import * as HttpBody from "@effect/platform/HttpBody"
import * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientError from "@effect/platform/HttpClientError"
import * as HttpClientRequest from "@effect/platform/HttpClientRequest"
import * as HttpClientResponse from "@effect/platform/HttpClientResponse"
import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import fs from "node:fs"
import path from "node:path"

import type { PurchaseProviderSettings } from "../../core/config.ts"
import type { PaymentEnvironmentTag } from "../../provider/types.ts"

import { captureVendorSession } from "../../harness/paddle/session-capture.ts"
import { failUnexpectedStatus, withProviderTransientRetry } from "../../internal/provider-http-retry.ts"
import {
  collectPrepareChanges,
  determineUnsupportedAction,
  type ProviderPrepareInput,
  type ProviderPreparePlan,
  type ProviderPrepareResult
} from "../../sync/provider-prepare.ts"
import { getPaddleUrl } from "../config.ts"
import {
  GET_CHECKOUT_SETTINGS_QUERY,
  GET_CHECKOUT_STYLES_QUERY,
  GET_OVERLAY_SETTINGS_QUERY,
  GET_SELLER_DOMAINS_QUERY,
  PADDLE_WEBHOOK_SUBSCRIBED_EVENTS,
  SAVE_CHECKOUT_SETTINGS_MUTATION,
  SAVE_OVERLAY_SETTINGS_MUTATION,
  SAVE_STYLES_MUTATION,
  SUBMIT_DOMAIN_APPROVAL_REQUEST_MUTATION
} from "./constants.ts"
import {
  PaddleVendorCheckoutSettingsData,
  PaddleVendorCheckoutStylesData,
  PaddleVendorOverlaySettingsData,
  PaddleVendorSaveCheckoutSettingsResponse,
  PaddleVendorSaveOverlaySettingsResponse,
  PaddleVendorSaveStylesResponse,
  PaddleVendorSessionState
} from "./paddle-vendor-schema.ts"

interface PaddleNotificationSettingState {
  readonly id: string
  readonly description: string
  readonly destination: string
  readonly active: boolean
  readonly subscribedEvents: ReadonlyArray<string>
  readonly endpointSecretKey?: string | undefined
}

interface PaddleDomainReviewState {
  readonly id: string
  readonly domain: string
  readonly status: string
}

export class PaddleVendorPrepareService extends Context.Tag(
  "@xstack/purchase/provider/Paddle/PaddleVendorPrepareService"
)<
  PaddleVendorPrepareService,
  {
    readonly prepare: (
      input: ProviderPrepareInput
    ) => Effect.Effect<ProviderPrepareResult, HttpClientError.HttpClientError>
  }
>() {}

export const PaddleVendorPrepareServiceLayer = Layer.effect(
  PaddleVendorPrepareService,
  Effect.gen(function* () {
    const environment = yield* Config.string("PADDLE_ENVIRONMENT").pipe(Config.map((_) => _ as PaymentEnvironmentTag))
    const vendorHttpConfig = yield* readPaddleVendorHttpConfig

    const sessionCaptureSemaphore = yield* Effect.makeSemaphore(1)

    const hasConfiguredPaddleVendorSession = () =>
      Option.isSome(vendorHttpConfig.cookie) || loadPaddleVendorSession(environment) !== undefined

    const ensurePaddleVendorSession = sessionCaptureSemaphore.withPermits(1)(
      Effect.gen(function* () {
        if (hasConfiguredPaddleVendorSession()) {
          return
        }

        const config = yield* readPaddleVendorCaptureConfig(environment)

        yield* captureVendorSession({
          environment,
          headless: config.headless,
          credentials: config.credentials,
          outputPath: config.outputPath
        }).pipe(Effect.orDie)
      })
    )

    const baseHttpClient = (yield* HttpClient.HttpClient).pipe(withProviderTransientRetry)

    const vendorHttpClient = baseHttpClient.pipe(
      HttpClient.mapRequestEffect(
        Effect.fn(function* (request) {
          const session = loadPaddleVendorSession(environment)
          const endpoint = `${session?.vendorUrl ?? paddleVendorUrl(environment)}/graphql`

          const origin = Option.getOrElse(
            vendorHttpConfig.origin,
            () => session?.vendorUrl ?? endpoint.replace(/\/graphql$/, "")
          )
          const referer = Option.getOrElse(vendorHttpConfig.referer, () => `${origin}/checkout-settings`)
          const cookie = Option.getOrElse(vendorHttpConfig.cookie, () => session?.cookieHeader)
          const xsrfToken = Option.getOrElse(vendorHttpConfig.xsrfToken, () => session?.xsrfToken)

          if (!cookie) {
            return yield* Effect.dieMessage("Missing PADDLE_VENDOR_COOKIE for paddle vendor GraphQL access.")
          }

          const mapped = request.pipe(
            HttpClientRequest.prependUrl(endpoint),
            HttpClientRequest.setHeader("Accept", "*/*"),
            HttpClientRequest.setHeader("Content-Type", "application/json"),
            HttpClientRequest.setHeader("Cookie", cookie),
            HttpClientRequest.setHeader("Origin", origin),
            HttpClientRequest.setHeader("Referer", referer),
            HttpClientRequest.setHeader(
              "User-Agent",
              Option.getOrElse(
                vendorHttpConfig.userAgent,
                () =>
                  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
              )
            ),
            HttpClientRequest.setHeader("Sec-Fetch-Dest", "empty"),
            HttpClientRequest.setHeader("Sec-Fetch-Mode", "cors"),
            HttpClientRequest.setHeader("Sec-Fetch-Site", "same-origin")
          )

          return xsrfToken ? mapped.pipe(HttpClientRequest.setHeader("X-XSRF-Token", xsrfToken)) : mapped
        })
      )
    )

    const restClient = baseHttpClient.pipe(
      HttpClient.mapRequestEffect(
        Effect.fn(function* (request) {
          const apiToken = yield* Config.string("PADDLE_API_TOKEN").pipe(Effect.orDie)

          return request.pipe(
            HttpClientRequest.prependUrl(getPaddleUrl(environment)),
            HttpClientRequest.bearerToken(apiToken),
            HttpClientRequest.acceptJson
          )
        })
      )
    )

    const restRequest = Effect.fn(function* (request: {
      readonly method: "GET" | "POST" | "PATCH"
      readonly path: string
      readonly body?: unknown
    }) {
      const sendJsonRequest = (
        client: HttpClient.HttpClient,
        method: "GET" | "POST" | "PATCH",
        path: string,
        body?: unknown
      ) => {
        switch (method) {
          case "GET":
            return client.get(path)
          case "POST":
            return client.post(path, body === undefined ? undefined : { body: HttpBody.unsafeJson(body) })
          case "PATCH":
            return client.patch(path, body === undefined ? undefined : { body: HttpBody.unsafeJson(body) })
        }
      }

      const response = yield* sendJsonRequest(restClient, request.method, request.path, request.body)

      return yield* expectJsonStatus(
        response,
        Schema.Struct({
          data: Schema.Unknown,
          meta: Schema.optional(Schema.Unknown),
          error: Schema.optional(Schema.Unknown)
        })
      )
    })

    const vendorRequest = Effect.fn(function* (operation: {
      readonly operationName: string
      readonly variables: Record<string, unknown>
      readonly query: string
    }) {
      const response = yield* vendorHttpClient.post("", {
        body: HttpBody.unsafeJson(operation)
      })
      const json = yield* expectJsonBody(response)

      if (isRecord(json) && Array.isArray(json.errors) && json.errors.length > 0) {
        return yield* new HttpClientError.ResponseError({
          reason: "Decode",
          request: response.request,
          response,
          description: json.errors
            .map((error) => (isRecord(error) && typeof error.message === "string" ? error.message : String(error)))
            .join("; ")
            .concat(` (${operation.operationName})`)
        })
      }

      return json as { data: any; errors?: ReadonlyArray<{ message: string }> }
    })

    const fetchPaddleNotificationSetting = Effect.gen(function* () {
      const response = yield* restRequest({
        method: "GET",
        path: `/notification-settings?per_page=200&order_by=${encodeURIComponent("id[DESC]")}`
      })

      const entries = Array.isArray(response.data) ? response.data : []
      const settings = entries.map(decodePaddleNotificationSetting)
      return (
        settings.find((entry) => entry.description === paddleWebhookDescription(environment)) ??
        settings.find((entry) => entry.description.startsWith(PADDLE_WEBHOOK_DESCRIPTION_PREFIX)) ??
        settings.find((entry) => entry.description === "Purchase SDK local e2e")
      )
    })

    const fetchPaddleApprovedDomains = Effect.gen(function* () {
      const response = yield* vendorRequest({
        operationName: "GetSellerDomains",
        variables: {},
        query: GET_SELLER_DOMAINS_QUERY
      })

      return Array.isArray(response.data.getDomainReviews)
        ? response.data.getDomainReviews.map(decodePaddleDomainReview)
        : []
    })

    const submitPaddleDomainApprovalRequest = Effect.fn(function* (domain: string) {
      const response = yield* vendorRequest({
        operationName: "SubmitDomainApprovalRequest",
        variables: { domain },
        query: SUBMIT_DOMAIN_APPROVAL_REQUEST_MUTATION
      })

      return decodePaddleDomainReview(response.data.submitDomainApprovalRequest)
    })

    const ensurePaddleApprovedCheckoutDomain = Effect.fn(function* (
      checkoutUrl: string,
      knownDomains?: ReadonlyArray<PaddleDomainReviewState> | undefined
    ) {
      const domain = new URL(checkoutUrl).hostname
      const current = knownDomains ?? (yield* fetchPaddleApprovedDomains)

      if (current.some((entry: PaddleDomainReviewState) => isPaddleDomainReviewApproved(entry, domain))) {
        return
      }

      const submitted = yield* submitPaddleDomainApprovalRequest(domain).pipe(
        Effect.catchAll((cause) =>
          fetchPaddleApprovedDomains.pipe(
            Effect.catchAll(() => Effect.fail(cause)),
            Effect.flatMap((domains) =>
              domains.some((entry: PaddleDomainReviewState) => isPaddleDomainReviewApproved(entry, domain))
                ? Effect.succeed({ id: "", domain, status: "approved" })
                : Effect.fail(cause)
            )
          )
        )
      )
      if (isPaddleDomainReviewApproved(submitted, domain)) {
        return
      }

      yield* fetchPaddleApprovedDomains.pipe(
        Effect.flatMap((domains) =>
          domains.some((entry: PaddleDomainReviewState) => isPaddleDomainReviewApproved(entry, domain))
            ? Effect.void
            : Effect.dieMessage(`Paddle checkout domain "${domain}" is not approved yet`)
        )
      )
    })

    const upsertPaddleNotificationSetting = Effect.fn(function* (
      environment: PaymentEnvironmentTag,
      current: PaddleNotificationSettingState | undefined,
      webhookUrl: string
    ) {
      const body = {
        description: paddleWebhookDescription(environment),
        type: "url",
        destination: webhookUrl,
        active: true,
        api_version: 1,
        include_sensitive_fields: false,
        subscribed_events: PADDLE_WEBHOOK_SUBSCRIBED_EVENTS,
        traffic_source: "platform"
      }

      if (current) {
        yield* restRequest({
          method: "PATCH",
          path: `/notification-settings/${current.id}`,
          body
        })
        return
      }

      yield* restRequest({
        method: "POST",
        path: "/notification-settings",
        body
      })
    })

    const fetchPaddleCurrentState = Effect.fn(function* (options: { readonly includeCheckoutDetails: boolean }) {
      const checkoutSettingsResponse = yield* vendorRequest({
        operationName: "GetCheckoutSettings",
        variables: {},
        query: GET_CHECKOUT_SETTINGS_QUERY
      })
      const checkoutSettings = yield* PaddleVendorCheckoutSettingsData.decode(
        checkoutSettingsResponse.data.getCheckoutSettings.data
      )
      const approvedDomains = Array.isArray(checkoutSettingsResponse.data.getDomainReviews)
        ? checkoutSettingsResponse.data.getDomainReviews.map(decodePaddleDomainReview)
        : []

      const [overlaySettings, checkoutStyles] = options.includeCheckoutDetails
        ? yield* Effect.all(
            [
              vendorRequest({
                operationName: "GetOverlaySettings",
                variables: {},
                query: GET_OVERLAY_SETTINGS_QUERY
              }).pipe(
                Effect.flatMap((_) => PaddleVendorOverlaySettingsData.decode(_.data.getOverlaySettings.data)),
                Effect.orElseSucceed(() => undefined)
              ),
              vendorRequest({
                operationName: "GetCheckoutStyles",
                variables: {},
                query: GET_CHECKOUT_STYLES_QUERY
              }).pipe(
                Effect.flatMap((_) => PaddleVendorCheckoutStylesData.decode(_.data.getCheckoutStyles.data)),
                Effect.orElseSucceed(() => undefined)
              )
            ] as const,
            { concurrency: "unbounded" }
          )
        : [undefined, undefined]

      const notificationSetting = yield* fetchPaddleNotificationSetting

      const checkoutSnapshot =
        overlaySettings && checkoutStyles
          ? PaddleVendorCheckoutSettingsData.normalizeSnapshot({ checkoutSettings, overlaySettings, checkoutStyles })
          : {
              checkoutUrl: checkoutSettings.defaultCheckoutUrl.url,
              checkout: {
                settings: {
                  audienceOptin: checkoutSettings.audienceOptin,
                  checkoutDiscounts: checkoutSettings.checkoutDiscounts,
                  enableSavedPaymentMethods: checkoutSettings.enableSavedPaymentMethods,
                  orderConfirmationEmail: {
                    freeCheckoutReceipts: checkoutSettings.orderConfirmationEmail.freeCheckoutReceipts,
                    receiptShowMessage: checkoutSettings.orderConfirmationEmail.receiptShowMessage
                  }
                },
                paymentMethods: omitVendorTypename(checkoutSettings.paymentMethods),
                ...(overlaySettings ? { overlay: { brandColor: overlaySettings.brandColor } } : {}),
                ...(checkoutStyles ? { styles: { theme: omitVendorTypenameDeep(checkoutStyles.theme) } } : {})
              }
            }

      return {
        providerSettings: {
          approvedCheckoutUrl: checkoutSnapshot.checkoutUrl,
          webhookUrl: notificationSetting?.destination,
          checkout: checkoutSnapshot.checkout
        } satisfies PurchaseProviderSettings as PurchaseProviderSettings,
        notificationSetting,
        approvedDomains
      }
    })

    const applyPaddleProviderChanges = Effect.fn(function* (
      input: ProviderPrepareInput,
      plan: ProviderPreparePlan,
      notificationSetting: PaddleNotificationSettingState | undefined,
      approvedDomains: ReadonlyArray<PaddleDomainReviewState>
    ) {
      const hasActionableChange = (predicate: (path: string) => boolean) =>
        plan.changes.some((change) => change.action !== "none" && predicate(change.path))

      if (
        hasActionableChange(
          (path) =>
            path.startsWith("checkout.settings") ||
            path === "checkout.defaultCheckoutUrl" ||
            path.startsWith("checkout.paymentMethods")
        )
      ) {
        if (input.approvedCheckoutUrl) {
          yield* ensurePaddleApprovedCheckoutDomain(input.approvedCheckoutUrl, approvedDomains)
        }

        yield* Effect.gen(function* () {
          const response = yield* vendorRequest({
            operationName: "SaveCheckoutSettings",
            variables: PaddleVendorCheckoutSettingsData.buildMutationVariables({
              checkoutUrl: input.approvedCheckoutUrl,
              checkout: input.checkout
            }),
            query: SAVE_CHECKOUT_SETTINGS_MUTATION
          })
          yield* PaddleVendorSaveCheckoutSettingsResponse.decode(response.data)
        }).pipe(
          Effect.catchAll((cause) =>
            input.approvedCheckoutUrl || input.checkout
              ? Effect.fail(cause)
              : Effect.logWarning(
                  `Paddle vendor checkout URL update failed; continuing because transactions use an explicit checkout URL. ${String(cause)}`
                )
          )
        )
      }

      if (hasActionableChange((path) => path.startsWith("checkout.overlay"))) {
        const response = yield* vendorRequest({
          operationName: "SaveOverlaySettings",
          variables: PaddleVendorOverlaySettingsData.buildMutationVariables(input.checkout?.overlay),
          query: SAVE_OVERLAY_SETTINGS_MUTATION
        })
        yield* PaddleVendorSaveOverlaySettingsResponse.decode(response.data)
      }

      if (hasActionableChange((path) => path.startsWith("checkout.styles"))) {
        const response = yield* vendorRequest({
          operationName: "SaveStyles",
          variables: PaddleVendorCheckoutStylesData.buildMutationVariables(input.checkout?.styles),
          query: SAVE_STYLES_MUTATION
        })
        yield* PaddleVendorSaveStylesResponse.decode(response.data)
      }

      if (input.webhookUrl && hasActionableChange((path) => path.startsWith("webhook."))) {
        yield* upsertPaddleNotificationSetting(input.environment, notificationSetting, input.webhookUrl)
      }
    })

    const createPaddlePreparePlan = (
      input: ProviderPrepareInput,
      notificationSetting: PaddleNotificationSettingState | undefined
    ): ProviderPreparePlan => {
      const changes = [...collectPrepareChanges(input)]

      if (input.webhookUrl) {
        changes.push({
          path: "webhook.active",
          current: notificationSetting?.active,
          desired: true,
          action: determineUnsupportedAction(notificationSetting?.active, true)
        })
        changes.push({
          path: "webhook.subscribedEvents",
          current: notificationSetting?.subscribedEvents,
          desired: PADDLE_WEBHOOK_SUBSCRIBED_EVENTS,
          action: sameStringArray(notificationSetting?.subscribedEvents, PADDLE_WEBHOOK_SUBSCRIBED_EVENTS)
            ? "none"
            : notificationSetting
              ? "update"
              : "create"
        })
      }

      return {
        status: "ready",
        changes,
        ...(input.approvedCheckoutUrl
          ? {
              approvedCheckoutUrl: {
                current: input.current?.approvedCheckoutUrl,
                desired: input.approvedCheckoutUrl,
                action: determineUnsupportedAction(input.current?.approvedCheckoutUrl, input.approvedCheckoutUrl)
              }
            }
          : {}),
        ...(input.webhookUrl
          ? {
              webhookUrl: {
                current: notificationSetting?.destination ?? input.current?.webhookUrl,
                desired: input.webhookUrl,
                action: determineUnsupportedAction(
                  notificationSetting?.destination ?? input.current?.webhookUrl,
                  input.webhookUrl
                )
              }
            }
          : {})
      }
    }

    const prepare = Effect.fn(
      function* (input: ProviderPrepareInput) {
        const normalizedInput = normalizePaddlePrepareInput(input)
        const includeCheckoutDetails = normalizedInput.checkout !== undefined

        yield* ensurePaddleVendorSession

        const currentStateResult = yield* Effect.exit(fetchPaddleCurrentState({ includeCheckoutDetails }))

        const notificationSetting = yield* Exit.match(currentStateResult, {
          onFailure: () => fetchPaddleNotificationSetting,
          onSuccess: (_) => Effect.succeed(_.notificationSetting)
        })
        const approvedDomains = Exit.match(currentStateResult, {
          onFailure: () => [] as ReadonlyArray<PaddleDomainReviewState>,
          onSuccess: (_) => _.approvedDomains
        })

        const current =
          normalizedInput.current ??
          Exit.match(currentStateResult, {
            onFailure: () =>
              ({
                approvedCheckoutUrl: normalizedInput.approvedCheckoutUrl,
                webhookUrl: notificationSetting?.destination
              }) satisfies PurchaseProviderSettings as PurchaseProviderSettings,
            onSuccess: (_) => _.providerSettings
          })

        const plan = createPaddlePreparePlan({ ...normalizedInput, current }, notificationSetting)
        const hasChanges = plan.changes.some((change) => change.action !== "none")

        if (hasChanges && normalizedInput.dryRun !== true && plan.status === "ready") {
          yield* applyPaddleProviderChanges(normalizedInput, plan, notificationSetting, approvedDomains)

          const verifiedState = yield* fetchPaddleCurrentState({ includeCheckoutDetails }).pipe(
            Effect.catchAll(() =>
              fetchPaddleNotificationSetting.pipe(
                Effect.map((verifiedNotificationSetting) => ({
                  providerSettings: {
                    approvedCheckoutUrl: normalizedInput.approvedCheckoutUrl,
                    webhookUrl: verifiedNotificationSetting?.destination
                  } satisfies PurchaseProviderSettings,
                  notificationSetting: verifiedNotificationSetting
                }))
              )
            )
          )

          const verificationPlan = createPaddlePreparePlan(
            { ...normalizedInput, current: verifiedState.providerSettings },
            verifiedState.notificationSetting
          )

          if (verificationPlan.changes.some((change) => change.action !== "none")) {
            return {
              provider: "paddle" as const,
              dryRun: false,
              secrets: formatPaddleSecrets(verifiedState.notificationSetting),
              plan: {
                ...plan,
                status: "unsupported" as const,
                reason: "Paddle vendor settings were updated but verification still found differences."
              }
            } satisfies ProviderPrepareResult
          }
        }

        return {
          provider: "paddle" as const,
          dryRun: normalizedInput.dryRun === true,
          secrets: formatPaddleSecrets(notificationSetting),
          plan
        } satisfies ProviderPrepareResult
      },
      Effect.catchTag("ParseError", Effect.die)
    )

    return PaddleVendorPrepareService.of({ prepare })
  })
)

const unexpectedStatus = (response: HttpClientResponse.HttpClientResponse) =>
  Effect.flatMap(
    Effect.all([
      Effect.orElseSucceed(response.text, () => "Unexpected status code"),
      Effect.orElseSucceed(response.json, () => undefined)
    ]),
    ([description, json]) =>
      failUnexpectedStatus(
        response.request,
        response,
        typeof json === "object" && json !== null ? JSON.stringify(json) : description,
        json
      )
  )

const expectJsonStatus = <A, I, R>(response: HttpClientResponse.HttpClientResponse, schema: Schema.Schema<A, I, R>) =>
  HttpClientResponse.matchStatus({
    200: (res) => HttpClientResponse.schemaBodyJson(schema)(res),
    201: (res) => HttpClientResponse.schemaBodyJson(schema)(res),
    orElse: unexpectedStatus
  })(response).pipe(Effect.catchTag("ParseError", Effect.die))

const expectJsonBody = HttpClientResponse.matchStatus({
  200: (res) => res.json,
  201: (res) => res.json,
  orElse: unexpectedStatus
})

const normalizePaddlePrepareInput = (input: ProviderPrepareInput): ProviderPrepareInput => {
  if (!input.approvedCheckoutUrl) {
    return input
  }

  return {
    ...input,
    approvedCheckoutUrl: new URL(input.approvedCheckoutUrl).origin
  }
}

const omitVendorTypename = <T extends { readonly __typename?: string | null | undefined }>(
  value: T
): Omit<T, "__typename"> => {
  const { __typename: _typename, ...rest } = value
  return rest
}

const omitVendorTypenameDeep = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((entry) => omitVendorTypenameDeep(entry)) as T
  }
  if (!value || typeof value !== "object") {
    return value
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "__typename")
      .map(([key, entry]) => [key, omitVendorTypenameDeep(entry)])
  ) as T
}

const decodePaddleNotificationSetting = (value: unknown): PaddleNotificationSettingState => {
  const record = isRecord(value) ? value : {}
  const subscribedEvents = Array.isArray(record.subscribed_events)
    ? record.subscribed_events
        .map((entry) => (isRecord(entry) ? entry.name : entry))
        .filter((entry): entry is string => typeof entry === "string")
        .sort()
    : []

  return {
    id: typeof record.id === "string" ? record.id : "",
    description: typeof record.description === "string" ? record.description : "",
    destination: typeof record.destination === "string" ? record.destination : "",
    active: record.active === true,
    subscribedEvents,
    endpointSecretKey: typeof record.endpoint_secret_key === "string" ? record.endpoint_secret_key : undefined
  }
}

const paddleWebhookDescription = (environment: PaymentEnvironmentTag | undefined) =>
  `${PADDLE_WEBHOOK_DESCRIPTION_PREFIX} (${environment ?? "sandbox"})`

const PADDLE_WEBHOOK_DESCRIPTION_PREFIX = "Purchase SDK managed webhook"

const sameStringArray = (left: ReadonlyArray<string> | undefined, right: ReadonlyArray<string>) => {
  const normalizedLeft = [...(left ?? [])].sort()
  const normalizedRight = [...right].sort()
  return (
    normalizedLeft.length === normalizedRight.length &&
    normalizedLeft.every((entry, index) => entry === normalizedRight[index])
  )
}

const formatPaddleSecrets = (notificationSetting: PaddleNotificationSettingState | undefined) =>
  notificationSetting?.endpointSecretKey
    ? {
        webhook: {
          current: notificationSetting.endpointSecretKey
        }
      }
    : undefined

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value)

const isPaddleDomainReviewApproved = (entry: Pick<PaddleDomainReviewState, "domain" | "status">, domain: string) =>
  entry.domain === domain && entry.status.toLowerCase() === "approved"

const decodePaddleDomainReview = (input: unknown): PaddleDomainReviewState => {
  if (!isRecord(input)) {
    throw new Error("Invalid Paddle domain review response")
  }

  return {
    id: String(input.id),
    domain: String(input.domain),
    status: String(input.status).toLowerCase()
  }
}

export const paddleVendorUrl = (environment: PaymentEnvironmentTag) =>
  environment === "production" ? "https://vendors.paddle.com" : "https://sandbox-vendors.paddle.com"

const loadPaddleVendorSession = (environment: PaymentEnvironmentTag) => {
  const configuredPath = process.env.PADDLE_VENDOR_SESSION_FILE
  const filePath = configuredPath
    ? path.resolve(process.cwd(), configuredPath)
    : path.resolve(process.cwd(), ".purchase", `paddle-vendor-${environment}-session.json`)

  if (!fs.existsSync(filePath)) {
    return undefined
  }

  const json = JSON.parse(fs.readFileSync(filePath, "utf8"))
  return PaddleVendorSessionState.decodeSync(json)
}

export interface PaddleVendorCaptureConfig {
  readonly environment: "sandbox" | "production"
  readonly headless: boolean
  readonly outputPath: string
  readonly credentials: {
    readonly email: string
    readonly password: string
  }
}

const readPaddleVendorHttpConfig = Config.all({
  cookie: Config.option(Config.string("PADDLE_VENDOR_COOKIE")),
  xsrfToken: Config.option(Config.string("PADDLE_VENDOR_XSRF_TOKEN")),
  origin: Config.option(Config.string("PADDLE_VENDOR_ORIGIN")),
  referer: Config.option(Config.string("PADDLE_VENDOR_REFERER")),
  userAgent: Config.option(Config.string("PADDLE_VENDOR_USER_AGENT"))
}).pipe(Effect.orDie)

export const readPaddleVendorCaptureConfig = (environment: PaymentEnvironmentTag) =>
  Effect.gen(function* () {
    const [vendorEmail, vendorPassword, fallbackEmail, fallbackEmailTypo, fallbackPassword, headless, sessionFile] =
      yield* Config.all([
        Config.option(Config.string("PADDLE_VENDOR_EMAIL")),
        Config.option(Config.string("PADDLE_VENDOR_PASSWORD")),
        Config.option(Config.string(environment === "production" ? "PADDLE_PRODUCTION_EMAIL" : "PADDLE_SANDBOX_EMAIL")),
        Config.option(Config.string("PADDLE_SANBOX_EMAIL")),
        Config.option(
          Config.string(environment === "production" ? "PADDLE_PRODUCTION_PASSWORD" : "PADDLE_SANDBOX_PASSWORD")
        ),
        Config.string("PADDLE_VENDOR_HEADLESS").pipe(Config.withDefault("0")),
        Config.option(Config.string("PADDLE_VENDOR_SESSION_FILE"))
      ])

    const email = Option.getOrElse(
      Option.orElse(vendorEmail, () =>
        environment === "production" ? fallbackEmail : Option.orElse(fallbackEmail, () => fallbackEmailTypo)
      ),
      () => ""
    )
    const password = Option.getOrElse(
      Option.orElse(vendorPassword, () => fallbackPassword),
      () => ""
    )

    if (!email || !password) {
      return yield* Effect.dieMessage(
        environment === "production"
          ? "Missing Paddle vendor credentials. Set PADDLE_VENDOR_EMAIL/PADDLE_VENDOR_PASSWORD or PADDLE_PRODUCTION_EMAIL/PADDLE_PRODUCTION_PASSWORD."
          : "Missing Paddle vendor credentials. Set PADDLE_SANDBOX_EMAIL/PADDLE_SANDBOX_PASSWORD in .env.local. PADDLE_SANBOX_EMAIL is also accepted for the email typo."
      )
    }

    return {
      environment,
      headless: headless === "1",
      outputPath: path.resolve(
        process.cwd(),
        Option.getOrElse(sessionFile, () => `.purchase/paddle-vendor-${environment}-session.json`)
      ),
      credentials: { email, password }
    }
  }).pipe(Effect.orDie)

export const writePaddleVendorCaptureSession = (session: PaddleVendorSessionState, outputPath: string) => {
  const sessionPath = outputPath

  fs.mkdirSync(path.dirname(sessionPath), { recursive: true })
  fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2))
  console.log(
    JSON.stringify(
      {
        saved: sessionPath,
        environment: session.environment,
        vendorUrl: session.vendorUrl,
        capturedAt: session.capturedAt,
        cookieNames: session.cookies.map((cookie) => cookie.name)
      },
      null,
      2
    )
  )
}

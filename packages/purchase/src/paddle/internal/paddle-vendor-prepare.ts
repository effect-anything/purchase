import * as HttpBody from "@effect/platform/HttpBody"
import * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientError from "@effect/platform/HttpClientError"
import * as HttpClientRequest from "@effect/platform/HttpClientRequest"
import * as HttpClientResponse from "@effect/platform/HttpClientResponse"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import { identity } from "effect/Function"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"

import type { PurchaseProviderSettings } from "../../core/config.ts"
import type { PaymentEnvironmentTag } from "../../provider/types.ts"

import { failUnexpectedStatus, withProviderTransientRetry } from "../../internal/provider-http-retry.ts"
import {
  collectPrepareChanges,
  determineUnsupportedAction,
  type ProviderPrepareOptions,
  type ProviderPreparePlan,
  type ProviderPrepareResult
} from "../../provider/provider-prepare.ts"
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
  PaddleVendorSaveStylesResponse
} from "./paddle-vendor-schema.ts"
import { PaddleVendorSession, paddleVendorUrl } from "./paddle-vendor-session.ts"

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

export const prepare = Effect.fn("Paddle.vendorPrepare")(
  function* (options: ProviderPrepareOptions) {
    const environment = yield* Config.string("PADDLE_ENVIRONMENT").pipe(Config.map((_) => _ as PaymentEnvironmentTag))

    yield* Effect.annotateCurrentSpan({
      provider: "paddle",
      environment: environment
    })

    const paddleVendorSession = yield* PaddleVendorSession

    const baseClient = (yield* HttpClient.HttpClient).pipe(withProviderTransientRetry)

    const vendorClient = baseClient.pipe(
      HttpClient.mapRequestEffect(
        Effect.fnUntraced(function* (request) {
          const session = yield* paddleVendorSession.load(environment)
          const vendorBaseUrl = Option.flatMap(session, (_) => Option.fromNullable(_.vendorUrl))
          const baseUrl = vendorBaseUrl.pipe(
            Option.map((_) => new URL(_)),
            Option.getOrElse(() => new URL(paddleVendorUrl(environment)))
          )
          const endpoint = `${baseUrl.origin}/graphql`
          const referer = `${baseUrl.origin}/checkout-settings`
          const cookie = Option.map(session, (_) => _.cookieHeader).pipe(Option.getOrUndefined)
          const xsrfToken = Option.map(session, (_) => _.xsrfToken).pipe(Option.getOrUndefined)

          if (!cookie) {
            return yield* Effect.dieMessage("Missing paddle vendor session for paddle vendor GraphQL access.")
          }

          const httpClientRequest = request.pipe(
            HttpClientRequest.prependUrl(endpoint),
            HttpClientRequest.setHeader("Accept", "*/*"),
            HttpClientRequest.setHeader("Content-Type", "application/json"),
            cookie ? HttpClientRequest.setHeader("Cookie", cookie) : identity,
            HttpClientRequest.setHeader("Origin", baseUrl.origin),
            HttpClientRequest.setHeader("Referer", referer),
            HttpClientRequest.setHeader(
              "User-Agent",
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
            ),
            HttpClientRequest.setHeader("Sec-Fetch-Dest", "empty"),
            HttpClientRequest.setHeader("Sec-Fetch-Mode", "cors"),
            HttpClientRequest.setHeader("Sec-Fetch-Site", "same-origin"),
            xsrfToken ? HttpClientRequest.setHeader("X-XSRF-Token", xsrfToken) : identity
          )

          return httpClientRequest
        })
      )
    )

    const restClient = baseClient.pipe(
      HttpClient.mapRequestEffect(
        Effect.fnUntraced(function* (request) {
          const apiToken = yield* Config.string("PADDLE_API_TOKEN").pipe(Effect.orDie)

          return request.pipe(
            HttpClientRequest.prependUrl(getPaddleUrl(environment)),
            HttpClientRequest.bearerToken(apiToken),
            HttpClientRequest.acceptJson
          )
        })
      )
    )

    const restRequest = Effect.fn("Paddle.restRequest")(function* (request: {
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

    const vendorRequest = (operation: {
      readonly operationName: string
      readonly variables: Record<string, unknown>
      readonly query: string
    }) =>
      Effect.gen(function* () {
        const response = yield* vendorClient.post("", {
          body: HttpBody.unsafeJson(operation)
        })
        const json = yield* expectJsonBody(response)

        yield* Effect.annotateCurrentSpan({
          "graphql.errors.count": isRecord(json) && Array.isArray(json.errors) ? json.errors.length : 0
        })

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
      }).pipe(
        Effect.withSpan(`Paddle.graphql.${operation.operationName}`, {
          attributes: {
            "graphql.operation.name": operation.operationName,
            "graphql.variables.keys": Object.keys(operation.variables).sort().join(",")
          }
        })
      )

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
    }).pipe(Effect.withSpan("Paddle.fetch-notification-setting"))

    const fetchPaddleApprovedDomains = Effect.gen(function* () {
      const response = yield* vendorRequest({
        operationName: "GetSellerDomains",
        variables: {},
        query: GET_SELLER_DOMAINS_QUERY
      })

      return Array.isArray(response.data.getDomainReviews)
        ? response.data.getDomainReviews.map(decodePaddleDomainReview)
        : []
    }).pipe(Effect.withSpan("Paddle.fetch-approved-domains"))

    const submitDomainApprovalRequest = Effect.fn("Paddle.submitDomainApprovalRequest")(function* (domain: string) {
      yield* Effect.annotateCurrentSpan({ "checkout.domain": domain })

      const response = yield* vendorRequest({
        operationName: "SubmitDomainApprovalRequest",
        variables: { domain },
        query: SUBMIT_DOMAIN_APPROVAL_REQUEST_MUTATION
      })

      return decodePaddleDomainReview(response.data.submitDomainApprovalRequest)
    })

    const ensureApprovedCheckoutDomain = Effect.fn("Paddle.ensureApprovedCheckoutDomain")(function* (
      checkoutUrl: string,
      knownDomains?: ReadonlyArray<PaddleDomainReviewState> | undefined
    ) {
      const url = new URL(checkoutUrl)
      const domain = url.host
      const origin = url.origin

      const current = knownDomains ?? (yield* fetchPaddleApprovedDomains)

      yield* Effect.annotateCurrentSpan({
        "checkout.url": origin,
        "checkout.domain": domain,
        knownDomains
      })

      if (current.some((entry: PaddleDomainReviewState) => isPaddleDomainReviewApproved(entry, domain))) {
        return
      }

      const submitted = yield* submitDomainApprovalRequest(domain).pipe(
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

    const upsertNotificationSetting = Effect.fn("Paddle.upsertNotificationSetting")(function* (
      environment: PaymentEnvironmentTag,
      current: PaddleNotificationSettingState | undefined,
      webhookUrl: string
    ) {
      yield* Effect.annotateCurrentSpan({
        "webhook.action": current ? "update" : "create",
        "webhook.destination.host": safeUrlHostname(webhookUrl),
        "webhook.subscribed_events.count": PADDLE_WEBHOOK_SUBSCRIBED_EVENTS.length
      })

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

      return yield* restRequest({
        method: "POST",
        path: "/notification-settings",
        body
      })
    })

    const fetchCurrentState = Effect.fn("Paddle.fetchCurrentState")(function* (options: {
      readonly includeCheckoutDetails: boolean
    }) {
      yield* Effect.annotateCurrentSpan({
        "checkout.details.include": options.includeCheckoutDetails
      })

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

    const applyProviderChanges = Effect.fn("Paddle.applyProviderChanges")(function* (
      input: ProviderPrepareOptions,
      plan: ProviderPreparePlan,
      notificationSetting: PaddleNotificationSettingState | undefined,
      approvedDomains: ReadonlyArray<PaddleDomainReviewState>
    ) {
      const hasActionableChange = (predicate: (path: string) => boolean) =>
        plan.changes.some((change) => change.action !== "none" && predicate(change.path))

      yield* Effect.annotateCurrentSpan(preparePlanSpanAttributes(plan))

      if (
        hasActionableChange(
          (path) =>
            path.startsWith("checkout.settings") ||
            path === "checkout.defaultCheckoutUrl" ||
            path.startsWith("checkout.paymentMethods")
        )
      ) {
        if (input.approvedCheckoutUrl) {
          yield* ensureApprovedCheckoutDomain(input.approvedCheckoutUrl, approvedDomains)
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
        yield* upsertNotificationSetting(input.environment, notificationSetting, input.webhookUrl)
      }
    })

    const createPaddlePreparePlan = (
      options: ProviderPrepareOptions,
      notificationSetting: PaddleNotificationSettingState | undefined
    ): ProviderPreparePlan => {
      const changes = [...collectPrepareChanges(options)]

      if (options.webhookUrl) {
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
        ...(options.approvedCheckoutUrl
          ? {
              approvedCheckoutUrl: {
                current: options.current?.approvedCheckoutUrl,
                desired: options.approvedCheckoutUrl,
                action: determineUnsupportedAction(options.current?.approvedCheckoutUrl, options.approvedCheckoutUrl)
              }
            }
          : {}),
        ...(options.webhookUrl
          ? {
              webhookUrl: {
                current: notificationSetting?.destination ?? options.current?.webhookUrl,
                desired: options.webhookUrl,
                action: determineUnsupportedAction(
                  notificationSetting?.destination ?? options.current?.webhookUrl,
                  options.webhookUrl
                )
              }
            }
          : {})
      }
    }

    const normalizedOptions = normalizePaddlePrepareOptions(options)
    const includeCheckoutDetails = normalizedOptions.checkout !== undefined

    yield* Effect.annotateCurrentSpan({
      dry_run: normalizedOptions.dryRun === true,
      "checkout.details.include": includeCheckoutDetails,
      "checkout.url.origin": normalizedOptions.approvedCheckoutUrl,
      "webhook.destination.host": safeUrlHostname(normalizedOptions.webhookUrl)
    })

    yield* paddleVendorSession.ensure(environment, { headless: false, force: true })

    const currentStateResult = yield* Effect.exit(fetchCurrentState({ includeCheckoutDetails })).pipe(
      Effect.withSpan("Paddle.load-current-state")
    )

    const notificationSetting = yield* Exit.match(currentStateResult, {
      onFailure: () => fetchPaddleNotificationSetting,
      onSuccess: (_) => Effect.succeed(_.notificationSetting)
    })
    const approvedDomains = Exit.match(currentStateResult, {
      onFailure: () => [] as ReadonlyArray<PaddleDomainReviewState>,
      onSuccess: (_) => _.approvedDomains
    })

    const current =
      normalizedOptions.current ??
      Exit.match(currentStateResult, {
        onFailure: () =>
          ({
            approvedCheckoutUrl: normalizedOptions.approvedCheckoutUrl,
            webhookUrl: notificationSetting?.destination
          }) satisfies PurchaseProviderSettings as PurchaseProviderSettings,
        onSuccess: (_) => _.providerSettings
      })

    const plan = createPaddlePreparePlan({ ...normalizedOptions, current }, notificationSetting)
    const hasChanges = plan.changes.some((change) => change.action !== "none")

    yield* Effect.annotateCurrentSpan({
      ...preparePlanSpanAttributes(plan),
      has_changes: hasChanges
    })

    if (hasChanges && normalizedOptions.dryRun !== true && plan.status === "ready") {
      yield* applyProviderChanges(normalizedOptions, plan, notificationSetting, approvedDomains)

      const verifiedState = yield* fetchCurrentState({ includeCheckoutDetails }).pipe(
        Effect.catchAll(() =>
          fetchPaddleNotificationSetting.pipe(
            Effect.map((verifiedNotificationSetting) => ({
              providerSettings: {
                approvedCheckoutUrl: normalizedOptions.approvedCheckoutUrl,
                webhookUrl: verifiedNotificationSetting?.destination
              } satisfies PurchaseProviderSettings,
              notificationSetting: verifiedNotificationSetting
            }))
          )
        ),
        Effect.withSpan("Paddle.verify-changes")
      )

      const verificationPlan = createPaddlePreparePlan(
        { ...normalizedOptions, current: verifiedState.providerSettings },
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
      dryRun: normalizedOptions.dryRun === true,
      secrets: formatPaddleSecrets(notificationSetting),
      plan
    } satisfies ProviderPrepareResult
  },
  Effect.provide(PaddleVendorSession.Default),
  Effect.catchTag("ParseError", Effect.die)
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

const normalizePaddlePrepareOptions = (options: ProviderPrepareOptions): ProviderPrepareOptions => {
  if (!options.approvedCheckoutUrl) {
    return options
  }

  return {
    ...options,
    approvedCheckoutUrl: new URL(options.approvedCheckoutUrl).origin
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

const preparePlanSpanAttributes = (plan: ProviderPreparePlan): Record<string, unknown> => {
  const actionableChanges = plan.changes.filter((change) => change.action !== "none")

  return {
    "plan.status": plan.status,
    "changes.total": plan.changes.length,
    "changes.actionable": actionableChanges.length,
    "changes.create": actionableChanges.filter((change) => change.action === "create").length,
    "changes.update": actionableChanges.filter((change) => change.action === "update").length,
    "changes.unsupported": actionableChanges.filter((change) => change.action === "unsupported").length,
    "changes.paths": actionableChanges.map((change) => change.path).join(",")
  }
}

const safeUrlHostname = (url: string | undefined) => {
  if (!url) {
    return undefined
  }

  try {
    return new URL(url).hostname
  } catch {
    return undefined
  }
}

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

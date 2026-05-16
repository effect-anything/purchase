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
import * as Schema from "effect/Schema"
import fs from "node:fs"
import path from "node:path"

import type { PurchaseProviderSettings } from "../core/config.ts"
import type { PaymentEnvironmentTag } from "../provider/types.ts"

import { failUnexpectedStatus, withProviderTransientRetry } from "../internal/provider-http-retry.ts"
import { getPaddleUrl } from "../paddle/config.ts"
import {
  PaddleVendorCheckoutSettingsData,
  PaddleVendorCheckoutStylesData,
  PaddleVendorOverlaySettingsData,
  PaddleVendorSaveCheckoutSettingsResponse,
  PaddleVendorSaveOverlaySettingsResponse,
  PaddleVendorSaveStylesResponse
} from "../paddle/internal/paddle-vendor-schema.ts"
import { PaddleVendorSessionState } from "../paddle/internal/paddle-vendor-session.ts"
import {
  collectPrepareChanges,
  determineUnsupportedAction,
  type ProviderPrepareInput,
  type ProviderPreparePlan,
  type ProviderPrepareResult
} from "./provider-prepare.ts"

interface PaddleNotificationSettingState {
  readonly id: string
  readonly description: string
  readonly destination: string
  readonly active: boolean
  readonly subscribedEvents: ReadonlyArray<string>
  readonly endpointSecretKey?: string | undefined
}

export class PaddleProviderPrepareService extends Context.Tag("@pay/core/PaddleProviderPrepareService")<
  PaddleProviderPrepareService,
  {
    readonly prepare: (
      input: ProviderPrepareInput
    ) => Effect.Effect<ProviderPrepareResult, HttpClientError.HttpClientError>
  }
>() {}

export const PaddleProviderPrepareServiceLayer = Layer.effect(
  PaddleProviderPrepareService,
  Effect.gen(function* () {
    const baseHttpClient = (yield* HttpClient.HttpClient).pipe(withProviderTransientRetry)

    const apiToken = yield* Config.string("PADDLE_API_TOKEN")
    const environment: PaymentEnvironmentTag = "sandbox" as PaymentEnvironmentTag

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

    const expectJsonStatus = <A, I, R>(
      response: HttpClientResponse.HttpClientResponse,
      schema: Schema.Schema<A, I, R>
    ) =>
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

    const vendorHttpClient = baseHttpClient.pipe(
      HttpClient.mapRequestEffect(
        Effect.fn(function* (request) {
          const session = loadPaddleVendorSession(environment)
          const endpoint =
            environment === "production"
              ? "https://vendors.paddle.com/graphql"
              : "https://sandbox-vendors.paddle.com/graphql"
          const origin = process.env.PADDLE_VENDOR_ORIGIN ?? session?.vendorUrl ?? endpoint.replace(/\/graphql$/, "")
          const referer = process.env.PADDLE_VENDOR_REFERER ?? `${origin}/checkout-settings`
          const cookie = process.env.PADDLE_VENDOR_COOKIE ?? session?.cookieHeader
          const xsrfToken = process.env.PADDLE_VENDOR_XSRF_TOKEN ?? session?.xsrfToken

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
              process.env.PADDLE_VENDOR_USER_AGENT ??
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
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
      HttpClient.mapRequest((request) =>
        request.pipe(
          HttpClientRequest.prependUrl(getPaddleUrl(environment)),
          HttpClientRequest.bearerToken(apiToken),
          HttpClientRequest.acceptJson
        )
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

    const fetchPaddleCurrentState = Effect.gen(function* () {
      const [checkoutSettings, overlaySettings, checkoutStyles] = yield* Effect.all(
        [
          vendorRequest({
            operationName: "GetCheckoutSettings",
            variables: {},
            query: GET_CHECKOUT_SETTINGS_QUERY
          }).pipe(Effect.flatMap((_) => PaddleVendorCheckoutSettingsData.decode(_.data.getCheckoutSettings.data))),
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
        ],
        { concurrency: "unbounded" }
      )

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
          checkoutUrl: checkoutSnapshot.checkoutUrl,
          webhookUrl: notificationSetting?.destination,
          checkout: checkoutSnapshot.checkout
        } satisfies PurchaseProviderSettings as PurchaseProviderSettings,
        notificationSetting
      }
    })

    const applyPaddleProviderChanges = Effect.fn(function* (
      input: ProviderPrepareInput,
      plan: ProviderPreparePlan,
      notificationSetting: PaddleNotificationSettingState | undefined
    ) {
      if (
        plan.changes.some(
          (change) =>
            change.path.startsWith("checkout.settings") ||
            change.path === "checkout.defaultCheckoutUrl" ||
            change.path.startsWith("checkout.paymentMethods")
        )
      ) {
        yield* Effect.gen(function* () {
          const response = yield* vendorRequest({
            operationName: "SaveCheckoutSettings",
            variables: PaddleVendorCheckoutSettingsData.buildMutationVariables({
              checkoutUrl: input.checkoutUrl,
              checkout: input.checkout
            }),
            query: SAVE_CHECKOUT_SETTINGS_MUTATION
          })
          yield* PaddleVendorSaveCheckoutSettingsResponse.decode(response.data)
        }).pipe(
          Effect.catchAll((cause) =>
            input.checkout
              ? Effect.fail(cause)
              : Effect.logWarning(
                  `Paddle vendor checkout URL update failed; continuing because transactions use an explicit checkout URL. ${String(cause)}`
                )
          )
        )
      }

      if (plan.changes.some((change) => change.path.startsWith("checkout.overlay"))) {
        const response = yield* vendorRequest({
          operationName: "SaveOverlaySettings",
          variables: PaddleVendorOverlaySettingsData.buildMutationVariables(input.checkout?.overlay),
          query: SAVE_OVERLAY_SETTINGS_MUTATION
        })
        yield* PaddleVendorSaveOverlaySettingsResponse.decode(response.data)
      }

      if (plan.changes.some((change) => change.path.startsWith("checkout.styles"))) {
        const response = yield* vendorRequest({
          operationName: "SaveStyles",
          variables: PaddleVendorCheckoutStylesData.buildMutationVariables(input.checkout?.styles),
          query: SAVE_STYLES_MUTATION
        })
        yield* PaddleVendorSaveStylesResponse.decode(response.data)
      }

      if (input.webhookUrl && plan.changes.some((change) => change.path.startsWith("webhook."))) {
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
        ...(input.checkoutUrl
          ? {
              checkoutUrl: {
                current: input.current?.checkoutUrl,
                desired: input.checkoutUrl,
                action: determineUnsupportedAction(input.current?.checkoutUrl, input.checkoutUrl)
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
        const currentStateResult = yield* Effect.exit(fetchPaddleCurrentState)

        const notificationSetting = yield* Exit.match(currentStateResult, {
          onFailure: () => fetchPaddleNotificationSetting,
          onSuccess: (_) => Effect.succeed(_.notificationSetting)
        })

        const current =
          input.current ??
          Exit.match(currentStateResult, {
            onFailure: () =>
              ({
                checkoutUrl: input.checkoutUrl,
                webhookUrl: notificationSetting?.destination
              }) satisfies PurchaseProviderSettings as PurchaseProviderSettings,
            onSuccess: (_) => _.providerSettings
          })

        const plan = createPaddlePreparePlan({ ...input, current }, notificationSetting)

        if (input.dryRun !== true && plan.status === "ready") {
          yield* applyPaddleProviderChanges(input, plan, notificationSetting)

          const verifiedState = yield* fetchPaddleCurrentState.pipe(
            Effect.catchAll(() =>
              fetchPaddleNotificationSetting.pipe(
                Effect.map((verifiedNotificationSetting) => ({
                  providerSettings: {
                    checkoutUrl: input.checkoutUrl,
                    webhookUrl: verifiedNotificationSetting?.destination
                  } satisfies PurchaseProviderSettings,
                  notificationSetting: verifiedNotificationSetting
                }))
              )
            )
          )

          const verificationPlan = createPaddlePreparePlan(
            { ...input, current: verifiedState.providerSettings },
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
          dryRun: input.dryRun === true,
          secrets: formatPaddleSecrets(notificationSetting),
          plan
        } satisfies ProviderPrepareResult
      },
      Effect.catchTag("ParseError", Effect.die)
    )

    return PaddleProviderPrepareService.of({ prepare })
  })
)

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

const PADDLE_WEBHOOK_SUBSCRIBED_EVENTS = [
  "adjustment.created",
  "adjustment.updated",
  "customer.created",
  "customer.updated",
  "subscription.activated",
  "subscription.canceled",
  "subscription.created",
  "subscription.past_due",
  "subscription.paused",
  "subscription.resumed",
  "subscription.trialing",
  "subscription.updated",
  "transaction.billed",
  "transaction.canceled",
  "transaction.completed",
  "transaction.created",
  "transaction.paid",
  "transaction.payment_failed",
  "transaction.ready",
  "transaction.updated"
] as const

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

const GET_CHECKOUT_SETTINGS_QUERY = `query GetCheckoutSettings {
  getCheckoutSettings {
    data {
      vendorName
      audienceOptin
      checkoutDiscounts
      enableSavedPaymentMethods
      statementDescription
      vendorFeatures {
        toggleCardPayments
        wireTransfers
        paypal
        __typename
      }
      defaultCheckoutUrl {
        url
        state
        __typename
      }
      featureFlags {
        defaultCheckoutUrl
        showAliPaySetting
        showIdealSetting
        showGooglePaySetting
        showBancontactSetting
        showSavedPaymentMethodsSetting
        showApplePayDomainVerificationTab
        showPixSetting
        showUpiSetting
        showWeChatSetting
        showMBWaySetting
        showBlikSetting
        showSouthKoreaLocalCardSetting
        showNaverPaySetting
        showKakaoPaySetting
        showSamsungPaySetting
        showPaycoSetting
        __typename
      }
      orderConfirmationEmail {
        freeCheckoutReceipts
        receiptShowMessage
        __typename
      }
      paymentMethods {
        card
        paypal
        wireTransfer
        alipay
        googlePay
        applePay
        ideal
        bancontact
        pix
        upi
        blik
        mbway
        wechat
        southKoreaLocalCard
        naverPay
        kakaoPay
        samsungPay
        payco
        __typename
      }
      __typename
    }
    __typename
  }
}`

const GET_OVERLAY_SETTINGS_QUERY = `query GetOverlaySettings {
  getOverlaySettings {
    data {
      brandColor
      __typename
    }
    __typename
  }
}`

const GET_CHECKOUT_STYLES_QUERY = `query GetCheckoutStyles($sellerId: ID) {
  getCheckoutStyles(sellerId: $sellerId) {
    data {
      theme {
        globals {
          activeFocusBorderColor
          activeFocusBoxShadowColor
          borderRadius
          fontFamily
          primaryFontSize
          secondaryFontSize
          useContainerPadding
          maxWidth
          __typename
        }
        inputs {
          text {
            activeColor
            backgroundColor
            borderColor
            borderRadius
            borderWidth
            color
            fontSize
            minHeight
            placeholderColor
            withBoxShadow
            __typename
          }
          checkbox {
            backgroundColor
            borderRadius
            __typename
          }
          select {
            backgroundColor
            borderColor
            borderRadius
            borderWidth
            color
            fontSize
            height
            minHeight
            withBoxShadow
            __typename
          }
          selectFieldWithLabel {
            labelVisible
            labelPosition
            __typename
          }
          inputFieldWithLabel {
            labelVisible
            labelPosition
            __typename
          }
          __typename
        }
        buttons {
          primary {
            activeFocusBorderColor
            activeFocusBoxShadowColor
            borderColor
            borderColorHover
            borderWidth
            color
            colorHover
            backgroundColor
            backgroundColorHover
            borderRadius
            fontSize
            height
            width
            __typename
          }
          secondary {
            activeFocusBorderColor
            activeFocusBoxShadowColor
            borderColor
            borderColorHover
            borderWidth
            color
            colorHover
            backgroundColor
            backgroundColorHover
            borderRadius
            fontSize
            height
            width
            __typename
          }
          __typename
        }
        paddleBar {
          container {
            backgroundColor
            borderColor
            borderRadius
            __typename
          }
          dataSharedAndPaddleAddress {
            fontSize
            __typename
          }
          paddleMerchantOrderProcess {
            fontSize
            __typename
          }
          __typename
        }
        label {
          color
          fontSize
          fontWeight
          __typename
        }
        link {
          color
          colorHover
          fontSize
          __typename
        }
        notification {
          container {
            backgroundColor
            borderColor
            borderRadius
            __typename
          }
          text {
            fontSize
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
}`

const SAVE_CHECKOUT_SETTINGS_MUTATION = `mutation SaveCheckoutSettings($checkoutSettingsObject: CheckoutSettingsObjectInput!) {
  saveCheckoutSettings(checkoutSettingsObject: $checkoutSettingsObject) {
    message
    __typename
  }
}`

const SAVE_STYLES_MUTATION = `mutation SaveStyles($stylesObject: CheckoutStylesObjectInput!) {
  saveStyles(stylesObject: $stylesObject) {
    message
    __typename
  }
}`

const SAVE_OVERLAY_SETTINGS_MUTATION = `mutation SaveOverlaySettings($overlaySettingsObject: OverlaySettingsObjectInput!) {
  saveOverlaySettings(overlaySettingsObject: $overlaySettingsObject) {
    message
    __typename
  }
}`

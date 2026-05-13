import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import fs from "node:fs"
import path from "node:path"

import type { PurchaseProviderSettings } from "../core/config.ts"
import type { ProductsModule, PurchasePlansModule } from "../dsl.ts"
import type { PaymentEnvironmentTag, PaymentProviderTag } from "../provider/types.ts"

import { buildCommercialCatalog, CatalogState } from "../core/catalog-builder.ts"
import { PayStorageAdapter, type PayStorageOverrides } from "../db.ts"
import {
  buildPaddleVendorCheckoutSettingsMutationVariables,
  buildPaddleVendorOverlayMutationVariables,
  buildPaddleVendorStylesMutationVariables,
  decodePaddleVendorCheckoutSettingsData,
  decodePaddleVendorCheckoutStylesData,
  decodePaddleVendorOverlaySettingsData,
  decodePaddleVendorSaveCheckoutSettingsResponse,
  decodePaddleVendorSaveOverlaySettingsResponse,
  decodePaddleVendorSaveStylesResponse,
  normalizePaddleVendorCheckoutSnapshot
} from "../paddle/internal/paddle-vendor-schema.ts"
import { decodePaddleVendorSessionStateSync } from "../paddle/internal/paddle-vendor-session.ts"
import { PaymentClient } from "../provider/client.ts"
import {
  CommercialCatalogSyncService,
  CommercialCatalogSyncServiceLayer,
  type CommercialCatalogSyncInput,
  type CommercialCatalogSyncResult
} from "./catalog-sync-service.ts"

export type {
  CommercialCatalogSyncInput,
  CommercialCatalogSyncPlan,
  CommercialCatalogSyncPlanArchiveCandidate,
  CommercialCatalogSyncPlanLocalRow,
  CommercialCatalogSyncPlanPriceCreate,
  CommercialCatalogSyncPlanProductCreate,
  CommercialCatalogSyncPlanProviderRef,
  CommercialCatalogSyncPlanStaleRow,
  CommercialCatalogSyncResult
} from "./catalog-sync-service.ts"

export interface ProviderPrepareInput extends PurchaseProviderSettings {
  /**
   * Builds the provider settings plan without mutating provider configuration.
   */
  readonly dryRun?: boolean | undefined
  readonly current?: PurchaseProviderSettings | undefined
  readonly environment?: PaymentEnvironmentTag | undefined
}

interface ProviderPreparePlan {
  readonly status: "ready" | "unsupported"
  readonly reason?: string | undefined
  readonly changes: ReadonlyArray<ProviderPreparePlanChange>
  readonly checkoutUrl?:
    | {
        readonly current?: string | undefined
        readonly desired: string
        readonly action: "create" | "update" | "none" | "unsupported"
      }
    | undefined
  readonly webhookUrl?:
    | {
        readonly current?: string | undefined
        readonly desired: string
        readonly action: "create" | "update" | "none" | "unsupported"
      }
    | undefined
}

interface ProviderPreparePlanChange {
  readonly path: string
  readonly current?: unknown
  readonly desired: unknown
  readonly action: "create" | "update" | "none" | "unsupported"
}

export interface ProviderPrepareResult {
  readonly provider: PaymentProviderTag
  readonly dryRun: boolean
  readonly plan: ProviderPreparePlan
  readonly secrets?:
    | {
        readonly webhook?:
          | {
              readonly current?: string | undefined
            }
          | undefined
      }
    | undefined
}

interface PaddleNotificationSettingState {
  readonly id: string
  readonly description: string
  readonly destination: string
  readonly active: boolean
  readonly subscribedEvents: ReadonlyArray<string>
  readonly endpointSecretKey?: string | undefined
}

export class PurchaseConfigService extends Context.Tag("@pay/core/PurchaseConfigService")<
  PurchaseConfigService,
  {
    readonly syncCatalog: (
      input?: CommercialCatalogSyncInput | undefined
    ) => Effect.Effect<CommercialCatalogSyncResult, unknown>
    readonly prepareProvider: (
      input?: ProviderPrepareInput | undefined
    ) => Effect.Effect<ProviderPrepareResult, unknown>
  }
>() {}

export const PurchaseConfigServiceLayer = Layer.effect(
  PurchaseConfigService,
  Effect.gen(function* () {
    const catalogSync = yield* CommercialCatalogSyncService
    const provider = yield* PaymentClient

    const syncCatalog = (input?: CommercialCatalogSyncInput | undefined) => catalogSync.sync(input)

    const prepareProvider = (input: ProviderPrepareInput = {}) =>
      provider._tag === "paddle"
        ? preparePaddleProvider(input)
        : Effect.succeed({
            provider: provider._tag as PaymentProviderTag,
            dryRun: input.dryRun === true,
            plan: {
              status: "unsupported",
              reason: `Provider prepare is not implemented for ${provider._tag} yet.`,
              changes: collectPrepareChanges(input),
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
                      current: input.current?.webhookUrl,
                      desired: input.webhookUrl,
                      action: determineUnsupportedAction(input.current?.webhookUrl, input.webhookUrl)
                    }
                  }
                : {})
            }
          } satisfies ProviderPrepareResult)

    return PurchaseConfigService.of({ syncCatalog, prepareProvider })
  })
)

export const PurchaseConfigLayer = (input: {
  readonly plans: PurchasePlansModule | undefined
  readonly products: ProductsModule | undefined
  readonly storageOverrides?: PayStorageOverrides | undefined
}) => {
  const catalogStateLive = Layer.effect(
    CatalogState,
    buildCommercialCatalog({
      plans: input.plans,
      products: input.products
    }).pipe(Effect.map((catalog) => ({ catalog })))
  )

  const catalogSyncLive = CommercialCatalogSyncServiceLayer(input).pipe(
    Layer.provide(catalogStateLive),
    Layer.provideMerge(PayStorageAdapter.make(input.storageOverrides))
  )

  return PurchaseConfigServiceLayer.pipe(Layer.provide(catalogSyncLive))
}

export const syncCatalog = (input?: CommercialCatalogSyncInput | undefined) =>
  Effect.flatMap(PurchaseConfigService, (service) => service.syncCatalog(input))

export const prepareProvider = (input?: ProviderPrepareInput | undefined) =>
  Effect.flatMap(PurchaseConfigService, (service) => service.prepareProvider(input))

const collectPrepareChanges = (input: ProviderPrepareInput): ReadonlyArray<ProviderPreparePlanChange> => {
  const changes: Array<ProviderPreparePlanChange> = []

  if (input.checkoutUrl) {
    changes.push({
      path: "checkout.defaultCheckoutUrl",
      current: input.current?.checkoutUrl,
      desired: input.checkoutUrl,
      action: determineUnsupportedAction(input.current?.checkoutUrl, input.checkoutUrl)
    })
  }
  if (input.webhookUrl) {
    changes.push({
      path: "webhook.destinationUrl",
      current: input.current?.webhookUrl,
      desired: input.webhookUrl,
      action: determineUnsupportedAction(input.current?.webhookUrl, input.webhookUrl)
    })
  }
  appendNestedChanges(changes, "checkout.settings", input.checkout?.settings, input.current?.checkout?.settings)
  appendNestedChanges(
    changes,
    "checkout.paymentMethods",
    input.checkout?.paymentMethods,
    input.current?.checkout?.paymentMethods
  )
  appendNestedChanges(changes, "checkout.overlay", input.checkout?.overlay, input.current?.checkout?.overlay)
  appendNestedChanges(changes, "checkout.styles", input.checkout?.styles, input.current?.checkout?.styles)

  return changes
}

const appendNestedChanges = (
  changes: Array<ProviderPreparePlanChange>,
  prefix: string,
  value: unknown,
  currentValue: unknown
) => {
  if (!isRecord(value)) {
    return
  }

  for (const [key, entry] of Object.entries(value)) {
    if (entry === undefined) {
      continue
    }

    const path = `${prefix}.${key}`
    const currentEntry = isRecord(currentValue) ? currentValue[key] : undefined

    if (isRecord(entry) && hasNestedRecord(entry)) {
      appendNestedChanges(changes, path, entry, currentEntry)
    } else {
      changes.push({
        path,
        current: currentEntry,
        desired: entry,
        action: determineUnsupportedAction(currentEntry, entry)
      })
    }
  }
}

const determineUnsupportedAction = (
  current: unknown,
  desired: unknown
): ProviderPreparePlanChange["action"] | NonNullable<ProviderPreparePlan["checkoutUrl"]>["action"] => {
  if (Object.is(current, desired)) {
    return "none"
  }
  return current === undefined ? "create" : "update"
}

const hasNestedRecord = (value: Record<string, unknown>) => Object.values(value).some((entry) => isRecord(entry))

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value)

const preparePaddleProvider = (input: ProviderPrepareInput) =>
  Effect.gen(function* () {
    const currentState = yield* fetchPaddleCurrentState(input.environment)
    const current = input.current ?? currentState.providerSettings
    const plan = createPaddlePreparePlan({ ...input, current }, currentState.notificationSetting)

    if (input.dryRun !== true && plan.status === "ready") {
      yield* applyPaddleProviderChanges(input, plan, currentState.notificationSetting)

      const verifiedState = yield* fetchPaddleCurrentState(input.environment)
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
      secrets: formatPaddleSecrets(currentState.notificationSetting),
      plan
    } satisfies ProviderPrepareResult
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

const applyPaddleProviderChanges = (
  input: ProviderPrepareInput,
  plan: ProviderPreparePlan,
  notificationSetting: PaddleNotificationSettingState | undefined
) =>
  Effect.gen(function* () {
    if (
      plan.changes.some(
        (change) =>
          change.path.startsWith("checkout.settings") ||
          change.path === "checkout.defaultCheckoutUrl" ||
          change.path.startsWith("checkout.paymentMethods")
      )
    ) {
      const response = yield* paddleVendorRequest({
        environment: input.environment,
        operationName: "SaveCheckoutSettings",
        variables: buildPaddleVendorCheckoutSettingsMutationVariables({
          checkoutUrl: input.checkoutUrl,
          checkout: input.checkout
        }),
        query: SAVE_CHECKOUT_SETTINGS_MUTATION
      })
      yield* decodePaddleVendorSaveCheckoutSettingsResponse(response.data)
    }

    if (plan.changes.some((change) => change.path.startsWith("checkout.overlay"))) {
      const response = yield* paddleVendorRequest({
        environment: input.environment,
        operationName: "SaveOverlaySettings",
        variables: buildPaddleVendorOverlayMutationVariables(input.checkout?.overlay),
        query: SAVE_OVERLAY_SETTINGS_MUTATION
      })
      yield* decodePaddleVendorSaveOverlaySettingsResponse(response.data)
    }

    if (plan.changes.some((change) => change.path.startsWith("checkout.styles"))) {
      const response = yield* paddleVendorRequest({
        environment: input.environment,
        operationName: "SaveStyles",
        variables: buildPaddleVendorStylesMutationVariables(input.checkout?.styles),
        query: SAVE_STYLES_MUTATION
      })
      yield* decodePaddleVendorSaveStylesResponse(response.data)
    }

    if (input.webhookUrl && plan.changes.some((change) => change.path.startsWith("webhook."))) {
      yield* upsertPaddleNotificationSetting(input.environment, notificationSetting, input.webhookUrl)
    }
  })

const fetchPaddleCurrentState = (environment: PaymentEnvironmentTag | undefined) =>
  Effect.gen(function* () {
    const [checkoutSettingsResponse, overlaySettingsResponse, checkoutStylesResponse] = yield* Effect.all(
      [
        paddleVendorRequest({
          environment,
          operationName: "GetCheckoutSettings",
          variables: {},
          query: GET_CHECKOUT_SETTINGS_QUERY
        }),
        paddleVendorRequest({
          environment,
          operationName: "GetOverlaySettings",
          variables: {},
          query: GET_OVERLAY_SETTINGS_QUERY
        }),
        paddleVendorRequest({
          environment,
          operationName: "GetCheckoutStyles",
          variables: {},
          query: GET_CHECKOUT_STYLES_QUERY
        })
      ],
      { concurrency: "unbounded" }
    )

    const checkoutSettings = yield* decodePaddleVendorCheckoutSettingsData(
      checkoutSettingsResponse.data.getCheckoutSettings.data
    )
    const overlaySettings = yield* decodePaddleVendorOverlaySettingsData(
      overlaySettingsResponse.data.getOverlaySettings.data
    )
    const checkoutStyles = yield* decodePaddleVendorCheckoutStylesData(
      checkoutStylesResponse.data.getCheckoutStyles.data
    )
    const normalized = normalizePaddleVendorCheckoutSnapshot({
      checkoutSettings,
      overlaySettings,
      checkoutStyles
    })
    const notificationSetting = yield* fetchPaddleNotificationSetting(environment)

    return {
      providerSettings: {
        checkoutUrl: normalized.checkoutUrl,
        webhookUrl: notificationSetting?.destination,
        checkout: normalized.checkout
      } satisfies PurchaseProviderSettings,
      notificationSetting
    }
  })

const fetchPaddleNotificationSetting = (environment: PaymentEnvironmentTag | undefined) =>
  Effect.gen(function* () {
    const response = yield* paddleApiRequest({
      environment,
      method: "GET",
      path: `/notification-settings?per_page=200&order_by=${encodeURIComponent("id[DESC]")}`
    })

    const entries = Array.isArray(response.data) ? response.data : []
    return entries
      .map(decodePaddleNotificationSetting)
      .find((entry) => entry.description === paddleWebhookDescription(environment) && entry.destination.length > 0)
  })

const upsertPaddleNotificationSetting = (
  environment: PaymentEnvironmentTag | undefined,
  current: PaddleNotificationSettingState | undefined,
  webhookUrl: string
) =>
  Effect.gen(function* () {
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
      yield* paddleApiRequest({
        environment,
        method: "PATCH",
        path: `/notification-settings/${current.id}`,
        body
      })
      return
    }

    yield* paddleApiRequest({
      environment,
      method: "POST",
      path: "/notification-settings",
      body
    })
  })

const paddleApiRequest = (request: {
  readonly environment?: PaymentEnvironmentTag | undefined
  readonly method: "GET" | "POST" | "PATCH"
  readonly path: string
  readonly body?: unknown
}) =>
  Effect.tryPromise({
    try: async () => {
      const environment = request.environment ?? process.env.PADDLE_ENVIRONMENT ?? "sandbox"
      const baseUrl = environment === "production" ? "https://api.paddle.com" : "https://sandbox-api.paddle.com"
      const apiToken = process.env.PADDLE_API_TOKEN

      if (!apiToken) {
        throw new Error("Missing PADDLE_API_TOKEN for Paddle API access.")
      }

      const response = await fetch(`${baseUrl}${request.path}`, {
        method: request.method,
        headers: {
          accept: "application/json",
          authorization: `Bearer ${apiToken}`,
          ...(request.body ? { "content-type": "application/json" } : {})
        },
        ...(request.body ? { body: JSON.stringify(request.body) } : {})
      })

      const json = await response.json()
      if (!response.ok) {
        throw new Error(`Paddle API request failed with status ${response.status}.`)
      }

      return json as { data: unknown; meta?: unknown; error?: unknown }
    },
    catch: (error: unknown) => error
  })

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
  `Purchase SDK managed webhook (${environment ?? "sandbox"})`

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

const paddleVendorRequest = (operation: {
  readonly environment?: PaymentEnvironmentTag | undefined
  readonly operationName: string
  readonly variables: Record<string, unknown>
  readonly query: string
}) =>
  Effect.tryPromise({
    try: async () => {
      const environment =
        operation.environment ?? process.env.PADDLE_VENDOR_ENVIRONMENT ?? process.env.PADDLE_ENVIRONMENT ?? "sandbox"
      const session = loadPaddleVendorSession(environment === "production" ? "production" : "sandbox")
      const endpoint =
        process.env.PADDLE_VENDOR_GRAPHQL_URL ??
        (environment === "production"
          ? "https://vendors.paddle.com/graphql"
          : "https://sandbox-vendors.paddle.com/graphql")
      const origin = process.env.PADDLE_VENDOR_ORIGIN ?? session?.vendorUrl ?? endpoint.replace(/\/graphql$/, "")
      const referer = process.env.PADDLE_VENDOR_REFERER ?? `${origin}/checkout-settings`
      const cookie = process.env.PADDLE_VENDOR_COOKIE ?? session?.cookieHeader
      const xsrfToken = process.env.PADDLE_VENDOR_XSRF_TOKEN ?? session?.xsrfToken

      if (!cookie) {
        throw new Error("Missing PADDLE_VENDOR_COOKIE for paddle vendor GraphQL access.")
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          accept: "*/*",
          "content-type": "application/json",
          cookie,
          origin,
          referer,
          "user-agent":
            process.env.PADDLE_VENDOR_USER_AGENT ??
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          ...(xsrfToken ? { "x-xsrf-token": xsrfToken } : {})
        },
        body: JSON.stringify(operation)
      })

      const json = await response.json()
      if (!response.ok) {
        throw new Error(`Paddle vendor GraphQL request failed with status ${response.status}.`)
      }
      if (Array.isArray(json.errors) && json.errors.length > 0) {
        throw new Error(json.errors.map((error: { message: string }) => error.message).join("; "))
      }

      return json as { data: any; errors?: ReadonlyArray<{ message: string }> }
    },
    catch: (error: unknown) => error
  })

const loadPaddleVendorSession = (environment: PaymentEnvironmentTag) => {
  const configuredPath = process.env.PADDLE_VENDOR_SESSION_FILE
  const filePath = configuredPath
    ? path.resolve(process.cwd(), configuredPath)
    : path.resolve(process.cwd(), ".purchase", `paddle-vendor-${environment}-session.json`)

  if (!fs.existsSync(filePath)) {
    return undefined
  }

  const json = JSON.parse(fs.readFileSync(filePath, "utf8"))
  return decodePaddleVendorSessionStateSync(json)
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

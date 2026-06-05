import type * as Layer from "effect/Layer"

import * as Command from "@effect/cli/Command"
import * as Options from "@effect/cli/Options"
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Redacted from "effect/Redacted"

import type { PurchaseConfig } from "../core/config.ts"
import type { PaymentProvider } from "../provider.ts"
import type { PaymentEnvironmentTag, PaymentProviderTag } from "../provider/types.ts"

import { Paddle } from "../paddle.ts"
import { prepare } from "../provider/prepare.ts"
import { formatPrepareResult } from "../provider/provider-prepare.ts"
import { Stripe } from "../stripe.ts"
import { loadPurchaseConfigModule } from "./config-loader.ts"

const envFallback = (value: Option.Option<string>, envName: string) =>
  Option.getOrElse(value, () => process.env[envName])

const makeProviderLayer = (options: PrepareOptions): Layer.Layer<PaymentProvider, unknown> => {
  if (options.provider === "stripe") {
    return Stripe.layerConfig({
      apiKey: Redacted.make(options.stripeApiKey ?? ""),
      webhookSecret: Redacted.make(options.stripeWebhookSecret ?? ""),
      environment: options.environment
    })
  }

  return Paddle.layerConfig({
    apiToken: Redacted.make(options.paddleApiToken ?? ""),
    webhookToken: Redacted.make(options.paddleWebhookToken ?? ""),
    environment: options.environment,
    checkoutUrl: Option.none()
  })
}

export interface PrepareOptions {
  readonly modulePath: string
  readonly exportName?: string | undefined
  readonly provider: PaymentProviderTag
  readonly environment: PaymentEnvironmentTag
  readonly approvedCheckoutUrl?: string | undefined
  readonly webhookUrl?: string | undefined
  readonly apply: boolean
  readonly dryRun: boolean
  readonly json: boolean
  readonly showSecrets: boolean
  readonly stripeApiKey?: string | undefined
  readonly stripeWebhookSecret?: string | undefined
  readonly paddleApiToken?: string | undefined
  readonly paddleWebhookToken?: string | undefined
}

export const parsePrepareOptions = (config: {
  readonly module: string
  readonly exportName: Option.Option<string>
  readonly provider: PaymentProviderTag
  readonly environment: PaymentEnvironmentTag
  readonly approvedCheckoutUrl: Option.Option<string>
  readonly webhookUrl: Option.Option<string>
  readonly apply: boolean
  readonly dryRun: boolean
  readonly json: boolean
  readonly showSecrets: boolean
  readonly stripeApiKey: Option.Option<string>
  readonly stripeWebhookSecret: Option.Option<string>
  readonly paddleApiToken: Option.Option<string>
  readonly paddleWebhookToken: Option.Option<string>
}): PrepareOptions => {
  if (config.apply && config.dryRun) {
    throw new Error("Use either --dry-run or --apply, not both.")
  }

  const options: PrepareOptions = {
    modulePath: config.module,
    exportName: Option.getOrUndefined(config.exportName),
    provider: config.provider,
    environment: config.environment,
    approvedCheckoutUrl: Option.getOrUndefined(config.approvedCheckoutUrl),
    webhookUrl: Option.getOrUndefined(config.webhookUrl),
    apply: config.apply,
    dryRun: !config.apply,
    json: config.json,
    showSecrets: config.showSecrets,
    stripeApiKey: envFallback(config.stripeApiKey, "STRIPE_API_KEY"),
    stripeWebhookSecret: envFallback(config.stripeWebhookSecret, "STRIPE_WEBHOOK_SECRET"),
    paddleApiToken: envFallback(config.paddleApiToken, "PADDLE_API_TOKEN"),
    paddleWebhookToken: envFallback(config.paddleWebhookToken, "PADDLE_WEBHOOK_TOKEN")
  }

  if (!options.dryRun && options.provider === "stripe" && !options.stripeApiKey) {
    throw new Error("Missing STRIPE_API_KEY or --stripe-api-key for --apply.")
  }
  if (!options.dryRun && options.provider === "paddle" && !options.paddleApiToken) {
    throw new Error("Missing PADDLE_API_TOKEN or --paddle-api-token for --apply.")
  }

  return options
}

const prepareOptions = {
  module: Options.text("module").pipe(
    Options.withDescription("Module exporting defineConfig(...), plans/products, or a PurchaseSDK subclass.")
  ),
  exportName: Options.text("export").pipe(Options.optional, Options.withDescription("Named export to load.")),
  provider: Options.choice("provider", ["stripe", "paddle"] as const).pipe(
    Options.withDefault((process.env.PROVIDER as PaymentProviderTag | undefined) ?? "paddle"),
    Options.withDescription("Payment provider to configure.")
  ),
  environment: Options.choice("env", ["sandbox", "production"] as const).pipe(
    Options.withDefault(
      ((process.env.STRIPE_ENVIRONMENT ?? process.env.PADDLE_ENVIRONMENT) as PaymentEnvironmentTag | undefined) ??
        "sandbox"
    ),
    Options.withDescription("Provider environment.")
  ),
  approvedCheckoutUrl: Options.text("approved-checkout-url").pipe(
    Options.optional,
    Options.withDescription("Desired approved checkout URL/origin to register with the provider dashboard.")
  ),
  webhookUrl: Options.text("webhook-url").pipe(
    Options.optional,
    Options.withDescription("Desired provider webhook destination URL.")
  ),
  apply: Options.boolean("apply").pipe(Options.withDescription("Apply provider setting changes.")),
  dryRun: Options.boolean("dry-run").pipe(Options.withDescription("Print the plan without provider writes.")),
  json: Options.boolean("json").pipe(Options.withDescription("Print the raw prepare result as JSON.")),
  showSecrets: Options.boolean("show-secrets").pipe(
    Options.withDescription("Print provider secrets in full instead of masking them.")
  ),
  stripeApiKey: Options.text("stripe-api-key").pipe(
    Options.optional,
    Options.withDescription("Stripe API key. Defaults to STRIPE_API_KEY.")
  ),
  stripeWebhookSecret: Options.text("stripe-webhook-secret").pipe(
    Options.optional,
    Options.withDescription("Stripe webhook secret. Defaults to STRIPE_WEBHOOK_SECRET.")
  ),
  paddleApiToken: Options.text("paddle-api-token").pipe(
    Options.optional,
    Options.withDescription("Paddle API token. Defaults to PADDLE_API_TOKEN.")
  ),
  paddleWebhookToken: Options.text("paddle-webhook-token").pipe(
    Options.optional,
    Options.withDescription("Paddle webhook token. Defaults to PADDLE_WEBHOOK_TOKEN.")
  )
}

export const prepareCommand = Command.make(
  "prepare",
  prepareOptions,
  Effect.fn(function* (config) {
    const options = parsePrepareOptions(config)
    const purchase = yield* Effect.promise(() => loadPurchaseConfigModule(options))
    const providerConfig = providerConfigFrom(purchase.config, options.provider)

    const layer = makeProviderLayer(options)

    const result = yield* prepare({
      dryRun: options.dryRun,
      environment: options.environment,
      approvedCheckoutUrl: options.approvedCheckoutUrl ?? providerConfig?.approvedCheckoutUrl,
      webhookUrl: options.webhookUrl ?? providerConfig?.webhookUrl,
      checkout: providerConfig?.checkout
    }).pipe(Effect.provide(layer))

    if (options.json) {
      console.log(JSON.stringify(result, null, 2))
    } else {
      console.log(formatPrepareResult(options, result).string)
    }
  })
).pipe(
  Command.withDescription("Plan or apply provider setup such as checkout and webhook settings."),
  Command.provide(FetchHttpClient.layer),
  Command.provide(NodeFileSystem.layer)
)

const providerConfigFrom = (config: PurchaseConfig, provider: "paddle" | "stripe") =>
  config.providers?.[provider] ?? config.provider?.[provider]

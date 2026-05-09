import { Config, Context, Effect, Layer, Redacted } from "effect"

const PaddleApiToken = Config.redacted("PADDLE_API_TOKEN").pipe(Config.withDefault(Redacted.make("PADDLE_API_TOKEN")))

const PaddleWebhookToken = Config.redacted("PADDLE_WEBHOOK_TOKEN").pipe(
  Config.withDefault(Redacted.make("PADDLE_WEBHOOK_TOKEN"))
)

const isPlaceholderSecret = (value: string) =>
  value.length === 0 || value === "PADDLE_API_TOKEN" || value === "PADDLE_WEBHOOK_TOKEN"

export class ProviderConfigService extends Context.Tag("ProviderConfigService")<
  ProviderConfigService,
  {
    readonly isCheckoutConfigured: Effect.Effect<boolean>
  }
>() {
  static Default = Layer.effect(
    ProviderConfigService,
    Effect.gen(function* () {
      const apiToken = Redacted.value(yield* PaddleApiToken)
      const webhookToken = Redacted.value(yield* PaddleWebhookToken)

      return {
        isCheckoutConfigured: Effect.succeed(!isPlaceholderSecret(apiToken) && !isPlaceholderSecret(webhookToken))
      } as const
    })
  )
}

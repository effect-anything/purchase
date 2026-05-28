import { describe, expect, it } from "@effect/vitest"
import { Config, ConfigProvider, Effect, Layer, Redacted } from "effect"

const RuntimeConfig = Config.all({
  apiToken: Config.redacted("PADDLE_API_TOKEN"),
  webhookToken: Config.redacted("PADDLE_WEBHOOK_TOKEN")
})

const makeMergedProvider = (runtimeValues: ReadonlyMap<string, string>, baseProvider: ConfigProvider.ConfigProvider) =>
  ConfigProvider.fromMap(new Map(runtimeValues)).pipe(ConfigProvider.orElse(() => baseProvider))

describe("dynamic ConfigProvider", () => {
  it.effect("layers values fetched at runtime over environment values", () =>
    Effect.gen(function* () {
      const baseProvider = ConfigProvider.fromMap(
        new Map([
          ["PADDLE_API_TOKEN", "env-api-token"],
          ["PADDLE_WEBHOOK_TOKEN", "env-webhook-token"]
        ])
      )
      const runtimeProvider = makeMergedProvider(
        new Map([["PADDLE_WEBHOOK_TOKEN", "broker-webhook-token"]]),
        baseProvider
      )

      const config = yield* Config.unwrap(RuntimeConfig).pipe(Effect.withConfigProvider(runtimeProvider))

      expect(Redacted.value(config.apiToken)).toBe("env-api-token")
      expect(Redacted.value(config.webhookToken)).toBe("broker-webhook-token")
    })
  )

  it.effect("can build the merged provider after an effectful registration request", () =>
    Effect.gen(function* () {
      const baseProvider = ConfigProvider.fromMap(
        new Map([
          ["PADDLE_API_TOKEN", "env-api-token"],
          ["PADDLE_WEBHOOK_TOKEN", "env-webhook-token"]
        ])
      )
      const registerWebhookTarget = Effect.succeed({ webhookSecret: "broker-webhook-token" })

      const config = yield* Effect.gen(function* () {
        const registration = yield* registerWebhookTarget
        const runtimeProvider = makeMergedProvider(
          new Map(registration.webhookSecret ? [["PADDLE_WEBHOOK_TOKEN", registration.webhookSecret]] : []),
          baseProvider
        )

        return yield* Config.unwrap(RuntimeConfig).pipe(Effect.withConfigProvider(runtimeProvider))
      })

      expect(Redacted.value(config.apiToken)).toBe("env-api-token")
      expect(Redacted.value(config.webhookToken)).toBe("broker-webhook-token")
    })
  )

  it.effect("can add an inner provider on top of the provider installed by an outer layer", () =>
    Effect.gen(function* () {
      const baseProvider = ConfigProvider.fromMap(
        new Map([
          ["PADDLE_API_TOKEN", "env-api-token"],
          ["PADDLE_WEBHOOK_TOKEN", "env-webhook-token"]
        ])
      )
      const outerEnvLayer = Layer.setConfigProvider(baseProvider)
      const registerWebhookTarget = Effect.succeed({ webhookSecret: "broker-webhook-token" })

      const config = yield* Effect.gen(function* () {
        const registration = yield* registerWebhookTarget
        const innerRuntimeLayer = RuntimeConfigProviderLayer(
          new Map(registration.webhookSecret ? [["PADDLE_WEBHOOK_TOKEN", registration.webhookSecret]] : [])
        )

        return yield* Config.unwrap(RuntimeConfig).pipe(Effect.provide(innerRuntimeLayer))
      }).pipe(Effect.provide(outerEnvLayer))

      expect(Redacted.value(config.apiToken)).toBe("env-api-token")
      expect(Redacted.value(config.webhookToken)).toBe("broker-webhook-token")
    })
  )
})

export const RuntimeConfigProviderLayer = (runtimeValues: ReadonlyMap<string, string>) =>
  Effect.configProviderWith((currentProvider) =>
    Effect.succeed(Layer.setConfigProvider(makeMergedProvider(runtimeValues, currentProvider)))
  ).pipe(Layer.unwrapEffect)

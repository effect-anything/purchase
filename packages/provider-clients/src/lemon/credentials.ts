import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"

export type LemonEnvironment = "production" | "test"

export const getLemonApiBaseUrl = (_environment: LemonEnvironment) => "https://api.lemonsqueezy.com/v1"

export interface LemonCredentialsShape {
  readonly apiKey: Redacted.Redacted<string>
  readonly environment: LemonEnvironment
  readonly apiBaseUrl: string
}

export class LemonCredentials extends Context.Tag("@effect-x/purchase-provider-clients/LemonCredentials")<
  LemonCredentials,
  LemonCredentialsShape
>() {}

export const LemonCredentialsFromEnv = Layer.effect(
  LemonCredentials,
  Config.all({
    apiKey: Config.redacted("LEMON_SQUEEZY_API_KEY"),
    environment: Config.literal("test", "production")("LEMON_SQUEEZY_ENVIRONMENT").pipe(Config.withDefault("test")),
    apiBaseUrl: Config.option(Config.string("LEMON_SQUEEZY_API_BASE_URL"))
  }).pipe(
    Config.map(({ apiBaseUrl, apiKey, environment }) => ({
      apiKey,
      environment,
      apiBaseUrl: apiBaseUrl._tag === "Some" ? apiBaseUrl.value : getLemonApiBaseUrl(environment)
    }))
  )
)

export const LemonCredentialsFromRecord = (credentials: LemonCredentialsShape) =>
  Layer.succeed(LemonCredentials, credentials)

export const unsafeLemonCredentials = (
  apiKey: string,
  options: Partial<Omit<LemonCredentialsShape, "apiKey">> = {}
) => {
  const environment = options.environment ?? "test"
  return {
    apiKey: Redacted.make(apiKey),
    environment,
    apiBaseUrl: options.apiBaseUrl ?? getLemonApiBaseUrl(environment)
  }
}

import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"

export type DodoEnvironment = "live" | "test"

export const getDodoApiBaseUrl = (environment: DodoEnvironment) =>
  environment === "test" ? "https://test.dodopayments.com" : "https://live.dodopayments.com"

export interface DodoCredentialsShape {
  readonly apiKey: Redacted.Redacted<string>
  readonly environment: DodoEnvironment
  readonly apiBaseUrl: string
}

export class DodoCredentials extends Context.Tag("@effect-x/purchase-provider-clients/DodoCredentials")<
  DodoCredentials,
  DodoCredentialsShape
>() {}

export const DodoCredentialsFromEnv = Layer.effect(
  DodoCredentials,
  Config.all({
    apiKey: Config.redacted("DODO_API_KEY"),
    environment: Config.literal("test", "live")("DODO_ENVIRONMENT").pipe(Config.withDefault("test")),
    apiBaseUrl: Config.option(Config.string("DODO_API_BASE_URL"))
  }).pipe(
    Config.map(({ apiBaseUrl, apiKey, environment }) => ({
      apiKey,
      environment,
      apiBaseUrl: apiBaseUrl._tag === "Some" ? apiBaseUrl.value : getDodoApiBaseUrl(environment)
    }))
  )
)

export const DodoCredentialsFromRecord = (credentials: DodoCredentialsShape) =>
  Layer.succeed(DodoCredentials, credentials)

export const unsafeDodoCredentials = (apiKey: string, options: Partial<Omit<DodoCredentialsShape, "apiKey">> = {}) => {
  const environment = options.environment ?? "test"
  return {
    apiKey: Redacted.make(apiKey),
    environment,
    apiBaseUrl: options.apiBaseUrl ?? getDodoApiBaseUrl(environment)
  }
}

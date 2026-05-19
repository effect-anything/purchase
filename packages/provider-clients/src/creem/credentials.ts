import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"

export type CreemEnvironment = "production" | "test"

export const getCreemApiBaseUrl = (environment: CreemEnvironment) =>
  environment === "test" ? "https://test-api.creem.io/v1" : "https://api.creem.io/v1"

export interface CreemCredentialsShape {
  readonly apiKey: Redacted.Redacted<string>
  readonly environment: CreemEnvironment
  readonly apiBaseUrl: string
}

export class CreemCredentials extends Context.Tag("@effect-x/purchase-provider-clients/CreemCredentials")<
  CreemCredentials,
  CreemCredentialsShape
>() {}

export const CreemCredentialsFromEnv = Layer.effect(
  CreemCredentials,
  Config.all({
    apiKey: Config.redacted("CREEM_API_KEY"),
    environment: Config.literal("test", "production")("CREEM_ENVIRONMENT").pipe(Config.withDefault("test")),
    apiBaseUrl: Config.option(Config.string("CREEM_API_BASE_URL"))
  }).pipe(
    Config.map(({ apiBaseUrl, apiKey, environment }) => ({
      apiKey,
      environment,
      apiBaseUrl: apiBaseUrl._tag === "Some" ? apiBaseUrl.value : getCreemApiBaseUrl(environment)
    }))
  )
)

export const CreemCredentialsFromRecord = (credentials: CreemCredentialsShape) =>
  Layer.succeed(CreemCredentials, credentials)

export const unsafeCreemCredentials = (
  apiKey: string,
  options: Partial<Omit<CreemCredentialsShape, "apiKey">> = {}
) => {
  const environment = options.environment ?? "test"
  return {
    apiKey: Redacted.make(apiKey),
    environment,
    apiBaseUrl: options.apiBaseUrl ?? getCreemApiBaseUrl(environment)
  }
}

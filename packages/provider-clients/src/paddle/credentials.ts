import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"

export type PaddleEnvironment = "production" | "sandbox"

export const getPaddleApiBaseUrl = (environment: PaddleEnvironment) =>
  environment === "sandbox" ? "https://sandbox-api.paddle.com" : "https://api.paddle.com"

export interface PaddleCredentialsShape {
  readonly apiToken: Redacted.Redacted<string>
  readonly environment: PaddleEnvironment
  readonly apiBaseUrl: string
}

export class PaddleCredentials extends Context.Tag("@effect-x/purchase-provider-clients/PaddleCredentials")<
  PaddleCredentials,
  PaddleCredentialsShape
>() {}

export const PaddleCredentialsFromEnv = Layer.effect(
  PaddleCredentials,
  Config.all({
    apiToken: Config.redacted("PADDLE_API_TOKEN"),
    environment: Config.literal("sandbox", "production")("PADDLE_ENVIRONMENT").pipe(Config.withDefault("sandbox")),
    apiBaseUrl: Config.option(Config.string("PADDLE_API_BASE_URL"))
  }).pipe(
    Config.map(({ apiBaseUrl, apiToken, environment }) => ({
      apiToken,
      environment,
      apiBaseUrl: apiBaseUrl._tag === "Some" ? apiBaseUrl.value : getPaddleApiBaseUrl(environment)
    }))
  )
)

export const PaddleCredentialsFromRecord = (credentials: PaddleCredentialsShape) =>
  Layer.succeed(PaddleCredentials, credentials)

export const unsafePaddleCredentials = (
  apiToken: string,
  options: Partial<Omit<PaddleCredentialsShape, "apiToken">> = {}
) => {
  const environment = options.environment ?? "sandbox"
  return {
    apiToken: Redacted.make(apiToken),
    environment,
    apiBaseUrl: options.apiBaseUrl ?? getPaddleApiBaseUrl(environment)
  }
}

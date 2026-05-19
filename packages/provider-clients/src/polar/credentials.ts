import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"

export type PolarEnvironment = "production" | "sandbox"

export const getPolarApiBaseUrl = (environment: PolarEnvironment) =>
  environment === "sandbox" ? "https://sandbox-api.polar.sh" : "https://api.polar.sh"

export interface PolarCredentialsShape {
  readonly accessToken: Redacted.Redacted<string>
  readonly environment: PolarEnvironment
  readonly apiBaseUrl: string
}

export class PolarCredentials extends Context.Tag("@effect-x/purchase-provider-clients/PolarCredentials")<
  PolarCredentials,
  PolarCredentialsShape
>() {}

export const PolarCredentialsFromEnv = Layer.effect(
  PolarCredentials,
  Config.all({
    accessToken: Config.redacted("POLAR_ACCESS_TOKEN"),
    environment: Config.literal("sandbox", "production")("POLAR_ENVIRONMENT").pipe(Config.withDefault("sandbox")),
    apiBaseUrl: Config.option(Config.string("POLAR_API_BASE_URL"))
  }).pipe(
    Config.map(({ accessToken, apiBaseUrl, environment }) => ({
      accessToken,
      environment,
      apiBaseUrl: apiBaseUrl._tag === "Some" ? apiBaseUrl.value : getPolarApiBaseUrl(environment)
    }))
  )
)

export const PolarCredentialsFromRecord = (credentials: PolarCredentialsShape) =>
  Layer.succeed(PolarCredentials, credentials)

export const unsafePolarCredentials = (
  accessToken: string,
  options: Partial<Omit<PolarCredentialsShape, "accessToken">> = {}
) => {
  const environment = options.environment ?? "sandbox"
  return {
    accessToken: Redacted.make(accessToken),
    environment,
    apiBaseUrl: options.apiBaseUrl ?? getPolarApiBaseUrl(environment)
  }
}

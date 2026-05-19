import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"

export const DEFAULT_STRIPE_API_BASE_URL = "https://api.stripe.com"
export const DEFAULT_STRIPE_API_VERSION = "2026-03-25.dahlia"

export interface StripeCredentialsShape {
  readonly apiKey: Redacted.Redacted<string>
  readonly apiBaseUrl: string
  readonly apiVersion: string
}

export class StripeCredentials extends Context.Tag("@effect-x/purchase-provider-clients/StripeCredentials")<
  StripeCredentials,
  StripeCredentialsShape
>() {}

export const StripeCredentialsFromEnv = Layer.effect(
  StripeCredentials,
  Config.all({
    apiKey: Config.redacted("STRIPE_API_KEY"),
    apiBaseUrl: Config.string("STRIPE_API_BASE_URL").pipe(Config.withDefault(DEFAULT_STRIPE_API_BASE_URL)),
    apiVersion: Config.string("STRIPE_API_VERSION").pipe(Config.withDefault(DEFAULT_STRIPE_API_VERSION))
  })
)

export const StripeCredentialsFromRecord = (credentials: StripeCredentialsShape) =>
  Layer.succeed(StripeCredentials, credentials)

export const unsafeStripeCredentials = (
  apiKey: string,
  options: Partial<Omit<StripeCredentialsShape, "apiKey">> = {}
) => ({
  apiKey: Redacted.make(apiKey),
  apiBaseUrl: options.apiBaseUrl ?? DEFAULT_STRIPE_API_BASE_URL,
  apiVersion: options.apiVersion ?? DEFAULT_STRIPE_API_VERSION
})

export const redactStripeKey = Effect.map(StripeCredentials, (credentials) => credentials.apiKey)

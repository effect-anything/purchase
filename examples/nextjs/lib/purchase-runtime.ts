import type { D1Database } from "@cloudflare/workers-types"
import type { PaymentProviderTag } from "@effect-x/purchase/provider"

import { Paddle } from "@effect-x/purchase/paddle"
import { Stripe } from "@effect-x/purchase/stripe"
import * as D1Client from "@effect/sql-d1/D1Client"
import { env } from "cloudflare:workers"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as ManagedRuntime from "effect/ManagedRuntime"
import * as Redacted from "effect/Redacted"
import * as EffectString from "effect/String"

import type { PurchaseWebhookResult } from "./runtime-schema.ts"

import { Pay, PurchaseRuntimeConfig, type PurchaseRuntimeEnvironment } from "../purchase.ts"

const workerEnv = env as unknown as Record<string, unknown> & { DB?: D1Database }

export type PurchaseEnvironment = PurchaseRuntimeEnvironment
export type PurchaseProviderTag = PaymentProviderTag

const runtimes = new Map<PurchaseProviderTag, ManagedRuntime.ManagedRuntime<never, unknown>>()

const getEnvString = (key: string) => {
  const value = workerEnv[key]
  return typeof value === "string" && value.length > 0 ? value : undefined
}

const getDatabase = () => {
  if (!workerEnv.DB) {
    throw new Error(
      'Missing Cloudflare D1 binding "DB". Apply Wrangler migrations and run the app with the DB binding.'
    )
  }

  return workerEnv.DB
}

const resolveEnvironment = (): PurchaseEnvironment => PurchaseRuntimeConfig.environment

const resolveProvider = (): PurchaseProviderTag => PurchaseRuntimeConfig.provider

const isProviderConfigured = (provider: PaymentProviderTag) =>
  provider === "paddle"
    ? Boolean(getEnvString("PADDLE_API_TOKEN") && getEnvString("PADDLE_WEBHOOK_TOKEN"))
    : Boolean(getEnvString("STRIPE_API_KEY") && getEnvString("STRIPE_WEBHOOK_SECRET"))

export const getPurchaseEnvironment = () => resolveEnvironment()

export const getActiveProvider = () => resolveProvider()

export const isActiveProviderConfigured = () => isProviderConfigured(resolveProvider())

export const getAppBaseUrl = () => PurchaseRuntimeConfig.baseUrl

const resolveProviderLayer = (provider: PurchaseProviderTag) => {
  if (provider === "paddle") {
    return Paddle.layerConfig({
      apiToken: Redacted.make(getEnvString("PADDLE_API_TOKEN") ?? ""),
      webhookToken: Redacted.make(getEnvString("PADDLE_WEBHOOK_TOKEN") ?? ""),
      environment: resolveEnvironment() === "production" ? "production" : "sandbox"
    })
  }

  return Stripe.layerConfig({
    apiKey: Redacted.make(getEnvString("STRIPE_API_KEY") ?? ""),
    webhookSecret: Redacted.make(getEnvString("STRIPE_WEBHOOK_SECRET") ?? ""),
    environment: resolveEnvironment() === "production" ? "production" : "sandbox"
  })
}

const makeRuntimeLayer = (provider: PurchaseProviderTag) =>
  Layer.provideMerge(
    Pay.Layer,
    Layer.mergeAll(
      resolveProviderLayer(provider),
      D1Client.layer({
        db: getDatabase(),
        transformQueryNames: EffectString.camelToSnake,
        transformResultNames: EffectString.snakeToCamel
      })
    )
  ) as unknown as Layer.Layer<never, unknown, never>

const getRuntime = (provider: PurchaseProviderTag) => {
  const existing = runtimes.get(provider)
  if (existing) {
    return existing
  }

  const runtime = ManagedRuntime.make(makeRuntimeLayer(provider)) as ManagedRuntime.ManagedRuntime<never, unknown>
  runtimes.set(provider, runtime)
  return runtime
}

export const runWithPurchaseRuntime = <A, E, R>(provider: PurchaseProviderTag, effect: Effect.Effect<A, E, R>) =>
  getRuntime(provider).runPromise(effect as Effect.Effect<A, E, never>)

export const runWithActivePurchaseRuntime = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  runWithPurchaseRuntime(resolveProvider(), effect)

export const processWebhook = async (input: {
  readonly provider: PurchaseProviderTag
  readonly body: string
  readonly signature: string
}): Promise<PurchaseWebhookResult> =>
  runWithPurchaseRuntime(
    input.provider,
    Effect.gen(function* () {
      const sdk = yield* Pay
      const result = yield* sdk.webhooks.handle({
        provider: input.provider,
        body: input.body,
        signature: input.signature
      })

      return {
        accepted: result.accepted,
        providerEventId: result.providerEventId,
        normalizedEvents: result.normalizedEvents.map((event) => ({
          id: event.id,
          kind: event.kind,
          offerId: event.offerId ?? null,
          customerId: event.customerId ?? null
        })),
        reconciliationReasons: result.reconciliationTriggers.map((trigger) => trigger.reason)
      } as const
    })
  )

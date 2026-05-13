import * as Effect from "effect/Effect"

import type { PaymentProviderTag } from "../../src/provider/types.ts"
import type { BasePaySdkContract } from "../../src/sdk.ts"

import { loadGeneratedWebhookFixture, type StoredWebhookFixture } from "../provider/support/generated-fixture.ts"
import { makeLocalWebhookServer, type LocalWebhookServer } from "../provider/support/local-webhook-server.ts"
import { insertTestCustomer } from "./sqlite-pay-harness.ts"

export interface ProviderLiveHarnessOptions {
  readonly provider: PaymentProviderTag
  readonly supportsTestClock?: boolean | undefined
  readonly supportsWebhookSimulation?: boolean | undefined
  readonly attachPaymentMethod?:
    | ((input: { readonly customerId: string }) => Effect.Effect<{ readonly attached: true }, unknown>)
    | undefined
  readonly advanceClock?:
    | ((input: {
        readonly customerId: string
        readonly by: string
      }) => Effect.Effect<{ readonly advanced: true }, unknown>)
    | undefined
}

export interface ProviderLiveHarness {
  readonly provider: PaymentProviderTag
  readonly supportsTestClock: boolean
  readonly supportsWebhookSimulation: boolean
  readonly webhookServer: LocalWebhookServer
  readonly createTestCustomer: (input?: {
    readonly customerId?: string | undefined
    readonly email?: string | undefined
    readonly name?: string | undefined
  }) => Effect.Effect<{ readonly customerId: string }, unknown, unknown>
  readonly attachTestPaymentMethod: (input: {
    readonly customerId: string
  }) => Effect.Effect<{ readonly attached: true }, unknown, unknown>
  readonly advanceProviderTime: (input: {
    readonly customerId: string
    readonly by: string
  }) => Effect.Effect<{ readonly advanced: true }, unknown, unknown>
  readonly dispatchWebhookFixture: <TProducts extends ReadonlyArray<unknown>>(input: {
    readonly sdk: BasePaySdkContract<ReadonlyArray<unknown>, TProducts>
    readonly eventType: string
    readonly signature?: string | undefined
  }) => Effect.Effect<
    {
      readonly accepted: boolean
      readonly providerEventId: string
      readonly fixture: StoredWebhookFixture
    },
    unknown,
    unknown
  >
  readonly waitForProjectionSettled: <A, E>(
    effect: Effect.Effect<A, E>,
    options?: {
      readonly retries?: number | undefined
      readonly delayMs?: number | undefined
    }
  ) => Effect.Effect<A, unknown>
}

const unsupported = (provider: PaymentProviderTag, capability: string) =>
  new Error(`Provider "${provider}" does not support ${capability} in this test harness`)

export const createLiveTestHarness = (options: ProviderLiveHarnessOptions) =>
  Effect.gen(function* () {
    const webhookServer = yield* makeLocalWebhookServer

    return {
      provider: options.provider,
      supportsTestClock: options.supportsTestClock ?? false,
      supportsWebhookSimulation: options.supportsWebhookSimulation ?? true,
      webhookServer,
      createTestCustomer: (input) =>
        insertTestCustomer({
          id: input?.customerId,
          email: input?.email,
          name: input?.name
        }).pipe(Effect.as({ customerId: input?.customerId ?? "customer_123" })),
      attachTestPaymentMethod: (input) =>
        options.attachPaymentMethod
          ? options.attachPaymentMethod(input)
          : Effect.fail(unsupported(options.provider, "attachTestPaymentMethod")),
      advanceProviderTime: (input) =>
        options.advanceClock
          ? options.advanceClock(input)
          : Effect.fail(unsupported(options.provider, "advanceProviderTime")),
      dispatchWebhookFixture: ({ sdk, eventType, signature }) =>
        Effect.gen(function* () {
          const fixture = loadGeneratedWebhookFixture(options.provider, eventType)

          if (!fixture) {
            return yield* Effect.fail(
              new Error(`Missing generated ${options.provider} fixture for event "${eventType}"`)
            )
          }

          const result = yield* sdk.webhooks.handle({
            provider: options.provider,
            body: fixture.payload,
            signature: signature ?? "test_signature"
          })

          return {
            accepted: result.accepted,
            providerEventId: result.providerEventId,
            fixture
          }
        }),
      waitForProjectionSettled: (effect, settleOptions) => {
        const retries = settleOptions?.retries ?? 10
        const delayMs = settleOptions?.delayMs ?? 25

        return Effect.tryPromise({
          try: async () => {
            let remaining = retries

            while (true) {
              const result = await Effect.runPromiseExit(effect)

              if (result._tag === "Success") {
                return result.value
              }

              if (remaining <= 0) {
                throw result.cause
              }

              remaining -= 1
              await new Promise((resolve) => setTimeout(resolve, delayMs))
            }
          },
          catch: (error) => error
        })
      }
    } satisfies ProviderLiveHarness
  })

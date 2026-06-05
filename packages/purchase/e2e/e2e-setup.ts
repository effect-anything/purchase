import type { ProvidedContext } from "vitest"

import { Effect, Layer, ManagedRuntime, Logger, LogLevel } from "effect"

import { DotEnvLive, makeTracingLayer } from "./internal/shared.ts"
import { BrokerLive, BrokerServer } from "./internal/webhook-broker.ts"

/**
 * Vitest global setup for provider E2E tests.
 *
 * Responsibilities:
 * 1. Load .env files so provider credentials are available.
 * 2. Acquire a provider-level lock to prevent concurrent sandbox mutations.
 * 3. Start the webhook broker (which starts a Wrangler tunnel and resolves a public URL).
 * 4. Provide the broker endpoint to test workers via vitest context.
 * 5. Return a teardown function that releases all resources.
 */
export default async function setup(project: {
  readonly provide: <K extends keyof ProvidedContext>(key: K, value: ProvidedContext[K]) => void
}) {
  const program = Effect.gen(function* () {
    const broker = yield* BrokerServer

    return broker
  })

  const Live = BrokerLive.pipe(
    Layer.provide(Logger.pretty),
    Layer.provide(Logger.minimumLogLevel(LogLevel.All)),
    Layer.provide(makeTracingLayer("e2e-broker")),
    Layer.provide(DotEnvLive),
    Layer.orDie
  )

  const runtime = ManagedRuntime.make(Live)

  const brokerServerInfo = await runtime.runPromise(program)

  project.provide("purchaseE2E", {
    broker: {
      localBaseURL: brokerServerInfo.localBaseURL,
      publicBaseURL: brokerServerInfo.publicBaseURL
    }
  })

  return async () => {
    await runtime.dispose()
  }
}

import type { ProvidedContext } from "vitest"

import { PlatformConfigProvider } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { Effect, Layer, ManagedRuntime } from "effect"
import * as path from "node:path"

import { Live } from "./runtime.ts"
import { BrokerServer } from "./webhook-broker.ts"

const repoRoot = new URL("../../../../", import.meta.url).pathname

const EnvFileLayer = Layer.mergeAll(
  PlatformConfigProvider.layerDotEnv(path.join(repoRoot, ".env")),
  PlatformConfigProvider.layerDotEnvAdd(path.join(repoRoot, ".env.local"))
).pipe(
  Layer.provide(NodeFileSystem.layer),
  Layer.catchAll((error) =>
    error._tag === "SystemError" && error.reason === "NotFound" ? Layer.empty : Layer.fail(error)
  )
)

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
    const p = yield* BrokerServer

    return p
  })

  const runtime = ManagedRuntime.make(Live.pipe(Layer.provide(EnvFileLayer)))

  const brokerServerInfo = await runtime.runPromise(program)

  project.provide("purchaseProviderE2E", {
    broker: {
      localBaseURL: brokerServerInfo.localBaseURL,
      publicBaseURL: brokerServerInfo.publicBaseURL
    }
  })

  return async () => {
    await runtime.dispose()
  }
}

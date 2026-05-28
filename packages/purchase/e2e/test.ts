import { Paddle } from "@effect-x/purchase/paddle"
/**
 * Standalone broker runner for manual testing outside vitest.
 *
 * This starts the broker with a Wrangler tunnel and keeps it alive until the process is
 * terminated. Useful for debugging webhook delivery without running the full
 * test suite.
 */
import { PlatformConfigProvider } from "@effect/platform"
import { NodeFileSystem, NodeRuntime } from "@effect/platform-node"
import { Layer, Effect } from "effect"
import * as path from "node:path"

import { makeHttpApiTesting } from "./utils/api.ts"
import { Live } from "./utils/runtime.ts"
import { BrokerServer } from "./utils/webhook-broker.ts"

const repoRoot = new URL("../../..", import.meta.url).pathname

const EnvFileLayer = Layer.mergeAll(
  PlatformConfigProvider.layerDotEnv(path.join(repoRoot, ".env")),
  PlatformConfigProvider.layerDotEnvAdd(path.join(repoRoot, ".env.local"))
).pipe(
  Layer.provide(NodeFileSystem.layer),
  Layer.catchAll((error) =>
    error._tag === "SystemError" && error.reason === "NotFound" ? Layer.empty : Layer.fail(error)
  )
)

const TestLayer = Layer.scopedDiscard(
  Effect.gen(function* () {
    const broker = yield* BrokerServer

    const ctx = yield* Layer.build(
      makeHttpApiTesting({
        broker: {
          localBaseURL: broker.localBaseURL,
          publicBaseURL: broker.publicBaseURL
        },
        paymentClient: Paddle
      })
    )

    // console.log(ctx)
  })
)

NodeRuntime.runMain(Layer.launch(TestLayer.pipe(Layer.provideMerge(Live), Layer.provide(EnvFileLayer))))

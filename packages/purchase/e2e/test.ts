import { Paddle } from "@effect-x/purchase/paddle"
import { NodeRuntime } from "@effect/platform-node"
import { Effect, Layer, Logger, LogLevel } from "effect"

import { EnvLayer } from "./internal/runtime.ts"
import { BrokerLive, BrokerServer } from "./internal/webhook-broker.ts"
import { makeHttpApiTesting } from "./utils/api.ts"

/**
 * Standalone broker runner for manual testing outside vitest.
 *
 * This starts the broker with a Wrangler tunnel and keeps it alive until the process is
 * terminated. Useful for debugging webhook delivery without running the full
 * test suite.
 */

const Live = BrokerLive.pipe(
  Layer.provide(Logger.pretty),
  Layer.provide(Logger.minimumLogLevel(LogLevel.All)),
  Layer.provide(EnvLayer),
  Layer.orDie
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
        paymentProvider: Paddle
      })
    )

    // console.log(ctx)
  })
).pipe(Layer.provide(Live))

NodeRuntime.runMain(Layer.launch(TestLayer))

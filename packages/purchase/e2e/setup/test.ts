import { PlatformConfigProvider } from "@effect/platform"
import { NodeFileSystem, NodeRuntime } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import * as path from "node:path"

import { Live } from "../infra/runtime.ts"
import { run } from "../infra/webhook-broker.ts"

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

const program = Effect.gen(function* () {
  yield* run("paddle")

  yield* Effect.logTrace("??")
})

NodeRuntime.runMain(program.pipe(Effect.provide(Live.pipe(Layer.provide(EnvFileLayer))), Effect.tap(Effect.never)))

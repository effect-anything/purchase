/**
 * Standalone broker runner for manual testing outside vitest.
 *
 * This starts the broker with a Wrangler tunnel and keeps it alive until the process is
 * terminated. Useful for debugging webhook delivery without running the full
 * test suite.
 */
import { PlatformConfigProvider } from "@effect/platform"
import { NodeFileSystem, NodeRuntime } from "@effect/platform-node"
import { Layer } from "effect"
import * as path from "node:path"

import { Live } from "./utils/runtime.ts"

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

NodeRuntime.runMain(Layer.launch(Live.pipe(Layer.provide(EnvFileLayer))))

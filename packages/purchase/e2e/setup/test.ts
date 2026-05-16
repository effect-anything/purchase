import { PlatformConfigProvider } from "@effect/platform"
import { NodeFileSystem, NodeRuntime } from "@effect/platform-node"
import { Layer } from "effect"
import * as path from "node:path"

import { Live } from "../infra/runtime.ts"

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

NodeRuntime.runMain(Layer.launch(Live.pipe(Layer.provide(EnvFileLayer))))

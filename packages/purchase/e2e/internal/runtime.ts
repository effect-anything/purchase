import { PlatformConfigProvider } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { Layer } from "effect"
import * as path from "node:path"

const repoRoot = new URL("../../../../", import.meta.url).pathname

export const EnvLayer = Layer.mergeAll(
  PlatformConfigProvider.layerDotEnv(path.join(repoRoot, ".env")),
  PlatformConfigProvider.layerDotEnvAdd(path.join(repoRoot, ".env.local"))
).pipe(
  Layer.provide(NodeFileSystem.layer),
  Layer.catchAll((error) =>
    error._tag === "SystemError" && error.reason === "NotFound" ? Layer.empty : Layer.fail(error)
  )
)

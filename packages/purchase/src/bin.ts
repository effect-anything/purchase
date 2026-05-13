#!/usr/bin/env -S node --import tsx
import * as NodeContext from "@effect/platform-node/NodeContext"
import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import * as Effect from "effect/Effect"
import { pathToFileURL } from "node:url"

import { cli } from "./cli.ts"

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain)
}

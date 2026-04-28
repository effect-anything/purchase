import { Command } from "effect/unstable/cli"
import { NodeServices } from "@effect/platform-node"
import * as Effect from "effect/Effect"
import { describe, it } from "vitest"
import { rootCommand } from "../src/commands.ts"

describe("database cli", () => {
  it("shows help and version", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const runCommand = Command.runWith(rootCommand, { version: "1.0.0" })

        yield* runCommand(["--help"])
        yield* runCommand(["--version"])
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
    ))
})

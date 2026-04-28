import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import * as NodeServices from "@effect/platform-node/NodeServices"
import * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import * as Command from "effect/unstable/cli/Command"
import { rootCommand } from "./commands.ts"
import * as CliLog from "./utils/log.ts"

const program = Command.run(rootCommand, { version: "0.0.1" }).pipe(
  Effect.scoped,
  Effect.provide(NodeServices.layer),
  Effect.catchCause((cause) => {
    const error = Cause.squash(cause)
    const message = error instanceof Error ? error.message : String(error)

    return CliLog.error(message).pipe(Effect.andThen(Effect.sync(() => (process.exitCode = 1))))
  })
)

NodeRuntime.runMain(program)

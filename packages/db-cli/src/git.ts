import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import type { Stage } from "./domain.ts"
import { runCommand } from "./utils/shell.ts"

export interface GitCommandOptions {
  cwd?: string
  trim?: boolean
}

const gitBranch = Effect.gen(function* () {
  if (process.env.GITHUB_REF_NAME) return process.env.GITHUB_REF_NAME

  return yield* runCommand("git", ["rev-parse", "--abbrev-ref", "HEAD"]).pipe(
    Effect.map((_) => _.stdout),
    Effect.withSpan("git.branch")
  )
}).pipe(Effect.cached, Effect.runSync)

export const detectStage = Effect.fn("detectStage")(function* (defaultStage?: Option.Option<Stage> | undefined) {
  const branch = yield* gitBranch
  const defaultValue = defaultStage ? Option.getOrUndefined(defaultStage) : undefined
  const branchStage = branch === "main" ? "production" : branch === "staging" ? "staging" : "test"

  process.env.STAGE = defaultValue || process.env.STAGE || branchStage
})

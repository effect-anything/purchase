import * as Data from "effect/Data"
import type { Workspace } from "./workspace.ts"

export type NodeEnv = "development" | "production"
export type Stage = "test" | "staging" | "production"

export const resolveNodeEnv = (value: string | undefined): NodeEnv =>
  value === "production" ? "production" : "development"

export const resolveStage = (value: string | undefined): Stage =>
  value === "production" || value === "staging" ? value : "test"

export class DatabaseSeedSubcommand extends Data.TaggedClass("DatabaseSeedSubcommand")<{
  readonly env: NodeEnv
  readonly stage: Stage
  readonly workspace: Workspace
  readonly database: string | undefined
  readonly file: string | undefined
}> {}

export class DatabasePushSubcommand extends Data.TaggedClass("DatabasePushSubcommand")<{
  readonly env: NodeEnv
  readonly stage: Stage
  readonly workspace: Workspace
  readonly database: string | undefined
  readonly forcePush: boolean
  readonly skipDump: boolean
}> {}

export class DatabaseDumpSubcommand extends Data.TaggedClass("DatabaseDumpSubcommand")<{
  readonly env: NodeEnv
  readonly stage: Stage
  readonly workspace: Workspace
  readonly database: string | undefined
}> {}

export type SchemaDumpResult = {
  readonly provider: string
  readonly status: "unchanged" | "updated"
  readonly output: string
}

export class DatabaseConfigurationError extends Data.TaggedError("DatabaseConfigurationError")<{
  readonly description: string
}> {
  override get message() {
    return this.description
  }
}

export class DatabaseExecuteInputError extends Data.TaggedError("DatabaseExecuteInputError")<{
  readonly reason: "MissingInput" | "ConflictingInput" | "EmptyInput"
}> {
  override get message() {
    switch (this.reason) {
      case "MissingInput":
        return "Execute requires --sql or --file."
      case "ConflictingInput":
        return "Execute accepts either --sql or --file, not both."
      case "EmptyInput":
        return "Execute input is empty."
    }
  }
}

export class DatabaseExecuteSubcommand extends Data.TaggedClass("DatabaseExecuteSubcommand")<{
  readonly env: NodeEnv
  readonly stage: Stage
  readonly workspace: Workspace
  readonly sql: string | undefined
  readonly file: string | undefined
  readonly database: string | undefined
}> {}

export class DatabaseMigrateDevSubcommand extends Data.TaggedClass("DatabaseMigrateDevSubcommand")<{
  readonly env: NodeEnv
  readonly stage: Stage
  readonly workspace: Workspace
  readonly database: string | undefined
  readonly forceDev: boolean
  readonly migrationName: string | undefined
  readonly skipSeed: boolean
  readonly skipDump: boolean
}> {}

export class DatabaseMigrateResetSubcommand extends Data.TaggedClass("DatabaseMigrateResetSubcommand")<{
  readonly env: NodeEnv
  readonly stage: Stage
  readonly workspace: Workspace
  readonly database: string | undefined
  readonly forceReset: boolean
  readonly skipSeed: boolean
}> {}

export class DatabaseMigrateDeploySubcommand extends Data.TaggedClass("DatabaseMigrateDeploySubcommand")<{
  readonly env: NodeEnv
  readonly stage: Stage
  readonly workspace: Workspace
  readonly database: string | undefined
}> {}

export class DatabaseMigrateResolveInputError extends Data.TaggedError("DatabaseMigrateResolveInputError")<{
  readonly reason: "MissingAction" | "ConflictingAction"
}> {
  override get message() {
    switch (this.reason) {
      case "MissingAction":
        return "Resolve requires --applied or --rolled-back."
      case "ConflictingAction":
        return "Resolve accepts either --applied or --rolled-back, not both."
    }
  }
}

export class DatabaseMigrateResolveSubcommand extends Data.TaggedClass("DatabaseMigrateResolveSubcommand")<{
  readonly env: NodeEnv
  readonly stage: Stage
  readonly workspace: Workspace
  readonly database: string | undefined
  readonly appliedMigration: string | undefined
  readonly rolledBackMigration: string | undefined
}> {}

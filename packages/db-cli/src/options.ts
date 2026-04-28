import * as Flag from "effect/unstable/cli/Flag"
import * as Effect from "effect/Effect"

const dbCwdOption = Flag.string("cwd").pipe(
  Flag.withDescription("Workspace root used to resolve the target project"),
  Flag.withDefault(
    Effect.gen(function* () {
      return process.cwd()
    })
  )
)
const dbProjectOption = Flag.string("project").pipe(
  Flag.withDescription("Project name to operate on (for example: @moo/web)")
)

const dbDatabaseOption = Flag.string("database").pipe(
  Flag.withDescription("Optional database name from wrangler.jsonc"),
  Flag.withDefault(undefined)
)

const dbFileOption = Flag.string("file").pipe(
  Flag.withDescription("Relative path to a file used by the command (seed or SQL script)"),
  Flag.withDefault(undefined)
)

const dbSqlOption = Flag.string("sql").pipe(
  Flag.withDescription("Inline SQL command to execute"),
  Flag.withDefault(undefined)
)

const dbSkipSeedOption = Flag.boolean("skip-seed").pipe(
  Flag.withDescription("Skip running seeds after database operations"),
  Flag.withDefault(false)
)

const dbForceFlag = Flag.boolean("force").pipe(
  Flag.withDescription("Skip confirmation prompts for destructive database operations"),
  Flag.withDefault(false)
)

const dbSkipDumpOption = Flag.boolean("skip-dump").pipe(
  Flag.withDescription("Skip writing Prisma schema dumps after push operations"),
  Flag.withDefault(false)
)

const dbMigrationNameOption = Flag.string("migration-name").pipe(
  Flag.withDescription("Name to use for newly generated migrations"),
  Flag.withDefault(undefined)
)

const dbAppliedMigrationOption = Flag.string("applied").pipe(
  Flag.withDescription("Mark a migration as applied"),
  Flag.withDefault(undefined)
)

const dbRolledBackMigrationOption = Flag.string("rolled-back").pipe(
  Flag.withDescription("Mark a migration as rolled back"),
  Flag.withDefault(undefined)
)

export {
  dbAppliedMigrationOption,
  dbCwdOption,
  dbDatabaseOption,
  dbForceFlag,
  dbFileOption,
  dbMigrationNameOption,
  dbProjectOption,
  dbRolledBackMigrationOption,
  dbSkipDumpOption,
  dbSkipSeedOption,
  dbSqlOption
}

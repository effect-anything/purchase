import * as Command from "effect/unstable/cli/Command"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"

import { detectStage } from "./git.ts"
import * as Workspace from "./workspace.ts"
import {
  DatabaseDumpSubcommand,
  DatabaseExecuteInputError,
  DatabaseExecuteSubcommand,
  DatabaseMigrateDeploySubcommand,
  DatabaseMigrateDevSubcommand,
  DatabaseMigrateResetSubcommand,
  DatabaseMigrateResolveSubcommand,
  DatabasePushSubcommand,
  DatabaseSeedSubcommand,
  resolveNodeEnv,
  resolveStage
} from "./domain.ts"
import {
  dbCwdOption,
  dbDatabaseOption,
  dbFileOption,
  dbForceFlag,
  dbMigrationNameOption,
  dbProjectOption,
  dbAppliedMigrationOption,
  dbRolledBackMigrationOption,
  dbSkipDumpOption,
  dbSkipSeedOption,
  dbSqlOption
} from "./options.ts"
import * as databaseModule from "./subcommand.ts"

const baseCommand = Command.make("db").pipe(
  Command.withSharedFlags({
    cwd: dbCwdOption,
    project: dbProjectOption,
    database: dbDatabaseOption
  }),
  Command.withDescription("Database push, dump, execute, and migration commands")
)

const resolveBaseFlags = Effect.gen(function* () {
  const baseFlags = yield* baseCommand
  const workspace = yield* Workspace.make({ cwd: baseFlags.cwd, project: baseFlags.project })

  return {
    ...baseFlags,
    env: resolveNodeEnv(process.env.NODE_ENV),
    stage: resolveStage(process.env.STAGE),
    workspace
  }
})

export const pushCommand = Command.make(
  "push",
  {
    forcePush: dbForceFlag,
    skipDump: dbSkipDumpOption
  },
  Effect.fn(function* (config) {
    yield* detectStage()
    const baseFlags = yield* resolveBaseFlags

    yield* databaseModule
      .push(
        baseFlags.workspace,
        new DatabasePushSubcommand({
          env: baseFlags.env,
          stage: baseFlags.stage,
          workspace: baseFlags.workspace,
          database: baseFlags.database,
          forcePush: config.forcePush,
          skipDump: config.skipDump
        })
      )
      .pipe(Effect.catchTag("DatabasePushCancelled", () => Effect.void))
  })
)

export const dumpCommand = Command.make(
  "dump",
  {},
  Effect.fn(function* () {
    yield* detectStage()
    const baseFlags = yield* resolveBaseFlags

    yield* databaseModule.dump(
      baseFlags.workspace,
      new DatabaseDumpSubcommand({
        env: baseFlags.env,
        stage: baseFlags.stage,
        workspace: baseFlags.workspace,
        database: baseFlags.database
      })
    )
  })
)

export const executeCommand = Command.make(
  "execute",
  { sql: dbSqlOption, file: dbFileOption },
  Effect.fn(function* (config) {
    if (config.sql && config.file) {
      return yield* Effect.fail(new DatabaseExecuteInputError({ reason: "ConflictingInput" }))
    }

    if (!config.sql && !config.file) {
      return yield* Effect.fail(new DatabaseExecuteInputError({ reason: "MissingInput" }))
    }

    yield* detectStage()
    const baseFlags = yield* resolveBaseFlags

    yield* databaseModule.execute(
      baseFlags.workspace,
      new DatabaseExecuteSubcommand({
        env: baseFlags.env,
        stage: baseFlags.stage,
        workspace: baseFlags.workspace,
        database: baseFlags.database,
        sql: config.sql,
        file: config.file
      })
    )
  })
)

export const seedCommand = Command.make(
  "seed",
  { file: dbFileOption },
  Effect.fn(function* (config) {
    yield* detectStage()
    const baseFlags = yield* resolveBaseFlags

    yield* databaseModule.seed(
      baseFlags.workspace,
      new DatabaseSeedSubcommand({
        env: baseFlags.env,
        stage: baseFlags.stage,
        workspace: baseFlags.workspace,
        database: baseFlags.database,
        file: config.file
      })
    )
  })
)

export const migrateDevCommand = Command.make(
  "dev",
  {
    forceDev: dbForceFlag,
    skipSeed: dbSkipSeedOption,
    skipDump: dbSkipDumpOption,
    migrationName: dbMigrationNameOption
  },
  Effect.fn(function* (config) {
    yield* detectStage()
    const baseFlags = yield* resolveBaseFlags

    yield* databaseModule
      .dev(
        baseFlags.workspace,
        new DatabaseMigrateDevSubcommand({
          env: baseFlags.env,
          stage: baseFlags.stage,
          workspace: baseFlags.workspace,
          database: baseFlags.database,
          forceDev: config.forceDev,
          skipSeed: config.skipSeed,
          skipDump: config.skipDump,
          migrationName: config.migrationName
        })
      )
      .pipe(Effect.catchTag("DatabaseResetCancelled", () => Effect.void))
  })
)

export const migrateResetCommand = Command.make(
  "reset",
  {
    forceReset: dbForceFlag,
    skipSeed: dbSkipSeedOption
  },
  Effect.fn(function* (config) {
    yield* detectStage()
    const baseFlags = yield* resolveBaseFlags

    yield* databaseModule
      .reset(
        baseFlags.workspace,
        new DatabaseMigrateResetSubcommand({
          env: baseFlags.env,
          stage: baseFlags.stage,
          workspace: baseFlags.workspace,
          database: baseFlags.database,
          forceReset: config.forceReset,
          skipSeed: config.skipSeed
        })
      )
      .pipe(Effect.catchTag("DatabaseResetCancelled", () => Effect.void))
  })
)

export const migrateDeployCommand = Command.make(
  "deploy",
  {},
  Effect.fn(function* () {
    yield* detectStage()
    const baseFlags = yield* resolveBaseFlags

    yield* databaseModule.deploy(
      baseFlags.workspace,
      new DatabaseMigrateDeploySubcommand({
        env: baseFlags.env,
        stage: baseFlags.stage,
        workspace: baseFlags.workspace,
        database: baseFlags.database
      })
    )
  })
)

export const migrateResolveCommand = Command.make(
  "resolve",
  {
    appliedMigration: dbAppliedMigrationOption,
    rolledBackMigration: dbRolledBackMigrationOption
  },
  Effect.fn(function* (config) {
    yield* detectStage()
    const baseFlags = yield* resolveBaseFlags

    yield* databaseModule.resolve(
      baseFlags.workspace,
      new DatabaseMigrateResolveSubcommand({
        env: baseFlags.env,
        stage: baseFlags.stage,
        workspace: baseFlags.workspace,
        database: baseFlags.database,
        appliedMigration: config.appliedMigration,
        rolledBackMigration: config.rolledBackMigration
      })
    )
  })
)

export const rootCommand = pipe(
  baseCommand,
  Command.withSubcommands([
    pushCommand,
    dumpCommand,
    executeCommand,
    seedCommand,
    migrateDevCommand,
    migrateResetCommand,
    migrateDeployCommand,
    migrateResolveCommand
  ])
)

/** @effect-diagnostics preferSchemaOverJson:off */

import * as FileSystem from "effect/FileSystem"
import * as Path from "effect/Path"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as Prompt from "effect/unstable/cli/Prompt"
import { execFile } from "node:child_process"
import { promisify } from "node:util"

import type * as Workspace from "./workspace.ts"
import {
  DatabaseDumpSubcommand,
  DatabaseExecuteInputError,
  type DatabaseExecuteSubcommand,
  type DatabaseMigrateDeploySubcommand,
  type DatabaseMigrateDevSubcommand,
  DatabaseMigrateResolveInputError,
  type DatabaseMigrateResetSubcommand,
  type DatabaseMigrateResolveSubcommand,
  type DatabasePushSubcommand,
  DatabaseSeedSubcommand,
  type SchemaDumpResult
} from "./domain.ts"
import * as D1 from "./d1.ts"
import * as Seed from "./seed.ts"
import * as Server from "./server.ts"
import * as Shared from "./shared.ts"
import * as SQLite from "./sqlite.ts"
import * as CliLog from "./utils/log.ts"
import { formatMigrationName, randomReadableSlug } from "./utils/slug.ts"

export const existDatabase = Shared.existDatabase

export class DatabasePushCancelled extends Data.TaggedError("DatabasePushCancelled")<{
  readonly database: string | undefined
}> {}

export class DatabaseResetCancelled extends Data.TaggedError("DatabaseResetCancelled")<{
  readonly database: string | undefined
}> {}

const execFileAsync = promisify(execFile)

const isNativeSqlite = (
  config: Shared.DatabaseConfig
): config is
  | Extract<Shared.DatabaseConfig, { runtime: "browser" }>
  | Extract<Shared.DatabaseConfig, { runtime: "server" }> =>
  config.provider === "sqlite" && (config.runtime === "browser" || config.runtime === "server")

const ensureDiffOutput = (output: ReadonlyArray<unknown>) =>
  output.filter((line): line is string => {
    if (typeof line !== "string" || line.trim().length === 0) {
      return false
    }

    if (line.indexOf("empty migration") > -1) {
      return false
    }

    return true
  })

const ignoredDataTables = ["_cf_KV", "_cf_METADATA", "_prisma_migrations", "d1_migrations"] as const

const quoteSqliteIdentifier = (identifier: string) => `"${identifier.replace(/"/g, '""')}"`

type DataTableSummary = {
  readonly name: string
  readonly rows: number
}

const runSqliteReadonly = Effect.fnUntraced(function* (databaseFile: string, sql: string) {
  const output = yield* Effect.tryPromise({
    try: () => execFileAsync("sqlite3", ["-readonly", "-noheader", databaseFile, sql]),
    catch: (error) => error
  }).pipe(Effect.orDie)

  return output.stdout.toString().trim()
})

const getSqliteDataTables = Effect.fnUntraced(function* (databaseFile: string) {
  const fs = yield* FileSystem.FileSystem
  const exists = yield* fs.exists(databaseFile).pipe(Effect.orElseSucceed(() => false))

  if (!exists) {
    return []
  }

  const tables = yield* runSqliteReadonly(
    databaseFile,
    [
      "SELECT name FROM sqlite_master",
      "WHERE type = 'table'",
      "AND name NOT LIKE 'sqlite_%'",
      `AND name NOT IN (${ignoredDataTables.map((table) => `'${table}'`).join(", ")})`,
      "ORDER BY name;"
    ].join(" ")
  )
  const dataTables: Array<DataTableSummary> = []

  for (const table of tables.split("\n").filter((line) => line.trim().length > 0)) {
    const rowCount = yield* runSqliteReadonly(databaseFile, `SELECT COUNT(1) FROM ${quoteSqliteIdentifier(table)};`)
    const rows = Number.parseInt(rowCount, 10)

    if (rows > 0) {
      dataTables.push({
        name: table,
        rows
      })
    }
  }

  return dataTables
})

const getDatabaseDataTables = Effect.fnUntraced(function* (
  workspace: Workspace.Workspace,
  config: Shared.DatabaseConfig,
  dbDir: string,
  database: string | undefined
) {
  if (config.runtime === "d1") {
    const { databaseFile } = yield* D1.getWranglerConfig(workspace, { database })
    return yield* getSqliteDataTables(databaseFile)
  }

  if (isNativeSqlite(config)) {
    const path = yield* Path.Path
    return yield* getSqliteDataTables(SQLite.getDatabaseFile(dbDir, config, path))
  }

  return []
})

const formatDataTablesForPrompt = (tables: ReadonlyArray<DataTableSummary>) =>
  tables
    .slice(0, 5)
    .map((table) => `${table.name} (${table.rows} rows)`)
    .join(", ") + (tables.length > 5 ? `, and ${tables.length - 5} more` : "")

const logDestructiveOperationPreflight = Effect.fnUntraced(function* (
  operation: "push" | "reset" | "dev-bootstrap-reset",
  config: Shared.DatabaseConfig,
  subcommand: DatabasePushSubcommand | DatabaseMigrateResetSubcommand | DatabaseMigrateDevSubcommand,
  dataTables: ReadonlyArray<DataTableSummary>
) {
  if (dataTables.length === 0) {
    return
  }

  yield* CliLog.warn(
    `Destructive ${operation} preflight: ${formatDataTablesForPrompt(dataTables)} contains data (${config.runtime}/${config.provider}, ${subcommand.stage})`
  )
})

const failPushCancelled = (database: string | undefined) =>
  Effect.fail(
    new DatabasePushCancelled({
      database
    })
  )

const failResetCancelled = (database: string | undefined) =>
  Effect.fail(
    new DatabaseResetCancelled({
      database
    })
  )

const confirmPushReset = Effect.fnUntraced(function* (
  workspace: Workspace.Workspace,
  config: Shared.DatabaseConfig,
  dbDir: string,
  subcommand: DatabasePushSubcommand
) {
  const dataTables = yield* getDatabaseDataTables(workspace, config, dbDir, subcommand.database)
  yield* logDestructiveOperationPreflight("push", config, subcommand, dataTables)

  if (dataTables.length === 0 || subcommand.forcePush) {
    return
  }

  const confirmed = yield* Prompt.confirm({
    message: `Database contains data in ${formatDataTablesForPrompt(dataTables)}. Push may reset or drop existing data. Continue?`,
    initial: false
  })

  if (!confirmed) {
    return yield* failPushCancelled(subcommand.database)
  }
})

const confirmReset = Effect.fnUntraced(function* (
  workspace: Workspace.Workspace,
  config: Shared.DatabaseConfig,
  dbDir: string,
  subcommand: DatabaseMigrateResetSubcommand
) {
  const dataTables = yield* getDatabaseDataTables(workspace, config, dbDir, subcommand.database)
  yield* logDestructiveOperationPreflight("reset", config, subcommand, dataTables)

  if (dataTables.length === 0 || subcommand.forceReset) {
    return
  }

  const confirmed = yield* Prompt.confirm({
    message: `Database contains data in ${formatDataTablesForPrompt(dataTables)}. Reset will remove existing data. Continue?`,
    initial: false
  })

  if (!confirmed) {
    return yield* failResetCancelled(subcommand.database)
  }
})

const confirmDevBootstrapReset = Effect.fnUntraced(function* (
  workspace: Workspace.Workspace,
  config: Shared.DatabaseConfig,
  dbDir: string,
  subcommand: DatabaseMigrateDevSubcommand
) {
  const dataTables = yield* getDatabaseDataTables(workspace, config, dbDir, subcommand.database)
  yield* logDestructiveOperationPreflight("dev-bootstrap-reset", config, subcommand, dataTables)

  if (dataTables.length === 0 || subcommand.forceDev) {
    return
  }

  const confirmed = yield* Prompt.confirm({
    message: `Database contains data in ${formatDataTablesForPrompt(dataTables)}. Dev bootstrap reset will remove existing data. Continue?`,
    initial: false
  })

  if (!confirmed) {
    return yield* failResetCancelled(subcommand.database)
  }
})

const getD1MigrationsDir = Effect.fnUntraced(function* (workspace: Workspace.Workspace, database: string | undefined) {
  const { migrationsDir } = yield* D1.getWranglerConfig(workspace, { database })
  return migrationsDir
})

const ensureMigrationsDir = Effect.fnUntraced(function* (migrationsDir: string) {
  const fs = yield* FileSystem.FileSystem
  const exists = yield* fs.exists(migrationsDir).pipe(Effect.orElseSucceed(() => false))

  if (!exists) {
    yield* fs.makeDirectory(migrationsDir, { recursive: true })
  }
})

const ensureMigrationLockFile = Effect.fnUntraced(function* (
  migrationsDir: string,
  provider: Shared.DatabaseConfig["provider"]
) {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path
  const lockfilePath = path.join(migrationsDir, "migration_lock.toml")
  const exists = yield* fs.exists(lockfilePath).pipe(Effect.orElseSucceed(() => false))

  if (!exists) {
    yield* fs.writeFileString(lockfilePath, `provider = "${provider}"\n`)
  }
})

const resolveMigrationName = Effect.fnUntraced(function* (migrationName: string | undefined) {
  if (migrationName) {
    const formatted = formatMigrationName(migrationName)

    if (formatted.length > 0) {
      return formatted
    }
  }

  const generated = yield* randomReadableSlug()

  return yield* Prompt.text({
    message: "Migration name",
    default: generated,
    validate: (value) => {
      const formatted = formatMigrationName(value)

      return formatted.length === 0 ? Effect.fail("Migration name is required") : Effect.succeed(formatted)
    }
  })
})

const validateExecuteInput = Effect.fnUntraced(function* (
  workspace: Workspace.Workspace,
  subcommand: DatabaseExecuteSubcommand
) {
  if (subcommand.sql !== undefined && subcommand.sql.trim().length === 0) {
    return yield* Effect.fail(new DatabaseExecuteInputError({ reason: "EmptyInput" }))
  }

  if (subcommand.file !== undefined) {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    const inputPath = path.isAbsolute(subcommand.file) ? subcommand.file : path.resolve(workspace.cwd, subcommand.file)
    const input = yield* fs.readFileString(inputPath)

    if (input.trim().length === 0) {
      return yield* Effect.fail(new DatabaseExecuteInputError({ reason: "EmptyInput" }))
    }
  }
})

const getMigrationNames = Effect.fnUntraced(function* (migrations: ReadonlyArray<Shared.PrismaMigration>) {
  const path = yield* Path.Path

  return migrations.map((migration) => path.basename(migration.filepath)).sort((a, b) => a.localeCompare(b))
})

const logDeployPreflight = Effect.fnUntraced(function* (
  workspace: Workspace.Workspace,
  config: Shared.DatabaseConfig,
  migrationsDir: string,
  migrations: ReadonlyArray<Shared.PrismaMigration>,
  subcommand: DatabaseMigrateDeploySubcommand
) {
  const migrationNames = yield* getMigrationNames(migrations)

  if (config.runtime === "d1") {
    const { databaseName, previewDatabaseId } = yield* D1.getWranglerConfig(workspace, {
      database: subcommand.database
    })
    const target = subcommand.stage !== "production" && previewDatabaseId ? "preview-remote" : "remote"

    yield* CliLog.info(
      `Deploy preflight: ${migrationNames.length} migration(s) from ${migrationsDir} to ${target} D1 database ${databaseName}`
    )
    return
  }

  yield* CliLog.info(
    `Deploy preflight: ${migrationNames.length} migration(s) from ${migrationsDir} to ${
      config.runtime === "browser" ? "browser local database" : "database url"
    } (${config.provider})`
  )
})

const logSchemaDumpResult = Effect.fnUntraced(function* (result: SchemaDumpResult) {
  const status = result.status === "unchanged" ? "unchanged" : "updated"
  yield* CliLog.info(`Schema dump ${status}: ${result.output} (${result.provider})`)
})

export const seed = Effect.fn("db.seed")(function* (
  workspace: Workspace.Workspace,
  subcommand: DatabaseSeedSubcommand
) {
  const { config, dbDir, tsconfigPath } = yield* Shared.detectDatabase(workspace, {
    databaseName: subcommand.database
  })
  const result = yield* Seed.run(workspace, {
    dbDir,
    tsconfigPath,
    config,
    subcommand
  })

  if (result._tag === "Skipped") {
    yield* CliLog.info(`Seed skipped: no seed file configured (${result.path})`)
    return
  }

  yield* CliLog.info(`Seed complete (${config.runtime}/${config.provider}): ${result.path}`)
})

export const dump = Effect.fn("db.dump")(function* (
  workspace: Workspace.Workspace,
  subcommand: DatabaseDumpSubcommand
) {
  const { dbDir, config } = yield* Shared.detectDatabase(workspace, {
    databaseName: subcommand.database
  })

  if (config.runtime === "d1") {
    const result = yield* D1.dump(workspace, subcommand, { dbDir })
    yield* logSchemaDumpResult(result)
  } else if (isNativeSqlite(config)) {
    const result = yield* SQLite.dump(dbDir, config)
    yield* logSchemaDumpResult(result)
  } else if (config.runtime === "server" && (config.provider === "postgresql" || config.provider === "mysql")) {
    const result = yield* Server.dump(workspace, dbDir, config)
    yield* logSchemaDumpResult(result)
  } else {
    return yield* CliLog.error("Database dump is not supported for this provider")
  }
})

export const push = Effect.fn("db.push")(function* (
  workspace: Workspace.Workspace,
  subcommand: DatabasePushSubcommand
) {
  const { config, tables, dbDir } = yield* Shared.detectDatabase(workspace, {
    databaseName: subcommand.database
  })

  yield* Shared.syncPrismaSchema(workspace, { dbDir }, config, tables)
  yield* confirmPushReset(workspace, config, dbDir, subcommand)

  if (config.runtime === "d1") {
    yield* D1.reset(workspace, { database: subcommand.database })

    const captureOutput = yield* Shared.runPrismaMigrateDiffCli(workspace, {
      dbDir,
      from: { tag: "empty" }
    })

    const ensuredOutputs = ensureDiffOutput(captureOutput)

    if (ensuredOutputs.length === 0) {
      yield* CliLog.info("No migration diff")
      return
    }

    yield* D1.push(workspace, {
      sql: ensuredOutputs.join("\n"),
      database: subcommand.database
    })
  } else if (isNativeSqlite(config)) {
    yield* Server.push(workspace, { dbDir })
  } else if (config.runtime === "server") {
    yield* Server.push(workspace, { dbDir })
  } else {
    yield* CliLog.error("Database push is not supported for this provider")
  }

  yield* CliLog.info(`Push complete (${config.runtime}/${config.provider})`)

  if (!subcommand.skipDump) {
    yield* dump(
      workspace,
      new DatabaseDumpSubcommand({
        env: subcommand.env,
        stage: subcommand.stage,
        workspace,
        database: subcommand.database
      })
    )
  }
})

export const execute = Effect.fn("db.execute")(function* (
  workspace: Workspace.Workspace,
  subcommand: DatabaseExecuteSubcommand
) {
  yield* validateExecuteInput(workspace, subcommand)

  const { config, tables, dbDir } = yield* Shared.detectDatabase(workspace, {
    databaseName: subcommand.database
  })

  if (config.runtime === "d1") {
    yield* D1.execute(workspace, subcommand)
  } else if (isNativeSqlite(config)) {
    yield* SQLite.execute(workspace, dbDir, config, subcommand)
  } else if (config.runtime === "server") {
    yield* Shared.syncPrismaSchema(workspace, { dbDir }, config, tables)
    yield* Server.execute(workspace, dbDir, subcommand)
  } else {
    yield* CliLog.error("Database execute is not supported for this provider")
  }

  yield* CliLog.info(`Execute complete (${config.runtime}/${config.provider})`)
})

export const dev = Effect.fn("db.dev")(function* (
  workspace: Workspace.Workspace,
  subcommand: DatabaseMigrateDevSubcommand
) {
  const path = yield* Path.Path
  const {
    config,
    tables,
    dbDir,
    migrationsDir: detectedMigrationsDir
  } = yield* Shared.detectDatabase(workspace, {
    databaseName: subcommand.database
  })
  const migrationsDir =
    config.runtime === "d1" ? yield* getD1MigrationsDir(workspace, subcommand.database) : detectedMigrationsDir
  yield* ensureMigrationsDir(migrationsDir)
  const migrations = yield* Shared.getMigrations(migrationsDir)

  yield* Shared.syncPrismaSchema(workspace, { dbDir }, config, tables)

  const captureOutput = yield* Shared.runPrismaMigrateDiffCli(workspace, {
    dbDir,
    from: migrations.length === 0 ? { tag: "empty" } : { tag: "migrations", path: migrationsDir },
    provider: config.provider
  })

  const ensuredOutputs = ensureDiffOutput(captureOutput)
  const shouldResetD1BeforeApply = config.runtime === "d1" && migrations.length === 0

  if (shouldResetD1BeforeApply) {
    yield* confirmDevBootstrapReset(workspace, config, dbDir, subcommand)
  }

  if (ensuredOutputs.length === 0) {
    yield* CliLog.info("No migration diff")
  } else {
    const isNativeMigration = config.runtime === "browser" || config.runtime === "server"
    const migrationName = yield* resolveMigrationName(subcommand.migrationName)
    const migrationDate = yield* Shared.getMigrationDate
    const outputFile = isNativeMigration
      ? path.join(`${migrationDate}_${migrationName}`, "migration.sql")
      : `${migrationDate}_${migrationName}.sql`
    const outputMigrationFile = path.join(migrationsDir, outputFile)

    yield* CliLog.info(`Generated migration: ${outputMigrationFile}`)

    const fs = yield* FileSystem.FileSystem
    if (isNativeMigration) {
      yield* ensureMigrationLockFile(migrationsDir, config.provider)
      const dir = path.join(migrationsDir, `${migrationDate}_${migrationName}`)
      yield* fs.makeDirectory(dir)
    }
    yield* fs.writeFileString(outputMigrationFile, ensuredOutputs.join("\n"))
  }

  const migrationsToApply = ensuredOutputs.length === 0 ? migrations : yield* Shared.getMigrations(migrationsDir)

  yield* CliLog.info(`Apply dev migrations (${config.runtime}/${config.provider})`)

  if (config.runtime === "d1") {
    yield* D1.applyMigrations(workspace, {
      database: subcommand.database,
      reset: shouldResetD1BeforeApply
    })
  } else if (isNativeSqlite(config)) {
    const datasource =
      config.runtime === "server" ? { url: config.url } : { url: `file:${path.join(dbDir, Shared.devDB)}` }

    if (config.runtime === "server") {
      yield* SQLite.ensureUnlocked(SQLite.getDatabaseFile(dbDir, config, path))
    }

    yield* Server.applyPrismaMigrations(workspace, {
      datasource,
      dbDir,
      migrationsDir,
      migrations: migrationsToApply
    })
  } else if (config.runtime === "server") {
    yield* Server.applyPrismaMigrations(workspace, {
      datasource: { url: config.url },
      dbDir,
      migrationsDir,
      migrations: migrationsToApply
    })
  }

  yield* CliLog.info(`Migrate complete (${config.runtime}/${config.provider})`)

  if (!subcommand.skipDump) {
    yield* dump(
      workspace,
      new DatabaseDumpSubcommand({
        env: subcommand.env,
        stage: subcommand.stage,
        workspace,
        database: subcommand.database
      })
    )
  }
})

export const reset = Effect.fn("db.reset")(function* (
  workspace: Workspace.Workspace,
  subcommand: DatabaseMigrateResetSubcommand
) {
  const path = yield* Path.Path
  const { config, dbDir, migrationsDir } = yield* Shared.detectDatabase(workspace, {
    databaseName: subcommand.database
  })
  yield* confirmReset(workspace, config, dbDir, subcommand)

  if (config.runtime === "d1") {
    yield* D1.applyMigrations(workspace, {
      database: subcommand.database,
      reset: true
    })
  } else if (isNativeSqlite(config)) {
    const datasource =
      config.runtime === "server" ? { url: config.url } : { url: `file:${path.join(dbDir, Shared.devDB)}` }
    const migrations = yield* Shared.getMigrations(migrationsDir)

    if (config.runtime === "server") {
      yield* SQLite.ensureUnlocked(SQLite.getDatabaseFile(dbDir, config, path))
    }

    yield* Server.applyPrismaMigrations(workspace, {
      dbDir,
      migrationsDir,
      datasource,
      migrations,
      reset: true
    })
  } else if (config.runtime === "server") {
    const migrations = yield* Shared.getMigrations(migrationsDir)

    yield* Server.applyPrismaMigrations(workspace, {
      dbDir,
      migrationsDir,
      datasource: { url: config.url },
      migrations,
      reset: true
    })
  }

  yield* CliLog.info(`Reset complete (${config.runtime}/${config.provider})`)

  if (!subcommand.skipSeed) {
    yield* seed(
      workspace,
      new DatabaseSeedSubcommand({
        workspace,
        env: subcommand.env,
        stage: subcommand.stage,
        database: subcommand.database,
        file: undefined
      })
    )
  }
})

export const deploy = Effect.fn("db.deploy")(function* (
  workspace: Workspace.Workspace,
  subcommand: DatabaseMigrateDeploySubcommand
) {
  const {
    config,
    tables,
    migrationsDir: detectedMigrationsDir,
    dbDir
  } = yield* Shared.detectDatabase(workspace, {
    databaseName: subcommand.database
  })
  const migrationsDir =
    config.runtime === "d1" ? yield* getD1MigrationsDir(workspace, subcommand.database) : detectedMigrationsDir
  const fs = yield* FileSystem.FileSystem
  const hasMigrationsDir = yield* fs.exists(migrationsDir).pipe(Effect.orElseSucceed(() => false))

  if (!hasMigrationsDir) {
    yield* logDeployPreflight(workspace, config, migrationsDir, [], subcommand)
    return yield* CliLog.info(`No migrations to deploy: ${migrationsDir}`)
  }

  const migrations = yield* Shared.getMigrations(migrationsDir)
  yield* logDeployPreflight(workspace, config, migrationsDir, migrations, subcommand)

  if (migrations.length === 0) {
    return yield* CliLog.info(`No migrations to deploy: ${migrationsDir}`)
  }

  if (config.runtime === "d1") {
    yield* D1.applyMigrations(workspace, {
      database: subcommand.database,
      deploy: true
    })
  } else if (config.runtime === "browser") {
    yield* CliLog.info("Deploy skipped: browser database")
  } else if (config.runtime === "server") {
    yield* Shared.syncPrismaSchema(workspace, { dbDir }, config, tables)

    yield* Server.applyPrismaMigrations(workspace, {
      dbDir,
      migrationsDir,
      datasource: { url: config.url },
      migrations
    })
  }

  yield* CliLog.info(`Deploy complete (${config.runtime}/${config.provider})`)
})

export const resolve = Effect.fn("resolve")(function* (
  workspace: Workspace.Workspace,
  subcommand: DatabaseMigrateResolveSubcommand
) {
  const { config, dbDir } = yield* Shared.detectDatabase(workspace, {
    databaseName: subcommand.database
  })

  const hasApplied = subcommand.appliedMigration !== undefined
  const hasRolledBack = subcommand.rolledBackMigration !== undefined

  if (hasApplied && hasRolledBack) {
    return yield* Effect.fail(new DatabaseMigrateResolveInputError({ reason: "ConflictingAction" }))
  }

  if (!hasApplied && !hasRolledBack) {
    return yield* Effect.fail(new DatabaseMigrateResolveInputError({ reason: "MissingAction" }))
  }

  if (config.runtime === "d1") {
    yield* D1.resolveMigration(workspace, subcommand)
  } else if (config.runtime === "server") {
    yield* Server.resolvePrismaMigration(workspace, dbDir, subcommand)
  } else {
    yield* Server.resolvePrismaMigration(workspace, dbDir, subcommand)
  }

  const action = subcommand.appliedMigration !== undefined ? "applied" : "rolled back"
  const migration = subcommand.appliedMigration ?? subcommand.rolledBackMigration
  yield* CliLog.info(`Resolve migration complete: ${action} ${migration}`)
})

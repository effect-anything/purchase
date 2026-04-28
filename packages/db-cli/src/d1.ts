/** @effect-diagnostics preferSchemaOverJson:off */

import type { Unstable_Config } from "wrangler"

import * as FileSystem from "effect/FileSystem"
import * as Path from "effect/Path"
import * as Effect from "effect/Effect"
import * as Result from "effect/Result"
import * as Schedule from "effect/Schedule"
import type * as Scope from "effect/Scope"
import { execFile } from "node:child_process"
import { promisify } from "node:util"

import type * as Workspace from "./workspace.ts"
import type {
  DatabaseDumpSubcommand,
  DatabaseExecuteSubcommand,
  DatabaseMigrateResolveSubcommand,
  SchemaDumpResult
} from "./domain.ts"

import { CloudflareConfig, getD1Name, parseConfig } from "./cloudflare.ts"
import { DatabaseConfigurationError, resolveNodeEnv, resolveStage } from "./domain.ts"

import { formatCommandOutput, logCommandOutput, runCommand } from "./utils/shell.ts"
import * as CliLog from "./utils/log.ts"

type ExecFileResult = {
  stdout: string
  stderr: string
  exitCode: number
}

const execFileAsync = promisify(execFile)

const quoteSqlString = (value: string) => `'${value.replace(/'/g, "''")}'`

export const getWranglerConfig = Effect.fn("wrangler.get-config")(function* (
  workspace: Workspace.Workspace,
  { database }: { database?: string | undefined } = {}
): Effect.fn.Return<
  {
    persistRoot: string
    persistTo: string
    wranglerConfigPath: string
    databaseName: string
    databaseNameId: string
    databaseFile: string
    migrationsDir: string
    databaseId: string | undefined
    previewDatabaseId: string | undefined
  },
  never,
  FileSystem.FileSystem | Path.Path | Scope.Scope
> {
  const path = yield* Path.Path
  const wranglerConfigPath = path.join(workspace.projectPath, "wrangler.jsonc")

  const { config: wranglerConfig, path: foundWranglerConfigPath } = yield* parseConfig(
    [wranglerConfigPath],
    resolveNodeEnv(process.env.NODE_ENV),
    resolveStage(process.env.STAGE)
  )

  const d1Databases = wranglerConfig.d1_databases ?? []
  const selectedDatabaseName = database || d1Databases[0]?.database_name
  const selectedDatabase = d1Databases.find((_) => _.database_name === selectedDatabaseName)

  if (!selectedDatabaseName) {
    return yield* Effect.die(
      new DatabaseConfigurationError({
        description: `No D1 database configured in ${foundWranglerConfigPath}. Add wrangler d1_databases or change db/tables.ts runtime.`
      })
    )
  }

  if (!selectedDatabase) {
    return yield* Effect.die(
      new DatabaseConfigurationError({
        description: `D1 database ${selectedDatabaseName} not found in ${foundWranglerConfigPath}.`
      })
    )
  }

  const databaseNameId = yield* databaseNameToId(wranglerConfig, selectedDatabaseName)
  const previewDatabaseId = selectedDatabase?.preview_database_id
  const databaseId = selectedDatabase?.database_id
  const migrationsDir = path.resolve(
    path.dirname(foundWranglerConfigPath),
    selectedDatabase?.migrations_dir ?? "migrations"
  )

  const persistRoot = path.join(workspace.cwd, ".wrangler/state")
  const persistTo = path.join(persistRoot, "v3")
  const dbFile = path.join(persistTo, "d1/miniflare-D1DatabaseObject", `${databaseNameId}.sqlite`)

  return {
    persistRoot,
    persistTo,
    wranglerConfigPath: foundWranglerConfigPath,
    databaseName: selectedDatabaseName,
    databaseNameId,
    databaseFile: dbFile,
    migrationsDir,
    databaseId,
    previewDatabaseId
  }
})

const databaseNameToId = (config: Unstable_Config, name: string) =>
  Effect.suspend(() => {
    const databaseId = (config.d1_databases ?? []).find((item) => item.database_name === name)?.database_id

    return !databaseId
      ? Effect.die(new DatabaseConfigurationError({ description: `D1 database ${name} is missing database_id.` }))
      : Effect.succeed(getD1Name(databaseId))
  })

const execFileResult = Effect.fn("process.exec-file-result")(function* (
  command: string,
  args: ReadonlyArray<string>,
  options?: { cwd?: string | undefined }
): Effect.fn.Return<ExecFileResult, never> {
  const result = yield* Effect.tryPromise({
    try: () =>
      execFileAsync(command, [...args], options).then((output) => ({
        stdout: output.stdout,
        stderr: output.stderr,
        exitCode: 0
      })),
    catch: (error) => error
  }).pipe(Effect.result)

  if (Result.isSuccess(result)) {
    return {
      stdout: result.success.stdout.toString(),
      stderr: result.success.stderr.toString(),
      exitCode: result.success.exitCode
    }
  }

  const error = result.failure as NodeJS.ErrnoException & {
    stdout?: string | Buffer
    stderr?: string | Buffer
    code?: string | number
    errno?: string | number
  }

  const exitCode = typeof error.code === "number" ? error.code : typeof error.errno === "number" ? error.errno : 1

  return {
    stdout: typeof error.stdout === "string" ? error.stdout : (error.stdout?.toString() ?? ""),
    stderr: typeof error.stderr === "string" ? error.stderr : (error.stderr?.toString() ?? ""),
    exitCode
  }
})

const runWranglerD1ExecuteJson = Effect.fn("db.wrangler-d1-execute-json")(function* (
  workspace: Workspace.Workspace,
  options: {
    databaseName: string
    persistRoot: string
    wranglerConfigPath: string
    sql?: string | undefined
    file?: string | undefined
  }
): Effect.fn.Return<ExecFileResult, never> {
  const args = [
    "d1",
    "execute",
    options.databaseName,
    "--local",
    `--persist-to=${options.persistRoot}`,
    `--config=${options.wranglerConfigPath}`,
    "--json"
  ]

  if (options.sql) {
    args.push(`--command=${options.sql}`)
  }

  if (options.file) {
    args.push(`--file=${options.file}`)
  }

  return yield* execFileResult(`${workspace.cwd}/node_modules/.bin/wrangler`, args, { cwd: workspace.cwd })
})

const parseJsonPayload = (output: string) => {
  const trimmed = output.trim()
  const arrayStart = trimmed.indexOf("[")
  const objectStart = trimmed.indexOf("{")
  const starts = [arrayStart, objectStart].filter((index) => index >= 0)
  const start = starts.length === 0 ? -1 : Math.min(...starts)
  const end = Math.max(trimmed.lastIndexOf("]"), trimmed.lastIndexOf("}"))

  return start >= 0 && end >= start ? trimmed.slice(start, end + 1) : trimmed
}

const parseD1JsonResult = (operation: string, output: ExecFileResult) =>
  Effect.try({
    try: () => JSON.parse(parseJsonPayload(output.stdout)),
    catch: () =>
      new Error(
        [
          `Failed to parse ${operation} output result`,
          `exitCode=${output.exitCode}`,
          `stdout=${output.stdout}`,
          `stderr=${output.stderr}`
        ].join("\n")
      )
  }).pipe(
    Effect.orDie,
    Effect.andThen((result: Array<any>) => {
      const results = Array.isArray(result) ? result : [result]
      const allSuccess = output.exitCode === 0 && results.every((item) => item?.success === true)

      if (allSuccess) return Effect.void

      return CliLog.error(`${operation} failed: ${output.stderr || output.stdout}`).pipe(
        Effect.andThen(Effect.die(`${operation} failed`))
      )
    })
  )

export const push = Effect.fn("push-d1")(function* (
  workspace: Workspace.Workspace,
  { sql, database }: { sql: string; database?: string | undefined }
): Effect.fn.Return<void, never, FileSystem.FileSystem | Path.Path | Scope.Scope> {
  const { persistRoot, wranglerConfigPath, databaseName } = yield* getWranglerConfig(workspace, {
    database
  })

  const output = yield* runWranglerD1ExecuteJson(workspace, {
    databaseName,
    persistRoot,
    wranglerConfigPath,
    sql
  }).pipe(
    Effect.withSpan("db.d1-execute", {
      attributes: {
        projectName: workspace.projectName,
        database: database || "default",
        databaseName,
        sqlLength: sql.length
      }
    })
  )

  if (output.stderr) {
    yield* CliLog.error(`D1 push failed: ${output.stderr}`)
    return yield* Effect.die("D1 push failed")
  }

  yield* parseD1JsonResult("D1 push", output)
})

export const reset = Effect.fn("reset-d1")(function* (
  workspace: Workspace.Workspace,
  subcommand: { database: string | undefined }
): Effect.fn.Return<void, never, FileSystem.FileSystem | Path.Path | Scope.Scope> {
  const path = yield* Path.Path
  const { persistRoot, wranglerConfigPath, databaseName, databaseFile } = yield* getWranglerConfig(workspace, {
    database: subcommand.database
  })

  yield* CliLog.info(`Reset local D1 database ${databaseName}`)

  const d1MigrationsInit = `
    CREATE TABLE IF NOT EXISTS d1_migrations(
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `

  const fs = yield* FileSystem.FileSystem
  const databaseDir = path.dirname(databaseFile)
  yield* fs.makeDirectory(databaseDir, { recursive: true }).pipe(Effect.orDie)
  yield* fs.remove(databaseFile).pipe(Effect.ignore)
  yield* fs.remove(`${databaseFile}-wal`).pipe(Effect.ignore)
  yield* fs.remove(`${databaseFile}-shm`).pipe(Effect.ignore)
  yield* fs.writeFileString(databaseFile, "").pipe(Effect.orDie)

  const output = yield* runWranglerD1ExecuteJson(workspace, {
    databaseName,
    persistRoot,
    wranglerConfigPath,
    sql: d1MigrationsInit
  })

  if (output.stderr) {
    yield* CliLog.error(`D1 reset failed: ${output.stderr}`)
    return yield* Effect.die("D1 reset failed")
  }

  yield* parseD1JsonResult("D1 reset", output)
})

export const dump = Effect.fn("dump-d1")(function* (
  workspace: Workspace.Workspace,
  subcommand: DatabaseDumpSubcommand,
  { dbDir }: { dbDir: string }
): Effect.fn.Return<SchemaDumpResult, never, Path.Path | FileSystem.FileSystem | Scope.Scope> {
  const isProd = process.env.NODE_ENV === "production"
  const path = yield* Path.Path
  const fs = yield* FileSystem.FileSystem
  const { wranglerConfigPath, databaseName, databaseFile } = yield* getWranglerConfig(workspace, {
    database: subcommand.database
  })
  const schemaOutput = path.join(dbDir, "schema.sql")
  const wranglerBin = `${workspace.cwd}/node_modules/.bin/wrangler`

  const formatSchema = fs.readFileString(schemaOutput).pipe(
    Effect.flatMap((content) =>
      fs.writeFileString(
        schemaOutput,
        content
          .replace(/create table sqlite_sequence\(name,seq\);/i, "")
          .replace(/create table _cf_KV[\s\S]*?\);/im, "")
          .replace(/create table _cf_METADATA[\s\S]*?\);/im, "")
          .replace(/\n{2,}/gm, "\n")
          .trim()
      )
    ),
    Effect.orDie
  )

  if (isProd) {
    const output = yield* runCommand(wranglerBin, [
      "d1",
      "export",
      databaseName,
      `--config=${wranglerConfigPath}`,
      "--no-data",
      "--remote",
      `--output=${schemaOutput}`
    ])

    if (output.stderr) {
      yield* CliLog.error(`Failed to dump production schema: ${output.stderr}`)
      return yield* Effect.die("Failed to dump production schema")
    } else {
      yield* formatSchema
      return {
        provider: "d1",
        status: "updated",
        output: schemaOutput
      }
    }
  } else {
    const output = yield* runCommand("sqlite3", [databaseFile, ".schema"])
    const currentFileContent = yield* fs.readFileString(schemaOutput, "utf-8").pipe(
      Effect.orElseSucceed(() => ""),
      Effect.map((_) => _.trim())
    )

    yield* fs.writeFileString(schemaOutput, output.stdout).pipe(Effect.orDie)

    yield* formatSchema
    const newFileContent = yield* fs.readFileString(schemaOutput, "utf-8").pipe(
      Effect.orDie,
      Effect.map((_) => _.trim())
    )

    return {
      provider: "d1",
      status: currentFileContent === newFileContent ? "unchanged" : "updated",
      output: schemaOutput
    }
  }
})

export const applyMigrations = Effect.fn("apply-d1-migrations")(function* (
  workspace: Workspace.Workspace,
  {
    deploy = false,
    reset: shouldReset = false,
    database
  }: {
    deploy?: boolean | undefined
    reset?: boolean | undefined
    database?: string | undefined
  } = { deploy: false }
): Effect.fn.Return<void, never, FileSystem.FileSystem | Path.Path | Scope.Scope> {
  const isPreview = deploy && process.env.STAGE !== "production"
  const wranglerBin = `${workspace.cwd}/node_modules/.bin/wrangler`
  const { persistRoot, wranglerConfigPath, databaseName, previewDatabaseId } = yield* getWranglerConfig(workspace, {
    database
  })

  let API_TOKEN = ""
  let ACCOUNT_ID = ""
  const deployArgs: Array<string> = []

  if (!deploy) {
    deployArgs.push("--local")
    deployArgs.push(`--persist-to=${persistRoot}`)
  } else {
    const config = yield* Effect.gen(function* () {
      return yield* CloudflareConfig
    }).pipe(Effect.orDie)
    API_TOKEN = config.API_TOKEN
    ACCOUNT_ID = config.ACCOUNT_ID

    if (!isPreview) {
      deployArgs.push("--remote")
    } else {
      if (previewDatabaseId) {
        deployArgs.push("--preview")
      }

      deployArgs.push("--remote")
    }
  }

  if (!deploy && shouldReset) {
    yield* reset(workspace, { database })
  }

  yield* CliLog.info(`Apply D1 migrations to ${databaseName}`)

  // Wrangler resolves D1 migrations from wrangler.jsonc's `migrations_dir`, or
  // from the project-level `migrations/` directory by default. This is separate
  // from Prisma's `db/migrations` convention, so keep D1 generation and apply
  // paths aligned when changing migration layout.
  yield* runCommand(
    wranglerBin,
    ["d1", "migrations", "apply", databaseName, `--config=${wranglerConfigPath}`, ...deployArgs],
    {
      env: {
        CLOUDFLARE_API_TOKEN: API_TOKEN,
        CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID
      }
    }
  ).pipe(
    Effect.retry({ times: 2, schedule: Schedule.spaced("5 seconds") }),
    Effect.tap(
      Effect.fnUntraced(function* (output) {
        if (output.stderr) {
          yield* CliLog.error(`D1 apply migrations failed: ${formatCommandOutput(output.stderr).join("; ")}`)
        } else {
          yield* logCommandOutput("wrangler.d1-migrations-apply", output)
        }
      })
    ),
    Effect.withSpan("d1-migrate-apply")
  )
})

export const execute = Effect.fn("d1.execute")(function* (
  workspace: Workspace.Workspace,
  subcommand: DatabaseExecuteSubcommand
) {
  const path = yield* Path.Path
  const { persistRoot, wranglerConfigPath, databaseName } = yield* getWranglerConfig(workspace, {
    database: subcommand.database
  })
  const filePath = subcommand.file
    ? path.isAbsolute(subcommand.file)
      ? subcommand.file
      : path.resolve(workspace.cwd, subcommand.file)
    : undefined

  const output = yield* runWranglerD1ExecuteJson(workspace, {
    databaseName,
    persistRoot,
    wranglerConfigPath,
    sql: subcommand.sql,
    file: filePath
  }).pipe(
    Effect.withSpan("db.d1-execute", {
      attributes: {
        projectName: workspace.projectName,
        databaseName,
        sql: subcommand.sql,
        file: filePath || "none"
      }
    })
  )

  if (output.stderr) {
    yield* CliLog.error(`D1 execute failed: ${formatCommandOutput(output.stderr).join("; ")}`)
    return yield* Effect.die("D1 execute failed")
  }

  yield* parseD1JsonResult("D1 execute", output)
})

export const resolveMigration = Effect.fn("d1.resolve-migration")(function* (
  workspace: Workspace.Workspace,
  subcommand: DatabaseMigrateResolveSubcommand
) {
  const path = yield* Path.Path
  const { databaseFile, databaseName } = yield* getWranglerConfig(workspace, {
    database: subcommand.database
  })
  const databaseDir = path.dirname(databaseFile)
  const migration = subcommand.appliedMigration ?? subcommand.rolledBackMigration!
  const action = subcommand.appliedMigration !== undefined ? "applied" : "rolled-back"
  const mutation =
    action === "applied"
      ? `INSERT OR IGNORE INTO d1_migrations(name) VALUES (${quoteSqlString(migration)});`
      : `DELETE FROM d1_migrations WHERE name = ${quoteSqlString(migration)};`

  const fs = yield* FileSystem.FileSystem
  yield* fs.makeDirectory(databaseDir, { recursive: true }).pipe(Effect.orDie)

  const output = yield* runCommand("sqlite3", [
    databaseFile,
    `CREATE TABLE IF NOT EXISTS d1_migrations(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL); ${mutation}`
  ])

  if (output.stderr) {
    yield* CliLog.error(`D1 resolve migration failed: ${formatCommandOutput(output.stderr).join("; ")}`)
    return yield* Effect.die("D1 resolve migration failed")
  }

  yield* CliLog.info(`Resolve D1 migration complete: ${action} ${migration} on ${databaseName}`)
})

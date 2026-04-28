import * as FileSystem from "effect/FileSystem"
import * as Path from "effect/Path"
import * as Effect from "effect/Effect"
import * as Result from "effect/Result"
import { execFile } from "node:child_process"
import { promisify } from "node:util"

import type * as Workspace from "./workspace.ts"
import {
  DatabaseExecuteInputError,
  type DatabaseExecuteSubcommand,
  type DatabaseMigrateResolveSubcommand,
  type SchemaDumpResult
} from "./domain.ts"
import type { DatabaseConfig, PrismaMigration } from "./shared.ts"

import { formatCommandOutput, logCommandOutput, runCommand, runCommandLine } from "./utils/shell.ts"
import * as CliLog from "./utils/log.ts"
import { resolvePrismaCommand } from "./utils/prisma-bin.ts"
import { devDB } from "./shared.ts"

const execFileAsync = promisify(execFile)

type NativeSqliteConfig =
  | Extract<DatabaseConfig, { runtime: "browser" }>
  | Extract<DatabaseConfig, { runtime: "server" }>

export const getDatabaseFile = (dbDir: string, config: NativeSqliteConfig, path: Path.Path) => {
  if (config.runtime === "server") {
    const rawPath = config.url.replace(/^file:/, "")
    return path.isAbsolute(rawPath) ? rawPath : path.join(dbDir, rawPath)
  }

  return path.join(dbDir, devDB)
}

const listLockHolders = Effect.fn("db.list-sqlite-lock-holders")(function* (databaseFile: string) {
  const lockFiles = [databaseFile, `${databaseFile}-wal`, `${databaseFile}-shm`]

  const result = yield* Effect.tryPromise({
    try: () => execFileAsync("lsof", ["-F", "pc", ...lockFiles]),
    catch: (error) => error
  }).pipe(Effect.result)

  if (Result.isSuccess(result)) {
    const holders: Array<{ pid: string; command: string }> = []
    let currentPid: string | undefined

    for (const line of result.success.stdout.split("\n")) {
      if (line.startsWith("p")) {
        currentPid = line.slice(1).trim()
      } else if (line.startsWith("c") && currentPid) {
        holders.push({
          pid: currentPid,
          command: line.slice(1).trim()
        })
        currentPid = undefined
      }
    }

    return holders
  }

  const error = result.failure

  if (error && typeof error === "object") {
    const code = "code" in error ? error.code : undefined
    if (code === 1 || code === "ENOENT") {
      return []
    }
  }

  return []
})

const ensureUnlocked = Effect.fn("db.ensure-sqlite-unlocked")(function* (databaseFile: string) {
  const holders = yield* listLockHolders(databaseFile)

  if (holders.length === 0) {
    return
  }

  const lines = holders.map((holder) => `- pid=${holder.pid} command=${holder.command}`).join("\n")

  return yield* Effect.die(
    [
      `SQLite database is currently in use: ${databaseFile}`,
      "Stop the processes below before running xdev db migrate commands:",
      lines
    ].join("\n")
  )
})

export const applyPrismaMigrations = Effect.fn("apply-prisma-migrations")(function* (
  _workspace: Workspace.Workspace,
  {
    dbDir,
    migrationsDir: _migrationsDir,
    datasource,
    migrations: _migrations,
    reset = false
  }: {
    dbDir: string
    migrationsDir: string
    datasource: { url: string }
    migrations: Array<PrismaMigration>
    reset?: boolean | undefined
  }
) {
  const path = yield* Path.Path
  const prismaCommand = resolvePrismaCommand()
  const rawPath = datasource.url.startsWith("file:") ? datasource.url.replace(/^file:/, "") : undefined
  const databaseFile = rawPath ? (path.isAbsolute(rawPath) ? rawPath : path.join(dbDir, rawPath)) : undefined

  if (databaseFile) {
    yield* ensureUnlocked(databaseFile)
  }

  if (reset) {
    const resetOutput = yield* runCommandLine(
      [...prismaCommand, "migrate", "reset", "--force", "--config", "./prisma.config.ts"],
      { cwd: dbDir }
    )
    yield* logCommandOutput("prisma.migrate-reset", resetOutput)
  }

  const deployOutput = yield* runCommandLine(
    [...prismaCommand, "migrate", "deploy", "--config", "./prisma.config.ts"],
    {
      cwd: dbDir
    }
  )
  yield* logCommandOutput("prisma.migrate-deploy", deployOutput)
})

export const push = Effect.fn("sqlite.push")(function* (_workspace: Workspace.Workspace, { dbDir }: { dbDir: string }) {
  const prismaCommand = resolvePrismaCommand()

  const output = yield* runCommandLine(
    [...prismaCommand, "db", "push", "--config", "./prisma.config.ts", "--accept-data-loss"],
    { cwd: dbDir }
  )
  yield* logCommandOutput("prisma.db-push", output)
})

export const dump = Effect.fn("sqlite.dump")(function* (dbDir: string, config: NativeSqliteConfig) {
  const path = yield* Path.Path
  const fs = yield* FileSystem.FileSystem
  const sqliteDbFile = getDatabaseFile(dbDir, config, path)
  const schemaOutput = path.join(dbDir, "schema.sql")

  const output = yield* runCommand("sqlite3", [sqliteDbFile, ".schema"])

  if (output.stderr) {
    yield* CliLog.error(`Failed to dump sqlite schema: ${output.stderr}`)
    return yield* Effect.die("Failed to dump sqlite schema")
  }

  const currentFileContent = yield* fs.readFileString(schemaOutput, "utf-8").pipe(
    Effect.orElseSucceed(() => ""),
    Effect.map((_) => _.trim())
  )

  const newFileContent = output.stdout
    .replace(/create table sqlite_sequence\(name,seq\);/i, "")
    .replace(/^create table if not exists "_prisma_migrations"[\s\S]*?\);/im, "")
    .replace(/\n{2,}/gm, "\n")
    .trim()

  if (currentFileContent === newFileContent) {
    return {
      provider: config.provider,
      status: "unchanged",
      output: schemaOutput
    } satisfies SchemaDumpResult
  }

  yield* fs.writeFileString(schemaOutput, newFileContent)

  return {
    provider: config.provider,
    status: "updated",
    output: schemaOutput
  } satisfies SchemaDumpResult
})

export const resolvePrismaMigration = Effect.fn("sqlite.resolve-prisma-migration")(function* (
  _workspace: Workspace.Workspace,
  dbDir: string,
  subcommand: DatabaseMigrateResolveSubcommand
) {
  const prismaCommand = resolvePrismaCommand()
  const action =
    subcommand.appliedMigration !== undefined
      ? ["--applied", subcommand.appliedMigration]
      : ["--rolled-back", subcommand.rolledBackMigration!]

  const output = yield* runCommandLine(
    [...prismaCommand, "migrate", "resolve", "--config", "./prisma.config.ts", ...action],
    {
      cwd: dbDir
    }
  )
  yield* logCommandOutput("prisma.migrate-resolve", output)
})

export const execute = Effect.fn("sqlite.execute")(function* (
  workspace: Workspace.Workspace,
  dbDir: string,
  config: NativeSqliteConfig,
  subcommand: DatabaseExecuteSubcommand
) {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path
  const sqliteDbFile = getDatabaseFile(dbDir, config, path)
  const tempSqlPath = path.join(dbDir, ".xdev.execute.sql")

  let executeScript = ""
  if (subcommand.sql) {
    executeScript = subcommand.sql
  } else if (subcommand.file) {
    const inputPath = path.isAbsolute(subcommand.file) ? subcommand.file : path.resolve(workspace.cwd, subcommand.file)

    executeScript = yield* fs.readFileString(inputPath)
  }

  if (executeScript.trim().length === 0) {
    return yield* Effect.fail(new DatabaseExecuteInputError({ reason: "EmptyInput" }))
  }

  yield* fs.writeFileString(tempSqlPath, executeScript)

  const cleanup = fs.remove(tempSqlPath).pipe(Effect.ignore)

  const output = yield* runCommand("sqlite3", [sqliteDbFile, `.read ${tempSqlPath}`]).pipe(Effect.ensuring(cleanup))

  if (output.stderr) {
    yield* CliLog.error(`SQLite execute failed: ${formatCommandOutput(output.stderr).join("; ")}`)
    return yield* Effect.die("SQLite execute failed")
  } else if (output.stdout.trim().length > 0) {
    yield* logCommandOutput("sqlite.execute", output)
  }
})

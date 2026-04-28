import * as FileSystem from "effect/FileSystem"
import * as Path from "effect/Path"
import * as Effect from "effect/Effect"

import {
  type DatabaseExecuteSubcommand,
  DatabaseExecuteInputError,
  type DatabaseMigrateResolveSubcommand
} from "./domain.ts"
import type * as Workspace from "./workspace.ts"
import type { PrismaMigration } from "./shared.ts"
import { logCommandOutput, runCommandLine } from "./utils/shell.ts"
import { resolvePrismaCommand } from "./utils/prisma-bin.ts"

export const applyPrismaMigrations = Effect.fn("server.apply-prisma-migrations")(function* (
  _workspace: Workspace.Workspace,
  {
    dbDir,
    reset = false
  }: {
    dbDir: string
    migrationsDir: string
    datasource: { url: string }
    migrations: Array<PrismaMigration>
    reset?: boolean | undefined
  }
) {
  const prismaCommand = resolvePrismaCommand()

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

export const push = Effect.fn("server.push")(function* (
  _workspace: Workspace.Workspace,
  { dbDir }: { dbDir: string }
) {
  const prismaCommand = resolvePrismaCommand()

  const output = yield* runCommandLine(
    [...prismaCommand, "db", "push", "--config", "./prisma.config.ts", "--accept-data-loss"],
    { cwd: dbDir }
  )
  yield* logCommandOutput("prisma.db-push", output)
})

export const resolvePrismaMigration = Effect.fn("server.resolve-prisma-migration")(function* (
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

export const execute = Effect.fn("server.execute")(function* (
  workspace: Workspace.Workspace,
  dbDir: string,
  subcommand: DatabaseExecuteSubcommand
) {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path
  const tempSqlPath = path.join(dbDir, ".xdev.execute.sql")

  let executeScript = ""
  if (subcommand.sql) {
    executeScript = subcommand.sql
  } else if (subcommand.file) {
    const inputPath = path.isAbsolute(subcommand.file)
      ? subcommand.file
      : path.resolve(workspace.cwd, subcommand.file)

    executeScript = yield* fs.readFileString(inputPath)
  }

  if (executeScript.trim().length === 0) {
    return yield* Effect.fail(new DatabaseExecuteInputError({ reason: "EmptyInput" }))
  }

  yield* fs.writeFileString(tempSqlPath, executeScript)

  const cleanup = fs.remove(tempSqlPath).pipe(Effect.ignore)
  const prismaCommand = resolvePrismaCommand()
  const output = yield* runCommandLine(
    [...prismaCommand, "db", "execute", "--config", "./prisma.config.ts", "--file", tempSqlPath],
    {
      cwd: dbDir
    }
  ).pipe(Effect.ensuring(cleanup))

  yield* logCommandOutput("prisma.db-execute", output)
})

import { NodeServices } from "@effect/platform-node"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import * as Cause from "effect/Cause"
import * as Command from "effect/unstable/cli/Command"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Path from "effect/Path"
import { describe, expect, it } from "vitest"

import { getD1Name } from "../src/cloudflare.ts"
import { rootCommand } from "../src/commands.ts"
import {
  DatabaseExecuteInputError,
  DatabaseMigrateResolveInputError,
  DatabaseMigrateResolveSubcommand
} from "../src/domain.ts"
import * as Server from "../src/server.ts"
import type { DatabaseConfig } from "../src/shared.ts"
import * as SQLite from "../src/sqlite.ts"
import * as Workspace from "../src/workspace.ts"

const execFileAsync = promisify(execFile)
const repoRoot = process.cwd()
const dbNodeModules = `${repoRoot}/packages/db/node_modules`

const chmodExecutable = (file: string) =>
  Effect.tryPromise({
    try: () => execFileAsync("chmod", ["+x", file]),
    catch: (error) => error
  }).pipe(Effect.orDie)

const linkPrismaWorkspaceNodeModules = Effect.fnUntraced(function* (cwd: string) {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path
  const nodeModules = path.join(cwd, "node_modules")

  yield* fs.makeDirectory(path.join(nodeModules, ".bin"), { recursive: true })
  yield* fs.makeDirectory(path.join(nodeModules, "@effect-x"), { recursive: true })
  yield* fs.makeDirectory(path.join(cwd, "packages"), { recursive: true })
  yield* fs.symlink(`${repoRoot}/packages/db`, path.join(nodeModules, "@effect-x/db")).pipe(Effect.orDie)
  yield* fs.symlink(`${repoRoot}/packages/db`, path.join(cwd, "packages/db")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbNodeModules}/effect`, path.join(nodeModules, "effect")).pipe(Effect.orDie)
})

const writeFakePrisma = Effect.fnUntraced(function* (cwd: string) {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path
  const prismaBin = path.join(cwd, "node_modules/.bin/prisma")

  yield* fs.makeDirectory(path.dirname(prismaBin), { recursive: true })
  yield* fs.writeFileString(
    prismaBin,
    [
      "#!/usr/bin/env node",
      'const fs = require("node:fs")',
      'const path = require("node:path")',
      'const callsFile = path.resolve(__dirname, "../../prisma-calls.jsonl")',
      "const call = { args: process.argv.slice(2) }",
      'fs.appendFileSync(callsFile, JSON.stringify(call) + "\\n")',
      'process.stdout.write("ok\\n")',
      ""
    ].join("\n")
  )
  yield* chmodExecutable(prismaBin)
})

const querySqlite = Effect.fnUntraced(function* (databaseFile: string, sql: string) {
  const output = yield* Effect.tryPromise({
    try: () => execFileAsync("sqlite3", [databaseFile, sql]),
    catch: (error) => error
  }).pipe(Effect.orDie)

  return output.stdout.trim()
})

const withEnv = <A, E, R>(name: string, value: string, effect: Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.sync(() => {
      const previous = process.env[name]
      process.env[name] = value
      return previous
    }),
    () => effect,
    (previous) =>
      Effect.sync(() => {
        if (previous === undefined) {
          delete process.env[name]
        } else {
          process.env[name] = previous
        }
      })
  )

const withNodeEnv = <A, E, R>(value: string, effect: Effect.Effect<A, E, R>) => withEnv("NODE_ENV", value, effect)

const makeWorkspaceFixture = Effect.fnUntraced(function* (
  config: DatabaseConfig,
  options: { prisma?: boolean | undefined } = {}
) {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path
  const cwd = yield* fs.makeTempDirectory()
  const project = "apps/web"
  const projectPath = path.join(cwd, project)
  const dbDir = path.join(projectPath, "db")

  if (options.prisma) {
    yield* linkPrismaWorkspaceNodeModules(cwd)
    yield* writeFakePrisma(cwd)
  }

  yield* fs.makeDirectory(dbDir, { recursive: true })
  yield* fs.writeFileString(
    path.join(projectPath, "tsconfig.app.json"),
    JSON.stringify({
      compilerOptions: {
        module: "NodeNext",
        moduleResolution: "NodeNext",
        target: "ES2022",
        strict: true
      }
    })
  )
  yield* fs.writeFileString(
    path.join(dbDir, "tables.ts"),
    options.prisma
      ? [
          'import * as Database from "@effect-x/db"',
          'import * as Schema from "effect/Schema"',
          "",
          'class User extends Database.Class<User>("User")({',
          '  id: Schema.Number.pipe(Database.IdConfig({ generate: "autoincrement" })),',
          "  name: Schema.String",
          "}) {}",
          "",
          "export const tables = { User }",
          `export const config = ${JSON.stringify(config)}`,
          ""
        ].join("\n")
      : [`export const tables = {}`, `export const config = ${JSON.stringify(config)}`, ""].join("\n")
  )

  return yield* Workspace.make({ cwd, project })
})

const runDbCommand = Effect.fnUntraced(function* (workspace: Workspace.Workspace, args: ReadonlyArray<string>) {
  const runCommand = Command.runWith(rootCommand, { version: "0.0.1" })

  yield* withEnv(
    "GITHUB_REF_NAME",
    "test",
    runCommand(["--cwd", workspace.cwd, "--project", workspace.project, ...args])
  )
})

describe("execute command", () => {
  it("runs inline sql against browser sqlite", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const path = yield* Path.Path
        const workspace = yield* makeWorkspaceFixture({
          runtime: "browser",
          provider: "sqlite"
        })
        const databaseFile = path.join(workspace.projectPath, "db", "dev.db")

        yield* runDbCommand(workspace, [
          "execute",
          "--sql",
          "CREATE TABLE Note(id INTEGER PRIMARY KEY, body TEXT); INSERT INTO Note(body) VALUES ('hello');"
        ])

        const count = yield* querySqlite(databaseFile, "SELECT COUNT(*) FROM Note;")
        expect(count).toBe("1")
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
    ))

  it("runs sql from file against browser sqlite", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem
        const path = yield* Path.Path
        const workspace = yield* makeWorkspaceFixture({
          runtime: "browser",
          provider: "sqlite"
        })
        const sqlPath = path.join(workspace.cwd, "create-note.sql")
        const databaseFile = path.join(workspace.projectPath, "db", "dev.db")

        yield* fs.writeFileString(
          sqlPath,
          "CREATE TABLE Note(id INTEGER PRIMARY KEY, body TEXT); INSERT INTO Note(body) VALUES ('from-file');"
        )

        yield* runDbCommand(workspace, ["execute", "--file", sqlPath])

        const body = yield* querySqlite(databaseFile, "SELECT body FROM Note;")
        expect(body).toBe("from-file")
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
    ))

  it("rejects sql and file together", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const workspace = yield* makeWorkspaceFixture({
          runtime: "browser",
          provider: "sqlite"
        })

        const exit = yield* runDbCommand(workspace, ["execute", "--sql", "SELECT 1;", "--file", "query.sql"]).pipe(
          Effect.exit
        )

        expect(exit._tag).toBe("Failure")
        if (exit._tag === "Failure") {
          const error = Cause.squash(exit.cause)
          expect(error).toBeInstanceOf(DatabaseExecuteInputError)
          expect((error as DatabaseExecuteInputError).reason).toBe("ConflictingInput")
        }
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
    ))

  it("rejects empty sql files with a structured input error", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem
        const path = yield* Path.Path
        const workspace = yield* makeWorkspaceFixture({
          runtime: "browser",
          provider: "sqlite"
        })
        const sqlPath = path.join(workspace.cwd, "empty.sql")

        yield* fs.writeFileString(sqlPath, "  \n\t")

        const exit = yield* runDbCommand(workspace, ["execute", "--file", sqlPath]).pipe(Effect.exit)

        expect(exit._tag).toBe("Failure")
        if (exit._tag === "Failure") {
          const error = Cause.squash(exit.cause)
          expect(error).toBeInstanceOf(DatabaseExecuteInputError)
          expect((error as DatabaseExecuteInputError).reason).toBe("EmptyInput")
        }
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
    ))

  it("rejects empty inline sql with a structured input error before provider execution", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const workspace = yield* makeWorkspaceFixture({
          runtime: "d1",
          provider: "sqlite"
        })

        const exit = yield* runDbCommand(workspace, ["execute", "--sql", "  \n\t"]).pipe(Effect.exit)

        expect(exit._tag).toBe("Failure")
        if (exit._tag === "Failure") {
          const error = Cause.squash(exit.cause)
          expect(error).toBeInstanceOf(DatabaseExecuteInputError)
          expect((error as DatabaseExecuteInputError).reason).toBe("EmptyInput")
        }
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
    ))
})

describe("resolve command", () => {
  it("rejects missing resolve action with a structured input error", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const workspace = yield* makeWorkspaceFixture({
          runtime: "browser",
          provider: "sqlite"
        })

        const exit = yield* runDbCommand(workspace, ["resolve"]).pipe(Effect.exit)

        expect(exit._tag).toBe("Failure")
        if (exit._tag === "Failure") {
          const error = Cause.squash(exit.cause)
          expect(error).toBeInstanceOf(DatabaseMigrateResolveInputError)
          expect((error as DatabaseMigrateResolveInputError).reason).toBe("MissingAction")
        }
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
    ))

  it("rejects conflicting resolve actions with a structured input error", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const workspace = yield* makeWorkspaceFixture({
          runtime: "browser",
          provider: "sqlite"
        })

        const exit = yield* runDbCommand(workspace, [
          "resolve",
          "--applied",
          "20260101000000_init",
          "--rolled-back",
          "20260101000000_init"
        ]).pipe(Effect.exit)

        expect(exit._tag).toBe("Failure")
        if (exit._tag === "Failure") {
          const error = Cause.squash(exit.cause)
          expect(error).toBeInstanceOf(DatabaseMigrateResolveInputError)
          expect((error as DatabaseMigrateResolveInputError).reason).toBe("ConflictingAction")
        }
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
    ))

  it("marks prisma migrations through prisma migrate resolve", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem
        const path = yield* Path.Path
        const workspace = yield* makeWorkspaceFixture(
          {
            runtime: "server",
            provider: "sqlite",
            url: "file:./server.db"
          },
          { prisma: true }
        )
        const dbDir = path.join(workspace.projectPath, "db")
        const prismaBin = path.join(workspace.cwd, "node_modules/.bin/prisma")
        const callsFile = path.join(workspace.cwd, "prisma-calls.jsonl")

        expect(yield* fs.exists(prismaBin)).toBe(true)
        expect(workspace.cwd).not.toContain("packages/db-cli")

        yield* withEnv(
          "XDEV_DB_CLI_PRISMA_BIN",
          prismaBin,
          Server.resolvePrismaMigration(
            workspace,
            dbDir,
            new DatabaseMigrateResolveSubcommand({
              env: "development",
              stage: "test",
              workspace,
              database: undefined,
              appliedMigration: "20260101000000_init",
              rolledBackMigration: undefined
            })
          )
        )

        const calls = (yield* fs.readFileString(callsFile))
          .trim()
          .split("\n")
          .map((line) => JSON.parse(line).args)

        expect(calls).toContainEqual([
          "migrate",
          "resolve",
          "--config",
          "./prisma.config.ts",
          "--applied",
          "20260101000000_init"
        ])
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
    ))

  it("marks local d1 migrations as applied", () =>
    Effect.runPromise(
      withNodeEnv(
        "development",
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem
          const path = yield* Path.Path
          const databaseId = "resolve-d1-id"
          const databaseName = "resolve-db"
          const migration = "20260101000000_init"
          const workspace = yield* makeWorkspaceFixture({
            runtime: "d1",
            provider: "sqlite"
          })
          const databaseFile = path.join(
            workspace.cwd,
            ".wrangler/state/v3/d1/miniflare-D1DatabaseObject",
            `${getD1Name(databaseId)}.sqlite`
          )

          yield* fs.writeFileString(
            path.join(workspace.projectPath, "wrangler.jsonc"),
            [
              "{",
              '  "d1_databases": [{',
              '    "binding": "DB",',
              `    "database_name": ${JSON.stringify(databaseName)},`,
              `    "database_id": ${JSON.stringify(databaseId)}`,
              "  }]",
              "}",
              ""
            ].join("\n")
          )

          yield* runDbCommand(workspace, ["--database", databaseName, "resolve", "--applied", migration])

          const stored = yield* querySqlite(databaseFile, `SELECT name FROM d1_migrations WHERE name = '${migration}';`)

          expect(stored).toBe(migration)
        }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
      )
    ))

  it("marks local d1 migrations as rolled back", () =>
    Effect.runPromise(
      withNodeEnv(
        "development",
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem
          const path = yield* Path.Path
          const databaseId = "resolve-d1-rollback-id"
          const databaseName = "resolve-rollback-db"
          const migration = "20260101000000_init"
          const workspace = yield* makeWorkspaceFixture({
            runtime: "d1",
            provider: "sqlite"
          })
          const databaseFile = path.join(
            workspace.cwd,
            ".wrangler/state/v3/d1/miniflare-D1DatabaseObject",
            `${getD1Name(databaseId)}.sqlite`
          )

          yield* fs.writeFileString(
            path.join(workspace.projectPath, "wrangler.jsonc"),
            [
              "{",
              '  "d1_databases": [{',
              '    "binding": "DB",',
              `    "database_name": ${JSON.stringify(databaseName)},`,
              `    "database_id": ${JSON.stringify(databaseId)}`,
              "  }]",
              "}",
              ""
            ].join("\n")
          )
          yield* fs.makeDirectory(path.dirname(databaseFile), { recursive: true })
          yield* querySqlite(
            databaseFile,
            [
              "CREATE TABLE d1_migrations(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL);",
              `INSERT INTO d1_migrations(name) VALUES ('${migration}');`
            ].join("\n")
          )

          yield* runDbCommand(workspace, ["--database", databaseName, "resolve", "--rolled-back", migration])

          const stored = yield* querySqlite(databaseFile, `SELECT name FROM d1_migrations WHERE name = '${migration}';`)

          expect(stored).toBe("")
        }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
      )
    ))
})

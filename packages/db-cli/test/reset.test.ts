import { NodeServices } from "@effect/platform-node"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import * as Command from "effect/unstable/cli/Command"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Path from "effect/Path"
import { describe, expect, it } from "vitest"

import { getD1Name } from "../src/cloudflare.ts"
import { rootCommand } from "../src/commands.ts"
import type { DatabaseConfig } from "../src/shared.ts"
import * as Workspace from "../src/workspace.ts"

const execFileAsync = promisify(execFile)

const repoRoot = process.cwd()
const dbCliNodeModules = `${repoRoot}/packages/db-cli/node_modules`
const dbNodeModules = `${repoRoot}/packages/db/node_modules`

const linkWorkspaceNodeModules = Effect.fnUntraced(function* (cwd: string) {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path
  const nodeModules = path.join(cwd, "node_modules")

  yield* fs.makeDirectory(path.join(nodeModules, ".bin"), { recursive: true })
  yield* fs.makeDirectory(path.join(nodeModules, "@effect-x"), { recursive: true })
  yield* fs.makeDirectory(path.join(cwd, "packages"), { recursive: true })
  yield* fs.symlink(`${repoRoot}/packages/db`, path.join(nodeModules, "@effect-x/db")).pipe(Effect.orDie)
  yield* fs.symlink(`${repoRoot}/packages/db`, path.join(cwd, "packages/db")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbNodeModules}/effect`, path.join(nodeModules, "effect")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbCliNodeModules}/@prisma`, path.join(nodeModules, "@prisma")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbCliNodeModules}/prisma`, path.join(nodeModules, "prisma")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbCliNodeModules}/tsx`, path.join(nodeModules, "tsx")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbCliNodeModules}/wrangler`, path.join(nodeModules, "wrangler")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbCliNodeModules}/.bin/prisma`, path.join(nodeModules, ".bin/prisma")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbCliNodeModules}/.bin/wrangler`, path.join(nodeModules, ".bin/wrangler")).pipe(Effect.orDie)
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

const makeWorkspaceFixture = Effect.fnUntraced(function* (config: DatabaseConfig) {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path
  const cwd = yield* fs.makeTempDirectory()
  const project = "apps/web"
  const projectPath = path.join(cwd, project)
  const dbDir = path.join(projectPath, "db")

  yield* linkWorkspaceNodeModules(cwd)
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
    [
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
  )

  return yield* Workspace.make({ cwd, project })
})

const resetWorkspace = Effect.fnUntraced(function* (
  workspace: Workspace.Workspace,
  database: string | undefined = undefined
) {
  const runCommand = Command.runWith(rootCommand, { version: "0.0.1" })

  yield* withEnv(
    "GITHUB_REF_NAME",
    "test",
    runCommand([
      "--cwd",
      workspace.cwd,
      "--project",
      workspace.project,
      ...(database ? ["--database", database] : []),
      "reset",
      "--force"
    ])
  )
})

describe("reset command runtime/provider coverage", () => {
  it(
    "(d1 sqlite) force resets without prompting when data exists",
    () =>
      Effect.runPromise(
        withNodeEnv(
          "development",
          Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem
            const path = yield* Path.Path
            const databaseId = "local-d1-reset-id"
            const databaseName = "reset-db"
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
                "  // jsonc comments are intentionally supported",
                '  "d1_databases": [{',
                '    "binding": "DB",',
                `    "database_name": ${JSON.stringify(databaseName)},`,
                `    "database_id": ${JSON.stringify(databaseId)},`,
                '    "migrations_dir": "db/migrations"',
                "  }]",
                "}",
                ""
              ].join("\n")
            )
            yield* fs.makeDirectory(path.dirname(databaseFile), { recursive: true })
            yield* fs.makeDirectory(path.join(workspace.projectPath, "db", "migrations"), { recursive: true })
            yield* fs.writeFileString(
              path.join(workspace.projectPath, "db", "migrations", "0001_init.sql"),
              "CREATE TABLE User(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);"
            )
            yield* querySqlite(
              databaseFile,
              "CREATE TABLE Legacy(id INTEGER PRIMARY KEY, name TEXT); INSERT INTO Legacy(name) VALUES ('old');"
            )

            yield* resetWorkspace(workspace, databaseName)

            const legacyTables = yield* querySqlite(
              databaseFile,
              "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'Legacy';"
            )
            const migrationTables = yield* querySqlite(
              databaseFile,
              "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'd1_migrations';"
            )
            const userTables = yield* querySqlite(
              databaseFile,
              "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'User';"
            )

            expect(legacyTables).toBe("")
            expect(migrationTables).toBe("d1_migrations")
            expect(userTables).toBe("User")
          }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
        )
      ),
    15_000
  )
})

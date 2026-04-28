import { NodeServices } from "@effect/platform-node"
import { execFile } from "node:child_process"
import { fileURLToPath } from "node:url"
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

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url))
const dbCliNodeModules = `${repoRoot}/packages/db-cli/node_modules`
const dbNodeModules = `${repoRoot}/packages/db/node_modules`

const linkWorkspaceNodeModules = Effect.fnUntraced(function* (cwd: string) {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path
  const nodeModules = path.join(cwd, "node_modules")

  yield* fs.makeDirectory(path.join(nodeModules, ".bin"), { recursive: true })
  yield* fs.makeDirectory(path.join(nodeModules, "@effect"), { recursive: true })
  yield* fs.makeDirectory(path.join(nodeModules, "@effect-x"), { recursive: true })
  yield* fs.makeDirectory(path.join(cwd, "packages"), { recursive: true })
  yield* fs.symlink(`${repoRoot}/packages/db`, path.join(nodeModules, "@effect-x/db")).pipe(Effect.orDie)
  yield* fs.symlink(`${repoRoot}/packages/db`, path.join(cwd, "packages/db")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbNodeModules}/effect`, path.join(nodeModules, "effect")).pipe(Effect.orDie)
  yield* fs
    .symlink(`${dbNodeModules}/@effect/experimental`, path.join(nodeModules, "@effect/experimental"))
    .pipe(Effect.orDie)
  yield* fs.symlink(`${dbNodeModules}/@effect/sql`, path.join(nodeModules, "@effect/sql")).pipe(Effect.orDie)
  yield* fs
    .symlink(`${dbNodeModules}/@effect/sql-sqlite-node`, path.join(nodeModules, "@effect/sql-sqlite-node"))
    .pipe(Effect.orDie)
  yield* fs.symlink(`${dbCliNodeModules}/tsx`, path.join(nodeModules, "tsx")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbCliNodeModules}/@prisma`, path.join(nodeModules, "@prisma")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbCliNodeModules}/prisma`, path.join(nodeModules, "prisma")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbCliNodeModules}/.bin/tsx`, path.join(nodeModules, ".bin/tsx")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbCliNodeModules}/.bin/prisma`, path.join(nodeModules, ".bin/prisma")).pipe(Effect.orDie)
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

const makeTables = (config: DatabaseConfig) =>
  [
    'import * as Database from "@effect-x/db"',
    'import * as Schema from "effect/Schema"',
    "",
    'export class User extends Database.Class<User>("User")({',
    '  id: Database.Generated(Schema.Number.pipe(Database.IdConfig({ generate: "autoincrement" }))),',
    "  name: Schema.String",
    "}) {",
    '  static table = "User" as const',
    "  static get repo() {",
    "    return Database.repo(this)",
    "  }",
    "}",
    "",
    "export const tables = { User }",
    `export const config = ${JSON.stringify(config)}`,
    ""
  ].join("\n")

const seedSource = [
  'import { SqlClient } from "@effect/sql/SqlClient"',
  'import * as Effect from "effect/Effect"',
  'import { seedName } from "@fixture/seed-name"',
  'import { User } from "./tables"',
  "",
  "export default Effect.gen(function* () {",
  "  const sql = yield* SqlClient",
  "  const repo = yield* User.repo",
  "  const insert = repo.insert((input) =>",
  "    sql`INSERT INTO ${sql(User.table)} ${sql.insert(input)} returning *`",
  "  )",
  "  yield* insert(User.insert.make({ name: seedName })).required",
  "})",
  ""
].join("\n")

const makeWorkspaceFixture = Effect.fnUntraced(function* (config: DatabaseConfig) {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path
  const cwd = yield* fs.makeTempDirectory()
  const project = "apps/web"
  const projectPath = path.join(cwd, project)
  const dbDir = path.join(projectPath, "db")

  yield* linkWorkspaceNodeModules(cwd)
  yield* fs.makeDirectory(dbDir, { recursive: true })
  yield* fs.makeDirectory(path.join(projectPath, "fixture"), { recursive: true })
  yield* fs.writeFileString(
    path.join(projectPath, "tsconfig.app.json"),
    JSON.stringify({
      compilerOptions: {
        baseUrl: ".",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        paths: {
          "@fixture/*": ["fixture/*"]
        },
        target: "ES2022",
        strict: true
      }
    })
  )
  yield* fs.writeFileString(path.join(projectPath, "fixture", "seed-name.ts"), 'export const seedName = "Ada"\n')
  yield* fs.writeFileString(path.join(dbDir, "tables.ts"), makeTables(config))
  yield* fs.writeFileString(path.join(dbDir, "seed.ts"), seedSource)

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

describe("seed command", () => {
  it("runs db/seed.ts in the project Effect v3 runtime with tables and tsconfig paths", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const path = yield* Path.Path
        const workspace = yield* makeWorkspaceFixture({
          runtime: "browser",
          provider: "sqlite"
        })
        const databaseFile = path.join(workspace.projectPath, "db", "dev.db")

        yield* querySqlite(
          databaseFile,
          'CREATE TABLE "User" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "name" TEXT NOT NULL);'
        )

        yield* runDbCommand(workspace, ["seed"])

        const names = yield* querySqlite(databaseFile, 'SELECT name FROM "User";')
        expect(names).toBe("Ada")
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
    ))

  it(
    "does not seed after dev, but seeds after reset unless skipped",
    () =>
      Effect.runPromise(
        Effect.gen(function* () {
          const path = yield* Path.Path
          const workspace = yield* makeWorkspaceFixture({
            runtime: "browser",
            provider: "sqlite"
          })
          const databaseFile = path.join(workspace.projectPath, "db", "dev.db")

          yield* runDbCommand(workspace, ["dev", "--force", "--skip-dump", "--migration-name", "init"])

          const rowsAfterDev = yield* querySqlite(databaseFile, 'SELECT COUNT(*) FROM "User";')
          expect(rowsAfterDev).toBe("0")

          yield* runDbCommand(workspace, ["reset", "--force"])

          const rowsAfterReset = yield* querySqlite(databaseFile, 'SELECT name FROM "User";')
          expect(rowsAfterReset).toBe("Ada")
        }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
      ),
    30_000
  )

  it("runs against local d1 persisted sqlite", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem
        const path = yield* Path.Path
        const databaseId = "seed-d1-id"
        const databaseName = "seed-db"
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
          'CREATE TABLE "User" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "name" TEXT NOT NULL);'
        )

        yield* runDbCommand(workspace, ["--database", databaseName, "seed"])

        const names = yield* querySqlite(databaseFile, 'SELECT name FROM "User";')
        expect(names).toBe("Ada")
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
    ))
})

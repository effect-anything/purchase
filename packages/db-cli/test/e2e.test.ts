import { NodeServices } from "@effect/platform-node"
import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Path from "effect/Path"
import { describe, it } from "vitest"

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

type TablesVersion = "initial" | "project" | "projectTask"

const makeTables = (config: DatabaseConfig, version: TablesVersion) =>
  [
    'import * as Database from "@effect-x/db"',
    'import * as Schema from "effect/Schema"',
    "",
    'class User extends Database.Class<User>("User")({',
    '  id: Schema.Number.pipe(Database.IdConfig({ generate: "autoincrement" })),',
    "  name: Schema.String,",
    ...(version !== "initial" ? ["  email: Schema.String.pipe(Schema.optional),"] : []),
    "}) {}",
    "",
    ...(version !== "initial"
      ? [
          'class Project extends Database.Class<Project>("Project")({',
          '  id: Schema.Number.pipe(Database.IdConfig({ generate: "autoincrement" })),',
          "  title: Schema.String",
          "}) {}",
          ""
        ]
      : []),
    ...(version === "projectTask"
      ? [
          'class Task extends Database.Class<Task>("Task")({',
          '  id: Schema.Number.pipe(Database.IdConfig({ generate: "autoincrement" })),',
          "  title: Schema.String",
          "}) {}",
          ""
        ]
      : []),
    `export const tables = ${
      version === "projectTask" ? "{ User, Project, Task }" : version === "project" ? "{ User, Project }" : "{ User }"
    }`,
    `export const config = ${JSON.stringify(config)}`,
    ""
  ].join("\n")

const writeTables = Effect.fnUntraced(function* (
  workspace: Workspace.Workspace,
  config: DatabaseConfig,
  version: TablesVersion
) {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path

  yield* fs.writeFileString(path.join(workspace.projectPath, "db", "tables.ts"), makeTables(config, version))
})

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

  const workspace = yield* Workspace.make({ cwd, project })
  yield* writeTables(workspace, config, "initial")

  return workspace
})

const runDbCommand = Effect.fnUntraced(function* (workspace: Workspace.Workspace, args: ReadonlyArray<string>) {
  const path = yield* Path.Path

  yield* Effect.tryPromise({
    try: () =>
      execFileAsync(
        path.join(dbCliNodeModules, ".bin", "tsx"),
        [
          path.join(repoRoot, "packages/db-cli/src/bin.ts"),
          "--cwd",
          workspace.cwd,
          "--project",
          workspace.project,
          ...args
        ],
        {
          cwd: workspace.cwd,
          env: {
            ...process.env,
            GITHUB_REF_NAME: "test",
            PATH: [
              path.join(workspace.cwd, "node_modules/.bin"),
              path.join(dbCliNodeModules, ".bin"),
              process.env.PATH ?? ""
            ].join(":")
          }
        }
      ),
    catch: (error) => error
  }).pipe(Effect.orDie)
})

const listUserTables = Effect.fnUntraced(function* (databaseFile: string) {
  return yield* querySqlite(
    databaseFile,
    [
      "SELECT name FROM sqlite_master",
      "WHERE type = 'table'",
      "AND name NOT LIKE 'sqlite_%'",
      "AND name NOT IN ('_prisma_migrations')",
      "ORDER BY name;"
    ].join(" ")
  )
})

const listColumns = Effect.fnUntraced(function* (databaseFile: string, table: string) {
  return yield* querySqlite(databaseFile, `SELECT name || ':' || type FROM pragma_table_info('${table}');`)
})

const listMigrations = Effect.fnUntraced(function* (migrationsDir: string) {
  const fs = yield* FileSystem.FileSystem

  return (yield* fs.readDirectory(migrationsDir)).filter((file) => file !== "migration_lock.toml").sort()
})

describe("db cli end-to-end development flow", () => {
  it(
    "creates a project database, executes sql, resets migrations, pushes a model change, and executes a file",
    () =>
      Effect.runPromise(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem
          const path = yield* Path.Path
          const config: DatabaseConfig = {
            runtime: "browser",
            provider: "sqlite"
          }
          const workspace = yield* makeWorkspaceFixture(config)
          const dbDir = path.join(workspace.projectPath, "db")
          const migrationsDir = path.join(dbDir, "migrations")
          const databaseFile = path.join(dbDir, "dev.db")

          yield* runDbCommand(workspace, ["dev", "--force", "--skip-dump", "--skip-seed", "--migration-name", "init"])

          let migrations = (yield* fs.readDirectory(migrationsDir)).filter((file) => file !== "migration_lock.toml")
          assert.strictEqual(migrations.length, 1)
          assert.match(migrations[0]!, /_init$/)
          assert.strictEqual(yield* listUserTables(databaseFile), "User")

          yield* runDbCommand(workspace, [
            "execute",
            "--sql",
            [
              "INSERT INTO \"User\" (name) VALUES ('Ada');",
              "CREATE TABLE Scratch(id INTEGER PRIMARY KEY, body TEXT);",
              "INSERT INTO Scratch(body) VALUES ('temporary');"
            ].join(" ")
          ])
          assert.strictEqual(yield* querySqlite(databaseFile, 'SELECT COUNT(*) FROM "User";'), "1")
          assert.strictEqual(yield* querySqlite(databaseFile, "SELECT COUNT(*) FROM Scratch;"), "1")

          yield* runDbCommand(workspace, ["reset", "--force", "--skip-seed"])
          assert.strictEqual(yield* listUserTables(databaseFile), "User")
          assert.strictEqual(yield* querySqlite(databaseFile, 'SELECT COUNT(*) FROM "User";'), "0")

          yield* writeTables(workspace, config, "project")
          yield* runDbCommand(workspace, ["push", "--force", "--skip-dump"])

          migrations = (yield* fs.readDirectory(migrationsDir)).filter((file) => file !== "migration_lock.toml")
          assert.strictEqual(migrations.length, 1)
          assert.deepEqual((yield* listUserTables(databaseFile)).split("\n"), ["Project", "User"])
          assert.deepEqual((yield* listColumns(databaseFile, "User")).split("\n"), [
            "id:INTEGER",
            "name:TEXT",
            "email:TEXT"
          ])

          const seedFile = path.join(workspace.cwd, "seed.sql")
          yield* fs.writeFileString(
            seedFile,
            [
              "INSERT INTO \"User\" (name, email) VALUES ('Grace', 'grace@example.com');",
              "INSERT INTO \"Project\" (title) VALUES ('Compiler');"
            ].join("\n")
          )
          yield* runDbCommand(workspace, ["execute", "--file", seedFile])

          assert.strictEqual(
            yield* querySqlite(databaseFile, "SELECT name || ':' || email FROM \"User\";"),
            "Grace:grace@example.com"
          )
          assert.strictEqual(yield* querySqlite(databaseFile, 'SELECT title FROM "Project";'), "Compiler")
        }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
      ),
    30_000
  )

  it(
    "supports repeated schema iteration with dev migrations and reset replay",
    () =>
      Effect.runPromise(
        Effect.gen(function* () {
          const path = yield* Path.Path
          const config: DatabaseConfig = {
            runtime: "browser",
            provider: "sqlite"
          }
          const workspace = yield* makeWorkspaceFixture(config)
          const dbDir = path.join(workspace.projectPath, "db")
          const migrationsDir = path.join(dbDir, "migrations")
          const databaseFile = path.join(dbDir, "dev.db")

          yield* runDbCommand(workspace, ["dev", "--force", "--skip-dump", "--skip-seed", "--migration-name", "init"])

          yield* writeTables(workspace, config, "project")
          yield* runDbCommand(workspace, [
            "dev",
            "--force",
            "--skip-dump",
            "--skip-seed",
            "--migration-name",
            "add-project"
          ])

          let migrations = yield* listMigrations(migrationsDir)
          assert.strictEqual(migrations.length, 2)
          assert.match(migrations[0]!, /_init$/)
          assert.match(migrations[1]!, /_add_project$/)
          assert.deepEqual((yield* listUserTables(databaseFile)).split("\n"), ["Project", "User"])

          yield* runDbCommand(workspace, [
            "execute",
            "--sql",
            [
              "INSERT INTO \"User\" (name, email) VALUES ('Ada', 'ada@example.com');",
              "INSERT INTO \"Project\" (title) VALUES ('Runtime');"
            ].join(" ")
          ])
          yield* runDbCommand(workspace, ["dev", "--force", "--skip-dump", "--skip-seed"])

          migrations = yield* listMigrations(migrationsDir)
          assert.strictEqual(migrations.length, 2)
          assert.strictEqual(yield* querySqlite(databaseFile, 'SELECT COUNT(*) FROM "User";'), "1")
          assert.strictEqual(yield* querySqlite(databaseFile, 'SELECT COUNT(*) FROM "Project";'), "1")

          yield* writeTables(workspace, config, "projectTask")
          yield* runDbCommand(workspace, [
            "dev",
            "--force",
            "--skip-dump",
            "--skip-seed",
            "--migration-name",
            "add-task"
          ])

          migrations = yield* listMigrations(migrationsDir)
          assert.strictEqual(migrations.length, 3)
          assert.match(migrations[2]!, /_add_task$/)
          assert.deepEqual((yield* listUserTables(databaseFile)).split("\n"), ["Project", "Task", "User"])
          assert.deepEqual((yield* listColumns(databaseFile, "Project")).split("\n"), ["id:INTEGER", "title:TEXT"])

          yield* runDbCommand(workspace, ["reset", "--force", "--skip-seed"])

          assert.deepEqual((yield* listUserTables(databaseFile)).split("\n"), ["Project", "Task", "User"])
          assert.strictEqual(yield* querySqlite(databaseFile, 'SELECT COUNT(*) FROM "User";'), "0")
          assert.strictEqual(yield* querySqlite(databaseFile, 'SELECT COUNT(*) FROM "Project";'), "0")
        }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
      ),
    45_000
  )
})

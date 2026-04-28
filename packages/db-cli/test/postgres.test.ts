import { NodeServices } from "@effect/platform-node"
import { PostgreSqlContainer } from "@testcontainers/postgresql"
import { execFile } from "node:child_process"
import { createRequire } from "node:module"
import { realpathSync } from "node:fs"
import * as nodePath from "node:path"
import { promisify } from "node:util"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Path from "effect/Path"
import { describe, expect, it } from "vitest"

import type { DatabaseConfig } from "../src/shared.ts"
import * as Workspace from "../src/workspace.ts"

const execFileAsync = promisify(execFile)
const repoRoot = realpathSync(new URL("../../..", import.meta.url))
const dbCliNodeModules = `${repoRoot}/packages/db-cli/node_modules`
const dbNodeModules = `${repoRoot}/packages/db/node_modules`
const pgRequire = createRequire(realpathSync(`${dbNodeModules}/@effect/sql-pg/package.json`))
const { Client } = pgRequire("pg") as { Client: new (options: { connectionString: string }) => any }
const describePostgres = process.env.DB_CLI_SKIP_TESTCONTAINERS === "1" ? describe.skip : describe
const postgresImage = process.env.DB_CLI_POSTGRES_IMAGE ?? "public.ecr.aws/docker/library/postgres:17-alpine"

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
  yield* fs.symlink(`${dbNodeModules}/@effect/sql-pg`, path.join(nodeModules, "@effect/sql-pg")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbCliNodeModules}/tsx`, path.join(nodeModules, "tsx")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbCliNodeModules}/@prisma`, path.join(nodeModules, "@prisma")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbCliNodeModules}/prisma`, path.join(nodeModules, "prisma")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbCliNodeModules}/.bin/tsx`, path.join(nodeModules, ".bin/tsx")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbCliNodeModules}/.bin/prisma`, path.join(nodeModules, ".bin/prisma")).pipe(Effect.orDie)
})

const queryPostgres = Effect.fnUntraced(function* (url: string, sql: string) {
  const result = yield* Effect.tryPromise({
    try: () => {
      const client = new Client({ connectionString: url })
      return client
        .connect()
        .then(() => client.query(sql))
        .finally(() => client.end())
    },
    catch: (error) => error
  }).pipe(Effect.orDie)

  return result.rows
})

const makeTables = (config: DatabaseConfig, includeProject = false) =>
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
    ...(includeProject
      ? [
          'export class Project extends Database.Class<Project>("Project")({',
          '  id: Database.Generated(Schema.Number.pipe(Database.IdConfig({ generate: "autoincrement" }))),',
          "  name: Schema.String",
          "}) {}",
          ""
        ]
      : []),
    `export const tables = ${includeProject ? "{ User, Project }" : "{ User }"}`,
    `export const config = ${JSON.stringify(config)}`,
    ""
  ].join("\n")

const seedSource = [
  'import { SqlClient } from "@effect/sql/SqlClient"',
  'import * as Effect from "effect/Effect"',
  'import { User } from "./tables"',
  "",
  "export default Effect.gen(function* () {",
  "  const sql = yield* SqlClient",
  "  const repo = yield* User.repo",
  "  const insert = repo.insert((input) =>",
  "    sql`INSERT INTO ${sql(User.table)} ${sql.insert(input)} returning *`",
  "  )",
  '  yield* insert(User.insert.make({ name: "Ada" })).required',
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
  yield* fs.writeFileString(path.join(dbDir, "tables.ts"), makeTables(config))
  yield* fs.writeFileString(path.join(dbDir, "seed.ts"), seedSource)

  return yield* Workspace.make({ cwd, project })
})

const runDbCommand = Effect.fnUntraced(function* (workspace: Workspace.Workspace, args: ReadonlyArray<string>) {
  yield* Effect.tryPromise({
    try: () =>
      execFileAsync(
        nodePath.join(dbCliNodeModules, ".bin/tsx"),
        [
          nodePath.join(repoRoot, "packages/db-cli/src/bin.ts"),
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
            PATH: [nodePath.join(workspace.cwd, "node_modules/.bin"), process.env.PATH].filter(Boolean).join(":")
          }
        }
      ),
    catch: (error) => error
  }).pipe(Effect.orDie)
})

const makePostgresContainer = Effect.acquireRelease(
  Effect.tryPromise({
    try: () => new PostgreSqlContainer(postgresImage).start(),
    catch: (error) => error
  }).pipe(Effect.orDie),
  (container) => Effect.promise(() => container.stop()).pipe(Effect.ignore)
)

describePostgres("postgres server provider", () => {
  it(
    "runs a development flow against a real postgres database",
    () =>
      Effect.runPromise(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem
          const path = yield* Path.Path
          const container = yield* makePostgresContainer
          const config = {
            runtime: "server",
            provider: "postgresql",
            url: container.getConnectionUri()
          } satisfies DatabaseConfig
          const workspace = yield* makeWorkspaceFixture(config)

          yield* runDbCommand(workspace, ["dev", "--force", "--skip-dump", "--migration-name", "init"])
          yield* runDbCommand(workspace, ["execute", "--sql", 'INSERT INTO "User" ("name") VALUES (\'Lin\');'])

          const rowsAfterExecute = yield* queryPostgres(config.url, 'SELECT name FROM "User" ORDER BY name;')
          expect(rowsAfterExecute.map((row) => row.name)).toEqual(["Lin"])

          yield* runDbCommand(workspace, ["reset", "--force"])

          const rowsAfterReset = yield* queryPostgres(config.url, 'SELECT name FROM "User" ORDER BY name;')
          expect(rowsAfterReset.map((row) => row.name)).toEqual(["Ada"])

          yield* fs.writeFileString(path.join(workspace.projectPath, "db", "tables.ts"), makeTables(config, true))
          yield* runDbCommand(workspace, ["push", "--force", "--skip-dump"])

          const sqlPath = path.join(workspace.cwd, "insert-project.sql")
          yield* fs.writeFileString(sqlPath, 'INSERT INTO "Project" ("name") VALUES (\'Postgres\');')
          yield* runDbCommand(workspace, ["execute", "--file", sqlPath])

          const projectRows = yield* queryPostgres(config.url, 'SELECT name FROM "Project" ORDER BY name;')
          expect(projectRows.map((row) => row.name)).toEqual(["Postgres"])
        }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
      ),
    60_000
  )
})

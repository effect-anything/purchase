import { NodeServices } from "@effect/platform-node"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import * as Command from "effect/unstable/cli/Command"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Path from "effect/Path"
import { describe, expect, it } from "vitest"

import { rootCommand } from "../src/commands.ts"
import type { DatabaseConfig } from "../src/shared.ts"
import * as Workspace from "../src/workspace.ts"

const execFileAsync = promisify(execFile)

const repoRoot = process.cwd()
const dbCliNodeModules = `${repoRoot}/packages/db-cli/node_modules`
const dbNodeModules = `${repoRoot}/packages/db/node_modules`

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
  yield* fs.symlink(`${dbCliNodeModules}/@prisma`, path.join(nodeModules, "@prisma")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbCliNodeModules}/prisma`, path.join(nodeModules, "prisma")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbCliNodeModules}/tsx`, path.join(nodeModules, "tsx")).pipe(Effect.orDie)
  yield* fs.symlink(`${dbCliNodeModules}/.bin/prisma`, path.join(nodeModules, ".bin/prisma")).pipe(Effect.orDie)
})

const chmodExecutable = (file: string) =>
  Effect.tryPromise({
    try: () => execFileAsync("chmod", ["+x", file]),
    catch: (error) => error
  }).pipe(Effect.orDie)

const writeFakeWrangler = Effect.fnUntraced(function* (cwd: string) {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path
  const wranglerBin = path.join(cwd, "node_modules/.bin/wrangler")

  yield* fs.makeDirectory(path.dirname(wranglerBin), { recursive: true })
  yield* fs.writeFileString(
    wranglerBin,
    [
      "#!/usr/bin/env node",
      'const fs = require("node:fs")',
      'const path = require("node:path")',
      'const callsFile = path.resolve(__dirname, "../../wrangler-calls.jsonl")',
      "const call = {",
      "  args: process.argv.slice(2),",
      "  token: process.env.CLOUDFLARE_API_TOKEN,",
      "  account: process.env.CLOUDFLARE_ACCOUNT_ID",
      "}",
      'fs.appendFileSync(callsFile, JSON.stringify(call) + "\\n")',
      'process.stdout.write("Applied migrations\\n")',
      ""
    ].join("\n")
  )
  yield* chmodExecutable(wranglerBin)
})

const querySqlite = Effect.fnUntraced(function* (databaseFile: string, sql: string) {
  const output = yield* Effect.tryPromise({
    try: () => execFileAsync("sqlite3", [databaseFile, sql]),
    catch: (error) => error
  }).pipe(Effect.orDie)

  return output.stdout.trim()
})

const withEnvVars = <A, E, R>(values: Record<string, string>, effect: Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.sync(() => {
      const previous: Record<string, string | undefined> = {}
      for (const [name, value] of Object.entries(values)) {
        previous[name] = process.env[name]
        process.env[name] = value
      }
      return previous
    }),
    () => effect,
    (previous) =>
      Effect.sync(() => {
        for (const [name, value] of Object.entries(previous)) {
          if (value === undefined) {
            delete process.env[name]
          } else {
            process.env[name] = value
          }
        }
      })
  )

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

  yield* withEnvVars(
    {
      GITHUB_REF_NAME: "test"
    },
    runCommand(["--cwd", workspace.cwd, "--project", workspace.project, ...args])
  )
})

describe("deploy command runtime/provider coverage", () => {
  it("applies server sqlite prisma migrations from an existing migration directory", () =>
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
        const migrationsDir = path.join(workspace.projectPath, "db", "migrations")
        const migrationDir = path.join(migrationsDir, "20260101000000_init")
        const databaseFile = path.join(workspace.projectPath, "db", "server.db")

        yield* fs.makeDirectory(migrationDir, { recursive: true })
        yield* fs.writeFileString(path.join(migrationsDir, "migration_lock.toml"), 'provider = "sqlite"\n')
        yield* fs.writeFileString(
          path.join(migrationDir, "migration.sql"),
          [
            'CREATE TABLE "User" (',
            '  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,',
            '  "name" TEXT NOT NULL',
            ");",
            ""
          ].join("\n")
        )

        yield* runDbCommand(workspace, ["deploy"])

        const userTables = yield* querySqlite(
          databaseFile,
          "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'User';"
        )

        expect(userTables).toBe("User")
        expect(yield* fs.exists(path.join(workspace.projectPath, "db", "prisma.config.ts"))).toBe(true)
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
    ))

  it("skips browser sqlite deploy even when local migrations exist", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem
        const path = yield* Path.Path
        const workspace = yield* makeWorkspaceFixture({
          runtime: "browser",
          provider: "sqlite"
        })
        const migrationDir = path.join(workspace.projectPath, "db", "migrations", "20260101000000_init")
        const databaseFile = path.join(workspace.projectPath, "db", "dev.db")

        yield* fs.makeDirectory(migrationDir, { recursive: true })
        yield* fs.writeFileString(path.join(migrationDir, "migration.sql"), "CREATE TABLE BrowserOnly(id INTEGER);")

        yield* runDbCommand(workspace, ["deploy"])

        expect(yield* fs.exists(databaseFile)).toBe(false)
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
    ))

  it("deploys d1 migrations from wrangler migrations_dir", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem
        const path = yield* Path.Path
        const databaseName = "remote-db"
        const workspace = yield* makeWorkspaceFixture({
          runtime: "d1",
          provider: "sqlite"
        })
        const migrationsDir = path.join(workspace.projectPath, "cloudflare-migrations")
        const callsFile = path.join(workspace.cwd, "wrangler-calls.jsonl")
        const wranglerConfigPath = path.join(workspace.projectPath, "wrangler.jsonc")

        yield* writeFakeWrangler(workspace.cwd)
        yield* fs.writeFileString(
          wranglerConfigPath,
          [
            "{",
            '  "d1_databases": [{',
            '    "binding": "DB",',
            `    "database_name": ${JSON.stringify(databaseName)},`,
            '    "database_id": "remote-db-id",',
            '    "preview_database_id": "preview-db-id",',
            '    "migrations_dir": "cloudflare-migrations"',
            "  }]",
            "}",
            ""
          ].join("\n")
        )
        yield* fs.makeDirectory(migrationsDir, { recursive: true })
        yield* fs.writeFileString(
          path.join(migrationsDir, "20260101000000_init.sql"),
          "CREATE TABLE D1User(id INTEGER);"
        )

        yield* withEnvVars(
          {
            CLOUDFLARE_ACCOUNT_ID: "account-id",
            CLOUDFLARE_API_TOKEN: "api-token",
            CLOUDFLARE_EMAIL: "ops@example.com",
            GITHUB_REF_NAME: "test",
            STAGE: "staging"
          },
          runDbCommand(workspace, ["--database", databaseName, "deploy"])
        )

        const call = JSON.parse((yield* fs.readFileString(callsFile)).trim())

        expect(call.args).toEqual([
          "d1",
          "migrations",
          "apply",
          databaseName,
          `--config=${wranglerConfigPath}`,
          "--preview",
          "--remote"
        ])
        expect(call.token).toBe("api-token")
        expect(call.account).toBe("account-id")
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
    ))

  it("does not deploy d1 migrations from prisma's db/migrations directory when wrangler uses a different directory", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem
        const path = yield* Path.Path
        const databaseName = "remote-db"
        const workspace = yield* makeWorkspaceFixture({
          runtime: "d1",
          provider: "sqlite"
        })
        const callsFile = path.join(workspace.cwd, "wrangler-calls.jsonl")
        const prismaMigrationsDir = path.join(workspace.projectPath, "db", "migrations")

        yield* writeFakeWrangler(workspace.cwd)
        yield* fs.writeFileString(
          path.join(workspace.projectPath, "wrangler.jsonc"),
          [
            "{",
            '  "d1_databases": [{',
            '    "binding": "DB",',
            `    "database_name": ${JSON.stringify(databaseName)},`,
            '    "database_id": "remote-db-id",',
            '    "migrations_dir": "cloudflare-migrations"',
            "  }]",
            "}",
            ""
          ].join("\n")
        )
        yield* fs.makeDirectory(prismaMigrationsDir, { recursive: true })
        yield* fs.writeFileString(path.join(prismaMigrationsDir, "20260101000000_init.sql"), "CREATE TABLE Wrong(id);")

        yield* withEnvVars(
          {
            CLOUDFLARE_ACCOUNT_ID: "account-id",
            CLOUDFLARE_API_TOKEN: "api-token",
            CLOUDFLARE_EMAIL: "ops@example.com",
            GITHUB_REF_NAME: "test"
          },
          runDbCommand(workspace, ["--database", databaseName, "deploy"])
        )

        expect(yield* fs.exists(callsFile)).toBe(false)
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
    ))
})

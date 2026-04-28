import { NodeServices } from "@effect/platform-node"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Path from "effect/Path"
import * as Command from "effect/unstable/cli/Command"
import { describe, expect, it } from "vitest"

import { getD1Name } from "../src/cloudflare.ts"
import { rootCommand } from "../src/commands.ts"
import type { DatabaseConfig } from "../src/shared.ts"
import * as Workspace from "../src/workspace.ts"

const execFileAsync = promisify(execFile)

const baseSchema = [
  "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL);",
  "CREATE TABLE posts (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, title TEXT NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id));"
]

const runSqlite = Effect.fnUntraced(function* (databaseFile: string, sql: ReadonlyArray<string>) {
  yield* Effect.tryPromise({
    try: () => execFileAsync("sqlite3", [databaseFile, sql.join("\n")]),
    catch: (error) => error
  }).pipe(Effect.orDie)
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
    [`export const tables = {}`, `export const config = ${JSON.stringify(config)}`, ""].join("\n")
  )

  return yield* Workspace.make({ cwd, project })
})

const dumpWorkspace = Effect.fnUntraced(function* (
  workspace: Workspace.Workspace,
  database: string | undefined = undefined
) {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path
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
      "dump"
    ])
  )

  return yield* fs.readFileString(path.join(workspace.projectPath, "db", "schema.sql"))
})

describe("dump command runtime/provider coverage", () => {
  it("dumps browser sqlite from db/dev.db with deterministic schema content", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const path = yield* Path.Path
        const workspace = yield* makeWorkspaceFixture({
          runtime: "browser",
          provider: "sqlite"
        })
        const databaseFile = path.join(workspace.projectPath, "db", "dev.db")

        yield* runSqlite(databaseFile, baseSchema)

        const dumped = yield* dumpWorkspace(workspace)

        expect(dumped).toBe(baseSchema.join("\n"))
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
    ))

  it("dumps server sqlite from configured file url with deterministic schema content", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const path = yield* Path.Path
        const workspace = yield* makeWorkspaceFixture({
          runtime: "server",
          provider: "sqlite",
          url: "file:./server.db"
        })
        const databaseFile = path.join(workspace.projectPath, "db", "server.db")

        yield* runSqlite(databaseFile, baseSchema)

        const dumped = yield* dumpWorkspace(workspace)

        expect(dumped).toBe(baseSchema.join("\n"))
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
    ))

  it("dumps local d1 sqlite from miniflare state and removes cloudflare internal tables", () =>
    Effect.runPromise(
      withNodeEnv(
        "development",
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem
          const path = yield* Path.Path
          const databaseId = "local-d1-id"
          const databaseName = "app-db"
          const workspace = yield* makeWorkspaceFixture({
            runtime: "d1",
            provider: "sqlite"
          })
          const databaseFile = path.join(
            workspace.cwd,
            ".wrangler/state/v3/d1/miniflare-D1DatabaseObject",
            `${getD1Name(databaseId)}.sqlite`
          )

          yield* fs.makeDirectory(path.dirname(databaseFile), { recursive: true })
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
          yield* runSqlite(databaseFile, [
            ...baseSchema,
            "CREATE TABLE _cf_KV(key TEXT);",
            "CREATE TABLE _cf_METADATA(key TEXT);"
          ])

          const dumped = (yield* dumpWorkspace(workspace, databaseName)).trim()

          expect(dumped).toBe(baseSchema.join("\n"))
          expect(dumped).not.toContain("_cf_KV")
          expect(dumped).not.toContain("_cf_METADATA")
        }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
      )
    ))
})

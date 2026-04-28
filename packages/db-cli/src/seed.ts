import * as FileSystem from "effect/FileSystem"
import * as Path from "effect/Path"
import * as Effect from "effect/Effect"
import * as Clock from "effect/Clock"

import { DatabaseSeedError, type DatabaseSeedSubcommand } from "./domain.ts"
import type { DatabaseConfig } from "./shared.ts"
import * as D1 from "./d1.ts"
import * as SQLite from "./sqlite.ts"
import type * as Workspace from "./workspace.ts"
import { logCommandOutput, runCommand } from "./utils/shell.ts"

type NativeSqliteConfig =
  | Extract<DatabaseConfig, { runtime: "browser" }>
  | Extract<DatabaseConfig, { runtime: "server" }>

type SeedTarget =
  | {
      readonly _tag: "sqlite"
      readonly databaseFile: string
    }
  | {
      readonly _tag: "postgresql"
      readonly url: string
    }
  | {
      readonly _tag: "mysql"
      readonly url: string
    }

export const defaultSeedFile = "seed.ts"

const resolveSeedPath = Effect.fnUntraced(function* (
  workspace: Workspace.Workspace,
  dbDir: string,
  file: string | undefined
) {
  const path = yield* Path.Path

  if (!file) {
    return path.join(dbDir, defaultSeedFile)
  }

  return path.isAbsolute(file) ? file : path.resolve(workspace.cwd, file)
})

const resolveNativeSqliteFile = Effect.fnUntraced(function* (dbDir: string, config: NativeSqliteConfig) {
  const path = yield* Path.Path
  return SQLite.getDatabaseFile(dbDir, config, path)
})

const resolveSeedTarget = Effect.fnUntraced(function* (
  workspace: Workspace.Workspace,
  dbDir: string,
  config: DatabaseConfig,
  subcommand: DatabaseSeedSubcommand
) {
  if (config.runtime === "d1") {
    if (subcommand.env === "production" || subcommand.stage === "production") {
      return yield* Effect.fail(
        new DatabaseSeedError({
          description: "Seed is local-only. Refusing to run D1 seed for production."
        })
      )
    }

    const { databaseFile } = yield* D1.getWranglerConfig(workspace, { database: subcommand.database })
    return {
      _tag: "sqlite" as const,
      databaseFile
    }
  }

  if (config.provider === "sqlite" && (config.runtime === "browser" || config.runtime === "server")) {
    if (config.runtime === "server" && !config.url.startsWith("file:")) {
      return yield* Effect.fail(
        new DatabaseSeedError({
          description: `Seed only supports server sqlite file URLs. Received ${config.url}.`
        })
      )
    }

    const databaseFile = yield* resolveNativeSqliteFile(dbDir, config)
    return {
      _tag: "sqlite" as const,
      databaseFile
    }
  }

  if (config.runtime === "server" && config.provider === "postgresql") {
    return {
      _tag: "postgresql" as const,
      url: config.url
    }
  }

  if (config.runtime === "server" && config.provider === "mysql") {
    return {
      _tag: "mysql" as const,
      url: config.url
    }
  }

  return yield* Effect.fail(
    new DatabaseSeedError({
      description: `Seed is not supported for ${config.runtime}/${config.provider}.`
    })
  )
})

const makeRunnerSource = (options: {
  readonly seedPath: string
  readonly tsconfigPath: string
  readonly target: SeedTarget
}) =>
  [
    'import { pathToFileURL } from "node:url"',
    "",
    `const seedPath = ${JSON.stringify(options.seedPath)}`,
    `const target = ${JSON.stringify(options.target)}`,
    "",
    'const Effect = await import("effect/Effect")',
    'const SqlClient = await import("@effect/sql/SqlClient")',
    'const Redacted = await import("effect/Redacted")',
    "",
    "const imported = await import(pathToFileURL(seedPath).href)",
    "const seed = imported.default",
    "",
    "if (!Effect.isEffect(seed)) {",
    "  throw new Error(`Seed file must default export an Effect: ${seedPath}`)",
    "}",
    "",
    "const program = Effect.gen(function*() {",
    "  const sql = yield* SqlClient.SqlClient",
    "  yield* sql.withTransaction(seed)",
    "})",
    "",
    "let layer",
    'if (target._tag === "sqlite") {',
    '  const SqliteClient = await import("@effect/sql-sqlite-node/SqliteClient")',
    "  layer = SqliteClient.layer({ filename: target.databaseFile })",
    '} else if (target._tag === "postgresql") {',
    '  const PgClient = await import("@effect/sql-pg/PgClient")',
    "  layer = PgClient.layer({ url: Redacted.make(target.url) })",
    '} else if (target._tag === "mysql") {',
    '  const MysqlClient = await import("@effect/sql-mysql2/MysqlClient")',
    "  layer = MysqlClient.layer({ url: Redacted.make(target.url) })",
    "} else {",
    "  throw new Error(`Unsupported seed target: ${target._tag}`)",
    "}",
    "",
    "await Effect.runPromise(Effect.provide(program, layer))",
    ""
  ].join("\n")

const makeRunnerPath = Effect.fnUntraced(function* (workspace: Workspace.Workspace) {
  const path = yield* Path.Path
  const fs = yield* FileSystem.FileSystem
  const millis = yield* Clock.currentTimeMillis
  const runnerDir = path.join(workspace.cwd, ".xdev")

  yield* fs.makeDirectory(runnerDir, { recursive: true })

  return path.join(runnerDir, `db-seed-runner-${process.pid}-${millis}.mjs`)
})

const runProjectSeed = Effect.fnUntraced(function* (
  workspace: Workspace.Workspace,
  options: {
    readonly seedPath: string
    readonly tsconfigPath: string
    readonly target: SeedTarget
  }
) {
  const path = yield* Path.Path
  const fs = yield* FileSystem.FileSystem
  const runnerPath = yield* makeRunnerPath(workspace)
  const runnerSource = makeRunnerSource(options)
  const tsxBin = path.join(workspace.cwd, "node_modules/.bin/tsx")

  yield* fs.writeFileString(runnerPath, runnerSource)

  const cleanup = fs.remove(runnerPath).pipe(Effect.ignore)
  const output = yield* runCommand(tsxBin, ["--tsconfig", options.tsconfigPath, runnerPath], {
    cwd: workspace.cwd,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      STAGE: process.env.STAGE,
      TSX_TSCONFIG_PATH: options.tsconfigPath
    }
  }).pipe(Effect.ensuring(cleanup))

  yield* logCommandOutput("db.seed", output)
})

export const run = Effect.fn("db.seed.run")(function* (
  workspace: Workspace.Workspace,
  {
    dbDir,
    tsconfigPath,
    config,
    subcommand
  }: {
    readonly dbDir: string
    readonly tsconfigPath: string
    readonly config: DatabaseConfig
    readonly subcommand: DatabaseSeedSubcommand
  }
) {
  const fs = yield* FileSystem.FileSystem
  const seedPath = yield* resolveSeedPath(workspace, dbDir, subcommand.file)
  const hasSeed = yield* fs.exists(seedPath).pipe(Effect.orElseSucceed(() => false))

  if (!hasSeed) {
    return {
      _tag: "Skipped" as const,
      path: seedPath
    }
  }

  const target = yield* resolveSeedTarget(workspace, dbDir, config, subcommand)

  yield* runProjectSeed(workspace, {
    seedPath,
    tsconfigPath,
    target
  })

  return {
    _tag: "Seeded" as const,
    path: seedPath,
    target
  }
})

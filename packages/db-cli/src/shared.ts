/** @effect-diagnostics preferSchemaOverJson:off */

import type { SqlError } from "@effect/sql"

import * as FileSystem from "effect/FileSystem"
import * as Path from "effect/Path"
import * as DateTime from "effect/DateTime"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"

import type { PrismaGenerateOptions } from "@effect-x/db/prisma"
import type { TablesRecord } from "@effect-x/db/schema"
import type * as Workspace from "./workspace.ts"
import type * as PrismaGenerator from "@effect-x/db/prisma"
import { DatabaseConfigurationError } from "./domain.ts"

import { logCommandOutput, runCommandLine } from "./utils/shell.ts"
import { formatSchema } from "./utils/prisma.ts"
import { resolvePrismaCommand } from "./utils/prisma-bin.ts"
import { importLocalModule } from "./utils/ts-import.ts"

export const devDB = "dev.db"

export const unwrapModule = <T>(value: T): T extends { default: infer U } ? U : T => {
  const candidate = value as { default?: unknown; "module.exports"?: unknown }
  return (candidate.default ?? candidate["module.exports"] ?? value) as T extends { default: infer U } ? U : T
}

let prismaGeneratePromise: Promise<typeof PrismaGenerator> | undefined

const getPrismaGenerator = () =>
  (prismaGeneratePromise ??= import("@effect-x/db/prisma").then(unwrapModule<typeof PrismaGenerator>))

const loadPrismaGenerator = Effect.promise(getPrismaGenerator)

export type DatabaseConfig =
  | {
      provider: "sqlite"
      runtime: "d1"
    }
  | {
      provider: "sqlite"
      runtime: "browser"
    }
  | {
      provider: PrismaGenerateOptions["provider"]
      runtime: "server"
      url: string
    }

export type SeedEntry = {
  start: Effect.Effect<void, SqlError.SqlError, never>
}

export type PrismaMigration = {
  filepath: string
  content: string
}

export const getMigrationDate = Effect.map(DateTime.now, (now) =>
  DateTime.formatIso(now).slice(0, 19).replace(/[-:T]/g, "")
)

export const existDatabase = Effect.fn("db.exist-database")(function* (
  workspace: Workspace.Workspace
): Effect.fn.Return<boolean, never, Path.Path | FileSystem.FileSystem> {
  yield* Effect.annotateCurrentSpan({
    projectName: workspace.projectName
  })

  const path = yield* Path.Path
  const fs = yield* FileSystem.FileSystem

  const dbDir = path.join(workspace.projectPath, "db")
  const migrationsDir = path.join(dbDir, "migrations")

  return yield* fs.exists(migrationsDir).pipe(Effect.orElseSucceed(() => false))
}, Effect.orDie)

export const detectDatabase = Effect.fn("db.detect-database")(function* (
  workspace: Workspace.Workspace,
  { databaseName }: { databaseName?: string | undefined } = {}
): Effect.fn.Return<
  {
    dbDir: string
    migrationsDir: string
    tables: Record<string, any>
    config: DatabaseConfig
    tsconfigPath: string
  },
  never,
  Path.Path | FileSystem.FileSystem
> {
  yield* Effect.annotateCurrentSpan({
    projectName: workspace.projectName,
    databaseName
  })

  const path = yield* Path.Path
  const fs = yield* FileSystem.FileSystem

  const dbDir = path.join(workspace.projectPath, "db")
  const migrationsDir = path.join(dbDir, "migrations")
  const tablesPath = path.join(dbDir, "tables.ts")
  const hasTables = yield* fs.exists(tablesPath).pipe(Effect.orElseSucceed(() => false))

  if (!hasTables) {
    return yield* Effect.die(
      new DatabaseConfigurationError({
        description: `No database configured for ${workspace.projectName}. Expected ${tablesPath}.`
      })
    )
  }

  yield* pipe(
    fs.exists(migrationsDir),
    Effect.tap((exists) => (!exists ? fs.makeDirectory(migrationsDir, { recursive: true }) : Effect.void)),
    Effect.orDie
  )

  const tsconfigPath = path.join(workspace.projectPath, "tsconfig.app.json")

  const { tables, config } = yield* Effect.promise(() =>
    importLocalModule<{
      tables: TablesRecord<any>
      config: DatabaseConfig
    }>(tablesPath, {
      parentURL: import.meta.url,
      tsconfig: tsconfigPath
    })
  ).pipe(
    Effect.map((module) => {
      const imported = unwrapModule(module)
      const databaseConfig = imported.config as DatabaseConfig

      return {
        tables: imported.tables as TablesRecord<any>,
        config: databaseConfig
      }
    })
  )

  return {
    dbDir,
    migrationsDir,
    tables,
    config,
    tsconfigPath
  }
})

export const getMigrations = Effect.fn("db.get-migrations")(function* (
  dir: string
): Effect.fn.Return<Array<PrismaMigration>, never, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path

  const migrations = yield* fs.readDirectory(dir).pipe(
    Effect.map((files) =>
      files
        .filter((item) => {
          if (item === "migration_lock.toml") {
            return false
          }

          if (item.indexOf("_") > -1) {
            return true
          }

          return item.endsWith(".sql")
        })
        .sort((a, b) => {
          const v1 = a.split("_")[0]
          const v2 = b.split("_")[0]

          const t1 = Number.parseInt(v1, 10)
          const t2 = Number.parseInt(v2, 10)

          if (t1 < t2) return 1
          if (t1 > t2) return -1
          return 0
        })
    ),
    Effect.flatMap((files) =>
      Effect.forEach(
        files,
        Effect.fnUntraced(function* (filename) {
          const filepath = path.join(dir, filename)
          const stat = yield* fs.stat(filepath).pipe(Effect.orDie)
          const content = yield* fs.readFileString(
            stat.type === "Directory" ? path.join(filepath, "migration.sql") : filepath
          )

          return {
            filepath,
            content
          }
        })
      )
    ),
    Effect.orDie
  )

  return migrations
})

export const syncPrismaSchema = Effect.fn("prisma.sync-schema")(function* (
  workspace: Workspace.Workspace,
  { dbDir }: { dbDir: string },
  config: DatabaseConfig,
  tables: TablesRecord<any>
): Effect.fn.Return<
  {
    prismaPath: string
    prisma: string
  },
  never,
  Path.Path | FileSystem.FileSystem
> {
  const path = yield* Path.Path
  const fs = yield* FileSystem.FileSystem
  const prismaGenerator = yield* loadPrismaGenerator

  if (config.runtime === "server" && !config.url) {
    return yield* Effect.die("Missing database url")
  }

  const generated = yield* Effect.try({
    try: () =>
      prismaGenerator.generate(
        {
          provider: config.provider,
          generator: {
            markdown: {
              title: "Database Schema",
              output: "./database-schema.md",
              root: path.relative(dbDir, workspace.cwd)
            }
          }
        },
        tables
      ),
    catch: (error) => error
  }).pipe(
    Effect.andThen((content) =>
      Effect.tryPromise({
        try: () => formatSchema({ schemas: [["schema.prisma", content]] }, { insertSpaces: true, tabSize: 2 }),
        catch: (error) => error
      })
    ),
    Effect.map((result) => result[0][1]),
    Effect.orDie
  )

  const prismaPath = path.join(dbDir, "schema.prisma")
  yield* fs.writeFileString(prismaPath, generated).pipe(Effect.orDie)

  const prismaConfigUrl =
    config.runtime === "server" ? config.url : config.provider === "sqlite" ? `file:./${devDB}` : undefined
  const prismaConfigPath = path.join(dbDir, "prisma.config.ts")

  if (prismaConfigUrl) {
    yield* fs
      .writeFileString(
        prismaConfigPath,
        [
          "import { defineConfig } from '@prisma/config'",
          "",
          "export default defineConfig({",
          "  schema: './schema.prisma',",
          "  migrations: { path: './migrations' },",
          `  datasource: { url: ${JSON.stringify(prismaConfigUrl)} },`,
          "})",
          ""
        ].join("\n")
      )
      .pipe(Effect.orDie)
  }

  const prismaCommand = resolvePrismaCommand()

  const generateOutput = yield* runCommandLine([...prismaCommand, "generate", "--schema=./schema.prisma"], {
    cwd: dbDir
  })
  yield* logCommandOutput("prisma.generate", generateOutput)

  return {
    prismaPath,
    prisma: generated
  }
})

export const runPrismaMigrateDiffCli = Effect.fn("prisma.migrate-diff-cli")(function* (
  _workspace: Workspace.Workspace,
  options: {
    dbDir: string
    from: { tag: "empty" } | { tag: "migrations"; path: string }
    provider?: PrismaGenerateOptions["provider"] | undefined
  }
) {
  const path = yield* Path.Path
  const fs = yield* FileSystem.FileSystem
  const prismaCommand = resolvePrismaCommand()
  const cleanupPaths: Array<string> = []
  let fromPath = options.from.tag === "migrations" ? options.from.path : undefined

  if (options.from.tag === "migrations") {
    const migrationsPath = path.isAbsolute(options.from.path)
      ? options.from.path
      : path.join(options.dbDir, options.from.path)
    const migrations = yield* getMigrations(migrationsPath)
    const hasFlatMigrations = migrations.some((migration) => path.basename(migration.filepath).endsWith(".sql"))
    const lockfilePath = path.join(migrationsPath, "migration_lock.toml")
    const hasLockfile = yield* fs.exists(lockfilePath).pipe(Effect.orElseSucceed(() => false))

    if (hasFlatMigrations || !hasLockfile) {
      const prismaMigrationsDir = yield* fs.makeTempDirectory().pipe(Effect.orDie)
      cleanupPaths.push(prismaMigrationsDir)

      if (hasLockfile) {
        const lockfile = yield* fs.readFileString(lockfilePath).pipe(Effect.orDie)
        yield* fs.writeFileString(path.join(prismaMigrationsDir, "migration_lock.toml"), lockfile).pipe(Effect.orDie)
      } else {
        yield* fs
          .writeFileString(
            path.join(prismaMigrationsDir, "migration_lock.toml"),
            `provider = "${options.provider ?? "sqlite"}"\n`
          )
          .pipe(Effect.orDie)
      }

      for (const migration of migrations) {
        const migrationFilename = path.basename(migration.filepath)
        const migrationDirname = migrationFilename.endsWith(".sql")
          ? migrationFilename.slice(0, -".sql".length)
          : migrationFilename
        const migrationDir = path.join(prismaMigrationsDir, migrationDirname)

        yield* fs.makeDirectory(migrationDir).pipe(Effect.orDie)
        yield* fs.writeFileString(path.join(migrationDir, "migration.sql"), migration.content).pipe(Effect.orDie)
      }

      fromPath = prismaMigrationsDir
    }
  }

  const args = [
    ...prismaCommand,
    "migrate",
    "diff",
    options.from.tag === "empty" ? "--from-empty" : "--from-migrations",
    ...(options.from.tag === "migrations" && fromPath ? [fromPath] : []),
    "--to-schema",
    "./schema.prisma",
    "--script"
  ]

  const cleanup = Effect.forEach(cleanupPaths, (target) => fs.remove(target).pipe(Effect.ignore), {
    discard: true
  })

  const result = yield* runCommandLine(args, { cwd: options.dbDir }).pipe(Effect.ensuring(cleanup))
  yield* logCommandOutput("prisma.migrate-diff", {
    stderr: result.stderr
  })

  return result.stdout.split("\n")
})

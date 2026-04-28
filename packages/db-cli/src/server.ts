import * as Clock from "effect/Clock"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Path from "effect/Path"

import {
  type DatabaseExecuteSubcommand,
  DatabaseExecuteInputError,
  type DatabaseMigrateResolveSubcommand,
  type SchemaDumpResult
} from "./domain.ts"
import type { DatabaseConfig, PrismaMigration } from "./shared.ts"
import type * as Workspace from "./workspace.ts"
import { logCommandOutput, runCommand, runCommandLine } from "./utils/shell.ts"
import { resolvePrismaCommand } from "./utils/prisma-bin.ts"

type ServerConfig = Extract<DatabaseConfig, { runtime: "server" }>
type ExternalServerConfig = ServerConfig & { provider: "postgresql" | "mysql" }

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

export const push = Effect.fn("server.push")(function* (_workspace: Workspace.Workspace, { dbDir }: { dbDir: string }) {
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
    const inputPath = path.isAbsolute(subcommand.file) ? subcommand.file : path.resolve(workspace.cwd, subcommand.file)

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

const makeDumpRunnerSource = (config: ExternalServerConfig) =>
  [
    'const Effect = await import("effect/Effect")',
    'const Redacted = await import("effect/Redacted")',
    'const SqlClient = await import("@effect/sql/SqlClient")',
    "",
    `const provider = ${JSON.stringify(config.provider)}`,
    `const url = ${JSON.stringify(config.url)}`,
    "",
    'const quotePg = (identifier) => `"${identifier.replaceAll(\'"\', \'""\')}"`',
    "const quoteMysql = (identifier) => `\\`${identifier.replaceAll('`', '``')}\\``",
    "const normalizeDefault = (value) => value == null ? undefined : String(value)",
    "const getField = (row, ...names) => {",
    "  for (const name of names) {",
    "    if (row[name] !== undefined) return row[name]",
    "  }",
    "}",
    "const formatPgType = (column) => {",
    "  if (column.data_type === 'character varying') {",
    "    return column.character_maximum_length ? `VARCHAR(${column.character_maximum_length})` : 'VARCHAR'",
    "  }",
    "  if (column.data_type === 'timestamp with time zone') return 'TIMESTAMPTZ'",
    "  if (column.data_type === 'timestamp without time zone') return 'TIMESTAMP'",
    "  if (column.data_type === 'double precision') return 'DOUBLE PRECISION'",
    "  if (column.data_type === 'numeric') {",
    "    return column.numeric_precision ? `DECIMAL(${column.numeric_precision},${column.numeric_scale ?? 0})` : 'DECIMAL'",
    "  }",
    "  return String(column.data_type).toUpperCase()",
    "}",
    "const dumpPostgres = Effect.gen(function*() {",
    "  const sql = yield* SqlClient.SqlClient",
    "  const tables = yield* sql`",
    "    SELECT table_name",
    "    FROM information_schema.tables",
    "    WHERE table_schema = 'public'",
    "      AND table_type = 'BASE TABLE'",
    "      AND table_name <> '_prisma_migrations'",
    "    ORDER BY table_name",
    "  `",
    "  const statements = []",
    "  for (const table of tables) {",
    "    const tableName = getField(table, 'table_name', 'TABLE_NAME')",
    "    const columns = yield* sql`",
    "      SELECT column_name, data_type, character_maximum_length, numeric_precision, numeric_scale,",
    "             is_nullable, column_default",
    "      FROM information_schema.columns",
    "      WHERE table_schema = 'public' AND table_name = ${tableName}",
    "      ORDER BY ordinal_position",
    "    `",
    "    const constraints = yield* sql`",
    "      SELECT tc.constraint_name, tc.constraint_type, kcu.column_name, kcu.ordinal_position,",
    "             ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name",
    "      FROM information_schema.table_constraints tc",
    "      JOIN information_schema.key_column_usage kcu",
    "        ON tc.constraint_schema = kcu.constraint_schema",
    "       AND tc.constraint_name = kcu.constraint_name",
    "       AND tc.table_name = kcu.table_name",
    "      LEFT JOIN information_schema.constraint_column_usage ccu",
    "        ON tc.constraint_schema = ccu.constraint_schema",
    "       AND tc.constraint_name = ccu.constraint_name",
    "      WHERE tc.table_schema = 'public'",
    "        AND tc.table_name = ${tableName}",
    "        AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE', 'FOREIGN KEY')",
    "      ORDER BY tc.constraint_type, tc.constraint_name, kcu.ordinal_position",
    "    `",
    "    const lines = columns.map((column) => {",
    "      const columnName = getField(column, 'column_name', 'COLUMN_NAME')",
    "      const columnDefault = getField(column, 'column_default', 'COLUMN_DEFAULT')",
    "      const isNullable = getField(column, 'is_nullable', 'IS_NULLABLE')",
    "      const parts = [quotePg(columnName), formatPgType(column)]",
    "      const defaultValue = normalizeDefault(columnDefault)",
    "      if (defaultValue && !defaultValue.startsWith('nextval(')) parts.push('DEFAULT', defaultValue)",
    "      if (isNullable === 'NO') parts.push('NOT NULL')",
    "      return `  ${parts.join(' ')}`",
    "    })",
    "    const grouped = new Map()",
    "    for (const constraint of constraints) {",
    "      const constraintType = getField(constraint, 'constraint_type', 'CONSTRAINT_TYPE')",
    "      const constraintName = getField(constraint, 'constraint_name', 'CONSTRAINT_NAME')",
    "      const columnName = getField(constraint, 'column_name', 'COLUMN_NAME')",
    "      const foreignColumnName = getField(constraint, 'foreign_column_name', 'FOREIGN_COLUMN_NAME')",
    "      const key = `${constraintType}:${constraintName}`",
    "      const entry = grouped.get(key) ?? { ...constraint, columns: [], foreignColumns: [] }",
    "      entry.constraint_type = constraintType",
    "      entry.constraint_name = constraintName",
    "      entry.foreign_table_name = getField(constraint, 'foreign_table_name', 'FOREIGN_TABLE_NAME')",
    "      entry.columns.push(columnName)",
    "      if (foreignColumnName) entry.foreignColumns.push(foreignColumnName)",
    "      grouped.set(key, entry)",
    "    }",
    "    for (const constraint of grouped.values()) {",
    "      const columnsSql = constraint.columns.map(quotePg).join(', ')",
    "      if (constraint.constraint_type === 'PRIMARY KEY') {",
    "        lines.push(`  CONSTRAINT ${quotePg(constraint.constraint_name)} PRIMARY KEY (${columnsSql})`)",
    "      } else if (constraint.constraint_type === 'UNIQUE') {",
    "        lines.push(`  CONSTRAINT ${quotePg(constraint.constraint_name)} UNIQUE (${columnsSql})`)",
    "      } else if (constraint.constraint_type === 'FOREIGN KEY') {",
    "        const foreignColumnsSql = constraint.foreignColumns.map(quotePg).join(', ')",
    "        lines.push(`  CONSTRAINT ${quotePg(constraint.constraint_name)} FOREIGN KEY (${columnsSql}) REFERENCES ${quotePg(constraint.foreign_table_name)} (${foreignColumnsSql})`)",
    "      }",
    "    }",
    "    statements.push(`CREATE TABLE ${quotePg(tableName)} (\\n${lines.join(',\\n')}\\n);`)",
    "  }",
    "  return statements.join('\\n\\n')",
    "})",
    "const dumpMysql = Effect.gen(function*() {",
    "  const sql = yield* SqlClient.SqlClient",
    "  const tables = yield* sql`",
    "    SELECT table_name",
    "    FROM information_schema.tables",
    "    WHERE table_schema = DATABASE()",
    "      AND table_type = 'BASE TABLE'",
    "      AND table_name <> '_prisma_migrations'",
    "    ORDER BY table_name",
    "  `",
    "  const statements = []",
    "  for (const table of tables) {",
    "    const tableName = getField(table, 'table_name', 'TABLE_NAME')",
    "    const rows = yield* sql.unsafe(`SHOW CREATE TABLE ${quoteMysql(tableName)}`)",
    "    const createTable = rows[0]?.['Create Table'] ?? rows[0]?.['Create Table'.toLowerCase()]",
    "    if (createTable) statements.push(String(createTable).replace(/ AUTO_INCREMENT=\\d+/g, ''))",
    "  }",
    "  return statements.join('\\n\\n')",
    "})",
    "let layer",
    "let program",
    "if (provider === 'postgresql') {",
    '  const PgClient = await import("@effect/sql-pg/PgClient")',
    "  layer = PgClient.layer({ url: Redacted.make(url) })",
    "  program = dumpPostgres",
    "} else if (provider === 'mysql') {",
    '  const MysqlClient = await import("@effect/sql-mysql2/MysqlClient")',
    "  layer = MysqlClient.layer({ url: Redacted.make(url) })",
    "  program = dumpMysql",
    "} else {",
    "  throw new Error(`Unsupported server dump provider: ${provider}`)",
    "}",
    "const schema = await Effect.runPromise(Effect.provide(program, layer))",
    "process.stdout.write(schema)",
    ""
  ].join("\n")

const makeDumpRunnerPath = Effect.fnUntraced(function* (workspace: Workspace.Workspace) {
  const path = yield* Path.Path
  const fs = yield* FileSystem.FileSystem
  const millis = yield* Clock.currentTimeMillis
  const runnerDir = path.join(workspace.cwd, ".xdev")

  yield* fs.makeDirectory(runnerDir, { recursive: true })

  return path.join(runnerDir, `db-dump-runner-${process.pid}-${millis}.mjs`)
})

export const dump = Effect.fn("server.dump")(function* (
  workspace: Workspace.Workspace,
  dbDir: string,
  config: ExternalServerConfig
) {
  const path = yield* Path.Path
  const fs = yield* FileSystem.FileSystem
  const runnerPath = yield* makeDumpRunnerPath(workspace)
  const runnerSource = makeDumpRunnerSource(config)
  const tsxBin = path.join(workspace.cwd, "node_modules/.bin/tsx")
  const tsconfigPath = path.join(workspace.projectPath, "tsconfig.app.json")
  const schemaOutput = path.join(dbDir, "schema.sql")

  yield* fs.writeFileString(runnerPath, runnerSource)

  const cleanup = fs.remove(runnerPath).pipe(Effect.ignore)
  const output = yield* runCommand(tsxBin, ["--tsconfig", tsconfigPath, runnerPath], {
    cwd: workspace.cwd,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      STAGE: process.env.STAGE,
      TSX_TSCONFIG_PATH: tsconfigPath
    }
  }).pipe(Effect.ensuring(cleanup))

  const newFileContent = output.stdout.trim()
  const currentFileContent = yield* fs.readFileString(schemaOutput, "utf-8").pipe(
    Effect.orElseSucceed(() => ""),
    Effect.map((_) => _.trim())
  )

  if (currentFileContent === newFileContent) {
    return {
      provider: config.provider,
      status: "unchanged",
      output: schemaOutput
    } satisfies SchemaDumpResult
  }

  yield* fs.writeFileString(schemaOutput, newFileContent)

  return {
    provider: config.provider,
    status: "updated",
    output: schemaOutput
  } satisfies SchemaDumpResult
})

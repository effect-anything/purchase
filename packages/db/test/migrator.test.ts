import * as SqlClient from "@effect/sql-sqlite-node/SqliteClient"
import { assert, describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"

import * as Migrator from "../src/migrator.ts"

const TestLive = SqlClient.layer({
  filename: ":memory:",
  disableWAL: true
})

const MigratorEmpty = Migrator.fromRecord(() => ({
  schemaSql: "",
  migrations: {}
}))

describe.concurrent("migrate success", () => {
  it.effect("empty records", () =>
    Effect.gen(function* () {
      const migrator = yield* Migrator.Migrator

      yield* migrator.start
    }).pipe(Effect.provide(Layer.provideMerge(MigratorEmpty, TestLive)))
  )

  it.effect("migrate from schema", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqliteClient
      const migrator = yield* Migrator.Migrator

      yield* migrator.start

      const currentTables = yield* sql<{
        name: string
        sql: string
      }>`SELECT * FROM sqlite_master WHERE type='table';`

      const testTable = currentTables.find((table) => table.name === "test")
      assert(testTable)
      expect(testTable.name).toBe("test")
      expect(testTable.sql).toBe("CREATE TABLE test (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)")

      const migrations = yield* sql`SELECT * FROM sql_migrations;`

      expect(migrations.length).toBe(1)
      expect(migrations[0]).toEqual({
        name: "schema-sql",
        created_at: Migrator.toDate("20240815113701").toISOString(),
        finished_at: expect.any(String)
      })
    }).pipe(
      Effect.provide(
        Layer.provideMerge(
          Migrator.fromRecord(() => ({
            schemaSql: `-- 20240815113701
              CREATE TABLE test (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);
            `,
            migrations: {}
          })),
          TestLive
        )
      )
    )
  )

  it.effect("migrate from records", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqliteClient
      const migrator = yield* Migrator.Migrator

      yield* migrator.start

      const tables = yield* sql<{
        name: string
        sql: string
      }>`SELECT * FROM sqlite_master WHERE type='table';`

      const testTable = tables.find((table) => table.name === "test")
      assert(testTable)
      expect(testTable.name).toBe("test")
      expect(testTable.sql).toBe("CREATE TABLE test (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, age INTEGER)")

      const todoTable = tables.find((table) => table.name === "todo")
      assert(todoTable)
      expect(todoTable.name).toBe("todo")
      expect(todoTable.sql).toBe("CREATE TABLE todo (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)")
    }).pipe(
      Effect.provide(
        Layer.provideMerge(
          Migrator.fromRecord(() => ({
            migrations: {
              "20240101081837-init/migration.sql":
                "CREATE TABLE test (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);",
              "20240102081837-add-column/migration.sql": "ALTER TABLE test ADD COLUMN age INTEGER;",
              "20240103081837-add-todo/migration.sql":
                "CREATE TABLE todo (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);"
            }
          })),
          TestLive
        )
      )
    )
  )
})

describe.concurrent("migrate error", () => {
  it.effect("error", () => {
    const migratorsError = Migrator.fromRecord(() => ({
      migrations: {
        "20240101081837-error/migration.sql": "Syntax error"
      }
    }))

    return Effect.gen(function* () {
      const sql = yield* SqlClient.SqliteClient
      const migrator = yield* Migrator.Migrator.pipe(Effect.provide(migratorsError))

      const exit = yield* migrator.start.pipe(Effect.exit)

      assert(exit._tag === "Failure")
      assert(exit.cause._tag === "Fail")

      expect(exit.cause.error._tag).toBe("@db:migration-error")

      // check tables, notionally the migration should be rolled back
      const tables = yield* sql`
        SELECT name FROM sqlite_master WHERE type='table';
      `
      // only migrations table should exist
      expect(tables.length).toBe(1)
    }).pipe(Effect.provide(TestLive))
  })

  it.effect("error in the middle", () => {
    const migratorsError = Migrator.fromRecord(() => ({
      migrations: {
        "20240101081837-init/migration.sql": "CREATE TABLE test (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);",
        "20240102081837-error/migration.sql": "Syntax error",
        "20240103081837-add-todo/migration.sql": "CREATE TABLE todo (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);"
      }
    }))

    return Effect.gen(function* () {
      const sql = yield* SqlClient.SqliteClient
      const migrator = yield* Migrator.Migrator.pipe(Effect.provide(migratorsError))

      const exit = yield* migrator.start.pipe(Effect.exit)

      assert(exit._tag === "Failure")
      assert(exit.cause._tag === "Fail")

      expect(exit.cause.error._tag).toBe("@db:migration-error")

      // check tables, notionally the migration should be rolled back
      // test, todo
      const tables = yield* sql`
        SELECT name FROM sqlite_master WHERE type='table';
      `

      console.log(tables)
      // only migrations table should exist
      expect(tables.length).toBe(3)
    }).pipe(Effect.provide(TestLive))
  })
})

describe.concurrent("partial migration, incremental migration", () => {
  it.effect("incremental migration", () => {
    const records = [
      {
        "20240101081617-init/migration.sql": "CREATE TABLE test (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);",
        "20240102081717-add-column/migration.sql": "ALTER TABLE test ADD COLUMN age INTEGER;"
      },
      {
        "20240102081817-add-todo/migration.sql": "CREATE TABLE todo (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);"
      }
    ] as const
    const migratorPart1 = Migrator.fromRecord(() => ({
      migrations: {
        ...records[0]
      }
    }))
    const migratorPart2 = Migrator.fromRecord(() => ({
      migrations: {
        ...records[0],
        ...records[1]
      }
    }))
    return Effect.gen(function* () {
      const sql = yield* SqlClient.SqliteClient
      const part1 = yield* Migrator.Migrator.pipe(Effect.provide(migratorPart1))

      // check tables, should have test table
      // check migrations, should have 2 migrations
      yield* part1.start
      const tables = yield* sql<{
        name: string
        sql: string
      }>`SELECT * FROM sqlite_master WHERE type='table';`

      const testTable = tables.find((table) => table.name === "test")
      assert(testTable)
      expect(testTable.name).toBe("test")
      expect(testTable.sql).toBe("CREATE TABLE test (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, age INTEGER)")

      const currentMigrations = yield* sql`SELECT * FROM sql_migrations;`
      expect(currentMigrations.length).toBe(2)
      expect(currentMigrations.map((_) => _.name)).toEqual(["20240101081617-init", "20240102081717-add-column"])

      const part2 = yield* Migrator.Migrator.pipe(Effect.provide(migratorPart2))
      // check tables, should have test and todo table
      // check migrations, should have 3 migrations
      {
        yield* part2.start
        const currentTables = yield* sql<{
          name: string
          sql: string
        }>`SELECT * FROM sqlite_master WHERE type='table';`

        const todoTable = currentTables.find((table) => table.name === "todo")
        assert(todoTable)
        expect(todoTable.name).toBe("todo")
        expect(todoTable.sql).toBe("CREATE TABLE todo (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)")

        const finalMigrations = yield* sql`SELECT * FROM sql_migrations;`
        expect(finalMigrations.length).toBe(3)
        expect(finalMigrations.map((_) => _.name)).toEqual([
          "20240101081617-init",
          "20240102081717-add-column",
          "20240102081817-add-todo"
        ])
      }
    }).pipe(Effect.provide(TestLive))
  })

  it.effect("keeps applied migration history when local files are removed and restored", () => {
    const initial = {
      "20240101081617-init/migration.sql": "CREATE TABLE test (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);",
      "20240102081717-add-column/migration.sql": "ALTER TABLE test ADD COLUMN age INTEGER;",
      "20240102081817-add-todo/migration.sql": "CREATE TABLE todo (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);"
    } as const
    const subset = {
      "20240101081617-init/migration.sql": initial["20240101081617-init/migration.sql"],
      "20240102081717-add-column/migration.sql": initial["20240102081717-add-column/migration.sql"]
    } as const

    const initialMigrator = Migrator.fromRecord(() => ({ migrations: initial }))
    const subsetMigrator = Migrator.fromRecord(() => ({ migrations: subset }))

    return Effect.gen(function* () {
      const sql = yield* SqlClient.SqliteClient

      const full = yield* Migrator.Migrator.pipe(Effect.provide(initialMigrator))
      yield* full.start

      const removed = yield* Migrator.Migrator.pipe(Effect.provide(subsetMigrator))
      yield* removed.start

      const afterSubset = yield* sql`SELECT name FROM sql_migrations ORDER BY created_at ASC;`
      expect(afterSubset.map((row) => row.name)).toEqual([
        "20240101081617-init",
        "20240102081717-add-column",
        "20240102081817-add-todo"
      ])

      const restored = yield* Migrator.Migrator.pipe(Effect.provide(initialMigrator))
      yield* restored.start

      const finalTables = yield* sql<{
        name: string
      }>`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name ASC;`
      expect(finalTables.map((table) => table.name)).toEqual(["sql_migrations", "sqlite_sequence", "test", "todo"])

      const finalMigrations = yield* sql`SELECT name FROM sql_migrations ORDER BY created_at ASC;`
      expect(finalMigrations.map((row) => row.name)).toEqual([
        "20240101081617-init",
        "20240102081717-add-column",
        "20240102081817-add-todo"
      ])
    }).pipe(Effect.provide(TestLive))
  })
})

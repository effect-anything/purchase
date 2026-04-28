# @effect-x/sql-kysely

Effect integrations for executing Kysely queries with `@effect/sql`.

## Install

```bash
pnpm add @effect-x/sql-kysely kysely @effect/sql effect
```

## Entrypoints

- `@effect-x/sql-kysely` exports namespaced modules: `D1`, `Kysely`, and `Sqlite`
- `@effect-x/sql-kysely/kysely` creates an Effect-compatible wrapper around a native Kysely dialect
- `@effect-x/sql-kysely/sqlite` creates a SQLite-compatible Kysely instance backed by `@effect/sql`
- `@effect-x/sql-kysely/d1` creates a D1-compatible Kysely instance backed by `@effect/sql`

## Usage

```ts
import * as SqliteKysely from "@effect-x/sql-kysely/sqlite"
import * as SqlClient from "@effect/sql/SqlClient"
import * as Effect from "effect/Effect"

interface Database {
  users: {
    id: number
    name: string
  }
}

const db = SqliteKysely.make<Database>()

const program = db.selectFrom("users").select(["id", "name"]).where("id", "=", 1).commit()

const runnable = Effect.provideService(program, SqlClient.SqlClient, sqlClient)
```

`commit()` compiles the Kysely query and executes it through the active `SqlClient.SqlClient` service. The wrapper also exposes `withTransaction`, `reactive`, and `reactiveMailbox` helpers from `@effect/sql`.

## Development

```bash
bun install
bun run check
bun run pack:check
```

## Release

This package is published from the `effect-anything/effect-x-sql-kysely` repository with public npm access and provenance enabled for the npm registry.

```bash
bun run changeset
bun run version-packages
bun run release
```

## License

MIT

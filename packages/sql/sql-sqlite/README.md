# @effect-x/sql-sqlite

Browser SQLite client integration for `@effect/sql`.

## Install

```bash
pnpm add @effect-x/sql-sqlite @effect/sql effect
```

## Entrypoints

- `@effect-x/sql-sqlite/client`
- `@effect-x/sql-sqlite/hooks`
- `@effect-x/sql-sqlite/kysely`
- `@effect-x/sql-sqlite/live`
- `@effect-x/sql-sqlite/metrics`
- `@effect-x/sql-sqlite/pool`
- `@effect-x/sql-sqlite/relay-client`
- `@effect-x/sql-sqlite/relay`
- `@effect-x/sql-sqlite/schema`
- `@effect-x/sql-sqlite/worker`

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

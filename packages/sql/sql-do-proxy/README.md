# @effect-x/sql-do-proxy

Durable Object proxy client helpers for `@effect/sql`.

## Install

```bash
pnpm add @effect-x/sql-do-proxy @effect/sql effect
```

## Entrypoints

- `@effect-x/sql-do-proxy`
- `@effect-x/sql-do-proxy/SqlClient`

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

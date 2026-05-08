import { HttpApiBuilder } from "@effect/platform"
import { SqlClient } from "@effect/sql"
import { Effect } from "effect"

import { AppApi } from "../api/http-api.ts"

export const AuthHttpLive = HttpApiBuilder.group(AppApi, "auth", (handlers) =>
  handlers.handle("get", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient
      const result = yield* sql`SELECT name FROM sqlite_master WHERE type='table'`.pipe(Effect.orDie)

      yield* Effect.log(result)
    })
  )
)

// const db = yield* CloudflareBindings.use((_) => _.getD1Database("DB"))
// if (db._tag === "Some") {
//   console.log(db.value.prepare)
// }

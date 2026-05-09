import { SqlClient } from "@effect/sql"
import { Context, Effect, Layer } from "effect"

import type { AuthenticatedUser } from "./authenticated-user.ts"

export class CustomerSyncService extends Context.Tag("CustomerSyncService")<
  CustomerSyncService,
  {
    readonly ensureCustomer: (user: AuthenticatedUser) => Effect.Effect<void, unknown>
  }
>() {
  static Default = Layer.effect(
    CustomerSyncService,
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient

      const ensureCustomer = Effect.fn(function* (user: AuthenticatedUser) {
        yield* sql.unsafe(
          `INSERT INTO paykit_customer (id, email, name, metadata, provider, created_at, updated_at)
           VALUES (?, ?, ?, '{}', '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT(id) DO UPDATE SET
             email = excluded.email,
             name = excluded.name,
             updated_at = CASE
               WHEN paykit_customer.email IS excluded.email AND paykit_customer.name IS excluded.name
                 THEN paykit_customer.updated_at
               ELSE CURRENT_TIMESTAMP
             END`,
          [user.id, user.email, user.name]
        ).withoutTransform
      })

      return { ensureCustomer } as const
    })
  )
}

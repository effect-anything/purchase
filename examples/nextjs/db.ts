import { D1Client } from "@effect/sql-d1"
import { Effect, String as EffectString, Layer, Option } from "effect"

import { CloudflareBindings } from "./lib/cloudflare/bindings.ts"

export const DBLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const DB = yield* CloudflareBindings.use((_) => _.getD1Database("DB")).pipe(
      Effect.flatMap(
        Option.match({
          onNone: () => Effect.dieMessage("Database not found"),
          onSome: Effect.succeed
        })
      )
    )

    return D1Client.layer({
      db: DB,
      transformQueryNames: EffectString.camelToSnake,
      transformResultNames: EffectString.snakeToCamel
    })
  })
)

import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SepaDebitGeneratedFrom = Schema.Struct({
  charge: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Charge, any, any> => Models.Charge as Schema.Schema<Models.Charge, any, any>
      )
    )
  ),
  setup_attempt: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.SetupAttempt, any, any> =>
          Models.SetupAttempt as Schema.Schema<Models.SetupAttempt, any, any>
      )
    )
  )
})
export type SepaDebitGeneratedFrom = typeof SepaDebitGeneratedFrom.Type

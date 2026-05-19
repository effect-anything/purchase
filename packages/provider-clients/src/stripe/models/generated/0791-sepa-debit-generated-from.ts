import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SepaDebitGeneratedFrom = Schema.Struct({
  charge: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Charge => Models.Charge))),
  setup_attempt: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.SetupAttempt => Models.SetupAttempt))),
})
export type SepaDebitGeneratedFrom = typeof SepaDebitGeneratedFrom.Type

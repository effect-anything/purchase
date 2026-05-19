import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AccountUnificationAccountControllerFees = Schema.Struct({
  payer: Schema.Literal("account", "application", "application_custom", "application_express"),
})
export type AccountUnificationAccountControllerFees = typeof AccountUnificationAccountControllerFees.Type

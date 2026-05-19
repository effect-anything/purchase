import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerBalance = Schema.Struct({
  available: Schema.String,
  reserved: Schema.String,
  used: Schema.String,
})
export type CustomerBalance = typeof CustomerBalance.Type

import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const KlarnaAddress = Schema.Struct({
  country: Schema.NullOr(Schema.String),
})
export type KlarnaAddress = typeof KlarnaAddress.Type

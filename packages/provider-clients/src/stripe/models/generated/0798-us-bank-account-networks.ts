import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const UsBankAccountNetworks = Schema.Struct({
  preferred: Schema.NullOr(Schema.String),
  supported: Schema.Array(Schema.Literal("ach", "us_domestic_wire")),
})
export type UsBankAccountNetworks = typeof UsBankAccountNetworks.Type

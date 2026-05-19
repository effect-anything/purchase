import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TokenCardNetworks = Schema.Struct({
  preferred: Schema.NullOr(Schema.String),
})
export type TokenCardNetworks = typeof TokenCardNetworks.Type

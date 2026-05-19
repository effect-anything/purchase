import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AccountGroupMembership = Schema.Struct({
  payments_pricing: Schema.NullOr(Schema.String),
})
export type AccountGroupMembership = typeof AccountGroupMembership.Type

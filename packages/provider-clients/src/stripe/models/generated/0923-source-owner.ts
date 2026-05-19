import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SourceOwner = Schema.Struct({
  address: Schema.NullOr(Schema.suspend((): typeof Models.Address => Models.Address)),
  email: Schema.NullOr(Schema.String),
  name: Schema.NullOr(Schema.String),
  phone: Schema.NullOr(Schema.String),
  verified_address: Schema.NullOr(Schema.suspend((): typeof Models.Address => Models.Address)),
  verified_email: Schema.NullOr(Schema.String),
  verified_name: Schema.NullOr(Schema.String),
  verified_phone: Schema.NullOr(Schema.String),
})
export type SourceOwner = typeof SourceOwner.Type

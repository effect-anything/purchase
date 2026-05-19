import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerTeamCreate = Schema.Struct({
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean) })),
  external_id: Schema.optional(Schema.NullOr(Schema.String)),
  name: Schema.optional(Schema.NullOr(Schema.String)),
  billing_address: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.AddressInput => Models.AddressInput))),
  tax_id: Schema.optional(Schema.NullOr(Schema.String)),
  locale: Schema.optional(Schema.NullOr(Schema.String)),
  organization_id: Schema.optional(Schema.NullOr(Schema.String)),
  owner: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.MemberOwnerCreate => Models.MemberOwnerCreate))),
  type: Schema.String,
  email: Schema.optional(Schema.NullOr(Schema.String)),
})
export type CustomerTeamCreate = typeof CustomerTeamCreate.Type

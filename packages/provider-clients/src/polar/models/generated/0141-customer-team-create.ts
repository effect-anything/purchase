import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerTeamCreate = Schema.Struct({
  metadata: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean)
    })
  ),
  external_id: Schema.optional(Schema.NullOr(Schema.String)),
  name: Schema.optional(Schema.NullOr(Schema.String)),
  billing_address: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.AddressInput, any, any> =>
          Models.AddressInput as Schema.Schema<Models.AddressInput, any, any>
      )
    )
  ),
  tax_id: Schema.optional(Schema.NullOr(Schema.String)),
  locale: Schema.optional(Schema.NullOr(Schema.String)),
  organization_id: Schema.optional(Schema.NullOr(Schema.String)),
  owner: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.MemberOwnerCreate, any, any> =>
          Models.MemberOwnerCreate as Schema.Schema<Models.MemberOwnerCreate, any, any>
      )
    )
  ),
  type: Schema.String,
  email: Schema.optional(Schema.NullOr(Schema.String))
})
export type CustomerTeamCreate = typeof CustomerTeamCreate.Type

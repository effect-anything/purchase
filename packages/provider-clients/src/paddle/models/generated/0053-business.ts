import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Business = Schema.Struct({
  id: Schema.suspend(() => Models.BusinessId),
  customer_id: Schema.suspend(() => Models.CustomerId),
  name: Schema.suspend(() => Models.Name),
  company_number: Schema.NullOr(Schema.String),
  tax_identifier: Schema.NullOr(Schema.String),
  status: Schema.suspend(() => Models.Status),
  contacts: Schema.Array(Schema.suspend(() => Models.BusinessContactsItem)),
  created_at: Schema.suspend(() => Models.CreatedAt),
  updated_at: Schema.suspend(() => Models.UpdatedAt),
  custom_data: Schema.NullOr(Schema.suspend(() => Models.CustomData)),
  import_meta: Schema.NullOr(Schema.suspend(() => Models.ImportMeta)),
})
export type Business = typeof Business.Type

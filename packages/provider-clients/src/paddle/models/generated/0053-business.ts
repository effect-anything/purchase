import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Business = Schema.Struct({
  id: Schema.suspend((): Schema.Schema<Models.BusinessId> => Models.BusinessId),
  customer_id: Schema.suspend((): Schema.Schema<Models.CustomerId> => Models.CustomerId),
  name: Schema.suspend((): Schema.Schema<Models.Name> => Models.Name),
  company_number: Schema.NullOr(Schema.String),
  tax_identifier: Schema.NullOr(Schema.String),
  status: Schema.suspend((): Schema.Schema<Models.Status> => Models.Status),
  contacts: Schema.Array(Schema.suspend((): Schema.Schema<Models.BusinessContactsItem> => Models.BusinessContactsItem)),
  created_at: Schema.suspend((): Schema.Schema<Models.CreatedAt> => Models.CreatedAt),
  updated_at: Schema.suspend((): Schema.Schema<Models.UpdatedAt> => Models.UpdatedAt),
  custom_data: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.CustomData> => Models.CustomData)),
  import_meta: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.ImportMeta> => Models.ImportMeta))
})
export type Business = typeof Business.Type

import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Business = Schema.Struct({
  id: Schema.suspend(
    (): Schema.Schema<Models.BusinessId, any, any> => Models.BusinessId as Schema.Schema<Models.BusinessId, any, any>
  ),
  customer_id: Schema.suspend(
    (): Schema.Schema<Models.CustomerId, any, any> => Models.CustomerId as Schema.Schema<Models.CustomerId, any, any>
  ),
  name: Schema.suspend((): Schema.Schema<Models.Name, any, any> => Models.Name as Schema.Schema<Models.Name, any, any>),
  company_number: Schema.NullOr(Schema.String),
  tax_identifier: Schema.NullOr(Schema.String),
  status: Schema.suspend(
    (): Schema.Schema<Models.Status, any, any> => Models.Status as Schema.Schema<Models.Status, any, any>
  ),
  contacts: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.BusinessContactsItem, any, any> =>
        Models.BusinessContactsItem as Schema.Schema<Models.BusinessContactsItem, any, any>
    )
  ),
  created_at: Schema.suspend(
    (): Schema.Schema<Models.CreatedAt, any, any> => Models.CreatedAt as Schema.Schema<Models.CreatedAt, any, any>
  ),
  updated_at: Schema.suspend(
    (): Schema.Schema<Models.UpdatedAt, any, any> => Models.UpdatedAt as Schema.Schema<Models.UpdatedAt, any, any>
  ),
  custom_data: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CustomData, any, any> => Models.CustomData as Schema.Schema<Models.CustomData, any, any>
    )
  ),
  import_meta: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ImportMeta, any, any> => Models.ImportMeta as Schema.Schema<Models.ImportMeta, any, any>
    )
  )
})
export type Business = typeof Business.Type

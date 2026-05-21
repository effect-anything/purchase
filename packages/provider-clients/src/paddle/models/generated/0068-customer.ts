import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Customer = Schema.Struct({
  id: Schema.suspend(
    (): Schema.Schema<Models.CustomerId, any, any> => Models.CustomerId as Schema.Schema<Models.CustomerId, any, any>
  ),
  name: Schema.NullOr(
    Schema.suspend((): Schema.Schema<Models.Name, any, any> => Models.Name as Schema.Schema<Models.Name, any, any>)
  ),
  email: Schema.suspend(
    (): Schema.Schema<Models.Email, any, any> => Models.Email as Schema.Schema<Models.Email, any, any>
  ),
  marketing_consent: Schema.Boolean,
  status: Schema.suspend(
    (): Schema.Schema<Models.Status, any, any> => Models.Status as Schema.Schema<Models.Status, any, any>
  ),
  custom_data: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CustomData, any, any> => Models.CustomData as Schema.Schema<Models.CustomData, any, any>
    )
  ),
  locale: Schema.String,
  created_at: Schema.suspend(
    (): Schema.Schema<Models.CreatedAt, any, any> => Models.CreatedAt as Schema.Schema<Models.CreatedAt, any, any>
  ),
  updated_at: Schema.suspend(
    (): Schema.Schema<Models.UpdatedAt, any, any> => Models.UpdatedAt as Schema.Schema<Models.UpdatedAt, any, any>
  ),
  import_meta: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ImportMeta, any, any> => Models.ImportMeta as Schema.Schema<Models.ImportMeta, any, any>
    )
  )
})
export type Customer = typeof Customer.Type

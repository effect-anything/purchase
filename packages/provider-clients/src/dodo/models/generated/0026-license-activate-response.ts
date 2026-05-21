import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseActivateResponse = Schema.Struct({
  id: Schema.String,
  business_id: Schema.String,
  created_at: Schema.String,
  customer: Schema.suspend(
    (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
  ),
  license_key_id: Schema.String,
  name: Schema.String,
  product: Schema.suspend(
    (): Schema.Schema<Models.LicenseActivateProduct, any, any> =>
      Models.LicenseActivateProduct as Schema.Schema<Models.LicenseActivateProduct, any, any>
  )
})
export type LicenseActivateResponse = typeof LicenseActivateResponse.Type

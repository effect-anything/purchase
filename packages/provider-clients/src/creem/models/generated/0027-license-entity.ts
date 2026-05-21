import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseEntity = Schema.Struct({
  id: Schema.String,
  mode: Schema.suspend(
    (): Schema.Schema<Models.EnvironmentMode, any, any> =>
      Models.EnvironmentMode as Schema.Schema<Models.EnvironmentMode, any, any>
  ),
  object: Schema.String,
  product_id: Schema.String,
  status: Schema.suspend(
    (): Schema.Schema<Models.LicenseStatus, any, any> =>
      Models.LicenseStatus as Schema.Schema<Models.LicenseStatus, any, any>
  ),
  key: Schema.String,
  activation: Schema.Number,
  activation_limit: Schema.optional(Schema.NullOr(Schema.Number)),
  expires_at: Schema.optional(Schema.NullOr(Schema.String)),
  created_at: Schema.String,
  instance: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.LicenseInstanceEntity, any, any> =>
        Models.LicenseInstanceEntity as Schema.Schema<Models.LicenseInstanceEntity, any, any>
    )
  )
})
export type LicenseEntity = typeof LicenseEntity.Type

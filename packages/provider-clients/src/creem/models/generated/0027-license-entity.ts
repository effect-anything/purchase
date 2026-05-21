import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseEntity = Schema.Struct({
  id: Schema.String,
  mode: Schema.suspend((): Schema.Schema<Models.EnvironmentMode> => Models.EnvironmentMode),
  object: Schema.String,
  product_id: Schema.String,
  status: Schema.suspend((): Schema.Schema<Models.LicenseStatus> => Models.LicenseStatus),
  key: Schema.String,
  activation: Schema.Number,
  activation_limit: Schema.optional(Schema.NullOr(Schema.Number)),
  expires_at: Schema.optional(Schema.NullOr(Schema.String)),
  created_at: Schema.String,
  instance: Schema.optional(
    Schema.suspend((): Schema.Schema<Models.LicenseInstanceEntity> => Models.LicenseInstanceEntity)
  )
})
export type LicenseEntity = typeof LicenseEntity.Type

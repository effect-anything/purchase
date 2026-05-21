import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseKeyActivationRead = Schema.Struct({
  id: Schema.String,
  license_key_id: Schema.String,
  label: Schema.String,
  meta: Schema.Record({
    key: Schema.String,
    value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean)
  }),
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  license_key: Schema.suspend(
    (): Schema.Schema<Models.LicenseKeyRead, any, any> =>
      Models.LicenseKeyRead as Schema.Schema<Models.LicenseKeyRead, any, any>
  )
})
export type LicenseKeyActivationRead = typeof LicenseKeyActivationRead.Type

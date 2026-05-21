import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseKeyActivationBase = Schema.Struct({
  id: Schema.String,
  license_key_id: Schema.String,
  label: Schema.String,
  meta: Schema.Record({
    key: Schema.String,
    value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean)
  }),
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String)
})
export type LicenseKeyActivationBase = typeof LicenseKeyActivationBase.Type

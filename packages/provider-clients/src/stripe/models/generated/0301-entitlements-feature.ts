import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const EntitlementsFeature = Schema.Struct({
  active: Schema.Boolean,
  id: Schema.String,
  livemode: Schema.Boolean,
  lookup_key: Schema.String,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  name: Schema.String,
  object: Schema.Literal("entitlements.feature")
})
export type EntitlementsFeature = typeof EntitlementsFeature.Type

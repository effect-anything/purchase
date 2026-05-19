import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingPhysicalBundle = Schema.Struct({
  features: Schema.suspend((): typeof Models.IssuingPhysicalBundleFeatures => Models.IssuingPhysicalBundleFeatures),
  id: Schema.String,
  livemode: Schema.Boolean,
  name: Schema.String,
  object: Schema.Literal("issuing.physical_bundle"),
  status: Schema.Literal("active", "inactive", "review"),
  type: Schema.Literal("custom", "standard"),
})
export type IssuingPhysicalBundle = typeof IssuingPhysicalBundle.Type

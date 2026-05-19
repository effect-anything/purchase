import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingPhysicalBundleFeatures = Schema.Struct({
  card_logo: Schema.Literal("optional", "required", "unsupported"),
  carrier_text: Schema.Literal("optional", "required", "unsupported"),
  second_line: Schema.Literal("optional", "required", "unsupported"),
})
export type IssuingPhysicalBundleFeatures = typeof IssuingPhysicalBundleFeatures.Type

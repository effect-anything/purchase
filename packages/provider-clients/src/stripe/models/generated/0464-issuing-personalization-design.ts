import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingPersonalizationDesign = Schema.Struct({
  card_logo: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  carrier_text: Schema.NullOr(Schema.suspend((): typeof Models.IssuingPersonalizationDesignCarrierText => Models.IssuingPersonalizationDesignCarrierText)),
  created: Schema.Number,
  id: Schema.String,
  livemode: Schema.Boolean,
  lookup_key: Schema.NullOr(Schema.String),
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  name: Schema.NullOr(Schema.String),
  object: Schema.Literal("issuing.personalization_design"),
  physical_bundle: Schema.Union(Schema.String, Schema.suspend((): typeof Models.IssuingPhysicalBundle => Models.IssuingPhysicalBundle)),
  preferences: Schema.suspend((): typeof Models.IssuingPersonalizationDesignPreferences => Models.IssuingPersonalizationDesignPreferences),
  rejection_reasons: Schema.suspend((): typeof Models.IssuingPersonalizationDesignRejectionReasons => Models.IssuingPersonalizationDesignRejectionReasons),
  status: Schema.Literal("active", "inactive", "rejected", "review"),
})
export type IssuingPersonalizationDesign = typeof IssuingPersonalizationDesign.Type

import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingPersonalizationDesign = Schema.Struct({
  card_logo: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend((): Schema.Schema<Models.File, any, any> => Models.File as Schema.Schema<Models.File, any, any>)
    )
  ),
  carrier_text: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingPersonalizationDesignCarrierText, any, any> =>
        Models.IssuingPersonalizationDesignCarrierText as Schema.Schema<
          Models.IssuingPersonalizationDesignCarrierText,
          any,
          any
        >
    )
  ),
  created: Schema.Number,
  id: Schema.String,
  livemode: Schema.Boolean,
  lookup_key: Schema.NullOr(Schema.String),
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  name: Schema.NullOr(Schema.String),
  object: Schema.Literal("issuing.personalization_design"),
  physical_bundle: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.IssuingPhysicalBundle, any, any> =>
        Models.IssuingPhysicalBundle as Schema.Schema<Models.IssuingPhysicalBundle, any, any>
    )
  ),
  preferences: Schema.suspend(
    (): Schema.Schema<Models.IssuingPersonalizationDesignPreferences, any, any> =>
      Models.IssuingPersonalizationDesignPreferences as Schema.Schema<
        Models.IssuingPersonalizationDesignPreferences,
        any,
        any
      >
  ),
  rejection_reasons: Schema.suspend(
    (): Schema.Schema<Models.IssuingPersonalizationDesignRejectionReasons, any, any> =>
      Models.IssuingPersonalizationDesignRejectionReasons as Schema.Schema<
        Models.IssuingPersonalizationDesignRejectionReasons,
        any,
        any
      >
  ),
  status: Schema.Literal("active", "inactive", "rejected", "review")
})
export type IssuingPersonalizationDesign = typeof IssuingPersonalizationDesign.Type

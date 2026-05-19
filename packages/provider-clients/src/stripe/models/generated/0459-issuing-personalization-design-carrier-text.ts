import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingPersonalizationDesignCarrierText = Schema.Struct({
  footer_body: Schema.NullOr(Schema.String),
  footer_title: Schema.NullOr(Schema.String),
  header_body: Schema.NullOr(Schema.String),
  header_title: Schema.NullOr(Schema.String),
})
export type IssuingPersonalizationDesignCarrierText = typeof IssuingPersonalizationDesignCarrierText.Type

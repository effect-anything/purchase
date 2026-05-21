import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingCardShippingAddressValidation = Schema.Struct({
  mode: Schema.Literal("disabled", "normalization_only", "validation_and_normalization"),
  normalized_address: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
    )
  ),
  result: Schema.NullOr(Schema.Literal("indeterminate", "likely_deliverable", "likely_undeliverable"))
})
export type IssuingCardShippingAddressValidation = typeof IssuingCardShippingAddressValidation.Type

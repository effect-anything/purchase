import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerCreditsFeatureEntity = Schema.Struct({
  amount: Schema.String,
  unit_label: Schema.optional(Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.Unknown })))
})
export type CustomerCreditsFeatureEntity = typeof CustomerCreditsFeatureEntity.Type

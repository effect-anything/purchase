import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BenefitMeterCreditProperties = Schema.Struct({
  units: Schema.Number,
  rollover: Schema.Boolean,
  meter_id: Schema.String,
})
export type BenefitMeterCreditProperties = typeof BenefitMeterCreditProperties.Type

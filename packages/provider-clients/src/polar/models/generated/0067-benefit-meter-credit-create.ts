import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitMeterCreditCreate = Schema.Struct({
  metadata: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean)
    })
  ),
  type: Schema.String,
  description: Schema.String,
  organization_id: Schema.optional(Schema.NullOr(Schema.String)),
  properties: Schema.suspend(
    (): Schema.Schema<Models.BenefitMeterCreditCreateProperties, any, any> =>
      Models.BenefitMeterCreditCreateProperties as Schema.Schema<Models.BenefitMeterCreditCreateProperties, any, any>
  )
})
export type BenefitMeterCreditCreate = typeof BenefitMeterCreditCreate.Type

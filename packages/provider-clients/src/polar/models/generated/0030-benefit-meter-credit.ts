import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitMeterCredit = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  type: Schema.String,
  description: Schema.String,
  selectable: Schema.Boolean,
  deletable: Schema.Boolean,
  is_deleted: Schema.Boolean,
  organization_id: Schema.String,
  metadata: Schema.suspend(
    (): Schema.Schema<Models.MetadataOutputType, any, any> =>
      Models.MetadataOutputType as Schema.Schema<Models.MetadataOutputType, any, any>
  ),
  properties: Schema.suspend(
    (): Schema.Schema<Models.BenefitMeterCreditProperties, any, any> =>
      Models.BenefitMeterCreditProperties as Schema.Schema<Models.BenefitMeterCreditProperties, any, any>
  )
})
export type BenefitMeterCredit = typeof BenefitMeterCredit.Type

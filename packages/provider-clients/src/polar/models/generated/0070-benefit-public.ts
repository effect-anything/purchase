import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BenefitPublic = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  type: Schema.suspend((): typeof Models.BenefitType => Models.BenefitType),
  description: Schema.String,
  selectable: Schema.Boolean,
  deletable: Schema.Boolean,
  is_deleted: Schema.Boolean,
  organization_id: Schema.String,
})
export type BenefitPublic = typeof BenefitPublic.Type

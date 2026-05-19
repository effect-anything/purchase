import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ListResourceBenefitGrant = Schema.Struct({
  items: Schema.Array(Schema.suspend((): typeof Models.BenefitGrant => Models.BenefitGrant)),
  pagination: Schema.suspend((): typeof Models.Pagination => Models.Pagination),
})
export type ListResourceBenefitGrant = typeof ListResourceBenefitGrant.Type

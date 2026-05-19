import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ListResourceBenefit = Schema.Struct({
  items: Schema.Array(Schema.suspend((): typeof Models.Benefit => Models.Benefit)),
  pagination: Schema.suspend((): typeof Models.Pagination => Models.Pagination),
})
export type ListResourceBenefit = typeof ListResourceBenefit.Type

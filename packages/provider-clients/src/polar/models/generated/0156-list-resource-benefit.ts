import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ListResourceBenefit = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.Benefit, any, any> => Models.Benefit as Schema.Schema<Models.Benefit, any, any>
    )
  ),
  pagination: Schema.suspend(
    (): Schema.Schema<Models.Pagination, any, any> => Models.Pagination as Schema.Schema<Models.Pagination, any, any>
  )
})
export type ListResourceBenefit = typeof ListResourceBenefit.Type

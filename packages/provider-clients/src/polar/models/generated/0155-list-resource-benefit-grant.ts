import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ListResourceBenefitGrant = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.BenefitGrant, any, any> =>
        Models.BenefitGrant as Schema.Schema<Models.BenefitGrant, any, any>
    )
  ),
  pagination: Schema.suspend(
    (): Schema.Schema<Models.Pagination, any, any> => Models.Pagination as Schema.Schema<Models.Pagination, any, any>
  )
})
export type ListResourceBenefitGrant = typeof ListResourceBenefitGrant.Type

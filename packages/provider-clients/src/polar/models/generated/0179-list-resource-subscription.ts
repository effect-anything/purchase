import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ListResourceSubscription = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.Subscription, any, any> =>
        Models.Subscription as Schema.Schema<Models.Subscription, any, any>
    )
  ),
  pagination: Schema.suspend(
    (): Schema.Schema<Models.Pagination, any, any> => Models.Pagination as Schema.Schema<Models.Pagination, any, any>
  )
})
export type ListResourceSubscription = typeof ListResourceSubscription.Type

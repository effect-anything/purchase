import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionListEntity = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionEntity, any, any> =>
        Models.SubscriptionEntity as Schema.Schema<Models.SubscriptionEntity, any, any>
    )
  ),
  pagination: Schema.suspend(
    (): Schema.Schema<Models.PaginationEntity, any, any> =>
      Models.PaginationEntity as Schema.Schema<Models.PaginationEntity, any, any>
  )
})
export type SubscriptionListEntity = typeof SubscriptionListEntity.Type

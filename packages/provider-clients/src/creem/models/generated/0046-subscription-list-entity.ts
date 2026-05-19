import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionListEntity = Schema.Struct({
  items: Schema.Array(Schema.suspend(() => Models.SubscriptionEntity)),
  pagination: Schema.suspend(() => Models.PaginationEntity),
})
export type SubscriptionListEntity = typeof SubscriptionListEntity.Type

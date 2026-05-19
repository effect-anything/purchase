import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ListResourceSubscription = Schema.Struct({
  items: Schema.Array(Schema.suspend((): typeof Models.Subscription => Models.Subscription)),
  pagination: Schema.suspend((): typeof Models.Pagination => Models.Pagination),
})
export type ListResourceSubscription = typeof ListResourceSubscription.Type

import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutListResponse = Schema.Struct({
  data: Schema.Array(Schema.suspend(() => Models.CheckoutResource)),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend(() => Models.JsonApiMeta)),
})
export type CheckoutListResponse = typeof CheckoutListResponse.Type

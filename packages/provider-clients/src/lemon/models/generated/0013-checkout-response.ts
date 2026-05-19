import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutResponse = Schema.Struct({
  data: Schema.suspend(() => Models.CheckoutResource),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend(() => Models.JsonApiMeta)),
})
export type CheckoutResponse = typeof CheckoutResponse.Type

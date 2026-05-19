import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutCreateData = Schema.Struct({
  type: Schema.Literal("checkouts"),
  attributes: Schema.optional(Schema.suspend(() => Models.CheckoutCreateAttributes)),
  relationships: Schema.suspend(() => Models.CheckoutCreateRelationships),
})
export type CheckoutCreateData = typeof CheckoutCreateData.Type

import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutCreateRelationships = Schema.Struct({
  store: Schema.suspend(() => Models.JsonApiStoreRelationship),
  variant: Schema.suspend(() => Models.JsonApiVariantRelationship),
})
export type CheckoutCreateRelationships = typeof CheckoutCreateRelationships.Type

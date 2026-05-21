import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutCreateRelationships = Schema.Struct({
  store: Schema.suspend((): Schema.Schema<Models.JsonApiStoreRelationship> => Models.JsonApiStoreRelationship),
  variant: Schema.suspend((): Schema.Schema<Models.JsonApiVariantRelationship> => Models.JsonApiVariantRelationship)
})
export type CheckoutCreateRelationships = typeof CheckoutCreateRelationships.Type

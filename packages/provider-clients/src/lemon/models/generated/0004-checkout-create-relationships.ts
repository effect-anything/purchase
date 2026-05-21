import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutCreateRelationships = Schema.Struct({
  store: Schema.suspend(
    (): Schema.Schema<Models.JsonApiStoreRelationship, any, any> =>
      Models.JsonApiStoreRelationship as Schema.Schema<Models.JsonApiStoreRelationship, any, any>
  ),
  variant: Schema.suspend(
    (): Schema.Schema<Models.JsonApiVariantRelationship, any, any> =>
      Models.JsonApiVariantRelationship as Schema.Schema<Models.JsonApiVariantRelationship, any, any>
  )
})
export type CheckoutCreateRelationships = typeof CheckoutCreateRelationships.Type

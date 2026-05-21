import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ProductsUpdateInput = Schema.Struct({
  id: Schema.String,
  metadata: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean)
    })
  ),
  trial_interval: Schema.optional(Schema.NullOr(Models.TrialInterval)),
  trial_interval_count: Schema.optional(Schema.NullOr(Schema.Number)),
  name: Schema.optional(Schema.NullOr(Schema.String)),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  recurring_interval: Schema.optional(Schema.NullOr(Models.SubscriptionRecurringInterval)),
  recurring_interval_count: Schema.optional(Schema.NullOr(Schema.Number)),
  is_archived: Schema.optional(Schema.NullOr(Schema.Boolean)),
  visibility: Schema.optional(Schema.NullOr(Models.ProductVisibility)),
  prices: Schema.optional(
    Schema.NullOr(
      Schema.Array(
        Schema.Union(
          Models.ExistingProductPrice,
          Schema.Union(
            Models.ProductPriceFixedCreate,
            Models.ProductPriceCustomCreate,
            Models.ProductPriceFreeCreate,
            Models.ProductPriceSeatBasedCreate,
            Models.ProductPriceMeteredUnitCreate
          )
        )
      )
    )
  ),
  medias: Schema.optional(Schema.NullOr(Schema.Array(Schema.String))),
  attached_custom_fields: Schema.optional(Schema.NullOr(Schema.Array(Models.AttachedCustomFieldCreate)))
})
export type ProductsUpdateInput = typeof ProductsUpdateInput.Type

export const ProductsUpdateOutput = Models.Product
export type ProductsUpdateOutput = typeof ProductsUpdateOutput.Type

export const productsUpdateOperation = defineOperation({
  id: "polar.products:update",
  method: "PATCH",
  path: "/v1/products/{id}",
  inputSchema: ProductsUpdateInput,
  outputSchema: ProductsUpdateOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  bodyParams: [
    "metadata",
    "trial_interval",
    "trial_interval_count",
    "name",
    "description",
    "recurring_interval",
    "recurring_interval_count",
    "is_archived",
    "visibility",
    "prices",
    "medias",
    "attached_custom_fields"
  ]
})

/**
 * Update Product
 */
export const productsUpdate = (input: ProductsUpdateInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(productsUpdateOperation, input)))

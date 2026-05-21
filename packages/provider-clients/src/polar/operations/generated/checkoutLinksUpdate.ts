import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CheckoutLinksUpdateInput = Schema.Struct({
  id: Schema.String,
  trial_interval: Schema.optional(Schema.NullOr(Models.TrialInterval)),
  trial_interval_count: Schema.optional(Schema.NullOr(Schema.Number)),
  metadata: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean)
    })
  ),
  products: Schema.optional(Schema.NullOr(Schema.Array(Schema.String))),
  label: Schema.optional(Schema.NullOr(Schema.String)),
  allow_discount_codes: Schema.optional(Schema.NullOr(Schema.Boolean)),
  require_billing_address: Schema.optional(Schema.NullOr(Schema.Boolean)),
  discount_id: Schema.optional(Schema.NullOr(Schema.String)),
  success_url: Schema.optional(Schema.NullOr(Schema.String)),
  return_url: Schema.optional(Schema.NullOr(Schema.String))
})
export type CheckoutLinksUpdateInput = typeof CheckoutLinksUpdateInput.Type

export const CheckoutLinksUpdateOutput = Models.CheckoutLink
export type CheckoutLinksUpdateOutput = typeof CheckoutLinksUpdateOutput.Type

export const checkoutLinksUpdateOperation = defineOperation({
  id: "polar.checkout-links:update",
  method: "PATCH",
  path: "/v1/checkout-links/{id}",
  inputSchema: CheckoutLinksUpdateInput,
  outputSchema: CheckoutLinksUpdateOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  bodyParams: [
    "trial_interval",
    "trial_interval_count",
    "metadata",
    "products",
    "label",
    "allow_discount_codes",
    "require_billing_address",
    "discount_id",
    "success_url",
    "return_url"
  ]
})

/**
 * Update Checkout Link
 */
export const checkoutLinksUpdate = (input: CheckoutLinksUpdateInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(checkoutLinksUpdateOperation, input)))

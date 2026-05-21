import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CheckoutLinksListInput = Schema.Struct({
  organization_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  product_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  page: Schema.optional(Schema.Number),
  limit: Schema.optional(Schema.Number),
  sorting: Schema.optional(Schema.NullOr(Schema.Array(Models.CheckoutLinkSortProperty)))
})
export type CheckoutLinksListInput = typeof CheckoutLinksListInput.Type

export const CheckoutLinksListOutput = Models.ListResourceCheckoutLink
export type CheckoutLinksListOutput = typeof CheckoutLinksListOutput.Type

export const checkoutLinksListOperation = defineOperation({
  id: "polar.checkout-links:list",
  method: "GET",
  path: "/v1/checkout-links/",
  inputSchema: CheckoutLinksListInput,
  outputSchema: CheckoutLinksListOutput,
  status: [200],
  contentType: "json",
  queryParams: ["organization_id", "product_id", "page", "limit", "sorting"]
})

/**
 * List Checkout Links
 */
export const checkoutLinksList = (input: CheckoutLinksListInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(checkoutLinksListOperation, input)))

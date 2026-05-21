import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const OrdersListInput = Schema.Struct({
  organization_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  product_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  product_billing_type: Schema.optional(
    Schema.NullOr(Schema.Union(Models.ProductBillingType, Schema.Array(Models.ProductBillingType)))
  ),
  discount_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  customer_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  external_customer_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  checkout_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  subscription_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  page: Schema.optional(Schema.Number),
  limit: Schema.optional(Schema.Number),
  sorting: Schema.optional(Schema.NullOr(Schema.Array(Models.OrderSortProperty))),
  metadata: Schema.optional(Models.MetadataQuery)
})
export type OrdersListInput = typeof OrdersListInput.Type

export const OrdersListOutput = Models.ListResourceOrder
export type OrdersListOutput = typeof OrdersListOutput.Type

export const ordersListOperation = defineOperation({
  id: "polar.orders:list",
  method: "GET",
  path: "/v1/orders/",
  inputSchema: OrdersListInput,
  outputSchema: OrdersListOutput,
  status: [200],
  contentType: "json",
  queryParams: [
    "organization_id",
    "product_id",
    "product_billing_type",
    "discount_id",
    "customer_id",
    "external_customer_id",
    "checkout_id",
    "subscription_id",
    "page",
    "limit",
    "sorting",
    "metadata"
  ]
})

/**
 * List Orders
 */
export const ordersList = (input: OrdersListInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(ordersListOperation, input)))

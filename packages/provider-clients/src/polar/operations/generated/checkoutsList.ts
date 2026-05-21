import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CheckoutsListInput = Schema.Struct({
  organization_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  product_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  customer_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  external_customer_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  status: Schema.optional(Schema.NullOr(Schema.Union(Models.CheckoutStatus, Schema.Array(Models.CheckoutStatus)))),
  query: Schema.optional(Schema.NullOr(Schema.String)),
  page: Schema.optional(Schema.Number),
  limit: Schema.optional(Schema.Number),
  sorting: Schema.optional(Schema.NullOr(Schema.Array(Models.CheckoutSortProperty)))
})
export type CheckoutsListInput = typeof CheckoutsListInput.Type

export const CheckoutsListOutput = Models.ListResourceCheckout
export type CheckoutsListOutput = typeof CheckoutsListOutput.Type

export const checkoutsListOperation = defineOperation({
  id: "polar.checkouts:list",
  method: "GET",
  path: "/v1/checkouts/",
  inputSchema: CheckoutsListInput,
  outputSchema: CheckoutsListOutput,
  status: [200],
  contentType: "json",
  queryParams: [
    "organization_id",
    "product_id",
    "customer_id",
    "external_customer_id",
    "status",
    "query",
    "page",
    "limit",
    "sorting"
  ]
})

/**
 * List Checkout Sessions
 */
export const checkoutsList = (input: CheckoutsListInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(checkoutsListOperation, input)))

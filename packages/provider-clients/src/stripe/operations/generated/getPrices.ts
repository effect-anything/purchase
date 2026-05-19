import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const GetPricesInput = Schema.Struct({
  active: Schema.optional(Schema.Boolean),
  created: Schema.optional(Schema.Union(Schema.Struct({
  gt: Schema.optional(Schema.Number),
  gte: Schema.optional(Schema.Number),
  lt: Schema.optional(Schema.Number),
  lte: Schema.optional(Schema.Number),
}), Schema.Number)),
  currency: Schema.optional(Schema.String),
  ending_before: Schema.optional(Schema.String),
  expand: Schema.optional(Schema.Array(Schema.String)),
  limit: Schema.optional(Schema.Number),
  lookup_keys: Schema.optional(Schema.Array(Schema.String)),
  product: Schema.optional(Schema.String),
  recurring: Schema.optional(Schema.Struct({
  interval: Schema.optional(Schema.Literal("day", "month", "week", "year")),
  meter: Schema.optional(Schema.String),
  usage_type: Schema.optional(Schema.Literal("licensed", "metered")),
})),
  starting_after: Schema.optional(Schema.String),
  type: Schema.optional(Schema.Literal("one_time", "recurring")),
})
export type GetPricesInput = typeof GetPricesInput.Type

export const GetPricesOutput = Schema.Struct({
  data: Schema.Array(Models.Price),
  has_more: Schema.Boolean,
  object: Schema.Literal("list"),
  url: Schema.String,
})
export type GetPricesOutput = typeof GetPricesOutput.Type

export const getPricesOperation = defineOperation({
  id: "stripe.GetPrices",
  method: "GET",
  path: "/v1/prices",
  inputSchema: GetPricesInput,
  outputSchema: GetPricesOutput,
  status: [200],
  contentType: "form",
  queryParams: ["active", "created", "currency", "ending_before", "expand", "limit", "lookup_keys", "product", "recurring", "starting_after", "type"]
})

/**
 * List all prices
 */
export const getPrices = (input: GetPricesInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getPricesOperation, input)))

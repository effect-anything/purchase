import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const GetProductsInput = Schema.Struct({
  active: Schema.optional(Schema.Boolean),
  created: Schema.optional(Schema.Union(Schema.Struct({
  gt: Schema.optional(Schema.Number),
  gte: Schema.optional(Schema.Number),
  lt: Schema.optional(Schema.Number),
  lte: Schema.optional(Schema.Number),
}), Schema.Number)),
  ending_before: Schema.optional(Schema.String),
  expand: Schema.optional(Schema.Array(Schema.String)),
  ids: Schema.optional(Schema.Array(Schema.String)),
  limit: Schema.optional(Schema.Number),
  shippable: Schema.optional(Schema.Boolean),
  starting_after: Schema.optional(Schema.String),
  type: Schema.optional(Schema.Literal("good", "service")),
  url: Schema.optional(Schema.String),
})
export type GetProductsInput = typeof GetProductsInput.Type

export const GetProductsOutput = Schema.Struct({
  data: Schema.Array(Models.Product),
  has_more: Schema.Boolean,
  object: Schema.Literal("list"),
  url: Schema.String,
})
export type GetProductsOutput = typeof GetProductsOutput.Type

export const getProductsOperation = defineOperation({
  id: "stripe.GetProducts",
  method: "GET",
  path: "/v1/products",
  inputSchema: GetProductsInput,
  outputSchema: GetProductsOutput,
  status: [200],
  contentType: "form",
  queryParams: ["active", "created", "ending_before", "expand", "ids", "limit", "shippable", "starting_after", "type", "url"]
})

/**
 * List all products
 */
export const getProducts = (input: GetProductsInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getProductsOperation, input)))

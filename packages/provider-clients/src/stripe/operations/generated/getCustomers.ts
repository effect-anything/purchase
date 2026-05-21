import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetCustomersInput = Schema.Struct({
  created: Schema.optional(
    Schema.Union(
      Schema.Struct({
        gt: Schema.optional(Schema.Number),
        gte: Schema.optional(Schema.Number),
        lt: Schema.optional(Schema.Number),
        lte: Schema.optional(Schema.Number)
      }),
      Schema.Number
    )
  ),
  email: Schema.optional(Schema.String),
  ending_before: Schema.optional(Schema.String),
  expand: Schema.optional(Schema.Array(Schema.String)),
  limit: Schema.optional(Schema.Number),
  starting_after: Schema.optional(Schema.String),
  test_clock: Schema.optional(Schema.String)
})
export type GetCustomersInput = typeof GetCustomersInput.Type

export const GetCustomersOutput = Schema.Struct({
  data: Schema.Array(Models.Customer),
  has_more: Schema.Boolean,
  object: Schema.Literal("list"),
  url: Schema.String
})
export type GetCustomersOutput = typeof GetCustomersOutput.Type

export const getCustomersOperation = defineOperation({
  id: "stripe.GetCustomers",
  method: "GET",
  path: "/v1/customers",
  inputSchema: GetCustomersInput,
  outputSchema: GetCustomersOutput,
  status: [200],
  contentType: "form",
  queryParams: ["created", "email", "ending_before", "expand", "limit", "starting_after", "test_clock"]
})

/**
 * List all customers
 */
export const getCustomers = (input: GetCustomersInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getCustomersOperation, input)))

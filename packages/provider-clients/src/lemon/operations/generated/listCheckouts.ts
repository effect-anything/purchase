import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { LemonClient } from "../../client.ts"

export const ListCheckoutsInput = Schema.Struct({
  "page[number]": Schema.optional(Schema.Number),
  "page[size]": Schema.optional(Schema.Number),
  "filter[store_id]": Schema.optional(Schema.String),
  "filter[variant_id]": Schema.optional(Schema.String),
  include: Schema.optional(Schema.String),
})
export type ListCheckoutsInput = typeof ListCheckoutsInput.Type

export const ListCheckoutsOutput = Models.CheckoutListResponse
export type ListCheckoutsOutput = typeof ListCheckoutsOutput.Type

export const listCheckoutsOperation = defineOperation({
  id: "lemon.listCheckouts",
  method: "GET",
  path: "/checkouts",
  inputSchema: ListCheckoutsInput,
  outputSchema: ListCheckoutsOutput,
  status: [200],
  contentType: "json",
  queryParams: ["page[number]", "page[size]", "filter[store_id]", "filter[variant_id]", "include"]
})

/**
 * List checkouts
 */
export const listCheckouts = (input: ListCheckoutsInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(listCheckoutsOperation, input)))

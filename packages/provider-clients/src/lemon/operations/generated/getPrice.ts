import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { LemonClient } from "../../client.ts"

export const GetPriceInput = Schema.Struct({
  id: Schema.String,
  include: Schema.optional(Schema.String),
})
export type GetPriceInput = typeof GetPriceInput.Type

export const GetPriceOutput = Models.PriceResponse
export type GetPriceOutput = typeof GetPriceOutput.Type

export const getPriceOperation = defineOperation({
  id: "lemon.getPrice",
  method: "GET",
  path: "/prices/{id}",
  inputSchema: GetPriceInput,
  outputSchema: GetPriceOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  queryParams: ["include"]
})

/**
 * Get price
 */
export const getPrice = (input: GetPriceInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(getPriceOperation, input)))

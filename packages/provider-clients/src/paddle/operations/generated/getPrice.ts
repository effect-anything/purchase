import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetPriceInput = Schema.Struct({
  include: Schema.optional(Schema.Array(Models.PriceIncludeEnum)),
  price_id: Schema.String
})
export type GetPriceInput = typeof GetPriceInput.Type

export const GetPriceOutput = Schema.Struct({
  data: Models.PriceIncludes,
  meta: Models.Meta
})
export type GetPriceOutput = typeof GetPriceOutput.Type

export const getPriceOperation = defineOperation({
  id: "paddle.get-price",
  method: "GET",
  path: "/prices/{price_id}",
  inputSchema: GetPriceInput,
  outputSchema: GetPriceOutput,
  status: [200],
  contentType: "json",
  pathParams: ["price_id"],
  queryParams: ["include"]
})

/**
 * Get a price
 */
export const getPrice = (input: GetPriceInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(getPriceOperation, input)))

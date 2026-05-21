import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetPricesPriceInput = Schema.Struct({
  expand: Schema.optional(Schema.Array(Schema.String)),
  price: Schema.String
})
export type GetPricesPriceInput = typeof GetPricesPriceInput.Type

export const GetPricesPriceOutput = Models.Price
export type GetPricesPriceOutput = typeof GetPricesPriceOutput.Type

export const getPricesPriceOperation = defineOperation({
  id: "stripe.GetPricesPrice",
  method: "GET",
  path: "/v1/prices/{price}",
  inputSchema: GetPricesPriceInput,
  outputSchema: GetPricesPriceOutput,
  status: [200],
  contentType: "form",
  pathParams: ["price"],
  queryParams: ["expand"]
})

/**
 * Retrieve a price
 */
export const getPricesPrice = (input: GetPricesPriceInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getPricesPriceOperation, input)))

import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { LemonClient } from "../../client.ts"

export const ListPricesInput = Schema.Struct({
  "page[number]": Schema.optional(Schema.Number),
  "page[size]": Schema.optional(Schema.Number),
  "filter[variant_id]": Schema.optional(Schema.String),
  include: Schema.optional(Schema.String),
})
export type ListPricesInput = typeof ListPricesInput.Type

export const ListPricesOutput = Models.PriceListResponse
export type ListPricesOutput = typeof ListPricesOutput.Type

export const listPricesOperation = defineOperation({
  id: "lemon.listPrices",
  method: "GET",
  path: "/prices",
  inputSchema: ListPricesInput,
  outputSchema: ListPricesOutput,
  status: [200],
  contentType: "json",
  queryParams: ["page[number]", "page[size]", "filter[variant_id]", "include"]
})

/**
 * List prices
 */
export const listPrices = (input: ListPricesInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(listPricesOperation, input)))

import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { CreemClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const RetrieveProductInput = Schema.Struct({
  product_id: Schema.String
})
export type RetrieveProductInput = typeof RetrieveProductInput.Type

export const RetrieveProductOutput = Models.ProductEntity
export type RetrieveProductOutput = typeof RetrieveProductOutput.Type

export const retrieveProductOperation = defineOperation({
  id: "creem.retrieveProduct",
  method: "GET",
  path: "/products",
  inputSchema: RetrieveProductInput,
  outputSchema: RetrieveProductOutput,
  status: [200],
  contentType: "json",
  queryParams: ["product_id"]
})

/**
 * Retrieve a product
 */
export const retrieveProduct = (input: RetrieveProductInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(retrieveProductOperation, input)))

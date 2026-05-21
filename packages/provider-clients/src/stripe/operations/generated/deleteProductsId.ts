import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const DeleteProductsIdInput = Schema.Struct({
  id: Schema.String
})
export type DeleteProductsIdInput = typeof DeleteProductsIdInput.Type

export const DeleteProductsIdOutput = Models.DeletedProduct
export type DeleteProductsIdOutput = typeof DeleteProductsIdOutput.Type

export const deleteProductsIdOperation = defineOperation({
  id: "stripe.DeleteProductsId",
  method: "DELETE",
  path: "/v1/products/{id}",
  inputSchema: DeleteProductsIdInput,
  outputSchema: DeleteProductsIdOutput,
  status: [200],
  contentType: "form",
  pathParams: ["id"]
})

/**
 * Delete a product
 */
export const deleteProductsId = (input: DeleteProductsIdInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(deleteProductsIdOperation, input)))

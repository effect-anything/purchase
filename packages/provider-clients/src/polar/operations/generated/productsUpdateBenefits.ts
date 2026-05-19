import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const ProductsUpdateBenefitsInput = Schema.Struct({
  id: Schema.String,
  benefits: Schema.Array(Schema.String),
})
export type ProductsUpdateBenefitsInput = typeof ProductsUpdateBenefitsInput.Type

export const ProductsUpdateBenefitsOutput = Models.Product
export type ProductsUpdateBenefitsOutput = typeof ProductsUpdateBenefitsOutput.Type

export const productsUpdateBenefitsOperation = defineOperation({
  id: "polar.products:update_benefits",
  method: "POST",
  path: "/v1/products/{id}/benefits",
  inputSchema: ProductsUpdateBenefitsInput,
  outputSchema: ProductsUpdateBenefitsOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  bodyParams: ["benefits"]
})

/**
 * Update Product Benefits
 */
export const productsUpdateBenefits = (input: ProductsUpdateBenefitsInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(productsUpdateBenefitsOperation, input)))

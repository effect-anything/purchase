import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetBusinessInput = Schema.Struct({
  business_id: Schema.String,
  customer_id: Schema.String
})
export type GetBusinessInput = typeof GetBusinessInput.Type

export const GetBusinessOutput = Schema.Struct({
  data: Models.Business,
  meta: Models.Meta
})
export type GetBusinessOutput = typeof GetBusinessOutput.Type

export const getBusinessOperation = defineOperation({
  id: "paddle.get-business",
  method: "GET",
  path: "/customers/{customer_id}/businesses/{business_id}",
  inputSchema: GetBusinessInput,
  outputSchema: GetBusinessOutput,
  status: [200],
  contentType: "json",
  pathParams: ["business_id", "customer_id"]
})

/**
 * Get a business for a customer
 */
export const getBusiness = (input: GetBusinessInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(getBusinessOperation, input)))

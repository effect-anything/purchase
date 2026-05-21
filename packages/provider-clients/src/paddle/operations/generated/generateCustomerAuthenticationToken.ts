import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GenerateCustomerAuthenticationTokenInput = Schema.Struct({
  customer_id: Schema.String
})
export type GenerateCustomerAuthenticationTokenInput = typeof GenerateCustomerAuthenticationTokenInput.Type

export const GenerateCustomerAuthenticationTokenOutput = Schema.Struct({
  data: Models.CustomerAuthenticationToken,
  meta: Models.Meta
})
export type GenerateCustomerAuthenticationTokenOutput = typeof GenerateCustomerAuthenticationTokenOutput.Type

export const generateCustomerAuthenticationTokenOperation = defineOperation({
  id: "paddle.generate-customer-authentication-token",
  method: "POST",
  path: "/customers/{customer_id}/auth-token",
  inputSchema: GenerateCustomerAuthenticationTokenInput,
  outputSchema: GenerateCustomerAuthenticationTokenOutput,
  status: [200],
  contentType: "json",
  pathParams: ["customer_id"]
})

/**
 * Generate an authentication token for a customer
 */
export const generateCustomerAuthenticationToken = (input: GenerateCustomerAuthenticationTokenInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(generateCustomerAuthenticationTokenOperation, input)))

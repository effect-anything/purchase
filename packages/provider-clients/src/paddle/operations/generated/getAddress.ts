import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetAddressInput = Schema.Struct({
  address_id: Schema.String,
  customer_id: Schema.String
})
export type GetAddressInput = typeof GetAddressInput.Type

export const GetAddressOutput = Schema.Struct({
  data: Models.Address,
  meta: Models.Meta
})
export type GetAddressOutput = typeof GetAddressOutput.Type

export const getAddressOperation = defineOperation({
  id: "paddle.get-address",
  method: "GET",
  path: "/customers/{customer_id}/addresses/{address_id}",
  inputSchema: GetAddressInput,
  outputSchema: GetAddressOutput,
  status: [200],
  contentType: "json",
  pathParams: ["address_id", "customer_id"]
})

/**
 * Get an address for a customer
 */
export const getAddress = (input: GetAddressInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(getAddressOperation, input)))

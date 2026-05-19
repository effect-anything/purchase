import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const CustomersCreateInput = Schema.Struct({

})
export type CustomersCreateInput = typeof CustomersCreateInput.Type

export const CustomersCreateOutput = Models.Customer
export type CustomersCreateOutput = typeof CustomersCreateOutput.Type

export const customersCreateOperation = defineOperation({
  id: "polar.customers:create",
  method: "POST",
  path: "/v1/customers/",
  inputSchema: CustomersCreateInput,
  outputSchema: CustomersCreateOutput,
  status: [201],
  contentType: "json"
})

/**
 * Create Customer
 */
export const customersCreate = (input: CustomersCreateInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(customersCreateOperation, input)))

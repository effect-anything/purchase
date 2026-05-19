import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const DeleteCustomersCustomerSourcesIdInput = Schema.Struct({
  customer: Schema.String,
  id: Schema.String,
  expand: Schema.optional(Schema.Array(Schema.String)),
})
export type DeleteCustomersCustomerSourcesIdInput = typeof DeleteCustomersCustomerSourcesIdInput.Type

export const DeleteCustomersCustomerSourcesIdOutput = Schema.Union(Models.PaymentSource, Models.DeletedPaymentSource)
export type DeleteCustomersCustomerSourcesIdOutput = typeof DeleteCustomersCustomerSourcesIdOutput.Type

export const deleteCustomersCustomerSourcesIdOperation = defineOperation({
  id: "stripe.DeleteCustomersCustomerSourcesId",
  method: "DELETE",
  path: "/v1/customers/{customer}/sources/{id}",
  inputSchema: DeleteCustomersCustomerSourcesIdInput,
  outputSchema: DeleteCustomersCustomerSourcesIdOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer", "id"],
  bodyParams: ["expand"]
})

/**
 * Delete a customer source
 */
export const deleteCustomersCustomerSourcesId = (input: DeleteCustomersCustomerSourcesIdInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(deleteCustomersCustomerSourcesIdOperation, input)))

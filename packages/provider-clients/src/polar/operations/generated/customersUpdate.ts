import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CustomersUpdateInput = Schema.Struct({
  id: Schema.String,
  metadata: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean)
    })
  ),
  email: Schema.optional(Schema.NullOr(Schema.String)),
  name: Schema.optional(Schema.NullOr(Schema.String)),
  billing_address: Schema.optional(Schema.NullOr(Models.AddressInput)),
  tax_id: Schema.optional(Schema.NullOr(Schema.String)),
  locale: Schema.optional(Schema.NullOr(Schema.String)),
  external_id: Schema.optional(Schema.NullOr(Schema.String)),
  type: Schema.optional(Schema.NullOr(Models.CustomerType))
})
export type CustomersUpdateInput = typeof CustomersUpdateInput.Type

export const CustomersUpdateOutput = Models.Customer
export type CustomersUpdateOutput = typeof CustomersUpdateOutput.Type

export const customersUpdateOperation = defineOperation({
  id: "polar.customers:update",
  method: "PATCH",
  path: "/v1/customers/{id}",
  inputSchema: CustomersUpdateInput,
  outputSchema: CustomersUpdateOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  bodyParams: ["metadata", "email", "name", "billing_address", "tax_id", "locale", "external_id", "type"]
})

/**
 * Update Customer
 */
export const customersUpdate = (input: CustomersUpdateInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(customersUpdateOperation, input)))

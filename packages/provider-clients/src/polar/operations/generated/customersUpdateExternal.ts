import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CustomersUpdateExternalInput = Schema.Struct({
  external_id: Schema.String,
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
  locale: Schema.optional(Schema.NullOr(Schema.String))
})
export type CustomersUpdateExternalInput = typeof CustomersUpdateExternalInput.Type

export const CustomersUpdateExternalOutput = Models.Customer
export type CustomersUpdateExternalOutput = typeof CustomersUpdateExternalOutput.Type

export const customersUpdateExternalOperation = defineOperation({
  id: "polar.customers:update_external",
  method: "PATCH",
  path: "/v1/customers/external/{external_id}",
  inputSchema: CustomersUpdateExternalInput,
  outputSchema: CustomersUpdateExternalOutput,
  status: [200],
  contentType: "json",
  pathParams: ["external_id"],
  bodyParams: ["metadata", "email", "name", "billing_address", "tax_id", "locale"]
})

/**
 * Update Customer by External ID
 */
export const customersUpdateExternal = (input: CustomersUpdateExternalInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(customersUpdateExternalOperation, input)))

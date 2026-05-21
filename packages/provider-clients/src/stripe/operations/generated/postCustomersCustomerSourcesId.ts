import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const PostCustomersCustomerSourcesIdInput = Schema.Struct({
  customer: Schema.String,
  id: Schema.String,
  account_holder_name: Schema.optional(Schema.String),
  account_holder_type: Schema.optional(Schema.Literal("company", "individual")),
  address_city: Schema.optional(Schema.String),
  address_country: Schema.optional(Schema.String),
  address_line1: Schema.optional(Schema.String),
  address_line2: Schema.optional(Schema.String),
  address_state: Schema.optional(Schema.String),
  address_zip: Schema.optional(Schema.String),
  exp_month: Schema.optional(Schema.String),
  exp_year: Schema.optional(Schema.String),
  expand: Schema.optional(Schema.Array(Schema.String)),
  metadata: Schema.optional(
    Schema.Union(Schema.Record({ key: Schema.String, value: Schema.String }), Schema.Literal(""))
  ),
  owner: Schema.optional(
    Schema.Struct({
      address: Schema.optional(
        Schema.Struct({
          city: Schema.optional(Schema.String),
          country: Schema.optional(Schema.String),
          line1: Schema.optional(Schema.String),
          line2: Schema.optional(Schema.String),
          postal_code: Schema.optional(Schema.String),
          state: Schema.optional(Schema.String)
        })
      ),
      email: Schema.optional(Schema.String),
      name: Schema.optional(Schema.String),
      phone: Schema.optional(Schema.String)
    })
  )
})
export type PostCustomersCustomerSourcesIdInput = typeof PostCustomersCustomerSourcesIdInput.Type

export const PostCustomersCustomerSourcesIdOutput = Schema.Union(Models.Card, Models.BankAccount, Models.Source)
export type PostCustomersCustomerSourcesIdOutput = typeof PostCustomersCustomerSourcesIdOutput.Type

export const postCustomersCustomerSourcesIdOperation = defineOperation({
  id: "stripe.PostCustomersCustomerSourcesId",
  method: "POST",
  path: "/v1/customers/{customer}/sources/{id}",
  inputSchema: PostCustomersCustomerSourcesIdInput,
  outputSchema: PostCustomersCustomerSourcesIdOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer", "id"],
  bodyParams: [
    "account_holder_name",
    "account_holder_type",
    "address_city",
    "address_country",
    "address_line1",
    "address_line2",
    "address_state",
    "address_zip",
    "exp_month",
    "exp_year",
    "expand",
    "metadata",
    "name",
    "owner"
  ]
})

/**
 * <p>Update a specified source for a given customer.</p>
 */
export const postCustomersCustomerSourcesId = (input: PostCustomersCustomerSourcesIdInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(postCustomersCustomerSourcesIdOperation, input)))

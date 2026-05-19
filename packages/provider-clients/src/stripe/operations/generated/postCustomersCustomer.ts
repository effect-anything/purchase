import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const PostCustomersCustomerInput = Schema.Struct({
  customer: Schema.String,
  address: Schema.optional(Schema.Union(Schema.Struct({
  city: Schema.optional(Schema.String),
  country: Schema.optional(Schema.String),
  line1: Schema.optional(Schema.String),
  line2: Schema.optional(Schema.String),
  postal_code: Schema.optional(Schema.String),
  state: Schema.optional(Schema.String),
}), Schema.Literal(""))),
  balance: Schema.optional(Schema.Number),
  business_name: Schema.optional(Schema.Union(Schema.String, Schema.Literal(""))),
  cash_balance: Schema.optional(Schema.Struct({
  settings: Schema.optional(Schema.Struct({
  reconciliation_mode: Schema.optional(Schema.Literal("automatic", "manual", "merchant_default")),
})),
})),
  default_source: Schema.optional(Schema.String),
  description: Schema.optional(Schema.String),
  email: Schema.optional(Schema.String),
  expand: Schema.optional(Schema.Array(Schema.String)),
  individual_name: Schema.optional(Schema.Union(Schema.String, Schema.Literal(""))),
  invoice_prefix: Schema.optional(Schema.String),
  invoice_settings: Schema.optional(Schema.Struct({
  custom_fields: Schema.optional(Schema.Union(Schema.Array(Schema.Struct({
  name: Schema.String,
  value: Schema.String,
})), Schema.Literal(""))),
  default_payment_method: Schema.optional(Schema.String),
  footer: Schema.optional(Schema.String),
  rendering_options: Schema.optional(Schema.Union(Schema.Struct({
  amount_tax_display: Schema.optional(Schema.Literal("", "exclude_tax", "include_inclusive_tax")),
  template: Schema.optional(Schema.String),
}), Schema.Literal(""))),
})),
  metadata: Schema.optional(Schema.Union(Schema.Record({ key: Schema.String, value: Schema.String }), Schema.Literal(""))),
  next_invoice_sequence: Schema.optional(Schema.Number),
  phone: Schema.optional(Schema.String),
  preferred_locales: Schema.optional(Schema.Array(Schema.String)),
  shipping: Schema.optional(Schema.Union(Schema.Struct({
  address: Schema.Struct({
  city: Schema.optional(Schema.String),
  country: Schema.optional(Schema.String),
  line1: Schema.optional(Schema.String),
  line2: Schema.optional(Schema.String),
  postal_code: Schema.optional(Schema.String),
  state: Schema.optional(Schema.String),
}),
  name: Schema.String,
  phone: Schema.optional(Schema.String),
}), Schema.Literal(""))),
  tax: Schema.optional(Schema.Struct({
  ip_address: Schema.optional(Schema.Union(Schema.String, Schema.Literal(""))),
  validate_location: Schema.optional(Schema.Literal("auto", "deferred", "immediately")),
})),
  tax_exempt: Schema.optional(Schema.Literal("", "exempt", "none", "reverse")),
  validate: Schema.optional(Schema.Boolean),
})
export type PostCustomersCustomerInput = typeof PostCustomersCustomerInput.Type

export const PostCustomersCustomerOutput = Models.Customer
export type PostCustomersCustomerOutput = typeof PostCustomersCustomerOutput.Type

export const postCustomersCustomerOperation = defineOperation({
  id: "stripe.PostCustomersCustomer",
  method: "POST",
  path: "/v1/customers/{customer}",
  inputSchema: PostCustomersCustomerInput,
  outputSchema: PostCustomersCustomerOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer"],
  bodyParams: ["address", "balance", "business_name", "cash_balance", "default_source", "description", "email", "expand", "individual_name", "invoice_prefix", "invoice_settings", "metadata", "name", "next_invoice_sequence", "phone", "preferred_locales", "shipping", "source", "tax", "tax_exempt", "validate"]
})

/**
 * Update a customer
 */
export const postCustomersCustomer = (input: PostCustomersCustomerInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(postCustomersCustomerOperation, input)))

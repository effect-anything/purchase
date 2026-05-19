import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const CheckoutsClientUpdateInput = Schema.Struct({
  client_secret: Schema.String,
  custom_field_data: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.NullOr(Schema.Union(Schema.String, Schema.Number, Schema.Boolean, Schema.String)) })),
  product_id: Schema.optional(Schema.NullOr(Schema.String)),
  product_price_id: Schema.optional(Schema.NullOr(Schema.String)),
  amount: Schema.optional(Schema.NullOr(Schema.Number)),
  seats: Schema.optional(Schema.NullOr(Schema.Number)),
  is_business_customer: Schema.optional(Schema.NullOr(Schema.Boolean)),
  customer_name: Schema.optional(Schema.NullOr(Schema.String)),
  customer_email: Schema.optional(Schema.NullOr(Schema.String)),
  customer_billing_name: Schema.optional(Schema.NullOr(Schema.String)),
  customer_billing_address: Schema.optional(Schema.NullOr(Models.AddressInput)),
  customer_tax_id: Schema.optional(Schema.NullOr(Schema.String)),
  locale: Schema.optional(Schema.NullOr(Schema.String)),
  discount_code: Schema.optional(Schema.NullOr(Schema.String)),
  allow_trial: Schema.optional(Schema.NullOr(Schema.Boolean)),
})
export type CheckoutsClientUpdateInput = typeof CheckoutsClientUpdateInput.Type

export const CheckoutsClientUpdateOutput = Models.CheckoutPublic
export type CheckoutsClientUpdateOutput = typeof CheckoutsClientUpdateOutput.Type

export const checkoutsClientUpdateOperation = defineOperation({
  id: "polar.checkouts:client_update",
  method: "PATCH",
  path: "/v1/checkouts/client/{client_secret}",
  inputSchema: CheckoutsClientUpdateInput,
  outputSchema: CheckoutsClientUpdateOutput,
  status: [200],
  contentType: "json",
  pathParams: ["client_secret"],
  bodyParams: ["custom_field_data", "product_id", "product_price_id", "amount", "seats", "is_business_customer", "customer_name", "customer_email", "customer_billing_name", "customer_billing_address", "customer_tax_id", "locale", "discount_code", "allow_trial"]
})

/**
 * Update Checkout Session from Client
 */
export const checkoutsClientUpdate = (input: CheckoutsClientUpdateInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(checkoutsClientUpdateOperation, input)))

import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CheckoutsClientConfirmInput = Schema.Struct({
  client_secret: Schema.String,
  custom_field_data: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.NullOr(Schema.Union(Schema.String, Schema.Number, Schema.Boolean, Schema.String))
    })
  ),
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
  confirmation_token_id: Schema.optional(Schema.NullOr(Schema.String))
})
export type CheckoutsClientConfirmInput = typeof CheckoutsClientConfirmInput.Type

export const CheckoutsClientConfirmOutput = Models.CheckoutPublicConfirmed
export type CheckoutsClientConfirmOutput = typeof CheckoutsClientConfirmOutput.Type

export const checkoutsClientConfirmOperation = defineOperation({
  id: "polar.checkouts:client_confirm",
  method: "POST",
  path: "/v1/checkouts/client/{client_secret}/confirm",
  inputSchema: CheckoutsClientConfirmInput,
  outputSchema: CheckoutsClientConfirmOutput,
  status: [200],
  contentType: "json",
  pathParams: ["client_secret"],
  bodyParams: [
    "custom_field_data",
    "product_id",
    "product_price_id",
    "amount",
    "seats",
    "is_business_customer",
    "customer_name",
    "customer_email",
    "customer_billing_name",
    "customer_billing_address",
    "customer_tax_id",
    "locale",
    "discount_code",
    "allow_trial",
    "confirmation_token_id"
  ]
})

/**
 * Confirm Checkout Session from Client
 */
export const checkoutsClientConfirm = (input: CheckoutsClientConfirmInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(checkoutsClientConfirmOperation, input)))

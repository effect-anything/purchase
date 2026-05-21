import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CheckoutsUpdateInput = Schema.Struct({
  id: Schema.String,
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
  trial_interval: Schema.optional(Schema.NullOr(Models.TrialInterval)),
  trial_interval_count: Schema.optional(Schema.NullOr(Schema.Number)),
  metadata: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean)
    })
  ),
  currency: Schema.optional(Schema.NullOr(Models.PresentmentCurrency)),
  discount_id: Schema.optional(Schema.NullOr(Schema.String)),
  allow_discount_codes: Schema.optional(Schema.NullOr(Schema.Boolean)),
  require_billing_address: Schema.optional(Schema.NullOr(Schema.Boolean)),
  allow_trial: Schema.optional(Schema.NullOr(Schema.Boolean)),
  customer_ip_address: Schema.optional(Schema.NullOr(Schema.String)),
  customer_metadata: Schema.optional(
    Schema.NullOr(
      Schema.Record({
        key: Schema.String,
        value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean)
      })
    )
  ),
  success_url: Schema.optional(Schema.NullOr(Schema.String)),
  return_url: Schema.optional(Schema.NullOr(Schema.String)),
  embed_origin: Schema.optional(Schema.NullOr(Schema.String))
})
export type CheckoutsUpdateInput = typeof CheckoutsUpdateInput.Type

export const CheckoutsUpdateOutput = Models.Checkout
export type CheckoutsUpdateOutput = typeof CheckoutsUpdateOutput.Type

export const checkoutsUpdateOperation = defineOperation({
  id: "polar.checkouts:update",
  method: "PATCH",
  path: "/v1/checkouts/{id}",
  inputSchema: CheckoutsUpdateInput,
  outputSchema: CheckoutsUpdateOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
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
    "trial_interval",
    "trial_interval_count",
    "metadata",
    "currency",
    "discount_id",
    "allow_discount_codes",
    "require_billing_address",
    "allow_trial",
    "customer_ip_address",
    "customer_metadata",
    "success_url",
    "return_url",
    "embed_origin"
  ]
})

/**
 * Update Checkout Session
 */
export const checkoutsUpdate = (input: CheckoutsUpdateInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(checkoutsUpdateOperation, input)))

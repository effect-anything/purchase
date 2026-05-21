import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const UpdateTransactionInput = Schema.Struct({
  include: Schema.optional(Schema.Array(Models.TransactionIncludeQuery)),
  transaction_id: Schema.String,
  status: Schema.optional(Models.TransactionStatus),
  customer_id: Schema.optional(Schema.NullOr(Models.CustomerId)),
  address_id: Schema.optional(Schema.NullOr(Models.AddressId)),
  business_id: Schema.optional(Schema.NullOr(Models.BusinessId)),
  custom_data: Schema.optional(Schema.NullOr(Models.CustomData)),
  currency_code: Schema.optional(Schema.NullOr(Models.CurrencyCode)),
  origin: Schema.optional(Models.TransactionOrigin),
  subscription_id: Schema.optional(Schema.NullOr(Models.SubscriptionId)),
  invoice_id: Schema.optional(Schema.NullOr(Schema.String)),
  invoice_number: Schema.optional(Schema.NullOr(Schema.String)),
  collection_mode: Schema.optional(Models.CollectionMode),
  discount_id: Schema.optional(Schema.NullOr(Models.DiscountId)),
  billing_details: Schema.optional(Schema.NullOr(Models.BillingDetailsUpdate)),
  billing_period: Schema.optional(Schema.NullOr(Models.TimePeriod)),
  items: Schema.optional(Schema.Array(Models.TransactionItemUpdate)),
  payments: Schema.optional(Schema.Array(Models.TransactionPaymentAttempt)),
  checkout: Schema.optional(Schema.NullOr(Models.TransactionCheckoutCreate)),
  created_at: Schema.optional(Models.CreatedAt),
  updated_at: Schema.optional(Models.UpdatedAt),
  billed_at: Schema.optional(Schema.NullOr(Models.Timestamp))
})
export type UpdateTransactionInput = typeof UpdateTransactionInput.Type

export const UpdateTransactionOutput = Schema.Struct({
  data: Models.TransactionIncludes,
  meta: Models.Meta
})
export type UpdateTransactionOutput = typeof UpdateTransactionOutput.Type

export const updateTransactionOperation = defineOperation({
  id: "paddle.update-transaction",
  method: "PATCH",
  path: "/transactions/{transaction_id}",
  inputSchema: UpdateTransactionInput,
  outputSchema: UpdateTransactionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["transaction_id"],
  queryParams: ["include"],
  bodyParams: [
    "id",
    "status",
    "customer_id",
    "address_id",
    "business_id",
    "custom_data",
    "currency_code",
    "origin",
    "subscription_id",
    "invoice_id",
    "invoice_number",
    "collection_mode",
    "discount_id",
    "billing_details",
    "billing_period",
    "items",
    "details",
    "payments",
    "checkout",
    "created_at",
    "updated_at",
    "billed_at"
  ]
})

/**
 * Update a transaction
 */
export const updateTransaction = (input: UpdateTransactionInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(updateTransactionOperation, input)))

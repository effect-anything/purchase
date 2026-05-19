import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PaddleClient } from "../../client.ts"

export const CreateTransactionInput = Schema.Struct({
  include: Schema.optional(Schema.Array(Models.TransactionIncludeQuery)),
  id: Schema.optional(Models.TransactionId),
  status: Schema.optional(Models.TransactionStatusCreate),
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
  billing_details: Schema.optional(Schema.NullOr(Models.BillingDetailsCreate)),
  billing_period: Schema.optional(Schema.NullOr(Models.TimePeriod)),
  items: Schema.Array(Models.TransactionItemCreate),
  payments: Schema.optional(Schema.Array(Models.TransactionPaymentAttempt)),
  checkout: Schema.optional(Schema.NullOr(Models.TransactionCheckoutCreate)),
  created_at: Schema.optional(Models.CreatedAt),
  updated_at: Schema.optional(Models.UpdatedAt),
  billed_at: Schema.optional(Schema.NullOr(Models.Timestamp)),
})
export type CreateTransactionInput = typeof CreateTransactionInput.Type

export const CreateTransactionOutput = Schema.Struct({
  data: Models.TransactionIncludes,
  meta: Models.Meta,
})
export type CreateTransactionOutput = typeof CreateTransactionOutput.Type

export const createTransactionOperation = defineOperation({
  id: "paddle.create-transaction",
  method: "POST",
  path: "/transactions",
  inputSchema: CreateTransactionInput,
  outputSchema: CreateTransactionOutput,
  status: [201],
  contentType: "json",
  queryParams: ["include"],
  bodyParams: ["id", "status", "customer_id", "address_id", "business_id", "custom_data", "currency_code", "origin", "subscription_id", "invoice_id", "invoice_number", "collection_mode", "discount_id", "billing_details", "billing_period", "items", "details", "payments", "checkout", "created_at", "updated_at", "billed_at"]
})

/**
 * Create a transaction
 */
export const createTransaction = (input: CreateTransactionInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(createTransactionOperation, input)))

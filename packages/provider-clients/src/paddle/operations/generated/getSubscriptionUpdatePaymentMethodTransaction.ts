import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetSubscriptionUpdatePaymentMethodTransactionInput = Schema.Struct({
  subscription_id: Schema.String
})
export type GetSubscriptionUpdatePaymentMethodTransactionInput =
  typeof GetSubscriptionUpdatePaymentMethodTransactionInput.Type

export const GetSubscriptionUpdatePaymentMethodTransactionOutput = Schema.Struct({
  data: Models.SubscriptionTransactionIncludes,
  meta: Models.Meta
})
export type GetSubscriptionUpdatePaymentMethodTransactionOutput =
  typeof GetSubscriptionUpdatePaymentMethodTransactionOutput.Type

export const getSubscriptionUpdatePaymentMethodTransactionOperation = defineOperation({
  id: "paddle.get-subscription-update-payment-method-transaction",
  method: "GET",
  path: "/subscriptions/{subscription_id}/update-payment-method-transaction",
  inputSchema: GetSubscriptionUpdatePaymentMethodTransactionInput,
  outputSchema: GetSubscriptionUpdatePaymentMethodTransactionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["subscription_id"]
})

/**
 * Get a transaction to update payment method
 */
export const getSubscriptionUpdatePaymentMethodTransaction = (
  input: GetSubscriptionUpdatePaymentMethodTransactionInput
) =>
  PaddleClient.pipe(
    Effect.flatMap((client) => client.request(getSubscriptionUpdatePaymentMethodTransactionOperation, input))
  )

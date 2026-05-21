import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { CreemClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ListCustomerSubscriptionsInput = Schema.Struct({
  id: Schema.String,
  page_number: Schema.optional(Schema.Number),
  page_size: Schema.optional(Schema.Number)
})
export type ListCustomerSubscriptionsInput = typeof ListCustomerSubscriptionsInput.Type

export const ListCustomerSubscriptionsOutput = Models.SubscriptionListEntity
export type ListCustomerSubscriptionsOutput = typeof ListCustomerSubscriptionsOutput.Type

export const listCustomerSubscriptionsOperation = defineOperation({
  id: "creem.listCustomerSubscriptions",
  method: "GET",
  path: "/customers/{id}/subscriptions",
  inputSchema: ListCustomerSubscriptionsInput,
  outputSchema: ListCustomerSubscriptionsOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  queryParams: ["page_number", "page_size"]
})

/**
 * List customer subscriptions
 */
export const listCustomerSubscriptions = (input: ListCustomerSubscriptionsInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(listCustomerSubscriptionsOperation, input)))

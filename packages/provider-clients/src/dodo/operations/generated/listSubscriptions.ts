import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const ListSubscriptionsInput = Schema.Struct({
  page_number: Schema.optional(Schema.Number),
  page_size: Schema.optional(Schema.Number),
})
export type ListSubscriptionsInput = typeof ListSubscriptionsInput.Type

export const ListSubscriptionsOutput = Models.SubscriptionListResponse
export type ListSubscriptionsOutput = typeof ListSubscriptionsOutput.Type

export const listSubscriptionsOperation = defineOperation({
  id: "dodo.listSubscriptions",
  method: "GET",
  path: "/subscriptions",
  inputSchema: ListSubscriptionsInput,
  outputSchema: ListSubscriptionsOutput,
  status: [200],
  contentType: "json",
  queryParams: ["page_number", "page_size"]
})

/**
 * List subscriptions
 */
export const listSubscriptions = (input: ListSubscriptionsInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(listSubscriptionsOperation, input)))

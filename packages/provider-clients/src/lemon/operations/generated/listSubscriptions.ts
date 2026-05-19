import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { LemonClient } from "../../client.ts"

export const ListSubscriptionsInput = Schema.Struct({
  "page[number]": Schema.optional(Schema.Number),
  "page[size]": Schema.optional(Schema.Number),
  "filter[store_id]": Schema.optional(Schema.String),
  "filter[order_id]": Schema.optional(Schema.String),
  "filter[product_id]": Schema.optional(Schema.String),
  "filter[variant_id]": Schema.optional(Schema.String),
  "filter[user_email]": Schema.optional(Schema.String),
  "filter[status]": Schema.optional(Schema.String),
  include: Schema.optional(Schema.String),
})
export type ListSubscriptionsInput = typeof ListSubscriptionsInput.Type

export const ListSubscriptionsOutput = Models.SubscriptionListResponse
export type ListSubscriptionsOutput = typeof ListSubscriptionsOutput.Type

export const listSubscriptionsOperation = defineOperation({
  id: "lemon.listSubscriptions",
  method: "GET",
  path: "/subscriptions",
  inputSchema: ListSubscriptionsInput,
  outputSchema: ListSubscriptionsOutput,
  status: [200],
  contentType: "json",
  queryParams: ["page[number]", "page[size]", "filter[store_id]", "filter[order_id]", "filter[product_id]", "filter[variant_id]", "filter[user_email]", "filter[status]", "include"]
})

/**
 * List subscriptions
 */
export const listSubscriptions = (input: ListSubscriptionsInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(listSubscriptionsOperation, input)))

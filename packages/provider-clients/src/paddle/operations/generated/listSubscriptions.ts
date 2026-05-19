import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PaddleClient } from "../../client.ts"

export const ListSubscriptionsInput = Schema.Struct({
  id: Schema.optional(Schema.Array(Schema.String)),
  after: Schema.optional(Schema.String),
  per_page: Schema.optional(Schema.Number),
  address_id: Schema.optional(Schema.Array(Schema.String)),
  collection_mode: Schema.optional(Models.CollectionModeQuery),
  customer_id: Schema.optional(Schema.Array(Schema.String)),
  order_by: Schema.optional(Schema.String),
  price_id: Schema.optional(Schema.Array(Schema.String)),
  scheduled_change_action: Schema.optional(Schema.Array(Models.ScheduledChangeActionQuery)),
  status: Schema.optional(Schema.Array(Models.SubscriptionStatusQuery)),
})
export type ListSubscriptionsInput = typeof ListSubscriptionsInput.Type

export const ListSubscriptionsOutput = Schema.Struct({
  data: Schema.Array(Models.Subscription),
  meta: Models.PaginatedMeta,
})
export type ListSubscriptionsOutput = typeof ListSubscriptionsOutput.Type

export const listSubscriptionsOperation = defineOperation({
  id: "paddle.list-subscriptions",
  method: "GET",
  path: "/subscriptions",
  inputSchema: ListSubscriptionsInput,
  outputSchema: ListSubscriptionsOutput,
  status: [200],
  contentType: "json",
  queryParams: ["id", "after", "per_page", "address_id", "collection_mode", "customer_id", "order_by", "price_id", "scheduled_change_action", "status"]
})

/**
 * List subscriptions
 */
export const listSubscriptions = (input: ListSubscriptionsInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(listSubscriptionsOperation, input)))

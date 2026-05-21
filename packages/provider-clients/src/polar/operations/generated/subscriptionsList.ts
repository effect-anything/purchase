import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const SubscriptionsListInput = Schema.Struct({
  organization_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  product_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  customer_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  external_customer_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  discount_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  active: Schema.optional(Schema.NullOr(Schema.Boolean)),
  cancel_at_period_end: Schema.optional(Schema.NullOr(Schema.Boolean)),
  customer_cancellation_reason: Schema.optional(
    Schema.NullOr(Schema.Union(Models.CustomerCancellationReason, Schema.Array(Models.CustomerCancellationReason)))
  ),
  canceled_at_after: Schema.optional(Schema.NullOr(Schema.String)),
  canceled_at_before: Schema.optional(Schema.NullOr(Schema.String)),
  page: Schema.optional(Schema.Number),
  limit: Schema.optional(Schema.Number),
  sorting: Schema.optional(Schema.NullOr(Schema.Array(Models.SubscriptionSortProperty))),
  metadata: Schema.optional(Models.MetadataQuery)
})
export type SubscriptionsListInput = typeof SubscriptionsListInput.Type

export const SubscriptionsListOutput = Models.ListResourceSubscription
export type SubscriptionsListOutput = typeof SubscriptionsListOutput.Type

export const subscriptionsListOperation = defineOperation({
  id: "polar.subscriptions:list",
  method: "GET",
  path: "/v1/subscriptions/",
  inputSchema: SubscriptionsListInput,
  outputSchema: SubscriptionsListOutput,
  status: [200],
  contentType: "json",
  queryParams: [
    "organization_id",
    "product_id",
    "customer_id",
    "external_customer_id",
    "discount_id",
    "active",
    "cancel_at_period_end",
    "customer_cancellation_reason",
    "canceled_at_after",
    "canceled_at_before",
    "page",
    "limit",
    "sorting",
    "metadata"
  ]
})

/**
 * List Subscriptions
 */
export const subscriptionsList = (input: SubscriptionsListInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(subscriptionsListOperation, input)))

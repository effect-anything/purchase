import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const PostSubscriptionsSubscriptionResumeInput = Schema.Struct({
  subscription: Schema.String,
  billing_cycle_anchor: Schema.optional(Schema.Literal("now", "unchanged")),
  expand: Schema.optional(Schema.Array(Schema.String)),
  proration_behavior: Schema.optional(Schema.Literal("always_invoice", "create_prorations", "none")),
  proration_date: Schema.optional(Schema.Number)
})
export type PostSubscriptionsSubscriptionResumeInput = typeof PostSubscriptionsSubscriptionResumeInput.Type

export const PostSubscriptionsSubscriptionResumeOutput = Models.Subscription
export type PostSubscriptionsSubscriptionResumeOutput = typeof PostSubscriptionsSubscriptionResumeOutput.Type

export const postSubscriptionsSubscriptionResumeOperation = defineOperation({
  id: "stripe.PostSubscriptionsSubscriptionResume",
  method: "POST",
  path: "/v1/subscriptions/{subscription}/resume",
  inputSchema: PostSubscriptionsSubscriptionResumeInput,
  outputSchema: PostSubscriptionsSubscriptionResumeOutput,
  status: [200],
  contentType: "form",
  pathParams: ["subscription"],
  bodyParams: ["billing_cycle_anchor", "expand", "proration_behavior", "proration_date"]
})

/**
 * Resume a subscription
 */
export const postSubscriptionsSubscriptionResume = (input: PostSubscriptionsSubscriptionResumeInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(postSubscriptionsSubscriptionResumeOperation, input)))

import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const PostSubscriptionsSubscriptionMigrateInput = Schema.Struct({
  subscription: Schema.String,
  billing_mode: Schema.Struct({
  flexible: Schema.optional(Schema.Struct({
  proration_discounts: Schema.optional(Schema.Literal("included", "itemized")),
})),
  type: Schema.Literal("flexible"),
}),
  expand: Schema.optional(Schema.Array(Schema.String)),
})
export type PostSubscriptionsSubscriptionMigrateInput = typeof PostSubscriptionsSubscriptionMigrateInput.Type

export const PostSubscriptionsSubscriptionMigrateOutput = Models.Subscription
export type PostSubscriptionsSubscriptionMigrateOutput = typeof PostSubscriptionsSubscriptionMigrateOutput.Type

export const postSubscriptionsSubscriptionMigrateOperation = defineOperation({
  id: "stripe.PostSubscriptionsSubscriptionMigrate",
  method: "POST",
  path: "/v1/subscriptions/{subscription}/migrate",
  inputSchema: PostSubscriptionsSubscriptionMigrateInput,
  outputSchema: PostSubscriptionsSubscriptionMigrateOutput,
  status: [200],
  contentType: "form",
  pathParams: ["subscription"],
  bodyParams: ["billing_mode", "expand"]
})

/**
 * Migrate a subscription
 */
export const postSubscriptionsSubscriptionMigrate = (input: PostSubscriptionsSubscriptionMigrateInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(postSubscriptionsSubscriptionMigrateOperation, input)))

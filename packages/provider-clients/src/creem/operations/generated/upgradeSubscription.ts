import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { CreemClient } from "../../client.ts"

export const UpgradeSubscriptionInput = Schema.Struct({
  id: Schema.String,
  product_id: Schema.String,
  update_behavior: Schema.optional(Schema.Literal("proration-charge-immediately", "proration-charge", "proration-none")),
})
export type UpgradeSubscriptionInput = typeof UpgradeSubscriptionInput.Type

export const UpgradeSubscriptionOutput = Models.SubscriptionEntity
export type UpgradeSubscriptionOutput = typeof UpgradeSubscriptionOutput.Type

export const upgradeSubscriptionOperation = defineOperation({
  id: "creem.upgradeSubscription",
  method: "POST",
  path: "/subscriptions/{id}/upgrade",
  inputSchema: UpgradeSubscriptionInput,
  outputSchema: UpgradeSubscriptionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  bodyParams: ["product_id", "update_behavior"]
})

/**
 * Upgrade a subscription to a different product
 */
export const upgradeSubscription = (input: UpgradeSubscriptionInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(upgradeSubscriptionOperation, input)))

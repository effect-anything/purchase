import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CreateCustomerPortalSessionInput = Schema.Struct({
  customer_id: Schema.String,
  subscription_ids: Schema.optional(Schema.Array(Models.SubscriptionId))
})
export type CreateCustomerPortalSessionInput = typeof CreateCustomerPortalSessionInput.Type

export const CreateCustomerPortalSessionOutput = Schema.Struct({
  data: Models.CustomerPortalSession,
  meta: Models.Meta
})
export type CreateCustomerPortalSessionOutput = typeof CreateCustomerPortalSessionOutput.Type

export const createCustomerPortalSessionOperation = defineOperation({
  id: "paddle.create-customer-portal-session",
  method: "POST",
  path: "/customers/{customer_id}/portal-sessions",
  inputSchema: CreateCustomerPortalSessionInput,
  outputSchema: CreateCustomerPortalSessionOutput,
  status: [201],
  contentType: "json",
  pathParams: ["customer_id"],
  bodyParams: ["subscription_ids"]
})

/**
 * Create a customer portal session
 */
export const createCustomerPortalSession = (input: CreateCustomerPortalSessionInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(createCustomerPortalSessionOperation, input)))

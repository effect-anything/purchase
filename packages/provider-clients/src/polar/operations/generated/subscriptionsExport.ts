import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const SubscriptionsExportInput = Schema.Struct({
  organization_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
})
export type SubscriptionsExportInput = typeof SubscriptionsExportInput.Type

export const SubscriptionsExportOutput = Schema.Unknown
export type SubscriptionsExportOutput = typeof SubscriptionsExportOutput.Type

export const subscriptionsExportOperation = defineOperation({
  id: "polar.subscriptions:export",
  method: "GET",
  path: "/v1/subscriptions/export",
  inputSchema: SubscriptionsExportInput,
  outputSchema: SubscriptionsExportOutput,
  status: [200],
  contentType: "json",
  queryParams: ["organization_id"]
})

/**
 * Export Subscriptions
 */
export const subscriptionsExport = (input: SubscriptionsExportInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(subscriptionsExportOperation, input)))

import * as Schema from "effect/Schema"

export const PurchaseWebhookResult = Schema.Struct({
  accepted: Schema.Boolean,
  providerEventId: Schema.String,
  normalizedEvents: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      kind: Schema.String,
      offerId: Schema.NullOr(Schema.String),
      customerId: Schema.NullOr(Schema.String)
    })
  ),
  reconciliationReasons: Schema.Array(Schema.String)
})
export type PurchaseWebhookResult = typeof PurchaseWebhookResult.Type

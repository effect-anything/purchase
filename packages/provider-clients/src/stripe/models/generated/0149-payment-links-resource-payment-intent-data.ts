import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourcePaymentIntentData = Schema.Struct({
  capture_method: Schema.NullOr(Schema.Literal("automatic", "automatic_async", "manual")),
  description: Schema.NullOr(Schema.String),
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  setup_future_usage: Schema.NullOr(Schema.Literal("off_session", "on_session")),
  statement_descriptor: Schema.NullOr(Schema.String),
  statement_descriptor_suffix: Schema.NullOr(Schema.String),
  transfer_group: Schema.NullOr(Schema.String)
})
export type PaymentLinksResourcePaymentIntentData = typeof PaymentLinksResourcePaymentIntentData.Type

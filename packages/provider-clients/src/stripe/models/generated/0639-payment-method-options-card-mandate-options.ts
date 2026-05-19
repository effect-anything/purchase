import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodOptionsCardMandateOptions = Schema.Struct({
  amount: Schema.Number,
  amount_type: Schema.Literal("fixed", "maximum"),
  description: Schema.NullOr(Schema.String),
  end_date: Schema.NullOr(Schema.Number),
  interval: Schema.Literal("day", "month", "sporadic", "week", "year"),
  interval_count: Schema.NullOr(Schema.Number),
  reference: Schema.String,
  start_date: Schema.Number,
  supported_types: Schema.NullOr(Schema.Array(Schema.Literal("india"))),
})
export type PaymentMethodOptionsCardMandateOptions = typeof PaymentMethodOptionsCardMandateOptions.Type

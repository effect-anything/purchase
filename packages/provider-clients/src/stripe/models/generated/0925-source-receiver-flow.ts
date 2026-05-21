import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SourceReceiverFlow = Schema.Struct({
  address: Schema.NullOr(Schema.String),
  amount_charged: Schema.Number,
  amount_received: Schema.Number,
  amount_returned: Schema.Number,
  refund_attributes_method: Schema.String,
  refund_attributes_status: Schema.String
})
export type SourceReceiverFlow = typeof SourceReceiverFlow.Type

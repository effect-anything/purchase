import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const RefundDestinationDetailsBlik = Schema.Struct({
  network_decline_code: Schema.NullOr(Schema.String),
  reference: Schema.NullOr(Schema.String),
  reference_status: Schema.NullOr(Schema.String),
})
export type RefundDestinationDetailsBlik = typeof RefundDestinationDetailsBlik.Type

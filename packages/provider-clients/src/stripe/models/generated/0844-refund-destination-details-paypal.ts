import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const RefundDestinationDetailsPaypal = Schema.Struct({
  network_decline_code: Schema.NullOr(Schema.String)
})
export type RefundDestinationDetailsPaypal = typeof RefundDestinationDetailsPaypal.Type

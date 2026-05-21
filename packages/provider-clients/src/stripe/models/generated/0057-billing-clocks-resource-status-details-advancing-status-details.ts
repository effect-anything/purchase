import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BillingClocksResourceStatusDetailsAdvancingStatusDetails = Schema.Struct({
  target_frozen_time: Schema.Number
})
export type BillingClocksResourceStatusDetailsAdvancingStatusDetails =
  typeof BillingClocksResourceStatusDetailsAdvancingStatusDetails.Type

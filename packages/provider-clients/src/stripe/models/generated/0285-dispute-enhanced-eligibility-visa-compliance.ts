import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DisputeEnhancedEligibilityVisaCompliance = Schema.Struct({
  status: Schema.Literal("fee_acknowledged", "requires_fee_acknowledgement")
})
export type DisputeEnhancedEligibilityVisaCompliance = typeof DisputeEnhancedEligibilityVisaCompliance.Type

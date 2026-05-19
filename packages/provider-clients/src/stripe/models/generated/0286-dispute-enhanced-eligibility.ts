import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DisputeEnhancedEligibility = Schema.Struct({
  visa_compelling_evidence_3: Schema.optional(Schema.suspend((): typeof Models.DisputeEnhancedEligibilityVisaCompellingEvidence3 => Models.DisputeEnhancedEligibilityVisaCompellingEvidence3)),
  visa_compliance: Schema.optional(Schema.suspend((): typeof Models.DisputeEnhancedEligibilityVisaCompliance => Models.DisputeEnhancedEligibilityVisaCompliance)),
})
export type DisputeEnhancedEligibility = typeof DisputeEnhancedEligibility.Type

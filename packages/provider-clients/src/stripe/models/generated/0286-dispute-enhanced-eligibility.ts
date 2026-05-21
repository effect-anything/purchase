import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DisputeEnhancedEligibility = Schema.Struct({
  visa_compelling_evidence_3: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DisputeEnhancedEligibilityVisaCompellingEvidence3, any, any> =>
        Models.DisputeEnhancedEligibilityVisaCompellingEvidence3 as Schema.Schema<
          Models.DisputeEnhancedEligibilityVisaCompellingEvidence3,
          any,
          any
        >
    )
  ),
  visa_compliance: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DisputeEnhancedEligibilityVisaCompliance, any, any> =>
        Models.DisputeEnhancedEligibilityVisaCompliance as Schema.Schema<
          Models.DisputeEnhancedEligibilityVisaCompliance,
          any,
          any
        >
    )
  )
})
export type DisputeEnhancedEligibility = typeof DisputeEnhancedEligibility.Type

import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DisputeEnhancedEvidence = Schema.Struct({
  visa_compelling_evidence_3: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DisputeEnhancedEvidenceVisaCompellingEvidence3, any, any> =>
        Models.DisputeEnhancedEvidenceVisaCompellingEvidence3 as Schema.Schema<
          Models.DisputeEnhancedEvidenceVisaCompellingEvidence3,
          any,
          any
        >
    )
  ),
  visa_compliance: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DisputeEnhancedEvidenceVisaCompliance, any, any> =>
        Models.DisputeEnhancedEvidenceVisaCompliance as Schema.Schema<
          Models.DisputeEnhancedEvidenceVisaCompliance,
          any,
          any
        >
    )
  )
})
export type DisputeEnhancedEvidence = typeof DisputeEnhancedEvidence.Type

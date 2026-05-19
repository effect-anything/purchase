import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DisputeEnhancedEvidenceVisaCompliance = Schema.Struct({
  fee_acknowledged: Schema.Boolean,
})
export type DisputeEnhancedEvidenceVisaCompliance = typeof DisputeEnhancedEvidenceVisaCompliance.Type

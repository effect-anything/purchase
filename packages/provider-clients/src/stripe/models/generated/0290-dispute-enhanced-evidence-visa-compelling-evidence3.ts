import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DisputeEnhancedEvidenceVisaCompellingEvidence3 = Schema.Struct({
  disputed_transaction: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.DisputeVisaCompellingEvidence3DisputedTransaction, any, any> =>
        Models.DisputeVisaCompellingEvidence3DisputedTransaction as Schema.Schema<
          Models.DisputeVisaCompellingEvidence3DisputedTransaction,
          any,
          any
        >
    )
  ),
  prior_undisputed_transactions: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.DisputeVisaCompellingEvidence3PriorUndisputedTransaction, any, any> =>
        Models.DisputeVisaCompellingEvidence3PriorUndisputedTransaction as Schema.Schema<
          Models.DisputeVisaCompellingEvidence3PriorUndisputedTransaction,
          any,
          any
        >
    )
  )
})
export type DisputeEnhancedEvidenceVisaCompellingEvidence3 = typeof DisputeEnhancedEvidenceVisaCompellingEvidence3.Type

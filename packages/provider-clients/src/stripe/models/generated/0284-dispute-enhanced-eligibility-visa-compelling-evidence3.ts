import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DisputeEnhancedEligibilityVisaCompellingEvidence3 = Schema.Struct({
  required_actions: Schema.Array(
    Schema.Literal(
      "missing_customer_identifiers",
      "missing_disputed_transaction_description",
      "missing_merchandise_or_services",
      "missing_prior_undisputed_transaction_description",
      "missing_prior_undisputed_transactions"
    )
  ),
  status: Schema.Literal("not_qualified", "qualified", "requires_action")
})
export type DisputeEnhancedEligibilityVisaCompellingEvidence3 =
  typeof DisputeEnhancedEligibilityVisaCompellingEvidence3.Type

import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CbbOverageBehavior = Schema.Literal(
  "forgive_at_reset",
  "invoice_at_billing",
  "carry_deficit",
  "carry_deficit_auto_repay"
)
export type CbbOverageBehavior = typeof CbbOverageBehavior.Type

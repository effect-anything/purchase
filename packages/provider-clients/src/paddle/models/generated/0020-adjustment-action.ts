import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AdjustmentAction = Schema.Literal("credit", "refund", "chargeback", "chargeback_reverse", "chargeback_warning", "chargeback_warning_reverse", "credit_reverse")
export type AdjustmentAction = typeof AdjustmentAction.Type

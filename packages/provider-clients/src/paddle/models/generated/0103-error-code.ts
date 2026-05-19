import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ErrorCode = Schema.Literal("already_canceled", "already_refunded", "authentication_failed", "blocked_card", "canceled", "declined", "declined_not_retryable", "expired_card", "fraud", "invalid_amount", "invalid_payment_details", "issuer_unavailable", "not_enough_balance", "preferred_network_not_supported", "psp_error", "redacted_payment_method", "system_error", "transaction_not_permitted", "unknown")
export type ErrorCode = typeof ErrorCode.Type

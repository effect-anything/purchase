import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingNetworkTokenWalletProvider = Schema.Struct({
  account_id: Schema.optional(Schema.String),
  account_trust_score: Schema.optional(Schema.Number),
  card_number_source: Schema.optional(Schema.Literal("app", "manual", "on_file", "other")),
  cardholder_address: Schema.optional(Schema.suspend((): typeof Models.IssuingNetworkTokenAddress => Models.IssuingNetworkTokenAddress)),
  cardholder_name: Schema.optional(Schema.String),
  device_trust_score: Schema.optional(Schema.Number),
  hashed_account_email_address: Schema.optional(Schema.String),
  reason_codes: Schema.optional(Schema.Array(Schema.Literal("account_card_too_new", "account_recently_changed", "account_too_new", "account_too_new_since_launch", "additional_device", "data_expired", "defer_id_v_decision", "device_recently_lost", "good_activity_history", "has_suspended_tokens", "high_risk", "inactive_account", "long_account_tenure", "low_account_score", "low_device_score", "low_phone_number_score", "network_service_error", "outside_home_territory", "provisioning_cardholder_mismatch", "provisioning_device_and_cardholder_mismatch", "provisioning_device_mismatch", "same_device_no_prior_authentication", "same_device_successful_prior_authentication", "software_update", "suspicious_activity", "too_many_different_cardholders", "too_many_recent_attempts", "too_many_recent_tokens"))),
  suggested_decision: Schema.optional(Schema.Literal("approve", "decline", "require_auth")),
  suggested_decision_version: Schema.optional(Schema.String),
})
export type IssuingNetworkTokenWalletProvider = typeof IssuingNetworkTokenWalletProvider.Type

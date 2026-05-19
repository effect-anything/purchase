import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DisputeEvidence = Schema.Struct({
  access_activity_log: Schema.NullOr(Schema.String),
  billing_address: Schema.NullOr(Schema.String),
  cancellation_policy: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  cancellation_policy_disclosure: Schema.NullOr(Schema.String),
  cancellation_rebuttal: Schema.NullOr(Schema.String),
  customer_communication: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  customer_email_address: Schema.NullOr(Schema.String),
  customer_name: Schema.NullOr(Schema.String),
  customer_purchase_ip: Schema.NullOr(Schema.String),
  customer_signature: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  duplicate_charge_documentation: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  duplicate_charge_explanation: Schema.NullOr(Schema.String),
  duplicate_charge_id: Schema.NullOr(Schema.String),
  enhanced_evidence: Schema.suspend((): typeof Models.DisputeEnhancedEvidence => Models.DisputeEnhancedEvidence),
  product_description: Schema.NullOr(Schema.String),
  receipt: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  refund_policy: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  refund_policy_disclosure: Schema.NullOr(Schema.String),
  refund_refusal_explanation: Schema.NullOr(Schema.String),
  service_date: Schema.NullOr(Schema.String),
  service_documentation: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  shipping_address: Schema.NullOr(Schema.String),
  shipping_carrier: Schema.NullOr(Schema.String),
  shipping_date: Schema.NullOr(Schema.String),
  shipping_documentation: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  shipping_tracking_number: Schema.NullOr(Schema.String),
  uncategorized_file: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  uncategorized_text: Schema.NullOr(Schema.String),
})
export type DisputeEvidence = typeof DisputeEvidence.Type

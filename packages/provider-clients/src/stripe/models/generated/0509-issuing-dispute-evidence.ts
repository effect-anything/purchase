import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingDisputeEvidence = Schema.Struct({
  canceled: Schema.optional(Schema.suspend((): typeof Models.IssuingDisputeCanceledEvidence => Models.IssuingDisputeCanceledEvidence)),
  duplicate: Schema.optional(Schema.suspend((): typeof Models.IssuingDisputeDuplicateEvidence => Models.IssuingDisputeDuplicateEvidence)),
  fraudulent: Schema.optional(Schema.suspend((): typeof Models.IssuingDisputeFraudulentEvidence => Models.IssuingDisputeFraudulentEvidence)),
  merchandise_not_as_described: Schema.optional(Schema.suspend((): typeof Models.IssuingDisputeMerchandiseNotAsDescribedEvidence => Models.IssuingDisputeMerchandiseNotAsDescribedEvidence)),
  no_valid_authorization: Schema.optional(Schema.suspend((): typeof Models.IssuingDisputeNoValidAuthorizationEvidence => Models.IssuingDisputeNoValidAuthorizationEvidence)),
  not_received: Schema.optional(Schema.suspend((): typeof Models.IssuingDisputeNotReceivedEvidence => Models.IssuingDisputeNotReceivedEvidence)),
  other: Schema.optional(Schema.suspend((): typeof Models.IssuingDisputeOtherEvidence => Models.IssuingDisputeOtherEvidence)),
  reason: Schema.Literal("canceled", "duplicate", "fraudulent", "merchandise_not_as_described", "no_valid_authorization", "not_received", "other", "service_not_as_described"),
  service_not_as_described: Schema.optional(Schema.suspend((): typeof Models.IssuingDisputeServiceNotAsDescribedEvidence => Models.IssuingDisputeServiceNotAsDescribedEvidence)),
})
export type IssuingDisputeEvidence = typeof IssuingDisputeEvidence.Type

import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingDisputeEvidence = Schema.Struct({
  canceled: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingDisputeCanceledEvidence, any, any> =>
        Models.IssuingDisputeCanceledEvidence as Schema.Schema<Models.IssuingDisputeCanceledEvidence, any, any>
    )
  ),
  duplicate: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingDisputeDuplicateEvidence, any, any> =>
        Models.IssuingDisputeDuplicateEvidence as Schema.Schema<Models.IssuingDisputeDuplicateEvidence, any, any>
    )
  ),
  fraudulent: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingDisputeFraudulentEvidence, any, any> =>
        Models.IssuingDisputeFraudulentEvidence as Schema.Schema<Models.IssuingDisputeFraudulentEvidence, any, any>
    )
  ),
  merchandise_not_as_described: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingDisputeMerchandiseNotAsDescribedEvidence, any, any> =>
        Models.IssuingDisputeMerchandiseNotAsDescribedEvidence as Schema.Schema<
          Models.IssuingDisputeMerchandiseNotAsDescribedEvidence,
          any,
          any
        >
    )
  ),
  no_valid_authorization: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingDisputeNoValidAuthorizationEvidence, any, any> =>
        Models.IssuingDisputeNoValidAuthorizationEvidence as Schema.Schema<
          Models.IssuingDisputeNoValidAuthorizationEvidence,
          any,
          any
        >
    )
  ),
  not_received: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingDisputeNotReceivedEvidence, any, any> =>
        Models.IssuingDisputeNotReceivedEvidence as Schema.Schema<Models.IssuingDisputeNotReceivedEvidence, any, any>
    )
  ),
  other: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingDisputeOtherEvidence, any, any> =>
        Models.IssuingDisputeOtherEvidence as Schema.Schema<Models.IssuingDisputeOtherEvidence, any, any>
    )
  ),
  reason: Schema.Literal(
    "canceled",
    "duplicate",
    "fraudulent",
    "merchandise_not_as_described",
    "no_valid_authorization",
    "not_received",
    "other",
    "service_not_as_described"
  ),
  service_not_as_described: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingDisputeServiceNotAsDescribedEvidence, any, any> =>
        Models.IssuingDisputeServiceNotAsDescribedEvidence as Schema.Schema<
          Models.IssuingDisputeServiceNotAsDescribedEvidence,
          any,
          any
        >
    )
  )
})
export type IssuingDisputeEvidence = typeof IssuingDisputeEvidence.Type

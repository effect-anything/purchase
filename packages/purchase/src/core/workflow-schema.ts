import * as Schema from "effect/Schema"

import { PaymentProviderTag } from "../provider/type.ts"
import {
  CommercialAgreementId,
  CommercialEvent,
  CommercialEventId,
  CommercialIntent,
  CommercialIntentId,
  CommercialOfferId,
  CommercialCheckoutTarget,
  ProviderEventId
} from "./commercial-schema.ts"
import {
  BillingPortalFlow,
  SubscriptionCancelTiming,
  SubscriptionChangeProrationMode,
  SubscriptionMutationMode,
  SubscriptionPreviewProrationMode
} from "./common-schema.ts"
import { CustomerId } from "./identity-schema.ts"

/**
 * Stable workflow names emitted by the commercial runtime.
 */
export const WorkflowName = Schema.Literal(
  "catalog.sync",
  "checkout.start",
  "subscription.cancel",
  "subscription.change",
  "subscription.pause",
  "subscription.resume",
  "subscription.preview_change",
  "purchase.refund",
  "credits.grant",
  "credits.consume",
  "portal.create_session",
  "webhook.receive",
  "projection.refresh_customer_commerce",
  "entitlement.recompute",
  "wallet.recompute"
)
export type WorkflowName = typeof WorkflowName.Type

/**
 * Shared orchestration stages used in receipts and internal traces.
 */
export const WorkflowStage = Schema.Literal(
  "validate_input",
  "load_context",
  "build_intent",
  "accept_event",
  "call_provider",
  "load_provider_snapshot",
  "persist_fact",
  "refresh_projection",
  "recompute_entitlements",
  "emit_hooks"
)
export type WorkflowStage = typeof WorkflowStage.Type

export class CommercialReconciliationTrigger extends Schema.Class<CommercialReconciliationTrigger>(
  "@pay/core/CommercialReconciliationTrigger"
)({
  /**
   * Why the read-side needs reconciliation.
   */
  reason: Schema.Literal(
    "checkout_completed",
    "subscription_updated",
    "transaction_updated",
    "refund_updated",
    "customer_updated"
  ),
  /**
   * Resolved local customer affected by the trigger, when known.
   */
  customerId: Schema.optional(CustomerId),
  /**
   * Resolved local agreement affected by the trigger, when known.
   */
  agreementId: Schema.optional(CommercialAgreementId),
  /**
   * Resolved local offer affected by the trigger, when known.
   */
  offerId: Schema.optional(CommercialOfferId),
  /**
   * Source normalized event that produced the trigger, when one exists.
   */
  sourceEventId: Schema.optional(CommercialEventId)
}) {}

export class StartCheckoutInput extends Schema.Class<StartCheckoutInput>("@pay/core/StartCheckoutInput")({
  /**
   * Local customer starting the checkout flow.
   */
  customerId: CustomerId,
  /**
   * Stable commercial offer selected by app code.
   */
  offerId: CommercialOfferId,
  /**
   * Redirect location for successful provider checkout completion.
   */
  successUrl: Schema.optional(Schema.String),
  /**
   * Redirect location when the user abandons checkout.
   */
  cancelUrl: Schema.optional(Schema.String),
  /**
   * Provider checkout payment link base. Paddle requires this to be an approved website.
   */
  checkoutUrl: Schema.optional(Schema.String),
  /**
   * Caller-supplied correlation metadata that will be persisted on the intent.
   */
  metadata: Schema.Record({ key: Schema.String, value: Schema.String })
}) {}

/**
 * Public application/API payload for starting checkout.
 * Customer identity and internal metadata are supplied by the application
 * runtime, not by browser clients.
 */
export class PrepareCheckoutInput extends Schema.Class<PrepareCheckoutInput>("@pay/core/PrepareCheckoutInput")({
  /**
   * Stable commercial offer selected by app code.
   */
  offerId: CommercialOfferId,
  /**
   * Redirect location for successful provider checkout completion.
   */
  successUrl: Schema.optional(Schema.String),
  /**
   * Redirect location when the user abandons checkout.
   */
  cancelUrl: Schema.optional(Schema.String)
}) {}

export class StartCheckoutResult extends Schema.Class<StartCheckoutResult>("@pay/core/StartCheckoutResult")({
  /**
   * Command-side correlation id for the checkout workflow.
   */
  intentId: CommercialIntentId,
  provider: PaymentProviderTag,
  /**
   * Resolved commercial target plus provider references.
   */
  target: CommercialCheckoutTarget,
  /**
   * Durable provider checkout identifier used for correlation and webhook recovery.
   */
  checkoutSessionId: Schema.String,
  /**
   * Checkout URL when the provider exposes a hosted page.
   */
  checkoutUrl: Schema.optional(Schema.String)
}) {}

export class CancelSubscriptionInput extends Schema.Class<CancelSubscriptionInput>("@pay/core/CancelSubscriptionInput")(
  {
    /**
     * Local customer requesting the mutation.
     */
    customerId: CustomerId,
    /**
     * Existing agreement to mutate.
     */
    agreementId: CommercialAgreementId,
    /**
     * Desired cancel timing relative to the provider billing cycle.
     */
    effectiveAt: SubscriptionCancelTiming
  }
) {}

export class ChangeSubscriptionInput extends Schema.Class<ChangeSubscriptionInput>("@pay/core/ChangeSubscriptionInput")(
  {
    /**
     * Local customer requesting the mutation.
     */
    customerId: CustomerId,
    /**
     * Existing agreement to mutate.
     */
    agreementId: CommercialAgreementId,
    /**
     * The next commercial offer requested for this agreement.
     */
    targetOfferId: CommercialOfferId,
    /**
     * Billing-change application mode relative to the current cycle.
     */
    prorationMode: Schema.optional(SubscriptionChangeProrationMode)
  }
) {}

export class PauseSubscriptionInput extends Schema.Class<PauseSubscriptionInput>("@pay/core/PauseSubscriptionInput")({
  customerId: CustomerId,
  agreementId: CommercialAgreementId,
  /**
   * Advanced provider-mode override. Normal app code should omit this and let
   * the workflow choose the provider-safe implementation.
   */
  mode: Schema.optional(SubscriptionMutationMode),
  effectiveAt: Schema.optional(SubscriptionCancelTiming),
  resumeAt: Schema.optional(Schema.String)
}) {}

export class ResumeSubscriptionInput extends Schema.Class<ResumeSubscriptionInput>("@pay/core/ResumeSubscriptionInput")(
  {
    customerId: CustomerId,
    agreementId: CommercialAgreementId,
    /**
     * Advanced provider-mode override. Normal app code should omit this and let
     * the workflow choose the provider-safe implementation.
     */
    mode: Schema.optional(SubscriptionMutationMode),
    effectiveAt: Schema.optional(Schema.String)
  }
) {}

export class PreviewSubscriptionChangeInput extends Schema.Class<PreviewSubscriptionChangeInput>(
  "@pay/core/PreviewSubscriptionChangeInput"
)({
  customerId: CustomerId,
  agreementId: CommercialAgreementId,
  targetOfferId: CommercialOfferId,
  prorationMode: Schema.optional(SubscriptionPreviewProrationMode)
}) {}

export class RefundPurchaseInput extends Schema.Class<RefundPurchaseInput>("@pay/core/RefundPurchaseInput")({
  /**
   * Local customer requesting the refund.
   */
  customerId: CustomerId,
  /**
   * Purchase agreement to refund.
   */
  agreementId: CommercialAgreementId,
  /**
   * Partial refund amount when supported; omit for full refund.
   */
  amount: Schema.optional(Schema.Number),
  /**
   * Optional operator-facing refund reason.
   */
  reason: Schema.optional(Schema.String)
}) {}

export class CreditGrantInput extends Schema.Class<CreditGrantInput>("@pay/core/CreditGrantInput")({
  customerId: CustomerId,
  creditKey: Schema.NonEmptyString,
  offerId: CommercialOfferId,
  amount: Schema.Int,
  sourceEventId: Schema.optional(CommercialEventId),
  idempotencyKey: Schema.String,
  reason: Schema.optional(Schema.String)
}) {}

export class CreditConsumeInput extends Schema.Class<CreditConsumeInput>("@pay/core/CreditConsumeInput")({
  customerId: CustomerId,
  creditKey: Schema.NonEmptyString,
  amount: Schema.Int,
  idempotencyKey: Schema.String,
  reason: Schema.optional(Schema.String)
}) {}

export class CreditWalletResult extends Schema.Class<CreditWalletResult>("@pay/core/CreditWalletResult")({
  customerId: CustomerId,
  creditKey: Schema.NonEmptyString,
  available: Schema.Int,
  acquired: Schema.Int,
  consumed: Schema.Int,
  refunded: Schema.Int,
  updatedAt: Schema.Date
}) {}

export class CreatePortalSessionInput extends Schema.Class<CreatePortalSessionInput>(
  "@pay/core/CreatePortalSessionInput"
)({
  customerId: CustomerId,
  agreementId: Schema.optional(CommercialAgreementId),
  flow: Schema.optional(BillingPortalFlow),
  returnUrl: Schema.optional(Schema.String)
}) {}

export class ReplayWebhookInput extends Schema.Class<ReplayWebhookInput>("@pay/core/ReplayWebhookInput")({
  provider: PaymentProviderTag,
  providerEventId: ProviderEventId
}) {}

export class ReceiveWebhookInput extends Schema.Class<ReceiveWebhookInput>("@pay/core/ReceiveWebhookInput")({
  /**
   * Provider that produced the webhook request.
   */
  provider: PaymentProviderTag,
  /**
   * Raw webhook request body.
   */
  body: Schema.String,
  /**
   * Provider-specific verification signature header value.
   */
  signature: Schema.String
}) {}

export class ReceiveWebhookResult extends Schema.Class<ReceiveWebhookResult>("@pay/core/ReceiveWebhookResult")({
  /**
   * Fixed workflow name for webhook processing.
   */
  workflow: Schema.Literal("webhook.receive"),
  /**
   * Primary normalized event id returned by the workflow.
   */
  eventId: CommercialEventId,
  /**
   * Provider-native event id used for idempotency.
   */
  providerEventId: ProviderEventId,
  /**
   * Whether the webhook was accepted into the commercial runtime.
   */
  accepted: Schema.Boolean,
  /**
   * All normalized events derived from the provider payload.
   */
  normalizedEvents: Schema.Array(CommercialEvent),
  /**
   * Follow-up reconciliation work produced by the webhook.
   */
  reconciliationTriggers: Schema.Array(CommercialReconciliationTrigger)
}) {}

export class RefreshCustomerSnapshotInput extends Schema.Class<RefreshCustomerSnapshotInput>(
  "@pay/core/RefreshCustomerSnapshotInput"
)({
  /**
   * Customer whose read-side snapshot should be recomputed.
   */
  customerId: CustomerId,
  /**
   * Trigger cause for the recomputation.
   */
  reason: Schema.Literal(
    "checkout_completed",
    "subscription_updated",
    "transaction_updated",
    "refund_updated",
    "manual"
  )
}) {}

export class WorkflowReceipt extends Schema.Class<WorkflowReceipt>("@pay/core/WorkflowReceipt")({
  /**
   * Workflow that produced the receipt.
   */
  workflow: WorkflowName,
  /**
   * Stages completed during this workflow run.
   */
  stages: Schema.Array(WorkflowStage),
  /**
   * Command-side intent when the workflow creates or mutates one.
   */
  intent: Schema.optional(CommercialIntent),
  /**
   * Normalized events emitted during the workflow.
   */
  events: Schema.Array(CommercialEvent),
  /**
   * Downstream read-side work implied by the workflow.
   */
  reconciliationTriggers: Schema.Array(CommercialReconciliationTrigger)
}) {}

export class CommercialWorkflowConflict extends Schema.TaggedError<CommercialWorkflowConflict>()(
  "CommercialWorkflowConflict",
  {
    /**
     * Workflow that detected the conflict.
     */
    workflow: WorkflowName,
    /**
     * Human-readable explanation of the conflict.
     */
    message: Schema.String
  }
) {}

export class CommercialWebhookRejected extends Schema.TaggedError<CommercialWebhookRejected>()(
  "CommercialWebhookRejected",
  {
    /**
     * Provider whose webhook was rejected.
     */
    provider: PaymentProviderTag,
    /**
     * Human-readable rejection reason.
     */
    message: Schema.String
  }
) {}

/**
 * Public schema surface for application/API consumers.
 *
 * Provider adapter schemas live under `src/internal` or provider `internal`
 * folders and should not be imported by client-facing code.
 */

export {
  CustomerEmail,
  CustomerId,
  BillingPortalFlow,
  SubscriptionCancelTiming,
  SubscriptionChangeProrationMode,
  SubscriptionMutationMode,
  SubscriptionPreviewProrationMode
} from "./core/common-schema.ts"

export { BillingPortalSession, SubscriptionChangePreview } from "./core/session-schema.ts"

export {
  AgreementLifecycleStatus,
  BenefitResetInterval,
  CommercialAgreementId,
  CommercialAgreementNotFound,
  CommercialAgreementType,
  CommercialBenefit,
  CommercialBenefitId,
  CommercialBenefitType,
  CommercialCatalog,
  CommercialCatalogIssue,
  CommercialCheckoutTarget,
  CommercialCustomerNotFound,
  CommercialCustomerProfile,
  CommercialEvent,
  CommercialEventId,
  CommercialEventKind,
  CommercialIntent,
  CommercialIntentId,
  CommercialIntentStatus,
  CommercialOffer,
  CommercialOfferId,
  CommercialOfferNotFound,
  CommercialProduct,
  CommercialProductId,
  CommercialProductType,
  CreditBalanceBenefit,
  CreditsLedgerEntryId,
  CreditsWalletState,
  CustomerCommercialSnapshot,
  CustomerEntitlementSnapshot,
  FeatureFlagBenefit,
  LicenseGrantBenefit,
  ProviderEventId,
  PurchaseGrantState,
  QuotaLimitBenefit,
  SubscriptionAgreementState,
  WalletBalancePolicy
} from "./core/commercial-schema.ts"

export {
  CancelSubscriptionInput,
  ChangeSubscriptionInput,
  CommercialReconciliationTrigger,
  CommercialWebhookRejected,
  CommercialWorkflowConflict,
  CreatePortalSessionInput,
  CreditConsumeInput,
  CreditGrantInput,
  CreditWalletResult,
  PauseSubscriptionInput,
  PrepareCheckoutInput,
  PreviewSubscriptionChangeInput,
  ReceiveWebhookInput,
  ReceiveWebhookResult,
  RefreshCustomerSnapshotInput,
  RefundPurchaseInput,
  ReplayWebhookInput,
  ResumeSubscriptionInput,
  StartCheckoutInput,
  StartCheckoutResult,
  WorkflowName,
  WorkflowReceipt,
  WorkflowStage
} from "./core/workflow-schema.ts"

import type { PaymentProviderTag } from "../provider/type.ts"
import type { BillingPortalFlow, SubscriptionMutationMode } from "./common-schema.ts"
import type { CreatePortalSessionInput, PauseSubscriptionInput, ResumeSubscriptionInput } from "./workflow-schema.ts"

const quote = (value: string) => `"${value}"`

export const resolvePauseMode = (input: {
  readonly provider: PaymentProviderTag
  readonly request: PauseSubscriptionInput
}): SubscriptionMutationMode => input.request.mode ?? (input.provider === "stripe" ? "billing_collection" : "lifecycle")

export const resolveResumeMode = (input: {
  readonly provider: PaymentProviderTag
  readonly request: ResumeSubscriptionInput
}): SubscriptionMutationMode => input.request.mode ?? (input.provider === "stripe" ? "billing_collection" : "lifecycle")

export const explainUnsupportedPause = (input: {
  readonly provider: PaymentProviderTag
  readonly request: PauseSubscriptionInput
}): string | undefined => {
  const { provider, request } = input
  const mode = resolvePauseMode(input)

  if (provider === "stripe") {
    if (mode !== "billing_collection") {
      return `Provider ${quote(provider)} only supports subscription.pause with mode=${quote("billing_collection")}`
    }

    if (request.effectiveAt === "period_end") {
      return `Provider ${quote(provider)} starts billing_collection pause immediately and does not support effectiveAt=${quote("period_end")}`
    }

    return undefined
  }

  if (mode !== "lifecycle") {
    return `Provider ${quote(provider)} only supports subscription.pause with mode=${quote("lifecycle")}`
  }

  return undefined
}

export const explainUnsupportedResume = (input: {
  readonly provider: PaymentProviderTag
  readonly request: ResumeSubscriptionInput
}): string | undefined => {
  const { provider, request } = input
  const mode = resolveResumeMode(input)

  if (provider === "stripe") {
    if (mode === "billing_collection") {
      if (typeof request.effectiveAt !== "undefined" && request.effectiveAt !== "immediately") {
        return `Provider ${quote(provider)} only supports immediate billing_collection resume`
      }

      return undefined
    }

    return undefined
  }

  if (mode !== "lifecycle") {
    return `Provider ${quote(provider)} only supports subscription.resume with mode=${quote("lifecycle")}`
  }

  return undefined
}

export const explainUnsupportedPortalFlow = (input: {
  readonly provider: PaymentProviderTag
  readonly request: CreatePortalSessionInput
  readonly hasProviderSubscriptionId: boolean
}): string | undefined => {
  const { provider, request, hasProviderSubscriptionId } = input
  const flow: BillingPortalFlow = request.flow ?? "general"

  if (provider === "stripe") {
    if ((flow === "subscription_cancel" || flow === "subscription_update") && !hasProviderSubscriptionId) {
      return `Provider ${quote(provider)} requires agreementId with a provider subscription for portal flow ${quote(flow)}`
    }

    return undefined
  }

  if (flow === "subscription_update") {
    return `Provider ${quote(provider)} does not support portal flow ${quote(flow)}; use subscription.change and a general portal session instead`
  }

  if ((flow === "payment_method_update" || flow === "subscription_cancel") && !hasProviderSubscriptionId) {
    return `Provider ${quote(provider)} requires agreementId with a provider subscription for portal flow ${quote(flow)}`
  }

  return undefined
}

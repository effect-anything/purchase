import { expect } from "@effect/vitest"
import * as Either from "effect/Either"

import type {
  AccountOverview,
  CatalogOverview,
  CheckoutAttemptResult,
  CheckoutStartResult,
  CreditWalletOverview,
  DurableCommercialState,
  SubscriptionPurchaseResult
} from "./harness.ts"

export const expectCatalogExposesCommercialOffers = (
  catalog: CatalogOverview,
  input: {
    readonly offers: ReadonlyArray<{
      readonly offerId: string
      readonly productId: string
      readonly type: string
    }>
  }
) => {
  expect(catalog.provider).toBe("paddle")

  for (const offer of input.offers) {
    expect(catalog.catalog.offers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: offer.offerId,
          productId: offer.productId,
          type: offer.type
        })
      ])
    )
  }
}

export const expectCheckoutCanReconnectProviderCompletion = (
  checkout: CheckoutStartResult,
  input: {
    readonly offerId: string
  }
) => {
  expect(checkout.offerId).toBe(input.offerId)
  expect(checkout.intentId.length).toBeGreaterThan(0)
  expect(checkout.sessionId.length).toBeGreaterThan(0)
  expect(checkout.url).toEqual(expect.stringMatching(/^https?:\/\//))
}

export const expectNoPaidSubscriptionAccess = (
  account: AccountOverview,
  input: {
    readonly offerId: string
    readonly benefitKeys: ReadonlyArray<string>
  }
) => {
  expect(account.snapshot?.activeOfferIds ?? []).not.toContain(input.offerId)

  const benefitKeys = account.entitlements?.benefits?.map((benefit) => benefit.key) ?? []
  for (const benefitKey of input.benefitKeys) {
    expect(benefitKeys).not.toContain(benefitKey)
  }
}

export const expectCheckoutStartedWithoutPaidAccess = (
  checkout: CheckoutStartResult,
  account: AccountOverview,
  input: {
    readonly offerId: string
    readonly benefitKeys: ReadonlyArray<string>
  }
) => {
  expectCheckoutCanReconnectProviderCompletion(checkout, input)
  expectNoPaidSubscriptionAccess(account, input)
}

export const expectSignupCheckoutStartedWithoutPaidAccess = (
  result: CheckoutAttemptResult,
  input: {
    readonly offerId: string
    readonly benefitKeys: ReadonlyArray<string>
  }
) => {
  expectCheckoutStartedWithoutPaidAccess(result.checkout, result.account, input)
}

export const expectCheckoutRejected = (result: Either.Either<CheckoutStartResult, unknown>) => {
  expect(Either.isLeft(result)).toBe(true)
}

export const expectNoCheckoutActivity = (
  account: AccountOverview,
  input: {
    readonly offerId: string
  }
) => {
  expect(account.activity?.checkoutIntents?.some((intent) => intent.offerId === input.offerId)).toBe(false)
  expect(account.activity?.events?.some((event) => event.offerId === input.offerId)).toBe(false)
}

export const expectNoDurableCheckoutIntent = (
  durable: DurableCommercialState,
  input: {
    readonly offerId: string
  }
) => {
  expect(durable.checkoutIntents.some((intent) => intent.offerId === input.offerId)).toBe(false)
}

export const expectUnknownOfferCheckoutDeniedWithoutLocalState = (
  result: Either.Either<CheckoutStartResult, unknown>,
  account: AccountOverview,
  durable: DurableCommercialState,
  input: {
    readonly offerId: string
  }
) => {
  expectCheckoutRejected(result)
  expectNoCheckoutActivity(account, input)
  expectNoDurableCheckoutIntent(durable, input)
}

export const expectCustomerHasActiveSubscription = (
  account: AccountOverview,
  input: {
    readonly offerId: string
    readonly customerEmail: string
    readonly enabledBenefits: ReadonlyArray<string>
    readonly quotaBenefits: ReadonlyArray<{
      readonly key: string
      readonly limit: number
    }>
  }
) => {
  expect(account.user?.email).toBe(input.customerEmail)
  expect(account.snapshot?.activeOfferIds).toContain(input.offerId)
  expect(account.snapshot?.subscriptions).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        offerId: input.offerId,
        status: "active"
      })
    ])
  )

  for (const benefitKey of input.enabledBenefits) {
    expect(account.entitlements?.benefits).toEqual(
      expect.arrayContaining([expect.objectContaining({ key: benefitKey, enabled: true })])
    )
  }

  for (const benefit of input.quotaBenefits) {
    expect(account.entitlements?.benefits).toEqual(
      expect.arrayContaining([expect.objectContaining({ key: benefit.key, limit: benefit.limit })])
    )
  }
}

export const expectDurableSubscriptionAcquisition = (
  durable: DurableCommercialState,
  input: {
    readonly offerId: string
    readonly customerId: string | undefined
    readonly checkoutSessionId: string
    readonly enabledBenefits: ReadonlyArray<string>
  }
) => {
  expect(durable.checkoutIntents).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        offerId: input.offerId,
        provider: "paddle",
        providerCheckoutSessionId: input.checkoutSessionId,
        status: "accepted"
      })
    ])
  )
  expect(durable.webhookReceipts.some((receipt) => receipt.status === "processed")).toBe(true)
  expect(durable.commercialEvents).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ provider: "paddle", kind: "transaction_updated", offerId: input.offerId }),
      expect.objectContaining({ provider: "paddle", kind: "subscription_updated", offerId: input.offerId })
    ])
  )
  expect(durable.subscriptions).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        customerId: input.customerId,
        status: "active"
      })
    ])
  )
  expect(durable.invoices.some((invoice) => invoice.status === "paid")).toBe(true)

  for (const benefitKey of input.enabledBenefits) {
    expect(durable.entitlements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          customerId: input.customerId,
          featureId: benefitKey
        })
      ])
    )
  }

  expect(durable.providerRefs).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        provider: "paddle",
        ownerType: "subscription",
        kind: "subscription"
      })
    ])
  )
}

export const expectWalletBalance = (
  wallet: CreditWalletOverview,
  input: {
    readonly acquired: number
    readonly consumed: number
    readonly available: number
  }
) => {
  expect(wallet.acquired).toBe(input.acquired)
  expect(wallet.consumed).toBe(input.consumed)
  expect(wallet.available).toBe(input.available)
}

export const expectAccountWalletBalance = (
  account: AccountOverview,
  input: {
    readonly creditKey: string
    readonly acquired: number
    readonly consumed: number
    readonly available: number
  }
) => {
  expect(account.snapshot?.wallets).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        productId: input.creditKey,
        acquired: input.acquired,
        consumed: input.consumed,
        available: input.available
      })
    ])
  )
}

export const expectAccountHasNoWallet = (
  account: AccountOverview,
  input: {
    readonly creditKey: string
  }
) => {
  expect(account.snapshot?.wallets?.some((wallet) => wallet.productId === input.creditKey)).toBe(false)
}

export const expectCreditConsumeRejected = (result: Either.Either<CreditWalletOverview, unknown>) => {
  expect(Either.isLeft(result)).toBe(true)
}

export const expectCreditSpendDeniedWithoutBalanceChange = (
  account: AccountOverview,
  result: Either.Either<CreditWalletOverview, unknown>,
  input: {
    readonly creditKey: string
  }
) => {
  expectCreditConsumeRejected(result)
  expectAccountHasNoWallet(account, input)
  expect(account.activity?.creditLedger?.some((entry) => entry.productId === input.creditKey)).toBe(false)
}

export const expectNoCreditLedgerActivity = (
  durable: DurableCommercialState,
  input: {
    readonly creditKey: string
  }
) => {
  expect(durable.creditLedger.some((entry) => entry.productId === input.creditKey)).toBe(false)
}

export const expectDurableCreditLedger = (
  durable: DurableCommercialState,
  input: {
    readonly customerId: string | undefined
    readonly creditKey: string
    readonly amount: number
    readonly direction: "grant" | "consume" | "refund"
  }
) => {
  expect(durable.creditLedger).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        customerId: input.customerId,
        productId: input.creditKey,
        amount: input.amount,
        direction: input.direction
      })
    ])
  )
}

export const expectCustomerSnapshotIsolated = (
  account: AccountOverview,
  input: {
    readonly customerEmail: string
    readonly forbiddenOfferIds: ReadonlyArray<string>
  }
) => {
  expect(account.user?.email).toBe(input.customerEmail)
  for (const offerId of input.forbiddenOfferIds) {
    expect(account.snapshot?.activeOfferIds ?? []).not.toContain(offerId)
    expect(account.activity?.checkoutIntents?.some((intent) => intent.offerId === offerId)).toBe(false)
    expect(account.activity?.events?.some((event) => event.offerId === offerId)).toBe(false)
  }
}

export const expectWebhookReceiptDiagnostics = (
  durable: DurableCommercialState,
  input: {
    readonly status?: string | undefined
    readonly eventTypes?: ReadonlyArray<string> | undefined
  } = {}
) => {
  if (input.status) {
    expect(durable.webhookReceipts).toEqual(expect.arrayContaining([expect.objectContaining({ status: input.status })]))
  }

  for (const eventType of input.eventTypes ?? []) {
    expect(durable.webhookReceipts).toEqual(expect.arrayContaining([expect.objectContaining({ type: eventType })]))
  }
}

export const expectCompletedSubscriptionAcquisition = (
  result: SubscriptionPurchaseResult,
  input: {
    readonly offerId: string
    readonly customerEmail: string
    readonly enabledBenefits: ReadonlyArray<string>
    readonly quotaBenefits: ReadonlyArray<{
      readonly key: string
      readonly limit: number
    }>
  }
) => {
  expect(result.checkout.offerId).toBe(input.offerId)
  expect(result.checkout.intentId.length).toBeGreaterThan(0)
  expect(result.checkout.sessionId.length).toBeGreaterThan(0)
  expect(result.checkout.url).toEqual(expect.stringMatching(/^https?:\/\//))
  expect(["paid", "completed"]).toContain(result.transaction.status)

  expectCustomerHasActiveSubscription(result.account, input)
  expectDurableSubscriptionAcquisition(result.durable, {
    offerId: input.offerId,
    customerId: result.account.user?.id,
    checkoutSessionId: result.checkout.sessionId,
    enabledBenefits: input.enabledBenefits
  })
}

import type {
  CommercialCatalog,
  CustomerCommercialSnapshot,
  CustomerEntitlementSnapshot
} from "@effect-x/purchase/schema"

import * as SqlClient from "@effect/sql/SqlClient"
import * as Effect from "effect/Effect"

import { Pay } from "../purchase.ts"
import { getActiveProvider, getAppBaseUrl, runWithActivePurchaseRuntime } from "./purchase-runtime.ts"

export type AuthenticatedUser = {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly workspaceSlug: string
  readonly creditsUsed: number
}

const asCustomerId = (customerId: string) => customerId as unknown as CustomerCommercialSnapshot["customerId"]

const formatBenefitValue = (benefit: CustomerEntitlementSnapshot["benefits"][number]) =>
  benefit.type === "credit_balance"
    ? String(benefit.amount)
    : benefit.type === "quota_limit"
      ? String(benefit.limit)
      : benefit.type === "feature_flag"
        ? benefit.enabled
          ? "Enabled"
          : "Disabled"
        : "Granted"

export async function loadUserCommerce(user: AuthenticatedUser) {
  return runWithActivePurchaseRuntime(
    Effect.gen(function* () {
      const sdk = yield* Pay
      const customerId = asCustomerId(user.id)
      const snapshot = yield* sdk.customer.getSnapshot({ customerId })
      const entitlements = yield* sdk.customer.getEntitlements({ customerId })

      return {
        provider: getActiveProvider(),
        snapshot,
        entitlements
      } as const
    })
  )
}

export async function startUserCheckout(input: { readonly user: AuthenticatedUser; readonly offerId: string }) {
  return runWithActivePurchaseRuntime(
    Effect.gen(function* () {
      const sdk = yield* Pay
      const checkout = yield* sdk.checkout.start({
        customerId: asCustomerId(input.user.id),
        offerId: input.offerId as never,
        successUrl: `${getAppBaseUrl()}/account?checkout=success&offer=${encodeURIComponent(input.offerId)}`,
        cancelUrl: `${getAppBaseUrl()}/account?checkout=cancelled&offer=${encodeURIComponent(input.offerId)}`,
        metadata: {
          source: "nextjs-app",
          workspaceSlug: input.user.workspaceSlug,
          authUserId: input.user.id
        }
      })
      return checkout
    })
  )
}

export async function syncCatalogProjection() {
  return runWithActivePurchaseRuntime(
    Effect.gen(function* () {
      const sdk = yield* Pay
      return yield* sdk.catalog.sync({ dryRun: false })
    })
  )
}

export async function loadCommercialCatalog(): Promise<CommercialCatalog> {
  await syncCatalogProjection()

  return runWithActivePurchaseRuntime(
    Effect.gen(function* () {
      const sdk = yield* Pay
      return yield* sdk.catalog.getCatalog()
    })
  )
}

export async function consumeUserCredits(input: {
  readonly user: AuthenticatedUser
  readonly amount: number
  readonly reason: string
}) {
  return runWithActivePurchaseRuntime(
    Effect.gen(function* () {
      const sdk = yield* Pay
      return yield* sdk.credits.consume({
        customerId: asCustomerId(input.user.id),
        creditKey: "ai_credits",
        amount: input.amount,
        idempotencyKey: `${input.user.id}:${Date.now()}:${input.amount}`,
        reason: input.reason
      })
    })
  )
}

export type UserAccountRows = Awaited<ReturnType<typeof listUserAccountRows>>
export async function listUserAccountRows(user: AuthenticatedUser) {
  return runWithActivePurchaseRuntime(
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient
      const [intents, events, ledger] = yield* Effect.all([
        sql.unsafe<{
          readonly id: string
          readonly offer_id: string
          readonly status: string
          readonly updated_at: string
        }>(
          `SELECT id, offer_id, status, updated_at
           FROM paykit_checkout_intent
           WHERE customer_id = ?
           ORDER BY updated_at DESC
           LIMIT 10`,
          [user.id]
        ).withoutTransform,
        sql.unsafe<{
          readonly id: string
          readonly provider: string
          readonly kind: string
          readonly offer_id: string | null
          readonly occurred_at: string
        }>(
          `SELECT id, provider, kind, offer_id, occurred_at
           FROM paykit_commercial_event
           WHERE customer_id = ?
           ORDER BY occurred_at DESC
           LIMIT 10`,
          [user.id]
        ).withoutTransform,
        sql.unsafe<{
          readonly id: string
          readonly product_id: string
          readonly amount: number
          readonly direction: string
          readonly reason: string | null
          readonly created_at: string
        }>(
          `SELECT id, product_id, amount, direction, reason, created_at
           FROM paykit_credit_ledger
           WHERE customer_id = ?
           ORDER BY created_at DESC
           LIMIT 10`,
          [user.id]
        ).withoutTransform
      ])

      return { intents, events, ledger } as const
    })
  )
}

export const benefitEnabled = (key: string, entitlements: CustomerEntitlementSnapshot) =>
  entitlements.benefits.some((benefit) => benefit.key === key && benefit.type === "feature_flag" && benefit.enabled)

export const benefitLimit = (key: string, entitlements: CustomerEntitlementSnapshot, fallback: number) => {
  const benefit = entitlements.benefits.find((item) => item.key === key && item.type === "quota_limit")
  return benefit && "limit" in benefit ? benefit.limit : fallback
}

export const walletAmount = (key: string, entitlements: CustomerEntitlementSnapshot) => {
  const benefit = entitlements.benefits.find((item) => item.key === key && item.type === "credit_balance")
  return benefit && "amount" in benefit ? benefit.amount : 0
}

export const entitlementRows = (entitlements: CustomerEntitlementSnapshot) =>
  entitlements.benefits.map((benefit) => ({
    id: benefit.id,
    key: benefit.key,
    type: benefit.type,
    value: formatBenefitValue(benefit)
  }))

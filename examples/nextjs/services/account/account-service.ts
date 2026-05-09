import type { CustomerCommercialSnapshot, CustomerEntitlementSnapshot } from "@effect-x/purchase/schema"

import { CustomerId } from "@effect-x/purchase/schema"
import { SqlClient } from "@effect/sql"
import { Context, Effect, Layer } from "effect"

import type { AuthenticatedUser } from "../authenticated-user.ts"

import { Pay } from "../../purchase.ts"
import { CustomerSyncService } from "../customer-sync-service.ts"
import { makeAccountOverview, type AccountActivity, type AccountOverview } from "./account-domain.ts"

export class AccountService extends Context.Tag("AccountService")<
  AccountService,
  {
    readonly loadCommerce: (user: AuthenticatedUser) => Effect.Effect<
      {
        readonly snapshot: CustomerCommercialSnapshot
        readonly entitlements: CustomerEntitlementSnapshot
      },
      unknown
    >
    readonly listActivity: (user: AuthenticatedUser) => Effect.Effect<AccountActivity, unknown>
    readonly loadOverview: (user: AuthenticatedUser) => Effect.Effect<AccountOverview, unknown>
  }
>() {
  static Default = Layer.effect(
    AccountService,
    Effect.gen(function* () {
      const sdk = yield* Pay
      const sql = yield* SqlClient.SqlClient
      const customerSync = yield* CustomerSyncService

      const loadCommerce = Effect.fn(function* (user: AuthenticatedUser) {
        yield* customerSync.ensureCustomer(user)
        const customerId = CustomerId.make(user.id)
        const snapshot = yield* sdk.customer.getSnapshot({ customerId })
        const entitlements = yield* sdk.customer.getEntitlements({ customerId })

        return { snapshot, entitlements } as const
      })

      const listActivity = Effect.fn(function* (user: AuthenticatedUser) {
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

        return {
          checkoutIntents: intents.map((intent) => ({
            id: intent.id,
            offerId: intent.offer_id,
            status: intent.status,
            updatedAt: intent.updated_at
          })),
          events: events.map((event) => ({
            id: event.id,
            provider: event.provider,
            kind: event.kind,
            offerId: event.offer_id,
            occurredAt: event.occurred_at
          })),
          creditLedger: ledger.map((entry) => ({
            id: entry.id,
            productId: entry.product_id,
            amount: entry.amount,
            direction: entry.direction,
            reason: entry.reason,
            createdAt: entry.created_at
          }))
        } satisfies AccountActivity
      })

      const loadOverview = Effect.fn(function* (user: AuthenticatedUser) {
        const [{ snapshot, entitlements }, activity] = yield* Effect.all([loadCommerce(user), listActivity(user)])

        return makeAccountOverview({
          user,
          snapshot,
          entitlements,
          activity
        })
      })

      return {
        loadCommerce,
        listActivity,
        loadOverview
      }
    })
  )
}

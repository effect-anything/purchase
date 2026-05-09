import { CustomerCommercialSnapshot, CustomerEntitlementSnapshot } from "@effect-x/purchase/schema"
import { Schema } from "effect"

import type { AuthenticatedUser } from "../authenticated-user.ts"

import { AuthenticatedUserSchema } from "../authenticated-user.ts"

export type AccountActivity = {
  readonly checkoutIntents: ReadonlyArray<{
    readonly id: string
    readonly offerId: string
    readonly status: string
    readonly updatedAt: string
  }>
  readonly events: ReadonlyArray<{
    readonly id: string
    readonly provider: string
    readonly kind: string
    readonly offerId: string | null
    readonly occurredAt: string
  }>
  readonly creditLedger: ReadonlyArray<{
    readonly id: string
    readonly productId: string
    readonly amount: number
    readonly direction: string
    readonly reason: string | null
    readonly createdAt: string
  }>
}

export type AccountOverview = {
  readonly customer: {
    readonly id: string
    readonly email: string
    readonly name: string
    readonly workspaceSlug: string
  }
  readonly snapshot: CustomerCommercialSnapshot
  readonly entitlements: CustomerEntitlementSnapshot
  readonly activity: AccountActivity
}

export const AccountActivitySchema = Schema.Struct({
  checkoutIntents: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      offerId: Schema.String,
      status: Schema.String,
      updatedAt: Schema.String
    })
  ),
  events: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      provider: Schema.String,
      kind: Schema.String,
      offerId: Schema.NullOr(Schema.String),
      occurredAt: Schema.String
    })
  ),
  creditLedger: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      productId: Schema.String,
      amount: Schema.Number,
      direction: Schema.String,
      reason: Schema.NullOr(Schema.String),
      createdAt: Schema.String
    })
  )
})

export const AccountOverviewSchema = Schema.Struct({
  customer: AuthenticatedUserSchema.pipe(Schema.omit("creditsUsed")),
  snapshot: CustomerCommercialSnapshot,
  entitlements: CustomerEntitlementSnapshot,
  activity: AccountActivitySchema
})

export const makeAccountOverview = (input: {
  readonly user: AuthenticatedUser
  readonly snapshot: CustomerCommercialSnapshot
  readonly entitlements: CustomerEntitlementSnapshot
  readonly activity: AccountActivity
}): AccountOverview => ({
  customer: {
    id: input.user.id,
    email: input.user.email,
    name: input.user.name,
    workspaceSlug: input.user.workspaceSlug
  },
  snapshot: input.snapshot,
  entitlements: input.entitlements,
  activity: input.activity
})

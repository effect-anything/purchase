import { Effect } from "effect"

import type { AuthenticatedUser } from "../authenticated-user.ts"

import * as Next from "../../lib/nextjs/server-effect.ts"
import { AccountService } from "./account-service.ts"

export const loadUserCommerce = Next.cachedServerFunction((user: AuthenticatedUser) =>
  Effect.gen(function* () {
    const account = yield* AccountService
    return yield* account.loadCommerce(user)
  })
)

export const loadUserAccountOverview = Next.cachedServerFunction((user: AuthenticatedUser) =>
  Effect.gen(function* () {
    const account = yield* AccountService
    return yield* account.loadOverview(user)
  })
)

export type UserAccountOverview = Awaited<ReturnType<typeof loadUserAccountOverview>>

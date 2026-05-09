import { Effect } from "effect"

import type { AuthenticatedUser } from "../authenticated-user.ts"

import * as Next from "../../lib/nextjs/server-effect.ts"
import { CreditsService } from "./credits-service.ts"

export const consumeUserCredits = Next.serverFunction(
  (input: { readonly user: AuthenticatedUser; readonly amount: number; readonly reason: string }) =>
    Effect.gen(function* () {
      const credits = yield* CreditsService
      return yield* credits.consume(input)
    })
)

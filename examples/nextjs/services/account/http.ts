import { HttpApiBuilder } from "@effect/platform"
import { Effect, Layer } from "effect"

// import {
//   consumeUserCredits,
//   listUserAccountRows,
//   loadCommercialCatalog,
//   loadUserCommerce,
//   processWebhook,
//   startUserCheckout
// } from "./app-runtime.ts"
// import { getSession, sessionUser } from "./auth-session.ts"
import { AuthenticationRequired, MissingOfferId } from "../../errors.ts"
import { AppApi } from "../api/http-api.ts"
// import { getActiveProvider, getPurchaseEnvironment } from "./runtime"

export const AccountHttpApiLive = HttpApiBuilder.group(AppApi, "account", (handlers) =>
  handlers.handle("get", () =>
    Effect.gen(function* () {
      // const session = yield* Effect.tryPromise(() => getSession()).pipe(
      //   Effect.flatMap((value) =>
      //     value
      //       ? Effect.succeed(value)
      //       : Effect.fail(new AuthenticationRequired({ message: "Authentication required." }))
      //   )
      // )
      // const user = sessionUser(session)
      // const [commerce, rows] = yield* Effect.all([loadUserCommerce(user), listUserAccountRows(user)])

      return {
        // environment: getPurchaseEnvironment(),
        // provider: getActiveProvider(),
        // customer: {
        //   id: user.id,
        //   email: user.email,
        //   name: user.name,
        //   workspaceSlug: user.workspaceSlug
        // },
        // snapshot: commerce.snapshot,
        // entitlements: commerce.entitlements,
        // activity: {
        //   checkoutIntents: rows.intents.map((intent) => ({
        //     id: intent.id,
        //     offerId: intent.offer_id,
        //     status: intent.status,
        //     updatedAt: intent.updated_at
        //   })),
        //   events: rows.events.map((event) => ({
        //     id: event.id,
        //     provider: event.provider,
        //     kind: event.kind,
        //     offerId: event.offer_id,
        //     occurredAt: event.occurred_at
        //   })),
        //   creditLedger: rows.ledger.map((entry) => ({
        //     id: entry.id,
        //     productId: entry.product_id,
        //     amount: entry.amount,
        //     direction: entry.direction,
        //     reason: entry.reason,
        //     createdAt: entry.created_at
        //   }))
      } as any
    })
  )
)

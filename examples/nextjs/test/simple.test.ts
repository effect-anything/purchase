import { it, expect } from "@effect/vitest"
import { Effect } from "effect"

import type { CreditsConflict, ProviderNotConfigured } from "../errors.ts"

import { ApiClient, HttpApiTesting, signUpTestUser } from "./api-utils.ts"

it.layer(HttpApiTesting)("http api", (it) => {
  it.scoped("returns catalog and anonymous auth session", () =>
    Effect.gen(function* () {
      const client = yield* ApiClient
      const auth = yield* client.auth.get({})
      const catalog = yield* client.catalog.get({})

      expect(auth.session).toBeNull()
      expect(catalog.environment).toBe("sandbox")
      expect(catalog.provider).toBe("paddle")
      expect(catalog.catalog.products.length).toBeGreaterThan(0)
    })
  )

  it.scoped("returns authenticated account and surfaces provider config issues explicitly", () =>
    Effect.gen(function* () {
      yield* signUpTestUser()

      const client = yield* ApiClient
      const account = yield* client.account.get({})
      const catalog = yield* client.catalog.get({})
      const purchasableOffer = catalog.catalog.products
        .flatMap((product) => product.offers)
        .find((offer) => offer.priceAmount !== undefined)

      expect(account.customer.email).toContain("@example.com")
      expect(account.snapshot).toBeDefined()
      expect(account.activity.checkoutIntents).toEqual([])

      expect(purchasableOffer).toBeTruthy()

      const checkout = yield* client.checkout
        .start({
          payload: {
            offerId: purchasableOffer!.id
          }
        })
        .pipe(
          Effect.matchEffect({
            onSuccess: () => Effect.fail(new Error("Expected provider configuration failure for checkout.")),
            onFailure: (error) =>
              error._tag === "ProviderNotConfigured"
                ? Effect.succeed(error as ProviderNotConfigured)
                : Effect.fail(error)
          })
        )

      expect(checkout._tag).toBe("ProviderNotConfigured")
      expect(checkout.message.length).toBeGreaterThan(0)

      const credits = yield* client.credits
        .consume({
          payload: {
            amount: 25,
            reason: "HTTP demo test"
          }
        })
        .pipe(
          Effect.matchEffect({
            onSuccess: () => Effect.fail(new Error("Expected credits conflict for empty wallet.")),
            onFailure: (error) =>
              error._tag === "CreditsConflict" ? Effect.succeed(error as CreditsConflict) : Effect.fail(error)
          })
        )

      expect(credits._tag).toBe("CreditsConflict")
      expect(credits.workflow).toBe("credits.consume")
      expect(credits.message).toContain("Insufficient credits")
    })
  )
})

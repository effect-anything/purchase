import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"

import { BillingPortalSession, SubscriptionChangePreview } from "../src/core/session-schema.ts"

describe("core session schema", () => {
  it.effect("decodes a billing portal session", () =>
    Effect.gen(function* () {
      const session = yield* BillingPortalSession.decode({
        id: "bps_123",
        flow: "general",
        provider: "stripe",
        environment: "sandbox",
        providerCustomerId: "cus_123",
        providerSubscriptionId: null,
        url: "https://billing.test/session",
        createdAt: "2025-01-01T00:00:00.000Z"
      })

      expect(session.provider).toBe("stripe")
      expect(session.flow).toBe("general")
    })
  )

  it.effect("decodes a subscription change preview with nullable charges", () =>
    Effect.gen(function* () {
      const preview = yield* SubscriptionChangePreview.decode({
        subscriptionId: "sub_123",
        currencyCode: "usd",
        items: [{ priceId: "price_123", productId: "prod_123", quantity: 1 }],
        immediateCharge: null,
        nextCharge: {
          subtotal: "1000",
          tax: "0",
          total: "1000",
          currencyCode: "usd",
          billingPeriod: null,
          lineItems: []
        },
        recurringCharge: null
      })

      expect(preview.subscriptionId).toBe("sub_123")
      expect(preview.nextCharge?.total).toBe("1000")
      expect(preview.immediateCharge).toBeUndefined()
    })
  )
})

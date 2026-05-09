import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import { Stripe } from "stripe"

import { makePaddleWebhookSignature } from "./fixtures/paddle.ts"
import { makePaddleProvider, makeStripeProvider } from "./support/fixture-providers.ts"
import { loadGeneratedWebhookFixture } from "./support/generated-fixture.ts"
import { paddlePrimaryWebhookEvent, paddleWebhookEvents, stripeWebhookEvents } from "./support/provider-events.ts"

const stripe = new Stripe("sk_test_fixture")

describe("provider webhook replay", () => {
  for (const event of stripeWebhookEvents) {
    it.effect(`replays Stripe ${event.eventType}`, () =>
      Effect.gen(function* () {
        const fixture = loadGeneratedWebhookFixture("stripe", event.eventType)

        expect(
          fixture,
          `Missing generated Stripe fixture at fixtures/generated/stripe/${event.eventType}.json`
        ).toBeDefined()

        if (!fixture) {
          return
        }

        const provider = yield* makeStripeProvider
        const signature = stripe.webhooks.generateTestHeaderString({
          payload: fixture.payload,
          secret: fixture.webhookSecret,
          timestamp: Math.floor(Date.now() / 1000)
        })

        const webhookEvent = yield* provider.webhooksUnmarshal({
          payload: fixture.payload,
          signature
        })
        const normalized = yield* provider.webhooksNormalize(webhookEvent)
        const replayedWebhookEvent = yield* provider.webhooksUnmarshal({
          payload: fixture.payload,
          signature
        })
        const replayedNormalized = yield* provider.webhooksNormalize(replayedWebhookEvent)

        expect(webhookEvent.type).toBe(event.eventType)
        expect(normalized.eventType).toBe(event.eventType)
        expect(replayedNormalized).toMatchObject({
          providerEventId: normalized.providerEventId,
          eventType: normalized.eventType,
          kind: normalized.kind
        })
      })
    )
  }

  for (const event of paddleWebhookEvents) {
    it.effect(`replays Paddle ${event.eventType}`, () =>
      Effect.gen(function* () {
        const fixture = loadGeneratedWebhookFixture("paddle", event.eventType)

        expect(
          fixture,
          `Missing generated Paddle fixture at fixtures/generated/paddle/${event.eventType}.json`
        ).toBeDefined()

        if (!fixture) {
          return
        }

        const provider = yield* makePaddleProvider
        const signature = makePaddleWebhookSignature(
          fixture.payload,
          fixture.webhookSecret,
          Math.floor(Date.now() / 1000)
        )

        const webhookEvent = yield* provider.webhooksUnmarshal({
          payload: fixture.payload,
          signature
        })
        const normalized = yield* provider.webhooksNormalize(webhookEvent)
        const replayedWebhookEvent = yield* provider.webhooksUnmarshal({
          payload: fixture.payload,
          signature
        })
        const replayedNormalized = yield* provider.webhooksNormalize(replayedWebhookEvent)

        expect(webhookEvent.event_type).toBe(event.eventType)
        expect(normalized.eventType).toBe(event.eventType)
        expect(replayedNormalized).toMatchObject({
          providerEventId: normalized.providerEventId,
          eventType: normalized.eventType,
          kind: normalized.kind
        })
      })
    )
  }

  it.effect("rejects expired Paddle webhook signatures", () =>
    Effect.gen(function* () {
      const fixture = loadGeneratedWebhookFixture("paddle", paddlePrimaryWebhookEvent)

      expect(
        fixture,
        `Missing generated Paddle fixture at fixtures/generated/paddle/${paddlePrimaryWebhookEvent}.json`
      ).toBeDefined()

      if (!fixture) {
        return
      }

      const provider = yield* makePaddleProvider
      const signature = makePaddleWebhookSignature(fixture.payload, fixture.webhookSecret, 1)
      const error = yield* Effect.flip(
        provider.webhooksUnmarshal({
          payload: fixture.payload,
          signature
        })
      )

      expect(error._tag).toBe("WebhookUnmarshalError")
    })
  )
})

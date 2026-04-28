import * as Effect from "effect/Effect"
import { writeFileSync } from "node:fs"

import {
  ensureGeneratedFixtureDir,
  generatedFixturePath,
  type StoredWebhookFixture
} from "./support/generated-fixture.ts"
import {
  capturePaddleScenarioWebhook,
  capturePaddleSimulation,
  ensurePaddleNotificationSetting
} from "./support/paddle-simulator.ts"
import { paddleWebhookEvents, stripeWebhookEvents } from "./support/provider-events.ts"
import { captureStripeSubscriptionResumedWebhook, captureStripeWebhook } from "./support/stripe-cli.ts"

type ProviderName = "stripe" | "paddle"

const cliArgs = process.argv.slice(2).filter((value) => value !== "--")
const args = new Set(cliArgs)
const providers: ReadonlyArray<ProviderName> = args.has("--stripe")
  ? ["stripe"]
  : args.has("--paddle")
    ? ["paddle"]
    : ["stripe", "paddle"]

const selectedEvents: ReadonlyArray<string> = (() => {
  const events: Array<string> = []

  for (let index = 0; index < cliArgs.length; index++) {
    if (cliArgs[index] === "--event") {
      const eventType = cliArgs[index + 1]
      if (eventType) {
        events.push(eventType)
      }
      index += 1
    }
  }

  return events
})()

const shouldIncludeEvent = (eventType: string) => selectedEvents.length === 0 || selectedEvents.includes(eventType)

const writeFixture = (name: ProviderName, eventType: string, fixture: StoredWebhookFixture) =>
  Effect.sync(() => {
    ensureGeneratedFixtureDir(name)
    writeFileSync(generatedFixturePath(name, eventType), `${JSON.stringify(fixture, null, 2)}\n`, "utf8")
  })

const refreshStripeEvent = (eventType: string, captureEvent = eventType) =>
  Effect.gen(function* () {
    const eventConfig = stripeWebhookEvents.find((event) => event.eventType === eventType)
    const captured =
      eventConfig?.captureStrategy === "stripe-subscription-resumed"
        ? yield* captureStripeSubscriptionResumedWebhook({
            env: process.env
          })
        : yield* captureStripeWebhook({
            event: captureEvent,
            env: process.env
          })

    yield* writeFixture("stripe", eventType, {
      payload: captured.payload,
      webhookSecret: captured.webhookSecret,
      source: "stripe-cli",
      eventType,
      capturedAt: new Date().toISOString()
    })
  })

const refreshPaddleEvent = (
  eventType: string,
  notificationSetting?: {
    readonly id: string
    readonly webhookSecret: string
  }
) =>
  Effect.gen(function* () {
    const eventConfig = paddleWebhookEvents.find((event) => event.eventType === eventType)
    const captured =
      eventConfig?.captureStrategy === "paddle-subscription-resumed" && eventConfig.captureSimulationType
        ? yield* capturePaddleScenarioWebhook({
            scenarioType: eventConfig.captureSimulationType,
            targetEventType: eventType,
            notificationSettingId: notificationSetting?.id,
            webhookSecret: notificationSetting?.webhookSecret,
            env: process.env
          })
        : yield* capturePaddleSimulation({
            eventType,
            notificationSettingId: notificationSetting?.id,
            webhookSecret: notificationSetting?.webhookSecret,
            env: process.env
          })

    yield* writeFixture("paddle", eventType, {
      payload: captured.payload,
      webhookSecret: captured.webhookSecret,
      source: "paddle-simulator",
      eventType,
      capturedAt: new Date().toISOString()
    })
  })

const program = Effect.gen(function* () {
  if (providers.includes("stripe")) {
    for (const event of stripeWebhookEvents) {
      if (!shouldIncludeEvent(event.eventType)) {
        continue
      }

      yield* Effect.sync(() => {
        console.log(`Refreshing Stripe webhook fixture: ${event.eventType}`)
      })
      yield* refreshStripeEvent(event.eventType, event.captureEvent)
    }
  }

  if (providers.includes("paddle")) {
    const events = paddleWebhookEvents.filter((event) => shouldIncludeEvent(event.eventType))
    const notificationSetting =
      events.length === 0
        ? undefined
        : yield* ensurePaddleNotificationSetting({
            subscribedEvents: events.map((event) => event.eventType),
            env: process.env
          })

    for (const event of events) {
      yield* Effect.sync(() => {
        console.log(`Refreshing Paddle webhook fixture: ${event.eventType}`)
      })
      yield* refreshPaddleEvent(event.eventType, notificationSetting)
    }
  }
}).pipe(
  Effect.tap(() =>
    Effect.sync(() => {
      console.log(`Refreshed provider fixtures in ${ensureGeneratedFixtureDir()}`)
    })
  )
)

Effect.runPromise(Effect.scoped(program)).catch((error) => {
  console.error(error)
  process.exitCode = 1
})

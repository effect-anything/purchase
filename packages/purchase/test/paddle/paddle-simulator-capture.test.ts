import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"

import { Paddle } from "../../src/paddle.ts"
import { PaddleClientLayer, PaddleConfigFromRecord } from "../../src/paddle/internal/paddle-client.ts"
import { capturePaddleSimulation, paddleSimulatorEnabled } from "../support/paddle-simulator.ts"

describe.runIf(() => process.env.PADDLE_LIVE_TESTS === "1" && paddleSimulatorEnabled)(
  "provider-live Paddle simulator capture",
  () => {
    it.effect("captures a simulator-backed Paddle webhook and validates it through the provider", () =>
      Effect.gen(function* () {
        const captured = yield* capturePaddleSimulation({
          eventType: "transaction.paid",
          env: process.env
        })

        const provider = yield* Paddle.make.pipe(
          Effect.provide(
            PaddleClientLayer.pipe(
              Layer.provide(
                PaddleConfigFromRecord({
                  apiToken: Redacted.make(process.env.PADDLE_API_TOKEN ?? "pdl_fixture_token"),
                  webhookToken: Redacted.make(captured.webhookSecret),
                  environment: "sandbox"
                })
              )
            )
          )
        )

        const event = yield* provider.webhooksUnmarshal({
          payload: captured.payload,
          signature: captured.signature
        })

        expect(event.event_type).toBe("transaction.paid")
      })
    )
  }
)

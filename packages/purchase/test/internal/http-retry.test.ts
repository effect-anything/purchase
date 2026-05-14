import * as HttpClientError from "@effect/platform/HttpClientError"
import * as HttpClientRequest from "@effect/platform/HttpClientRequest"
import * as HttpClientResponse from "@effect/platform/HttpClientResponse"
import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Fiber from "effect/Fiber"
import * as TestClock from "effect/TestClock"

import { providerRetryDelayMillis, retryProviderTransient } from "../../src/internal/provider-http-retry.ts"

const request = HttpClientRequest.get("https://provider.example.test/v1/resource")

const responseError = (status: number, headers?: Record<string, string>) =>
  new HttpClientError.ResponseError({
    request,
    response: HttpClientResponse.fromWeb(
      request,
      new Response(
        JSON.stringify({ error: { message: "provider error" } }),
        headers
          ? {
              headers,
              status
            }
          : { status }
      )
    ),
    reason: "StatusCode"
  })

describe("provider http retry", () => {
  it.effect("retries transient 429 responses", () => {
    let calls = 0

    return Effect.gen(function* () {
      const fiber = yield* retryProviderTransient(
        Effect.suspend(() => {
          calls += 1
          return calls < 3 ? Effect.fail(responseError(429)) : Effect.succeed("ok")
        })
      ).pipe(Effect.fork)

      yield* TestClock.adjust("750 millis")
      const result = yield* Fiber.join(fiber)

      expect(result).toBe("ok")
      expect(calls).toBe(3)
    })
  })

  it.effect("does not retry non-transient 4xx responses", () => {
    let calls = 0

    return Effect.gen(function* () {
      const exit = yield* retryProviderTransient(
        Effect.suspend(() => {
          calls += 1
          return Effect.fail(responseError(400))
        })
      ).pipe(Effect.exit)

      expect(exit._tag).toBe("Failure")
      expect(calls).toBe(1)
    })
  })

  it("uses Retry-After seconds before exponential backoff", () => {
    const delay = providerRetryDelayMillis(0, responseError(429, { "retry-after": "2" }))

    expect(delay).toBe(2_000)
  })
})

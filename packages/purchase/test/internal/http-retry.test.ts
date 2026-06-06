import { HttpClientError, HttpClientResponse, HttpClientRequest } from "@effect/platform"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Fiber, TestClock } from "effect"

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
  it.effect(
    "retries transient 429 responses",
    Effect.fn(function* () {
      let calls = 0
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
  )

  it.effect(
    "does not retry non-transient 4xx responses",
    Effect.fn(function* () {
      let calls = 0
      const exit = yield* retryProviderTransient(
        Effect.suspend(() => {
          calls += 1
          return Effect.fail(responseError(400))
        })
      ).pipe(Effect.exit)
      expect(exit._tag).toBe("Failure")
      expect(calls).toBe(1)
    })
  )

  it("uses Retry-After seconds before exponential backoff", () => {
    const delay = providerRetryDelayMillis(0, responseError(429, { "retry-after": "2" }))

    expect(delay).toBe(2_000)
  })
})

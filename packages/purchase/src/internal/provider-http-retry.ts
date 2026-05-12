import type * as HttpClientResponse from "@effect/platform/HttpClientResponse"

import * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientError from "@effect/platform/HttpClientError"
import * as Effect from "effect/Effect"

const transientRetryStatuses = new Set([408, 409, 425, 429, 500, 502, 503, 504])

const maxRetryAfterMillis = 30_000
const maxBackoffMillis = 5_000
const retryAttempts = 4

const parseRetryAfterMillis = (value: string | undefined) => {
  if (!value) {
    return undefined
  }

  const seconds = Number.parseInt(value, 10)
  if (Number.isFinite(seconds) && seconds > 0) {
    return Math.min(seconds * 1_000, maxRetryAfterMillis)
  }

  const dateMillis = Date.parse(value)
  if (!Number.isNaN(dateMillis)) {
    return Math.min(Math.max(dateMillis - Date.now(), 0), maxRetryAfterMillis)
  }

  return undefined
}

export const providerRetryDelayMillis = (attempt: number, error: HttpClientError.HttpClientError) => {
  if (error._tag === "ResponseError") {
    const retryAfterMillis = parseRetryAfterMillis(error.response.headers["retry-after"])
    if (typeof retryAfterMillis === "number") {
      return retryAfterMillis
    }
  }

  return Math.min(2 ** attempt * 250, maxBackoffMillis)
}

const isTransientProviderError = (error: HttpClientError.HttpClientError) =>
  error._tag === "RequestError" || (error._tag === "ResponseError" && transientRetryStatuses.has(error.response.status))

export const retryProviderTransient = <A, E extends HttpClientError.HttpClientError, R>(
  effect: Effect.Effect<A, E, R>
) =>
  Effect.gen(function* () {
    let attempt = 0
    while (true) {
      const result = yield* Effect.either(effect)
      if (result._tag === "Right") {
        return result.right
      }

      if (attempt >= retryAttempts || !isTransientProviderError(result.left)) {
        return yield* Effect.fail(result.left)
      }

      yield* Effect.sleep(providerRetryDelayMillis(attempt, result.left))
      attempt += 1
    }
  })

export const withProviderTransientRetry = <E extends HttpClientError.HttpClientError, R>(
  client: HttpClient.HttpClient.With<E, R>
): HttpClient.HttpClient.With<E, R> => HttpClient.transformResponse(client, retryProviderTransient)

export const failUnexpectedStatus = (
  request: HttpClientResponse.HttpClientResponse["request"],
  response: HttpClientResponse.HttpClientResponse,
  description: string,
  cause?: unknown
) =>
  Effect.fail(
    new HttpClientError.ResponseError({
      request,
      response,
      reason: "StatusCode",
      description,
      cause
    })
  )

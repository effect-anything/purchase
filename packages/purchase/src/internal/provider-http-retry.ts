import type * as HttpClientResponse from "@effect/platform/HttpClientResponse"

import * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientError from "@effect/platform/HttpClientError"
import * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import * as Schedule from "effect/Schedule"

const transientResponseStatuses = new Set([408, 429, 500, 502, 503, 504])

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

const isTransientResponse = (response: HttpClientResponse.HttpClientResponse) =>
  transientResponseStatuses.has(response.status)

const isTransientHttpError = (error: unknown) =>
  HttpClientError.isHttpClientError(error) &&
  ((error._tag === "RequestError" && error.reason === "Transport") ||
    (error._tag === "ResponseError" && isTransientResponse(error.response)))

const isTransientError = (error: unknown) => Cause.isTimeoutException(error) || isTransientHttpError(error)

export const retryProviderTransient = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.retry(effect, {
    while: isTransientError,
    schedule: Schedule.recurs(retryAttempts).pipe(
      Schedule.addDelay((attempt) => Math.min(2 ** attempt * 250, maxBackoffMillis))
    )
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

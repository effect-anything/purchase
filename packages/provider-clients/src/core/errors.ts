import type * as HttpClientResponse from "@effect/platform/HttpClientResponse"

import * as HttpClientError from "@effect/platform/HttpClientError"
import * as Schema from "effect/Schema"

export class ProviderClientParseError extends Schema.TaggedError<ProviderClientParseError>()(
  "ProviderClientParseError",
  {
    provider: Schema.String,
    operation: Schema.String,
    body: Schema.Unknown,
    cause: Schema.Unknown
  }
) {}

export class ProviderClientUnknownError extends Schema.TaggedError<ProviderClientUnknownError>()(
  "ProviderClientUnknownError",
  {
    provider: Schema.String,
    status: Schema.Number,
    message: Schema.optional(Schema.String),
    body: Schema.Unknown
  }
) {}

export const failUnexpectedStatus = (
  request: HttpClientResponse.HttpClientResponse["request"],
  response: HttpClientResponse.HttpClientResponse,
  description: string,
  cause?: unknown
) =>
  new HttpClientError.ResponseError({
    request,
    response,
    reason: "StatusCode",
    description,
    cause
  })

export const formatUnknownBodyMessage = (provider: string, status: number) =>
  `${provider} API request failed with status ${status}`

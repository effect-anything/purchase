import * as Schema from "effect/Schema"

export const StripeErrorBody = Schema.Struct({
  error: Schema.Struct({
    type: Schema.String,
    code: Schema.optional(Schema.String),
    message: Schema.optional(Schema.String),
    param: Schema.optional(Schema.String),
    decline_code: Schema.optional(Schema.String),
    charge: Schema.optional(Schema.String),
    doc_url: Schema.optional(Schema.String),
    request_log_url: Schema.optional(Schema.String)
  })
})
export type StripeErrorBody = typeof StripeErrorBody.Type

export class StripeApiError extends Schema.TaggedError<StripeApiError>()("StripeApiError", {
  type: Schema.String,
  status: Schema.Number,
  code: Schema.optional(Schema.String),
  message: Schema.optional(Schema.String),
  param: Schema.optional(Schema.String),
  declineCode: Schema.optional(Schema.String),
  charge: Schema.optional(Schema.String),
  docUrl: Schema.optional(Schema.String),
  requestLogUrl: Schema.optional(Schema.String),
  body: Schema.Unknown
}) {}

export const matchStripeError = (status: number, body: unknown, message?: string) => {
  const parsed = Schema.decodeUnknownOption(StripeErrorBody)(body)
  if (parsed._tag === "None") {
    return new StripeApiError({
      type: "unknown",
      status,
      message,
      body
    })
  }

  const error = parsed.value.error
  return new StripeApiError({
    type: error.type,
    status,
    code: error.code,
    message: error.message ?? message,
    param: error.param,
    declineCode: error.decline_code,
    charge: error.charge,
    docUrl: error.doc_url,
    requestLogUrl: error.request_log_url,
    body
  })
}

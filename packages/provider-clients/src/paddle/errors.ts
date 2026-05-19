import * as Schema from "effect/Schema"

export const PaddleErrorBody = Schema.Struct({
  error: Schema.Struct({
    type: Schema.optional(Schema.String),
    code: Schema.optional(Schema.String),
    detail: Schema.optional(Schema.String),
    documentation_url: Schema.optional(Schema.String)
  })
})
export type PaddleErrorBody = typeof PaddleErrorBody.Type

export class PaddleApiError extends Schema.TaggedError<PaddleApiError>()("PaddleApiError", {
  status: Schema.Number,
  type: Schema.optional(Schema.String),
  code: Schema.optional(Schema.String),
  message: Schema.optional(Schema.String),
  documentationUrl: Schema.optional(Schema.String),
  body: Schema.Unknown
}) {}

export const matchPaddleError = (status: number, body: unknown, message?: string) => {
  const parsed = Schema.decodeUnknownOption(PaddleErrorBody)(body)
  if (parsed._tag === "None") {
    return new PaddleApiError({
      status,
      message,
      body
    })
  }

  const error = parsed.value.error
  return new PaddleApiError({
    status,
    type: error.type,
    code: error.code,
    message: error.detail ?? message,
    documentationUrl: error.documentation_url,
    body
  })
}

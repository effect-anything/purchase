import * as Schema from "effect/Schema"

export const CreemErrorBody = Schema.Struct({
  message: Schema.optional(Schema.String),
  error: Schema.optional(Schema.String),
  trace_id: Schema.optional(Schema.String)
})

export class CreemApiError extends Schema.TaggedError<CreemApiError>()("CreemApiError", {
  status: Schema.Number,
  message: Schema.optional(Schema.String),
  traceId: Schema.optional(Schema.String),
  body: Schema.Unknown
}) {}

export const matchCreemError = (status: number, body: unknown, message?: string) => {
  const parsed = Schema.decodeUnknownOption(CreemErrorBody)(body)
  return new CreemApiError({
    status,
    message,
    traceId: parsed._tag === "Some" ? parsed.value.trace_id : undefined,
    body
  })
}

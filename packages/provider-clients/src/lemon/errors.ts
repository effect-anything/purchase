import * as Schema from "effect/Schema"

export const LemonErrorBody = Schema.Struct({
  message: Schema.optional(Schema.String),
  error: Schema.optional(Schema.String),
  errors: Schema.optional(Schema.Unknown)
})

export class LemonApiError extends Schema.TaggedError<LemonApiError>()("LemonApiError", {
  status: Schema.Number,
  message: Schema.optional(Schema.String),
  errors: Schema.optional(Schema.Unknown),
  body: Schema.Unknown
}) {}

export const matchLemonError = (status: number, body: unknown, message?: string) => {
  const parsed = Schema.decodeUnknownOption(LemonErrorBody)(body)
  return new LemonApiError({
    status,
    message,
    errors: parsed._tag === "Some" ? parsed.value.errors : undefined,
    body
  })
}

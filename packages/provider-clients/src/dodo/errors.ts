import * as Schema from "effect/Schema"

export const DodoErrorBody = Schema.Struct({
  code: Schema.optional(Schema.String),
  message: Schema.optional(Schema.String)
})

export class DodoApiError extends Schema.TaggedError<DodoApiError>()("DodoApiError", {
  status: Schema.Number,
  code: Schema.optional(Schema.String),
  message: Schema.optional(Schema.String),
  body: Schema.Unknown
}) {}

export const matchDodoError = (status: number, body: unknown, message?: string) => {
  const parsed = Schema.decodeUnknownOption(DodoErrorBody)(body)
  return new DodoApiError({
    status,
    code: parsed._tag === "Some" ? parsed.value.code : undefined,
    message: parsed._tag === "Some" ? (parsed.value.message ?? message) : message,
    body
  })
}

import * as Schema from "effect/Schema"

export const PolarErrorBody = Schema.Struct({
  detail: Schema.optional(Schema.Unknown),
  error: Schema.optional(Schema.String),
  message: Schema.optional(Schema.String)
})

export class PolarApiError extends Schema.TaggedError<PolarApiError>()("PolarApiError", {
  status: Schema.Number,
  message: Schema.optional(Schema.String),
  body: Schema.Unknown
}) {}

export const matchPolarError = (status: number, body: unknown, message?: string) =>
  new PolarApiError({ status, message, body })

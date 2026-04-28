import * as HttpApiSchema from "@effect/platform/HttpApiSchema"
import * as Schema from "effect/Schema"

export class RatelimitError extends Schema.TaggedError<RatelimitError>()(
  "RatelimitError",
  {
    reason: Schema.Literal("RemainingLimitExceeded", "UnknownError"),
    message: Schema.String.pipe(Schema.optionalWith({ default: () => "Too many requests", exact: true })),
    cause: Schema.Defect.pipe(Schema.optional)
  },
  HttpApiSchema.annotations({
    status: 429
  })
) {}

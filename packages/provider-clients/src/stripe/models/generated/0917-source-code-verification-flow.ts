import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SourceCodeVerificationFlow = Schema.Struct({
  attempts_remaining: Schema.Number,
  status: Schema.String
})
export type SourceCodeVerificationFlow = typeof SourceCodeVerificationFlow.Type

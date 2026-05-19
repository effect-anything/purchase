import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TestHelpersTestClock = Schema.Struct({
  created: Schema.Number,
  deletes_after: Schema.Number,
  frozen_time: Schema.Number,
  id: Schema.String,
  livemode: Schema.Boolean,
  name: Schema.NullOr(Schema.String),
  object: Schema.Literal("test_helpers.test_clock"),
  status: Schema.Literal("advancing", "internal_failure", "ready"),
  status_details: Schema.suspend((): typeof Models.BillingClocksResourceStatusDetailsStatusDetails => Models.BillingClocksResourceStatusDetailsStatusDetails),
})
export type TestHelpersTestClock = typeof TestHelpersTestClock.Type

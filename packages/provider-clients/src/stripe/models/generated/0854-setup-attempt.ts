import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SetupAttempt = Schema.Struct({
  application: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Application => Models.Application))),
  attach_to_self: Schema.optional(Schema.Boolean),
  created: Schema.Number,
  customer: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Customer => Models.Customer), Schema.suspend((): typeof Models.DeletedCustomer => Models.DeletedCustomer))),
  customer_account: Schema.NullOr(Schema.String),
  flow_directions: Schema.NullOr(Schema.Array(Schema.Literal("inbound", "outbound"))),
  id: Schema.String,
  livemode: Schema.Boolean,
  object: Schema.Literal("setup_attempt"),
  on_behalf_of: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Account => Models.Account))),
  payment_method: Schema.Union(Schema.String, Schema.suspend((): typeof Models.PaymentMethod => Models.PaymentMethod)),
  payment_method_details: Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetails => Models.SetupAttemptPaymentMethodDetails),
  setup_error: Schema.NullOr(Schema.suspend((): typeof Models.ApiErrors => Models.ApiErrors)),
  setup_intent: Schema.Union(Schema.String, Schema.suspend((): typeof Models.SetupIntent => Models.SetupIntent)),
  status: Schema.String,
  usage: Schema.String,
})
export type SetupAttempt = typeof SetupAttempt.Type

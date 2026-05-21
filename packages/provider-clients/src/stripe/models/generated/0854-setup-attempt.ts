import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type SetupAttempt = {
  readonly application: string | Models.Application | null
  readonly attach_to_self?: boolean
  readonly created: number
  readonly customer: string | Models.Customer | Models.DeletedCustomer | null
  readonly customer_account: string | null
  readonly flow_directions: ReadonlyArray<"inbound" | "outbound"> | null
  readonly id: string
  readonly livemode: boolean
  readonly object: "setup_attempt"
  readonly on_behalf_of: string | Models.Account | null
  readonly payment_method: string | Models.PaymentMethod
  readonly payment_method_details: Models.SetupAttemptPaymentMethodDetails
  readonly setup_error: Models.ApiErrors | null
  readonly setup_intent: string | Models.SetupIntent
  readonly status: string
  readonly usage: string
}

export const SetupAttempt = Schema.Struct({
  application: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Application, any, any> =>
          Models.Application as Schema.Schema<Models.Application, any, any>
      )
    )
  ),
  attach_to_self: Schema.optional(Schema.Boolean),
  created: Schema.Number,
  customer: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.DeletedCustomer, any, any> =>
          Models.DeletedCustomer as Schema.Schema<Models.DeletedCustomer, any, any>
      )
    )
  ),
  customer_account: Schema.NullOr(Schema.String),
  flow_directions: Schema.NullOr(Schema.Array(Schema.Literal("inbound", "outbound"))),
  id: Schema.String,
  livemode: Schema.Boolean,
  object: Schema.Literal("setup_attempt"),
  on_behalf_of: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
      )
    )
  ),
  payment_method: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethod, any, any> =>
        Models.PaymentMethod as Schema.Schema<Models.PaymentMethod, any, any>
    )
  ),
  payment_method_details: Schema.suspend(
    (): Schema.Schema<Models.SetupAttemptPaymentMethodDetails, any, any> =>
      Models.SetupAttemptPaymentMethodDetails as Schema.Schema<Models.SetupAttemptPaymentMethodDetails, any, any>
  ),
  setup_error: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ApiErrors, any, any> => Models.ApiErrors as Schema.Schema<Models.ApiErrors, any, any>
    )
  ),
  setup_intent: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntent, any, any> =>
        Models.SetupIntent as Schema.Schema<Models.SetupIntent, any, any>
    )
  ),
  status: Schema.String,
  usage: Schema.String
})

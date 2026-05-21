import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type Customer = {
  readonly address?: Models.Address | null
  readonly balance?: number
  readonly business_name?: string
  readonly cash_balance?: Models.CashBalance | null
  readonly created: number
  readonly currency?: string | null
  readonly customer_account?: string | null
  readonly default_source: string | Models.PaymentSource | null
  readonly delinquent?: boolean | null
  readonly description: string | null
  readonly discount?: Models.Discount | null
  readonly email: string | null
  readonly id: string
  readonly individual_name?: string
  readonly invoice_credit_balance?: Readonly<Record<string, number>>
  readonly invoice_prefix?: string | null
  readonly invoice_settings?: Models.InvoiceSettingCustomerSetting
  readonly livemode: boolean
  readonly metadata?: Readonly<Record<string, string>>
  readonly name?: string | null
  readonly next_invoice_sequence?: number
  readonly object: "customer"
  readonly phone?: string | null
  readonly preferred_locales?: ReadonlyArray<string> | null
  readonly shipping: Models.Shipping | null
  readonly sources?: {
    readonly data: ReadonlyArray<Models.PaymentSource>
    readonly has_more: boolean
    readonly object: "list"
    readonly url: string
  }
  readonly subscriptions?: {
    readonly data: ReadonlyArray<Models.Subscription>
    readonly has_more: boolean
    readonly object: "list"
    readonly url: string
  }
  readonly tax?: Models.CustomerTax
  readonly tax_exempt?: "exempt" | "none" | "reverse" | null
  readonly tax_ids?: {
    readonly data: ReadonlyArray<Models.TaxId>
    readonly has_more: boolean
    readonly object: "list"
    readonly url: string
  }
  readonly test_clock?: string | Models.TestHelpersTestClock | null
}

export const Customer = Schema.Struct({
  address: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
      )
    )
  ),
  balance: Schema.optional(Schema.Number),
  business_name: Schema.optional(Schema.String),
  cash_balance: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.CashBalance, any, any> =>
          Models.CashBalance as Schema.Schema<Models.CashBalance, any, any>
      )
    )
  ),
  created: Schema.Number,
  currency: Schema.optional(Schema.NullOr(Schema.String)),
  customer_account: Schema.optional(Schema.NullOr(Schema.String)),
  default_source: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentSource, any, any> =>
          Models.PaymentSource as Schema.Schema<Models.PaymentSource, any, any>
      )
    )
  ),
  delinquent: Schema.optional(Schema.NullOr(Schema.Boolean)),
  description: Schema.NullOr(Schema.String),
  discount: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.Discount, any, any> => Models.Discount as Schema.Schema<Models.Discount, any, any>
      )
    )
  ),
  email: Schema.NullOr(Schema.String),
  id: Schema.String,
  individual_name: Schema.optional(Schema.String),
  invoice_credit_balance: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Number })),
  invoice_prefix: Schema.optional(Schema.NullOr(Schema.String)),
  invoice_settings: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.InvoiceSettingCustomerSetting, any, any> =>
        Models.InvoiceSettingCustomerSetting as Schema.Schema<Models.InvoiceSettingCustomerSetting, any, any>
    )
  ),
  livemode: Schema.Boolean,
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
  name: Schema.optional(Schema.NullOr(Schema.String)),
  next_invoice_sequence: Schema.optional(Schema.Number),
  object: Schema.Literal("customer"),
  phone: Schema.optional(Schema.NullOr(Schema.String)),
  preferred_locales: Schema.optional(Schema.NullOr(Schema.Array(Schema.String))),
  shipping: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Shipping, any, any> => Models.Shipping as Schema.Schema<Models.Shipping, any, any>
    )
  ),
  sources: Schema.optional(
    Schema.Struct({
      data: Schema.Array(
        Schema.suspend(
          (): Schema.Schema<Models.PaymentSource, any, any> =>
            Models.PaymentSource as Schema.Schema<Models.PaymentSource, any, any>
        )
      ),
      has_more: Schema.Boolean,
      object: Schema.Literal("list"),
      url: Schema.String
    })
  ),
  subscriptions: Schema.optional(
    Schema.Struct({
      data: Schema.Array(
        Schema.suspend(
          (): Schema.Schema<Models.Subscription, any, any> =>
            Models.Subscription as Schema.Schema<Models.Subscription, any, any>
        )
      ),
      has_more: Schema.Boolean,
      object: Schema.Literal("list"),
      url: Schema.String
    })
  ),
  tax: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CustomerTax, any, any> =>
        Models.CustomerTax as Schema.Schema<Models.CustomerTax, any, any>
    )
  ),
  tax_exempt: Schema.optional(Schema.NullOr(Schema.Literal("exempt", "none", "reverse"))),
  tax_ids: Schema.optional(
    Schema.Struct({
      data: Schema.Array(
        Schema.suspend(
          (): Schema.Schema<Models.TaxId, any, any> => Models.TaxId as Schema.Schema<Models.TaxId, any, any>
        )
      ),
      has_more: Schema.Boolean,
      object: Schema.Literal("list"),
      url: Schema.String
    })
  ),
  test_clock: Schema.optional(
    Schema.NullOr(
      Schema.Union(
        Schema.String,
        Schema.suspend(
          (): Schema.Schema<Models.TestHelpersTestClock, any, any> =>
            Models.TestHelpersTestClock as Schema.Schema<Models.TestHelpersTestClock, any, any>
        )
      )
    )
  )
})

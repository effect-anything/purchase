import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type Invoice = {
  readonly account_country: string | null
  readonly account_name: string | null
  readonly account_tax_ids: ReadonlyArray<string | Models.TaxId | Models.DeletedTaxId> | null
  readonly amount_due: number
  readonly amount_overpaid: number
  readonly amount_paid: number
  readonly amount_remaining: number
  readonly amount_shipping: number
  readonly application: string | Models.Application | Models.DeletedApplication | null
  readonly attempt_count: number
  readonly attempted: boolean
  readonly auto_advance?: boolean
  readonly automatic_tax: Models.AutomaticTax
  readonly automatically_finalizes_at: number | null
  readonly billing_reason:
    | "automatic_pending_invoice_item_invoice"
    | "manual"
    | "quote_accept"
    | "subscription"
    | "subscription_create"
    | "subscription_cycle"
    | "subscription_threshold"
    | "subscription_update"
    | "upcoming"
    | null
  readonly collection_method: "charge_automatically" | "send_invoice"
  readonly confirmation_secret?: Models.InvoicesResourceConfirmationSecret | null
  readonly created: number
  readonly currency: string
  readonly custom_fields: ReadonlyArray<Models.InvoiceSettingCustomField> | null
  readonly customer: string | Models.Customer | Models.DeletedCustomer | null
  readonly customer_account: string | null
  readonly customer_address: Models.Address | null
  readonly customer_email: string | null
  readonly customer_name: string | null
  readonly customer_phone: string | null
  readonly customer_shipping: Models.Shipping | null
  readonly customer_tax_exempt: "exempt" | "none" | "reverse" | null
  readonly customer_tax_ids?: ReadonlyArray<Models.InvoicesResourceInvoiceTaxId> | null
  readonly default_payment_method: string | Models.PaymentMethod | null
  readonly default_source: string | Models.PaymentSource | null
  readonly default_tax_rates: ReadonlyArray<Models.TaxRate>
  readonly description: string | null
  readonly discounts: ReadonlyArray<string | Models.Discount | Models.DeletedDiscount>
  readonly due_date: number | null
  readonly effective_at: number | null
  readonly ending_balance: number | null
  readonly footer: string | null
  readonly from_invoice: Models.InvoicesResourceFromInvoice | null
  readonly hosted_invoice_url?: string | null
  readonly id?: string
  readonly invoice_pdf?: string | null
  readonly issuer: Models.ConnectAccountReference
  readonly last_finalization_error: Models.ApiErrors | null
  readonly latest_revision: string | Models.Invoice | null
  readonly lines: {
    readonly data: ReadonlyArray<Models.LineItem>
    readonly has_more: boolean
    readonly object: "list"
    readonly url: string
  }
  readonly livemode: boolean
  readonly metadata: Readonly<Record<string, string>> | null
  readonly next_payment_attempt: number | null
  readonly number: string | null
  readonly object: "invoice"
  readonly on_behalf_of: string | Models.Account | null
  readonly parent: Models.BillingBillResourceInvoicingParentsInvoiceParent | null
  readonly payment_settings: Models.InvoicesPaymentSettings
  readonly payments?: {
    readonly data: ReadonlyArray<Models.InvoicePayment>
    readonly has_more: boolean
    readonly object: "list"
    readonly url: string
  }
  readonly period_end: number
  readonly period_start: number
  readonly post_payment_credit_notes_amount: number
  readonly pre_payment_credit_notes_amount: number
  readonly receipt_number: string | null
  readonly rendering: Models.InvoicesResourceInvoiceRendering | null
  readonly shipping_cost: Models.InvoicesResourceShippingCost | null
  readonly shipping_details: Models.Shipping | null
  readonly starting_balance: number
  readonly statement_descriptor: string | null
  readonly status: "draft" | "open" | "paid" | "uncollectible" | "void" | null
  readonly status_transitions: Models.InvoicesResourceStatusTransitions
  readonly subscription?: string | Models.Subscription | null
  readonly subtotal: number
  readonly subtotal_excluding_tax: number | null
  readonly test_clock: string | Models.TestHelpersTestClock | null
  readonly threshold_reason?: Models.InvoiceThresholdReason
  readonly total: number
  readonly total_discount_amounts: ReadonlyArray<Models.DiscountsResourceDiscountAmount> | null
  readonly total_excluding_tax: number | null
  readonly total_pretax_credit_amounts: ReadonlyArray<Models.InvoicesResourcePretaxCreditAmount> | null
  readonly total_taxes: ReadonlyArray<Models.BillingBillResourceInvoicingTaxesTax> | null
  readonly webhooks_delivered_at: number | null
}

export const Invoice = Schema.Struct({
  account_country: Schema.NullOr(Schema.String),
  account_name: Schema.NullOr(Schema.String),
  account_tax_ids: Schema.NullOr(
    Schema.Array(
      Schema.Union(
        Schema.String,
        Schema.suspend(
          (): Schema.Schema<Models.TaxId, any, any> => Models.TaxId as Schema.Schema<Models.TaxId, any, any>
        ),
        Schema.suspend(
          (): Schema.Schema<Models.DeletedTaxId, any, any> =>
            Models.DeletedTaxId as Schema.Schema<Models.DeletedTaxId, any, any>
        )
      )
    )
  ),
  amount_due: Schema.Number,
  amount_overpaid: Schema.Number,
  amount_paid: Schema.Number,
  amount_remaining: Schema.Number,
  amount_shipping: Schema.Number,
  application: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Application, any, any> =>
          Models.Application as Schema.Schema<Models.Application, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.DeletedApplication, any, any> =>
          Models.DeletedApplication as Schema.Schema<Models.DeletedApplication, any, any>
      )
    )
  ),
  attempt_count: Schema.Number,
  attempted: Schema.Boolean,
  auto_advance: Schema.optional(Schema.Boolean),
  automatic_tax: Schema.suspend(
    (): Schema.Schema<Models.AutomaticTax, any, any> =>
      Models.AutomaticTax as Schema.Schema<Models.AutomaticTax, any, any>
  ),
  automatically_finalizes_at: Schema.NullOr(Schema.Number),
  billing_reason: Schema.NullOr(
    Schema.Literal(
      "automatic_pending_invoice_item_invoice",
      "manual",
      "quote_accept",
      "subscription",
      "subscription_create",
      "subscription_cycle",
      "subscription_threshold",
      "subscription_update",
      "upcoming"
    )
  ),
  collection_method: Schema.Literal("charge_automatically", "send_invoice"),
  confirmation_secret: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.InvoicesResourceConfirmationSecret, any, any> =>
          Models.InvoicesResourceConfirmationSecret as Schema.Schema<
            Models.InvoicesResourceConfirmationSecret,
            any,
            any
          >
      )
    )
  ),
  created: Schema.Number,
  currency: Schema.String,
  custom_fields: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.InvoiceSettingCustomField, any, any> =>
          Models.InvoiceSettingCustomField as Schema.Schema<Models.InvoiceSettingCustomField, any, any>
      )
    )
  ),
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
  customer_address: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
    )
  ),
  customer_email: Schema.NullOr(Schema.String),
  customer_name: Schema.NullOr(Schema.String),
  customer_phone: Schema.NullOr(Schema.String),
  customer_shipping: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Shipping, any, any> => Models.Shipping as Schema.Schema<Models.Shipping, any, any>
    )
  ),
  customer_tax_exempt: Schema.NullOr(Schema.Literal("exempt", "none", "reverse")),
  customer_tax_ids: Schema.optional(
    Schema.NullOr(
      Schema.Array(
        Schema.suspend(
          (): Schema.Schema<Models.InvoicesResourceInvoiceTaxId, any, any> =>
            Models.InvoicesResourceInvoiceTaxId as Schema.Schema<Models.InvoicesResourceInvoiceTaxId, any, any>
        )
      )
    )
  ),
  default_payment_method: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentMethod, any, any> =>
          Models.PaymentMethod as Schema.Schema<Models.PaymentMethod, any, any>
      )
    )
  ),
  default_source: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentSource, any, any> =>
          Models.PaymentSource as Schema.Schema<Models.PaymentSource, any, any>
      )
    )
  ),
  default_tax_rates: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.TaxRate, any, any> => Models.TaxRate as Schema.Schema<Models.TaxRate, any, any>
    )
  ),
  description: Schema.NullOr(Schema.String),
  discounts: Schema.Array(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Discount, any, any> => Models.Discount as Schema.Schema<Models.Discount, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.DeletedDiscount, any, any> =>
          Models.DeletedDiscount as Schema.Schema<Models.DeletedDiscount, any, any>
      )
    )
  ),
  due_date: Schema.NullOr(Schema.Number),
  effective_at: Schema.NullOr(Schema.Number),
  ending_balance: Schema.NullOr(Schema.Number),
  footer: Schema.NullOr(Schema.String),
  from_invoice: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.InvoicesResourceFromInvoice, any, any> =>
        Models.InvoicesResourceFromInvoice as Schema.Schema<Models.InvoicesResourceFromInvoice, any, any>
    )
  ),
  hosted_invoice_url: Schema.optional(Schema.NullOr(Schema.String)),
  id: Schema.optional(Schema.String),
  invoice_pdf: Schema.optional(Schema.NullOr(Schema.String)),
  issuer: Schema.suspend(
    (): Schema.Schema<Models.ConnectAccountReference, any, any> =>
      Models.ConnectAccountReference as Schema.Schema<Models.ConnectAccountReference, any, any>
  ),
  last_finalization_error: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ApiErrors, any, any> => Models.ApiErrors as Schema.Schema<Models.ApiErrors, any, any>
    )
  ),
  latest_revision: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Invoice, any, any> => Models.Invoice as Schema.Schema<Models.Invoice, any, any>
      )
    )
  ),
  lines: Schema.Struct({
    data: Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.LineItem, any, any> => Models.LineItem as Schema.Schema<Models.LineItem, any, any>
      )
    ),
    has_more: Schema.Boolean,
    object: Schema.Literal("list"),
    url: Schema.String
  }),
  livemode: Schema.Boolean,
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  next_payment_attempt: Schema.NullOr(Schema.Number),
  number: Schema.NullOr(Schema.String),
  object: Schema.Literal("invoice"),
  on_behalf_of: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
      )
    )
  ),
  parent: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.BillingBillResourceInvoicingParentsInvoiceParent, any, any> =>
        Models.BillingBillResourceInvoicingParentsInvoiceParent as Schema.Schema<
          Models.BillingBillResourceInvoicingParentsInvoiceParent,
          any,
          any
        >
    )
  ),
  payment_settings: Schema.suspend(
    (): Schema.Schema<Models.InvoicesPaymentSettings, any, any> =>
      Models.InvoicesPaymentSettings as Schema.Schema<Models.InvoicesPaymentSettings, any, any>
  ),
  payments: Schema.optional(
    Schema.Struct({
      data: Schema.Array(
        Schema.suspend(
          (): Schema.Schema<Models.InvoicePayment, any, any> =>
            Models.InvoicePayment as Schema.Schema<Models.InvoicePayment, any, any>
        )
      ),
      has_more: Schema.Boolean,
      object: Schema.Literal("list"),
      url: Schema.String
    })
  ),
  period_end: Schema.Number,
  period_start: Schema.Number,
  post_payment_credit_notes_amount: Schema.Number,
  pre_payment_credit_notes_amount: Schema.Number,
  receipt_number: Schema.NullOr(Schema.String),
  rendering: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.InvoicesResourceInvoiceRendering, any, any> =>
        Models.InvoicesResourceInvoiceRendering as Schema.Schema<Models.InvoicesResourceInvoiceRendering, any, any>
    )
  ),
  shipping_cost: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.InvoicesResourceShippingCost, any, any> =>
        Models.InvoicesResourceShippingCost as Schema.Schema<Models.InvoicesResourceShippingCost, any, any>
    )
  ),
  shipping_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Shipping, any, any> => Models.Shipping as Schema.Schema<Models.Shipping, any, any>
    )
  ),
  starting_balance: Schema.Number,
  statement_descriptor: Schema.NullOr(Schema.String),
  status: Schema.NullOr(Schema.Literal("draft", "open", "paid", "uncollectible", "void")),
  status_transitions: Schema.suspend(
    (): Schema.Schema<Models.InvoicesResourceStatusTransitions, any, any> =>
      Models.InvoicesResourceStatusTransitions as Schema.Schema<Models.InvoicesResourceStatusTransitions, any, any>
  ),
  subscription: Schema.optional(
    Schema.NullOr(
      Schema.Union(
        Schema.String,
        Schema.suspend(
          (): Schema.Schema<Models.Subscription, any, any> =>
            Models.Subscription as Schema.Schema<Models.Subscription, any, any>
        )
      )
    )
  ),
  subtotal: Schema.Number,
  subtotal_excluding_tax: Schema.NullOr(Schema.Number),
  test_clock: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.TestHelpersTestClock, any, any> =>
          Models.TestHelpersTestClock as Schema.Schema<Models.TestHelpersTestClock, any, any>
      )
    )
  ),
  threshold_reason: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.InvoiceThresholdReason, any, any> =>
        Models.InvoiceThresholdReason as Schema.Schema<Models.InvoiceThresholdReason, any, any>
    )
  ),
  total: Schema.Number,
  total_discount_amounts: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.DiscountsResourceDiscountAmount, any, any> =>
          Models.DiscountsResourceDiscountAmount as Schema.Schema<Models.DiscountsResourceDiscountAmount, any, any>
      )
    )
  ),
  total_excluding_tax: Schema.NullOr(Schema.Number),
  total_pretax_credit_amounts: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.InvoicesResourcePretaxCreditAmount, any, any> =>
          Models.InvoicesResourcePretaxCreditAmount as Schema.Schema<
            Models.InvoicesResourcePretaxCreditAmount,
            any,
            any
          >
      )
    )
  ),
  total_taxes: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.BillingBillResourceInvoicingTaxesTax, any, any> =>
          Models.BillingBillResourceInvoicingTaxesTax as Schema.Schema<
            Models.BillingBillResourceInvoicingTaxesTax,
            any,
            any
          >
      )
    )
  ),
  webhooks_delivered_at: Schema.NullOr(Schema.Number)
})

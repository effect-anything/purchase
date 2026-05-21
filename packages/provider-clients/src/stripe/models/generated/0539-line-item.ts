import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type LineItem = {
  readonly amount: number
  readonly currency: string
  readonly description: string | null
  readonly discount_amounts: ReadonlyArray<Models.DiscountsResourceDiscountAmount> | null
  readonly discountable: boolean
  readonly discounts: ReadonlyArray<string | Models.Discount>
  readonly id: string
  readonly invoice: string | null
  readonly livemode: boolean
  readonly metadata: Readonly<Record<string, string>>
  readonly object: "line_item"
  readonly parent: Models.BillingBillResourceInvoicingLinesParentsInvoiceLineItemParent | null
  readonly period: Models.InvoiceLineItemPeriod
  readonly pretax_credit_amounts: ReadonlyArray<Models.InvoicesResourcePretaxCreditAmount> | null
  readonly pricing: Models.BillingBillResourceInvoicingPricingPricing | null
  readonly quantity: number | null
  readonly quantity_decimal: string | null
  readonly subscription: string | Models.Subscription | null
  readonly subtotal: number
  readonly taxes: ReadonlyArray<Models.BillingBillResourceInvoicingTaxesTax> | null
}

export const LineItem = Schema.Struct({
  amount: Schema.Number,
  currency: Schema.String,
  description: Schema.NullOr(Schema.String),
  discount_amounts: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.DiscountsResourceDiscountAmount, any, any> =>
          Models.DiscountsResourceDiscountAmount as Schema.Schema<Models.DiscountsResourceDiscountAmount, any, any>
      )
    )
  ),
  discountable: Schema.Boolean,
  discounts: Schema.Array(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Discount, any, any> => Models.Discount as Schema.Schema<Models.Discount, any, any>
      )
    )
  ),
  id: Schema.String,
  invoice: Schema.NullOr(Schema.String),
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  object: Schema.Literal("line_item"),
  parent: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.BillingBillResourceInvoicingLinesParentsInvoiceLineItemParent, any, any> =>
        Models.BillingBillResourceInvoicingLinesParentsInvoiceLineItemParent as Schema.Schema<
          Models.BillingBillResourceInvoicingLinesParentsInvoiceLineItemParent,
          any,
          any
        >
    )
  ),
  period: Schema.suspend(
    (): Schema.Schema<Models.InvoiceLineItemPeriod, any, any> =>
      Models.InvoiceLineItemPeriod as Schema.Schema<Models.InvoiceLineItemPeriod, any, any>
  ),
  pretax_credit_amounts: Schema.NullOr(
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
  pricing: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.BillingBillResourceInvoicingPricingPricing, any, any> =>
        Models.BillingBillResourceInvoicingPricingPricing as Schema.Schema<
          Models.BillingBillResourceInvoicingPricingPricing,
          any,
          any
        >
    )
  ),
  quantity: Schema.NullOr(Schema.Number),
  quantity_decimal: Schema.NullOr(Schema.String),
  subscription: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Subscription, any, any> =>
          Models.Subscription as Schema.Schema<Models.Subscription, any, any>
      )
    )
  ),
  subtotal: Schema.Number,
  taxes: Schema.NullOr(
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
  )
})

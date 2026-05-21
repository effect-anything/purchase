import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Order = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  status: Schema.suspend(
    (): Schema.Schema<Models.OrderStatus, any, any> => Models.OrderStatus as Schema.Schema<Models.OrderStatus, any, any>
  ),
  paid: Schema.Boolean,
  subtotal_amount: Schema.Number,
  discount_amount: Schema.Number,
  net_amount: Schema.Number,
  tax_amount: Schema.Number,
  total_amount: Schema.Number,
  applied_balance_amount: Schema.Number,
  due_amount: Schema.Number,
  refunded_amount: Schema.Number,
  refunded_tax_amount: Schema.Number,
  currency: Schema.String,
  billing_reason: Schema.suspend(
    (): Schema.Schema<Models.OrderBillingReason, any, any> =>
      Models.OrderBillingReason as Schema.Schema<Models.OrderBillingReason, any, any>
  ),
  billing_name: Schema.NullOr(Schema.String),
  billing_address: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
    )
  ),
  invoice_number: Schema.String,
  is_invoice_generated: Schema.Boolean,
  receipt_number: Schema.NullOr(Schema.String),
  seats: Schema.optional(Schema.NullOr(Schema.Number)),
  customer_id: Schema.String,
  product_id: Schema.NullOr(Schema.String),
  discount_id: Schema.NullOr(Schema.String),
  subscription_id: Schema.NullOr(Schema.String),
  checkout_id: Schema.NullOr(Schema.String),
  metadata: Schema.suspend(
    (): Schema.Schema<Models.MetadataOutputType, any, any> =>
      Models.MetadataOutputType as Schema.Schema<Models.MetadataOutputType, any, any>
  ),
  custom_field_data: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.NullOr(Schema.Union(Schema.String, Schema.Number, Schema.Boolean, Schema.String))
    })
  ),
  platform_fee_amount: Schema.Number,
  platform_fee_currency: Schema.NullOr(Schema.String),
  customer: Schema.suspend(
    (): Schema.Schema<Models.OrderCustomer, any, any> =>
      Models.OrderCustomer as Schema.Schema<Models.OrderCustomer, any, any>
  ),
  product: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.OrderProduct, any, any> =>
        Models.OrderProduct as Schema.Schema<Models.OrderProduct, any, any>
    )
  ),
  discount: Schema.NullOr(
    Schema.Union(
      Schema.suspend(
        (): Schema.Schema<Models.DiscountFixedOnceForeverDurationBase, any, any> =>
          Models.DiscountFixedOnceForeverDurationBase as Schema.Schema<
            Models.DiscountFixedOnceForeverDurationBase,
            any,
            any
          >
      ),
      Schema.suspend(
        (): Schema.Schema<Models.DiscountFixedRepeatDurationBase, any, any> =>
          Models.DiscountFixedRepeatDurationBase as Schema.Schema<Models.DiscountFixedRepeatDurationBase, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.DiscountPercentageOnceForeverDurationBase, any, any> =>
          Models.DiscountPercentageOnceForeverDurationBase as Schema.Schema<
            Models.DiscountPercentageOnceForeverDurationBase,
            any,
            any
          >
      ),
      Schema.suspend(
        (): Schema.Schema<Models.DiscountPercentageRepeatDurationBase, any, any> =>
          Models.DiscountPercentageRepeatDurationBase as Schema.Schema<
            Models.DiscountPercentageRepeatDurationBase,
            any,
            any
          >
      )
    )
  ),
  subscription: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.OrderSubscription, any, any> =>
        Models.OrderSubscription as Schema.Schema<Models.OrderSubscription, any, any>
    )
  ),
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.OrderItemSchema, any, any> =>
        Models.OrderItemSchema as Schema.Schema<Models.OrderItemSchema, any, any>
    )
  ),
  description: Schema.String,
  refundable_amount: Schema.Number,
  refundable_tax_amount: Schema.Number
})
export type Order = typeof Order.Type

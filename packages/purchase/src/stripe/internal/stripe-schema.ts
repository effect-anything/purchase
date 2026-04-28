import * as Schema from "effect/Schema"

const StringRecord = Schema.Record({ key: Schema.String, value: Schema.String }).pipe(
  Schema.optionalWith({ exact: true, nullable: true, default: () => ({}) })
)

const NullableString = Schema.String.pipe(Schema.optionalWith({ exact: true, nullable: true }))
const NullableNumber = Schema.Number.pipe(Schema.optionalWith({ exact: true, nullable: true }))

export const StripeDeletedObject = Schema.Struct({
  id: Schema.String,
  object: Schema.String,
  deleted: Schema.Literal(true)
})

export const StripeDeletedCustomer = Schema.Struct({
  id: Schema.String,
  object: Schema.Literal("customer"),
  deleted: Schema.Literal(true)
})

export class StripeProduct extends Schema.Class<StripeProduct>("StripeProduct")({
  id: Schema.String,
  active: Schema.Boolean,
  created: Schema.Number,
  description: NullableString,
  metadata: StringRecord,
  name: Schema.String,
  updated: Schema.Number.pipe(Schema.optionalWith({ exact: true, nullable: true }))
}) {}

const StripeProductRef = Schema.Union(Schema.String, StripeProduct, StripeDeletedObject)

const StripeRecurringPrice = Schema.Struct({
  interval: Schema.Literal("day", "week", "month", "year"),
  interval_count: Schema.Number,
  trial_period_days: NullableNumber
})

const StripeCurrencyOption = Schema.Struct({
  unit_amount: NullableNumber,
  unit_amount_decimal: NullableString
})

export class StripePrice extends Schema.Class<StripePrice>("StripePrice")({
  id: Schema.String,
  active: Schema.Boolean,
  created: Schema.Number,
  currency: Schema.String,
  currency_options: Schema.Record({ key: Schema.String, value: StripeCurrencyOption }).pipe(
    Schema.optionalWith({ exact: true, nullable: true })
  ),
  metadata: StringRecord,
  nickname: NullableString,
  product: StripeProductRef,
  recurring: StripeRecurringPrice.pipe(Schema.optionalWith({ exact: true, nullable: true })),
  type: Schema.Literal("one_time", "recurring"),
  unit_amount: NullableNumber,
  unit_amount_decimal: NullableString
}) {}

export class StripeCustomer extends Schema.Class<StripeCustomer>("StripeCustomer")({
  id: Schema.String,
  email: NullableString,
  metadata: StringRecord,
  name: NullableString,
  preferred_locales: Schema.Array(Schema.String).pipe(Schema.optionalWith({ exact: true, nullable: true }))
}) {}

const StripeCustomerRef = Schema.Union(Schema.String, StripeCustomer, StripeDeletedCustomer)

const StripeSubscriptionItem = Schema.Struct({
  id: Schema.String,
  current_period_end: NullableNumber,
  current_period_start: NullableNumber,
  price: StripePrice,
  quantity: NullableNumber
})

const StripeInvoiceLinePriceDetails = Schema.Struct({
  price: Schema.Union(Schema.String, StripePrice).pipe(Schema.optionalWith({ exact: true, nullable: true })),
  product: NullableString
})

const StripeInvoiceLinePricing = Schema.Struct({
  price_details: StripeInvoiceLinePriceDetails.pipe(Schema.optionalWith({ exact: true, nullable: true })),
  type: NullableString,
  unit_amount_decimal: NullableString
})

const StripeInvoiceLinePeriod = Schema.Struct({
  start: NullableNumber,
  end: NullableNumber
})

export class StripeInvoiceLineItem extends Schema.Class<StripeInvoiceLineItem>("StripeInvoiceLineItem")({
  id: Schema.String,
  amount: NullableNumber,
  currency: Schema.String,
  description: NullableString,
  period: StripeInvoiceLinePeriod.pipe(Schema.optionalWith({ exact: true, nullable: true })),
  pricing: StripeInvoiceLinePricing.pipe(Schema.optionalWith({ exact: true, nullable: true })),
  quantity: NullableNumber
}) {}

const StripeTaxAmount = Schema.Struct({
  amount: Schema.Number
})

const StripeStatusTransitions = Schema.Struct({
  finalized_at: NullableNumber,
  marked_uncollectible_at: NullableNumber,
  paid_at: NullableNumber,
  voided_at: NullableNumber
})

const StripeDiscountRef = Schema.Union(
  Schema.String,
  Schema.Struct({
    id: Schema.String
  })
)

export class StripePaymentIntent extends Schema.Class<StripePaymentIntent>("StripePaymentIntent")({
  id: Schema.String
}) {}

export class StripeInvoice extends Schema.Class<StripeInvoice>("StripeInvoice")({
  id: Schema.String,
  billing_reason: NullableString,
  collection_method: Schema.Literal("charge_automatically", "send_invoice"),
  created: Schema.Number,
  currency: Schema.String,
  description: NullableString,
  discounts: Schema.Array(StripeDiscountRef).pipe(
    Schema.optionalWith({ exact: true, nullable: true, default: () => [] })
  ),
  due_date: NullableNumber,
  hosted_invoice_url: NullableString,
  invoice_pdf: NullableString,
  lines: Schema.Struct({
    data: Schema.Array(StripeInvoiceLineItem)
  }),
  number: NullableString,
  payment_intent: Schema.Union(Schema.String, StripePaymentIntent).pipe(
    Schema.optionalWith({ exact: true, nullable: true })
  ),
  period_end: NullableNumber,
  period_start: NullableNumber,
  status: Schema.Literal("draft", "open", "paid", "uncollectible", "void").pipe(
    Schema.optionalWith({ exact: true, nullable: true })
  ),
  status_transitions: StripeStatusTransitions,
  subtotal: NullableNumber,
  total: NullableNumber,
  total_taxes: Schema.Array(StripeTaxAmount).pipe(
    Schema.optionalWith({ exact: true, nullable: true, default: () => [] })
  )
}) {}

export class StripeSubscription extends Schema.Class<StripeSubscription>("StripeSubscription")({
  id: Schema.String,
  cancel_at_period_end: Schema.Boolean,
  canceled_at: NullableNumber,
  created: Schema.Number,
  currency: Schema.String,
  customer: StripeCustomerRef,
  description: NullableString,
  items: Schema.Struct({
    data: Schema.Array(StripeSubscriptionItem)
  }),
  latest_invoice: Schema.Union(Schema.String, StripeInvoice).pipe(Schema.optionalWith({ exact: true, nullable: true })),
  metadata: StringRecord,
  start_date: Schema.Number,
  status: Schema.Literal(
    "active",
    "canceled",
    "incomplete",
    "incomplete_expired",
    "past_due",
    "paused",
    "trialing",
    "unpaid"
  ),
  trial_end: NullableNumber
}) {}

const StripeCharge = Schema.Struct({
  invoice: Schema.Union(
    Schema.String,
    Schema.Struct({
      id: Schema.String
    })
  ).pipe(Schema.optionalWith({ exact: true, nullable: true }))
})

export class StripeRefund extends Schema.Class<StripeRefund>("StripeRefund")({
  id: Schema.String,
  amount: Schema.Number,
  charge: Schema.Union(Schema.String, StripeCharge).pipe(Schema.optionalWith({ exact: true, nullable: true })),
  created: Schema.Number,
  currency: Schema.String,
  status: NullableString
}) {}

export class StripeCheckoutSession extends Schema.Class<StripeCheckoutSession>("StripeCheckoutSession")({
  id: Schema.String,
  customer: NullableString,
  invoice: NullableString,
  metadata: StringRecord,
  mode: Schema.Literal("payment", "setup", "subscription"),
  subscription: NullableString,
  url: NullableString
}) {}

export class StripeBillingPortalSession extends Schema.Class<StripeBillingPortalSession>("StripeBillingPortalSession")({
  id: Schema.String,
  created: Schema.Number,
  customer: Schema.String,
  url: Schema.String
}) {}

export class StripeEvent extends Schema.Class<StripeEvent>("StripeEvent")({
  data: Schema.Struct({
    object: Schema.Any
  }),
  id: Schema.String,
  type: Schema.String
}) {}

export const StripeError = Schema.Struct({
  code: NullableString,
  message: Schema.String,
  param: NullableString,
  request_log_url: NullableString,
  type: Schema.String
})

export const StripeErrorEnvelope = Schema.Struct({
  error: StripeError
})

export const StripeList = <A, I, R>(item: Schema.Schema<A, I, R>) =>
  Schema.Struct({
    data: Schema.Array(item),
    has_more: Schema.Boolean
  })

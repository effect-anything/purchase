import * as Schema from "effect/Schema"

import { CommercialOfferId } from "../core/commercial-schema.ts"
import { CustomerEmail } from "../core/common-schema.ts"
import { SubscriptionChangePreviewCharge } from "../core/session-schema.ts"
import { PaymentEnvironmentTag, PaymentProviderTag } from "../provider/types.ts"

export { BillingPortalSession, SubscriptionChangePreview } from "../core/session-schema.ts"

/**
 * Provider product identifier.
 */
export const ProductId = Schema.NonEmptyString.pipe(
  Schema.brand("productId"),
  Schema.annotations({
    description: "Product unique identifier"
  })
)
export type ProductId = typeof ProductId.Type

/**
 * Provider price identifier.
 */
export const PriceId = Schema.NonEmptyString.pipe(
  Schema.brand("PriceId"),
  Schema.annotations({
    description: "Price unique identifier"
  })
)
export type PriceId = typeof PriceId.Type

/**
 * Provider price display name.
 */
export const PriceName = Schema.String.pipe(
  Schema.brand("PriceName"),
  Schema.annotations({
    description: "Price name"
  })
)
export type PriceName = typeof PriceName.Type

/**
 * Provider product display name.
 */
export const ProductName = Schema.String.pipe(
  Schema.brand("ProductName"),
  Schema.annotations({
    description: "Product name"
  })
)
export type ProductName = typeof ProductName.Type

/**
 * Provider customer identifier.
 */
export const CustomerProviderId = Schema.NonEmptyString.pipe(
  Schema.brand("CustomerProviderId"),
  Schema.annotations({
    description: "Customer provider unique identifier"
  })
)
export type CustomerProviderId = typeof CustomerProviderId.Type

/**
 * Provider subscription identifier.
 */
export const SubscriptionId = Schema.String.pipe(
  Schema.brand("SubscriptionId"),
  Schema.annotations({
    description: "Subscription unique identifier"
  })
)
export type SubscriptionId = typeof SubscriptionId.Type

/**
 * Provider transaction identifier.
 */
export const TransactionId = Schema.NonEmptyString.pipe(
  Schema.brand("TransactionId"),
  Schema.annotations({
    description: "Transaction unique identifier"
  })
)
export type TransactionId = typeof TransactionId.Type

/**
 * Billing interval supported by provider pricing.
 */
export const BillingInterval = Schema.Literal("day", "week", "month", "year")

/**
 * Currency code used by provider amounts.
 */
export const CurrencyCode = Schema.String

/**
 * Country code used by provider addresses.
 */
export const CountryCode = Schema.String

/**
 * Monetary amount and currency pair.
 */
export const UnitPrice = Schema.Struct({
  amount: Schema.String,
  currencyCode: Schema.String
})

/**
 * Recurring billing cycle configuration.
 */
export const BillingCycle = Schema.Struct({
  interval: BillingInterval,
  frequency: Schema.Number
})

/**
 * Trial period configuration.
 */
export const TrialPeriod = Schema.Struct({
  interval: BillingInterval,
  frequency: Schema.Number
})

/**
 * Quantity constraints for a price.
 */
export const PriceQuantity = Schema.Struct({
  minimum: Schema.Number,
  maximum: Schema.Number
})

/**
 * Optional metadata payload forwarded to providers.
 */
export const Metadata = Schema.Record({ key: Schema.String, value: Schema.Any }).pipe(
  Schema.optionalWith({ exact: true, nullable: true })
)

/**
 * 订阅状态
 * - active: 活跃的付费订阅
 * - paused: 暂停状态
 * - canceled: 已取消
 * - past_due: 付款逾期
 * - trialing: 试用期内
 */
/**
 * Current subscription lifecycle status.
 */
export const SubscriptionStatus = Schema.Literal("active", "paused", "past_due", "trialing", "canceled")

/**
 * Billing period boundaries.
 */
export const BillingPeriod = Schema.Struct({
  startsAt: Schema.Date,
  endsAt: Schema.Date
})

/**
 * Preview of the next subscription transaction.
 */
export const NextSubscriptionTransaction = Schema.Struct({
  billingPeriod: BillingPeriod,
  taxRatesUsed: Schema.Array(
    Schema.Struct({
      taxRate: Schema.String,
      totals: Schema.optionalWith(
        Schema.Struct({
          subtotal: Schema.String,
          discount: Schema.String,
          tax: Schema.String,
          total: Schema.String
        }),
        { exact: true, nullable: true }
      )
    })
  ),
  totals: Schema.Struct({
    subtotal: Schema.String,
    discount: Schema.String,
    tax: Schema.String,
    total: Schema.String,
    credit: Schema.String,
    creditToBalance: Schema.String,
    balance: Schema.String,
    grandTotal: Schema.String,
    fee: Schema.optionalWith(Schema.String, { exact: true, nullable: true }),
    earnings: Schema.optionalWith(Schema.String, { exact: true, nullable: true }),
    currencyCode: CurrencyCode
  }),
  items: Schema.Array(
    Schema.Struct({
      priceId: PriceId,
      quantity: Schema.Number,
      taxRate: Schema.String,
      unitTotals: Schema.Struct({
        subtotal: Schema.String,
        discount: Schema.String,
        tax: Schema.String,
        total: Schema.String
      }),
      totals: Schema.Struct({
        subtotal: Schema.String,
        discount: Schema.String,
        tax: Schema.String,
        total: Schema.String
      }),
      product: Schema.Struct({
        id: ProductId,
        name: Schema.String,
        description: Schema.String
      })
    })
  )
})

/**
 * Normalized subscription line item.
 */
export const SubscriptionItem = Schema.Struct({
  /**
   * 数量
   */
  quantity: Schema.Number,
  /**
   * 是否是周期性订阅
   */
  recurring: Schema.Boolean,
  /**
   * 下次计费时间
   */
  nextBilledAt: Schema.optionalWith(Schema.Date, { nullable: true }),
  /**
   * 价格
   */
  price: Schema.Struct({
    id: PriceId,
    name: PriceName,
    description: Schema.String,
    unitPrice: UnitPrice
  }),
  /**
   * 产品
   */
  product: Schema.Struct({
    id: ProductId,
    name: ProductName,
    description: Schema.String
  }),
  /**
   * 试用时间
   */
  trialDates: Schema.optional(BillingPeriod)
})

/**
 * Scheduled subscription mutation.
 */
export const SubscriptionScheduledChange = Schema.Struct({
  action: Schema.Literal("cancel", "pause", "resume"),
  effectiveAt: Schema.Date,
  resumeAt: Schema.optionalWith(Schema.Date, { nullable: true })
})

/**
 * Normalized transaction status.
 */
export const TransactionStatus = Schema.Literal("draft", "ready", "billed", "paid", "completed", "canceled", "past_due")
/**
 * How a transaction is collected.
 */
export const TransactionCollectionMode = Schema.Literal("automatic", "manual")
export type TransactionCollectionMode = typeof TransactionCollectionMode.Type

/**
 * Origin for a provider transaction.
 */
export const TransactionOrigin = Schema.Literal(
  "api",
  "subscription_charge",
  "subscription_payment_method_change",
  "subscription_recurring",
  "subscription_update",
  "web"
)

/**
 * Payment attempt lifecycle status.
 */
export const PaymentAttemptStatus = Schema.Literal(
  "canceled",
  "authorized",
  "authorized_flagged",
  "captured",
  "error",
  "action_required",
  "pending_no_action_required",
  "created",
  "unknown",
  "dropped"
)

/**
 * Payment method type label.
 */
export const PaymentMethodType = Schema.String

/**
 * Payment card type label.
 */
export const PaymentCardType = Schema.String

/**
 * Provider-specific payment error code.
 */
export const ErrorCode = Schema.String

/**
 * Card details captured on a payment attempt.
 */
export const PaymentCard = Schema.Struct({
  type: PaymentCardType,
  last4: Schema.String,
  expiryMonth: Schema.Number,
  expiryYear: Schema.Number,
  cardholderName: Schema.String
})

/**
 * Payment attempt details for a transaction.
 */
export const PaymentAttempt = Schema.Struct({
  id: Schema.String,
  amount: Schema.String,
  status: PaymentAttemptStatus,
  error: Schema.optional(ErrorCode),
  details: Schema.optionalWith(
    Schema.Struct({
      type: PaymentMethodType,
      card: Schema.optionalWith(PaymentCard, { nullable: true })
    }),
    { nullable: true }
  ),
  createdAt: Schema.Date,
  capturedAt: Schema.optionalWith(Schema.Date, { nullable: true })
})

export class Customer extends Schema.Class<Customer>("Customer")({
  id: CustomerProviderId,
  email: CustomerEmail,
  name: Schema.optionalWith(Schema.String, { exact: true, nullable: true, default: () => "" }),
  metadata: Metadata
}) {
  static decode = Schema.decode(Customer)

  static decodeMany = Schema.decode(Schema.Array(Customer))
}

export class Price extends Schema.Class<Price>("Price")({
  id: PriceId,
  name: Schema.optionalWith(PriceName, { exact: true, nullable: true, default: () => PriceName.make("") }),
  productId: ProductId,
  unitPrice: UnitPrice,
  unitPriceOverride: Schema.Array(
    Schema.Struct({
      countryCodes: Schema.Array(CountryCode),
      unitPrice: UnitPrice
    })
  ),
  billingCycle: Schema.optionalWith(BillingCycle, { exact: true, nullable: true }),
  trialPeriod: Schema.optionalWith(TrialPeriod, { exact: true, nullable: true }),
  active: Schema.Boolean,
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
  quantity: PriceQuantity,
  metadata: Metadata
}) {
  static decode = Schema.decode(Price)

  static decodeMany = Schema.decode(Schema.Array(Price))
}

export class Product extends Schema.Class<Product>("Product")({
  id: ProductId,
  name: ProductName,
  description: Schema.optionalWith(Schema.String, { exact: true, nullable: true, default: () => "" }),
  active: Schema.Boolean,
  metadata: Metadata,
  prices: Schema.Array(Price)
}) {
  static decode = Schema.decode(Product)

  static decodeMany = Schema.decode(Schema.Array(Product))
}

export class Subscription extends Schema.Class<Subscription>("Subscription")({
  /**
   * 订阅ID
   */
  id: SubscriptionId,
  /**
   * 订阅状态
   */
  status: SubscriptionStatus,
  /**
   * 产品
   */
  product: Schema.Struct({
    id: ProductId,
    name: ProductName,
    description: Schema.String
  }),
  /**
   * 单价
   */
  price: Schema.Struct({
    id: PriceId,
    name: Schema.String,
    unitPrice: UnitPrice
  }),
  /**
   * 地址ID
   */
  addressId: Schema.String,
  /**
   * 货币代码
   */
  currencyCode: CurrencyCode,
  /**
   * 创建时间
   */
  createdAt: Schema.Date,
  /**
   * 更新时间
   */
  updatedAt: Schema.Date,
  /**
   * 开始时间
   */
  startedAt: Schema.optionalWith(Schema.Date, { exact: true, nullable: true }),
  /**
   * 首次计费时间
   */
  firstBilledAt: Schema.optionalWith(Schema.Date, { exact: true, nullable: true }),
  /**
   * 下次计费时间
   */
  nextBilledAt: Schema.optionalWith(Schema.Date, { exact: true, nullable: true }),
  /**
   * 暂停时间
   */
  pausedAt: Schema.optionalWith(Schema.Date, { exact: true, nullable: true }),
  /**
   * 取消时间
   */
  canceledAt: Schema.optionalWith(Schema.Date, { exact: true, nullable: true }),
  /**
   * 当前计费周期
   */
  currentBillingPeriod: Schema.optionalWith(BillingPeriod, { exact: true, nullable: true }),
  /**
   * 计费周期
   */
  billingCycle: Schema.optionalWith(BillingCycle, { exact: true, nullable: true }),
  /**
   * 计划变更
   */
  scheduledChange: Schema.optionalWith(SubscriptionScheduledChange, { exact: true, nullable: true }),
  /**
   * 管理 URL
   */
  managementUrls: Schema.Struct({
    updatePaymentMethod: Schema.optionalWith(Schema.String, { exact: true, nullable: true }),
    cancel: Schema.optional(Schema.String)
  }),
  /**
   * 订阅项
   */
  items: Schema.Array(SubscriptionItem),
  /**
   * 下一个交易
   */
  nextTransaction: Schema.optionalWith(NextSubscriptionTransaction, { exact: true, nullable: true }),
  /**
   * 元数据
   */
  metadata: Metadata
}) {
  static decode = Schema.decode(Subscription)

  static decodeMany = Schema.decode(Schema.Array(Subscription))
}

export class SubscriptionChargePreview extends Schema.Class<SubscriptionChargePreview>("SubscriptionChargePreview")({
  subscriptionId: SubscriptionId,
  currencyCode: CurrencyCode,
  effectiveFrom: Schema.Literal("immediately", "next_billing_period"),
  charge: SubscriptionChangePreviewCharge
}) {
  static decode = Schema.decode(SubscriptionChargePreview)
}

const TransactionItem = Schema.Struct({
  name: Schema.String,
  productId: ProductId,
  priceId: PriceId,
  unitPrice: UnitPrice,
  quantity: Schema.Number
})

export class Transaction extends Schema.Class<Transaction>("Transaction")({
  id: Schema.String,
  reason: Schema.String,
  status: TransactionStatus,
  collectionMode: Schema.optionalWith(TransactionCollectionMode, { exact: true, nullable: true }),
  invoiceId: Schema.optionalWith(Schema.String, { nullable: true }),
  invoiceNumber: Schema.optionalWith(Schema.String, { exact: true, nullable: true }),
  currencyCode: CurrencyCode,
  discount: Schema.optionalWith(Schema.String, { nullable: true }),
  billingPeriod: Schema.optionalWith(BillingPeriod, { nullable: true }),
  items: Schema.Array(TransactionItem),
  payments: Schema.Array(PaymentAttempt),
  paymentTerms: Schema.optionalWith(BillingCycle, { exact: true, nullable: true }),
  checkoutUrl: Schema.optionalWith(Schema.String, { exact: true, nullable: true }),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
  billedAt: Schema.optionalWith(Schema.Date, { nullable: true }),
  dueAt: Schema.optionalWith(Schema.Date, { exact: true, nullable: true })
}) {
  static decode = Schema.decode(Transaction)

  static decodeMany = Schema.decode(Schema.Array(Transaction))
}

export const RefundStatus = Schema.Literal("pending", "succeeded", "failed", "canceled")

export class RefundResult extends Schema.Class<RefundResult>("RefundResult")({
  id: Schema.String,
  transactionId: Schema.optionalWith(TransactionId, { exact: true, nullable: true }),
  amount: Schema.String,
  currencyCode: CurrencyCode,
  status: RefundStatus,
  providerStatus: Schema.String,
  createdAt: Schema.Date,
  updatedAt: Schema.Date
}) {
  static decode = Schema.decode(RefundResult)
}

export class Invoice extends Schema.Class<Invoice>("Invoice")({}) {}

export const SubscriptionChargeStatus = Schema.Literal(
  "scheduled",
  "draft",
  "ready",
  "billed",
  "paid",
  "completed",
  "canceled",
  "past_due"
)

export class SubscriptionChargeResult extends Schema.Class<SubscriptionChargeResult>("SubscriptionChargeResult")({
  subscriptionId: SubscriptionId,
  currencyCode: CurrencyCode,
  effectiveFrom: Schema.Literal("immediately", "next_billing_period"),
  status: SubscriptionChargeStatus,
  providerStatus: Schema.String,
  transactionId: Schema.optionalWith(TransactionId, { exact: true, nullable: true }),
  charge: SubscriptionChangePreviewCharge
}) {
  static decode = Schema.decode(SubscriptionChargeResult)
}

export class TransactionPreviewResult extends Schema.Class<TransactionPreviewResult>("TransactionPreviewResult")({
  currencyCode: CurrencyCode,
  charge: SubscriptionChangePreviewCharge
}) {
  static decode = Schema.decode(TransactionPreviewResult)
}

export const CheckoutMode = Schema.Literal("inline", "hosted", "portal")
export type CheckoutMode = typeof CheckoutMode.Type

export class CheckoutSession extends Schema.Class<CheckoutSession>("@pay:checkout-session")({
  mode: CheckoutMode,
  provider: PaymentProviderTag,
  environment: PaymentEnvironmentTag,
  /**
   * Stable commercial offer id for the checkout session.
   * This is the runtime identifier new integrations should carry forward.
   */
  offerId: CommercialOfferId,
  providerCustomerId: Schema.optional(CustomerProviderId),
  providerSubscriptionId: Schema.optional(SubscriptionId),
  providerTransactionId: Schema.optional(TransactionId),
  url: Schema.optional(Schema.String),
  token: Schema.optional(Schema.String),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String }))
}) {}

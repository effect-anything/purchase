import * as Database from "@effect-x/db"
import * as Schema from "effect/Schema"

export const TABLES = {
  checkoutIntent: "paykit_checkout_intent",
  commercialEvent: "paykit_commercial_event",
  creditLedger: "paykit_credit_ledger",
  customer: "paykit_customer",
  entitlement: "paykit_entitlement",
  feature: "paykit_feature",
  invoice: "paykit_invoice",
  metadata: "paykit_metadata",
  paymentMethod: "paykit_payment_method",
  product: "paykit_product",
  productFeature: "paykit_product_feature",
  providerRef: "paykit_provider_ref",
  subscription: "paykit_subscription",
  webhookEvent: "paykit_webhook_event"
} as const

const StringRecord = Schema.Record({ key: Schema.String, value: Schema.String })
const UnknownRecord = Schema.Record({ key: Schema.String, value: Schema.Unknown })

const StringRecordJson = Database.Json(StringRecord)
const UnknownRecordJson = Database.Json(UnknownRecord)

const nullableString = Schema.String.pipe(
  Database.ColumnConfig({ nullable: true }),
  Schema.optionalWith({ nullable: true })
)

const nullableInteger = Schema.Int.pipe(
  Database.ColumnConfig({ nullable: true }),
  Schema.optionalWith({ nullable: true })
)

const nullableDate = Schema.Date.pipe(
  Database.ColumnConfig({ nullable: true }),
  Schema.optionalWith({ nullable: true })
)

export class Customer extends Database.Class<Customer>("@pay-web/db/customer")({
  id: Database.id.string,
  email: nullableString,
  name: nullableString,
  metadata: StringRecordJson.pipe(Database.ColumnConfig({ nullable: true }), Schema.optionalWith({ nullable: true })),
  provider: UnknownRecordJson.pipe(Database.ColumnConfig({ default: {} })),
  deletedAt: nullableDate,
  createdAt: Database.DateTimeInsert,
  updatedAt: Database.DateTimeUpdate
}) {
  static table = TABLES.customer
}

export class CheckoutIntent extends Database.Class<CheckoutIntent>("@pay-web/db/checkout-intent")({
  id: Database.id.string,
  customerId: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_checkout_intent_customer_idx" })),
  offerId: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_checkout_intent_offer_idx" })),
  provider: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_checkout_intent_provider_status_idx" })),
  providerCheckoutSessionId: Schema.String.pipe(
    Database.ColumnConfig({
      unique: "paykit_checkout_intent_session_unique",
      index: "paykit_checkout_intent_provider_status_idx"
    })
  ),
  checkoutUrl: nullableString,
  status: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_checkout_intent_provider_status_idx" })),
  metadata: UnknownRecordJson.pipe(Database.ColumnConfig({ default: {} })),
  createdAt: Database.DateTimeInsert,
  updatedAt: Database.DateTimeUpdate
}) {
  static table = TABLES.checkoutIntent
}

export class CommercialEvent extends Database.Class<CommercialEvent>("@pay-web/db/commercial-event")({
  id: Database.id.string,
  provider: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_commercial_event_provider_idx" })),
  providerEventId: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_commercial_event_provider_idx" })),
  kind: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_commercial_event_kind_idx" })),
  customerId: nullableString,
  offerId: nullableString,
  agreementId: nullableString,
  payload: UnknownRecordJson.pipe(Database.ColumnConfig({ default: {} })),
  occurredAt: Schema.Date,
  createdAt: Database.DateTimeInsert
}) {
  static table = TABLES.commercialEvent
}

export class CreditLedger extends Database.Class<CreditLedger>("@pay-web/db/credit-ledger")({
  id: Database.id.string,
  customerId: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_credit_ledger_customer_product_idx" })),
  productId: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_credit_ledger_customer_product_idx" })),
  offerId: nullableString,
  amount: Schema.Int,
  direction: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_credit_ledger_direction_idx" })),
  idempotencyKey: Schema.String.pipe(Database.ColumnConfig({ unique: "paykit_credit_ledger_idempotency_unique" })),
  sourceEventId: nullableString,
  reason: nullableString,
  createdAt: Database.DateTimeInsert
}) {
  static table = TABLES.creditLedger
}

export class Entitlement extends Database.Class<Entitlement>("@pay-web/db/entitlement")(
  {
    id: Database.id.string,
    subscriptionId: Schema.String.pipe(
      Database.ColumnConfig({
        nullable: true,
        index: "paykit_entitlement_subscription_idx"
      }),
      Schema.optionalWith({ nullable: true })
    ),
    customerId: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_entitlement_customer_feature_idx" })),
    featureId: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_entitlement_customer_feature_idx" })),
    limit: nullableInteger,
    balance: nullableInteger,
    nextResetAt: Schema.Date.pipe(
      Database.ColumnConfig({
        nullable: true,
        index: "paykit_entitlement_next_reset_idx"
      }),
      Schema.optionalWith({ nullable: true })
    ),
    createdAt: Database.DateTimeInsert,
    updatedAt: Database.DateTimeUpdate
  },
  {
    ...Database.ModelConfig({
      relations: [
        {
          name: "subscription",
          type: "many-to-one",
          fields: ["subscriptionId"],
          references: ["id"],
          referencedModel: "Subscription",
          map: "paykit_entitlement_subscription_id_fkey"
        },
        {
          name: "customer",
          type: "many-to-one",
          fields: ["customerId"],
          references: ["id"],
          referencedModel: "Customer",
          map: "paykit_entitlement_customer_id_fkey"
        },
        {
          name: "feature",
          type: "many-to-one",
          fields: ["featureId"],
          references: ["id"],
          referencedModel: "Feature",
          map: "paykit_entitlement_feature_id_fkey"
        }
      ]
    })
  }
) {
  static table = TABLES.entitlement
}

export class Feature extends Database.Class<Feature>("@pay-web/db/feature")({
  id: Database.id.string,
  type: Schema.String,
  createdAt: Database.DateTimeInsert,
  updatedAt: Database.DateTimeUpdate
}) {
  static table = TABLES.feature
}

export class Invoice extends Database.Class<Invoice>("@pay-web/db/invoice")(
  {
    id: Database.id.string,
    customerId: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_invoice_customer_idx" })),
    subscriptionId: Schema.String.pipe(
      Database.ColumnConfig({
        nullable: true,
        index: "paykit_invoice_subscription_idx"
      }),
      Schema.optionalWith({ nullable: true })
    ),
    type: Schema.String,
    status: Schema.String,
    amount: Schema.Int,
    currency: Schema.String,
    description: nullableString,
    hostedUrl: nullableString,
    providerId: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_invoice_provider_idx" })),
    providerData: UnknownRecordJson,
    periodStartAt: nullableDate,
    periodEndAt: nullableDate,
    createdAt: Database.DateTimeInsert,
    updatedAt: Database.DateTimeUpdate
  },
  {
    ...Database.ModelConfig({
      relations: [
        {
          name: "customer",
          type: "many-to-one",
          fields: ["customerId"],
          references: ["id"],
          referencedModel: "Customer",
          map: "paykit_invoice_customer_id_fkey"
        },
        {
          name: "subscription",
          type: "many-to-one",
          fields: ["subscriptionId"],
          references: ["id"],
          referencedModel: "Subscription",
          map: "paykit_invoice_subscription_id_fkey"
        }
      ]
    })
  }
) {
  static table = TABLES.invoice
}

export class Metadata extends Database.Class<Metadata>("@pay-web/db/metadata")({
  id: Database.id.string,
  providerId: Schema.String.pipe(Database.ColumnConfig({ unique: "paykit_metadata_checkout_session_unique" })),
  type: Schema.String,
  data: UnknownRecordJson,
  providerCheckoutSessionId: Schema.String.pipe(
    Database.ColumnConfig({
      nullable: true,
      unique: "paykit_metadata_checkout_session_unique"
    }),
    Schema.optionalWith({ nullable: true })
  ),
  expiresAt: nullableDate,
  createdAt: Database.DateTimeInsert
}) {
  static table = TABLES.metadata
}

export class PaymentMethod extends Database.Class<PaymentMethod>("@pay-web/db/payment-method")(
  {
    id: Database.id.string,
    customerId: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_payment_method_customer_idx" })),
    providerId: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_payment_method_provider_idx" })),
    providerData: UnknownRecordJson,
    isDefault: Database.Boolean.pipe(Database.ColumnConfig({ default: false })),
    deletedAt: Schema.Date.pipe(
      Database.ColumnConfig({
        nullable: true,
        index: "paykit_payment_method_customer_idx"
      }),
      Schema.optionalWith({ nullable: true })
    ),
    createdAt: Database.DateTimeInsert,
    updatedAt: Database.DateTimeUpdate
  },
  {
    ...Database.ModelConfig({
      relations: [
        {
          name: "customer",
          type: "many-to-one",
          fields: ["customerId"],
          references: ["id"],
          referencedModel: "Customer",
          map: "paykit_payment_method_customer_id_fkey"
        }
      ]
    })
  }
) {
  static table = TABLES.paymentMethod
}

export class Product extends Database.Class<Product>("@pay-web/db/product")({
  internalId: Database.id.string,
  id: Schema.String.pipe(Database.ColumnConfig({ unique: "paykit_product_id_version_unique" })),
  version: Schema.Int.pipe(
    Database.ColumnConfig({
      default: 1,
      unique: "paykit_product_id_version_unique"
    })
  ),
  name: Schema.String,
  group: Schema.String.pipe(Database.ColumnConfig({ default: "" })),
  isDefault: Database.Boolean.pipe(Database.ColumnConfig({ default: false, index: "paykit_product_default_idx" })),
  priceAmount: nullableInteger,
  priceInterval: nullableString,
  hash: nullableString,
  provider: UnknownRecordJson.pipe(Database.ColumnConfig({ default: {} })),
  createdAt: Database.DateTimeInsert,
  updatedAt: Database.DateTimeUpdate
}) {
  static table = TABLES.product
}

export class ProductFeature extends Database.Class<ProductFeature>("@pay-web/db/product-feature")(
  {
    productInternalId: Schema.String,
    featureId: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_product_feature_feature_idx" })),
    limit: nullableInteger,
    resetInterval: nullableString,
    config: UnknownRecordJson.pipe(Database.ColumnConfig({ nullable: true }), Schema.optionalWith({ nullable: true })),
    createdAt: Database.DateTimeInsert,
    updatedAt: Database.DateTimeUpdate
  },
  {
    ...Database.ModelConfig({
      primaryKey: {
        fields: ["productInternalId", "featureId"],
        map: "paykit_product_feature_primary"
      },
      relations: [
        {
          name: "product",
          type: "many-to-one",
          fields: ["productInternalId"],
          references: ["internalId"],
          referencedModel: "Product",
          map: "paykit_product_feature_product_internal_id_fkey"
        },
        {
          name: "feature",
          type: "many-to-one",
          fields: ["featureId"],
          references: ["id"],
          referencedModel: "Feature",
          map: "paykit_product_feature_feature_id_fkey"
        }
      ]
    })
  }
) {
  static table = TABLES.productFeature
}

export class ProviderRef extends Database.Class<ProviderRef>("@pay-web/db/provider-ref")({
  id: Database.id.string,
  provider: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_provider_ref_provider_idx" })),
  ownerType: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_provider_ref_owner_idx" })),
  ownerId: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_provider_ref_owner_idx" })),
  providerId: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_provider_ref_provider_id_idx" })),
  kind: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_provider_ref_kind_idx" })),
  createdAt: Database.DateTimeInsert,
  updatedAt: Database.DateTimeUpdate
}) {
  static table = TABLES.providerRef
}

export class Subscription extends Database.Class<Subscription>("@pay-web/db/subscription")(
  {
    id: Database.id.string,
    customerId: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_subscription_customer_status_idx" })),
    productInternalId: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_subscription_product_idx" })),
    providerId: Schema.String.pipe(
      Database.ColumnConfig({
        nullable: true,
        index: "paykit_subscription_provider_idx"
      }),
      Schema.optionalWith({ nullable: true })
    ),
    providerData: UnknownRecordJson.pipe(
      Database.ColumnConfig({ nullable: true }),
      Schema.optionalWith({ nullable: true })
    ),
    status: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_subscription_customer_status_idx" })),
    canceled: Database.Boolean.pipe(Database.ColumnConfig({ default: false })),
    cancelAtPeriodEnd: Database.Boolean.pipe(Database.ColumnConfig({ default: false })),
    startedAt: nullableDate,
    trialEndsAt: nullableDate,
    currentPeriodStartAt: nullableDate,
    currentPeriodEndAt: nullableDate,
    canceledAt: nullableDate,
    endedAt: Schema.Date.pipe(
      Database.ColumnConfig({
        nullable: true,
        index: "paykit_subscription_customer_status_idx"
      }),
      Schema.optionalWith({ nullable: true })
    ),
    scheduledProductId: nullableString,
    quantity: Schema.Int.pipe(Database.ColumnConfig({ default: 1 })),
    createdAt: Database.DateTimeInsert,
    updatedAt: Database.DateTimeUpdate
  },
  {
    ...Database.ModelConfig({
      relations: [
        {
          name: "customer",
          type: "many-to-one",
          fields: ["customerId"],
          references: ["id"],
          referencedModel: "Customer",
          map: "paykit_subscription_customer_id_fkey"
        },
        {
          name: "product",
          type: "many-to-one",
          fields: ["productInternalId"],
          references: ["internalId"],
          referencedModel: "Product",
          map: "paykit_subscription_product_internal_id_fkey"
        }
      ]
    })
  }
) {
  static table = TABLES.subscription
}

export class WebhookEvent extends Database.Class<WebhookEvent>("@pay-web/db/webhook-event")({
  id: Database.id.string,
  providerId: Schema.String.pipe(
    Database.ColumnConfig({
      unique: "paykit_webhook_event_provider_unique",
      index: "paykit_webhook_event_status_idx"
    })
  ),
  providerEventId: Schema.String.pipe(Database.ColumnConfig({ unique: "paykit_webhook_event_provider_unique" })),
  type: Schema.String,
  payload: UnknownRecordJson,
  status: Schema.String.pipe(Database.ColumnConfig({ index: "paykit_webhook_event_status_idx" })),
  error: nullableString,
  traceId: nullableString,
  receivedAt: Schema.Date,
  processedAt: nullableDate
}) {
  static table = TABLES.webhookEvent
}

export const tables = [
  CheckoutIntent,
  CommercialEvent,
  CreditLedger,
  Customer,
  Entitlement,
  Feature,
  Invoice,
  Metadata,
  PaymentMethod,
  Product,
  ProductFeature,
  ProviderRef,
  Subscription,
  WebhookEvent
]

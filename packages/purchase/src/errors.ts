import * as HttpApiSchema from "@effect/platform/HttpApiSchema"
import * as Schema from "effect/Schema"

export class CustomerAlreadyExists extends Schema.TaggedError<CustomerAlreadyExists>()("CustomerAlreadyExists", {
  email: Schema.String,
  userId: Schema.String
}) {}

export class CheckoutOfferNotFound extends Schema.TaggedError<CheckoutOfferNotFound>()("CheckoutOfferNotFound", {
  offerId: Schema.String,
  provider: Schema.String
}) {}

export class PriceNotFound extends Schema.TaggedError<PriceNotFound>()(
  "PriceNotFound",
  {
    priceId: Schema.String
  },
  HttpApiSchema.annotations({
    status: 404
  })
) {}

export class CheckoutNotSupported extends Schema.TaggedError<CheckoutNotSupported>()("CheckoutNotSupported", {
  provider: Schema.String,
  message: Schema.String
}) {}

export class CustomerNotFound extends Schema.TaggedError<CustomerNotFound>()(
  "CustomerNotFound",
  {
    customerId: Schema.optional(Schema.String)
  },
  HttpApiSchema.annotations({
    status: 404
  })
) {}

export class ProductNotFound extends Schema.TaggedError<ProductNotFound>()(
  "ProductNotFound",
  {
    productId: Schema.String
  },
  HttpApiSchema.annotations({
    status: 404
  })
) {}

export class SubscriptionCancel extends Schema.TaggedError<SubscriptionCancel>()("SubscriptionCancel", {
  message: Schema.String
}) {}

export class SubscriptionNotFound extends Schema.TaggedError<SubscriptionNotFound>()(
  "SubscriptionNotFound",
  {
    subscriptionId: Schema.optional(Schema.String),
    message: Schema.String.pipe(
      Schema.propertySignature,
      Schema.withConstructorDefault(() => "Subscription not found")
    )
  },
  HttpApiSchema.annotations({
    status: 404
  })
) {}

export class ProviderOperationNotSupported extends Schema.TaggedError<ProviderOperationNotSupported>()(
  "ProviderOperationNotSupported",
  {
    provider: Schema.String,
    operation: Schema.String,
    message: Schema.String
  },
  HttpApiSchema.annotations({
    status: 400
  })
) {}

export class TransactionNotFound extends Schema.TaggedError<TransactionNotFound>()(
  "TransactionNotFound",
  {
    transactionId: Schema.String,
    message: Schema.String.pipe(
      Schema.propertySignature,
      Schema.withConstructorDefault(() => "Transaction not found")
    )
  },
  HttpApiSchema.annotations({
    status: 404
  })
) {}

export class InvoiceNotFound extends Schema.TaggedError<InvoiceNotFound>()(
  "InvoiceNotFound",
  {},
  HttpApiSchema.annotations({
    status: 404
  })
) {}

export class WebhookUnmarshalError extends Schema.TaggedError<WebhookUnmarshalError>()("WebhookUnmarshalError", {
  error: Schema.String,
  cause: Schema.optional(Schema.Unknown)
}) {}

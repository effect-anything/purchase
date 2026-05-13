import * as HttpApiSchema from "@effect/platform/HttpApiSchema"
import * as Schema from "effect/Schema"

/**
 * Raised when a customer already exists for the requested identity.
 */
export class CustomerAlreadyExists extends Schema.TaggedError<CustomerAlreadyExists>()("CustomerAlreadyExists", {
  email: Schema.String,
  userId: Schema.String
}) {}

/**
 * Raised when a checkout target cannot be resolved for a provider.
 */
export class CheckoutOfferNotFound extends Schema.TaggedError<CheckoutOfferNotFound>()("CheckoutOfferNotFound", {
  offerId: Schema.String,
  provider: Schema.String
}) {}

/**
 * Raised when a provider price cannot be found.
 */
export class PriceNotFound extends Schema.TaggedError<PriceNotFound>()(
  "PriceNotFound",
  {
    priceId: Schema.String
  },
  HttpApiSchema.annotations({
    status: 404
  })
) {}

/**
 * Raised when a provider does not support checkout for the requested shape.
 */
export class CheckoutNotSupported extends Schema.TaggedError<CheckoutNotSupported>()("CheckoutNotSupported", {
  provider: Schema.String,
  message: Schema.String
}) {}

/**
 * Raised when a provider customer cannot be found.
 */
export class CustomerNotFound extends Schema.TaggedError<CustomerNotFound>()(
  "CustomerNotFound",
  {
    customerId: Schema.optional(Schema.String)
  },
  HttpApiSchema.annotations({
    status: 404
  })
) {}

/**
 * Raised when a provider product cannot be found.
 */
export class ProductNotFound extends Schema.TaggedError<ProductNotFound>()(
  "ProductNotFound",
  {
    productId: Schema.String
  },
  HttpApiSchema.annotations({
    status: 404
  })
) {}

/**
 * Raised when subscription cancellation fails validation.
 */
export class SubscriptionCancel extends Schema.TaggedError<SubscriptionCancel>()("SubscriptionCancel", {
  message: Schema.String
}) {}

/**
 * Raised when a provider subscription cannot be found.
 */
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

/**
 * Raised when a provider operation is unsupported.
 */
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

/**
 * Raised when a provider transaction cannot be found.
 */
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

/**
 * Raised when an invoice PDF cannot be found or generated.
 */
export class InvoiceNotFound extends Schema.TaggedError<InvoiceNotFound>()(
  "InvoiceNotFound",
  {},
  HttpApiSchema.annotations({
    status: 404
  })
) {}

/**
 * Raised when webhook verification or decoding fails.
 */
export class WebhookUnmarshalError extends Schema.TaggedError<WebhookUnmarshalError>()("WebhookUnmarshalError", {
  error: Schema.String,
  cause: Schema.optional(Schema.Unknown)
}) {}

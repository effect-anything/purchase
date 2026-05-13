import * as Chunk from "effect/Chunk"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Stream from "effect/Stream"

import type { PaymentProviderTag } from "../provider/types.ts"
import type {
  StripeCustomer,
  StripeInvoice,
  StripeInvoiceLineItem,
  StripePrice,
  StripeProduct,
  StripeSubscription
} from "./internal/stripe-schema.ts"

import { CommercialOfferId } from "../core/commercial-schema.ts"
import { CheckoutNotSupported, InvoiceNotFound } from "../errors.ts"
import {
  BillingPortalSession,
  CheckoutSession,
  Customer,
  Price,
  Product,
  RefundResult,
  Subscription,
  SubscriptionChangePreview,
  SubscriptionChargePreview,
  SubscriptionChargeResult,
  SubscriptionId,
  Transaction,
  TransactionId,
  TransactionPreviewResult
} from "../internal/provider-schema.ts"
import {
  PaymentClient,
  type PaymentWebhookKind,
  type PaymentWebhookNormalization,
  type StripeImpl,
  makePaymentClient
} from "../provider/client.ts"
import { StripeClient, StripeConfig, makeStripeClient } from "./internal/stripe-client.ts"

/**
 * Stripe payment client service.
 */
export class Stripe extends Context.Tag("@pay:provider-stripe")<Stripe, StripeImpl>() {
  static readonly _tag: PaymentProviderTag = "stripe"

  static make = Effect.gen(function* () {
    const stripe = yield* StripeClient
    const config = stripe.config

    const stripeHi: StripeImpl["stripeHi"] = Effect.succeed("hi")

    const webhooksUnmarshal: PaymentClient.Methods["webhooksUnmarshal"] = ({ signature, payload }) =>
      stripe.webhooksUnmarshal(payload, signature)

    const webhooksNormalize: PaymentClient.Methods["webhooksNormalize"] = (event) =>
      Effect.succeed(normalizeStripeWebhook(event))

    // ----------------------------------------------------------------------------------------

    const pricesList: PaymentClient.Methods["prices"]["list"] = Effect.fn(function* (args) {
      const prices = yield* stripe.prices
        .list({
          productId: args.productId,
          after: args.after,
          perPage: args.perPage
        })
        .pipe(Effect.orDie)

      return yield* Price.decodeMany(prices.map(formatPrice)).pipe(Effect.orDie)
    })

    const pricesGet: PaymentClient.Methods["prices"]["get"] = Effect.fn(function* (args) {
      const stripePrice = yield* stripe.prices.get({ priceId: args.priceId }).pipe(Effect.orDie)

      return yield* Option.match(stripePrice, {
        onNone: () => Effect.succeed(Option.none<Price>()),
        onSome: (price) => Price.decode(formatPrice(price)).pipe(Effect.map(Option.some), Effect.orDie)
      })
    })

    const pricesCreate: PaymentClient.Methods["prices"]["create"] = Effect.fn(function* (args) {
      const stripePrice = yield* stripe.prices.create(args)

      return yield* Price.decode(formatPrice(stripePrice)).pipe(Effect.orDie)
    })

    const pricesUpdate: PaymentClient.Methods["prices"]["update"] = Effect.fn(function* (args) {
      const stripePrice = yield* stripe.prices.update(args)

      return yield* Price.decode(formatPrice(stripePrice)).pipe(Effect.orDie)
    })

    const pricesArchive: PaymentClient.Methods["prices"]["archive"] = Effect.fn(function* (args) {
      const stripePrice = yield* stripe.prices.update({
        priceId: args.priceId,
        active: false
      })

      return yield* Price.decode(formatPrice(stripePrice)).pipe(Effect.orDie)
    })

    // ----------------------------------------------------------------------------------------

    const loadProductsPage = Effect.fnUntraced(function* (
      active: boolean,
      after: string | undefined,
      perPage?: number | undefined
    ) {
      const products = yield* stripe.products.list({ active, after, perPage }).pipe(Effect.orDie)

      const prices = yield* Effect.forEach(
        products,
        (product) => stripe.prices.listAll({ productId: product.id, active }).pipe(Effect.orDie),
        { concurrency: "unbounded" }
      )

      return yield* Product.decodeMany(
        products.map((product, index) => formatProduct(product, prices[index] ?? []))
      ).pipe(Effect.orDie)
    })

    const productsStream: PaymentClient.Methods["products"]["stream"] = (args = {}) =>
      Stream.unwrap(
        Effect.gen(function* () {
          const states = productStatusToActive(args.status)
          const streams = states.map((active) =>
            paginateByLastId(args.after, (cursor) => loadProductsPage(active, cursor, args.perPage))
          )

          return streams.length === 1 ? streams[0]! : Stream.concat(streams[0]!, streams[1]!)
        })
      )

    const productsList: PaymentClient.Methods["products"]["list"] = Effect.fn(function* (args) {
      return yield* productsStream({ after: args.after, perPage: args.perPage, status: ["active"] }).pipe(
        Stream.take(args.perPage ?? 10),
        Stream.runCollect,
        Effect.map(Chunk.toReadonlyArray)
      )
    })

    const productsGet: PaymentClient.Methods["products"]["get"] = Effect.fn(function* (args) {
      const [stripeProduct, productPrices] = yield* Effect.all(
        [stripe.products.get({ productId: args.productId }), stripe.prices.listAll({ productId: args.productId })],
        { concurrency: "unbounded" }
      ).pipe(Effect.orDie)

      return yield* Option.match(stripeProduct, {
        onNone: () => Effect.succeed(Option.none<Product>()),
        onSome: (product) =>
          pipe(Product.decode(formatProduct(product, productPrices)), Effect.map(Option.some), Effect.orDie)
      })
    })

    const productsCreate: PaymentClient.Methods["products"]["create"] = Effect.fn(function* (args) {
      const stripeProduct = yield* stripe.products.create(args)
      const productPrices = yield* stripe.prices.listAll({ productId: stripeProduct.id }).pipe(Effect.orDie)

      return yield* Product.decode(formatProduct(stripeProduct, productPrices)).pipe(Effect.orDie)
    })

    const productsUpdate: PaymentClient.Methods["products"]["update"] = Effect.fn(function* (args) {
      const stripeProduct = yield* stripe.products.update(args)
      const productPrices = yield* stripe.prices.listAll({ productId: stripeProduct.id }).pipe(Effect.orDie)

      return yield* Product.decode(formatProduct(stripeProduct, productPrices)).pipe(Effect.orDie)
    })

    const productsArchive: PaymentClient.Methods["products"]["archive"] = Effect.fn(function* (args) {
      const stripeProduct = yield* stripe.products.update({
        productId: args.productId,
        active: false
      })
      const productPrices = yield* stripe.prices.listAll({ productId: stripeProduct.id }).pipe(Effect.orDie)

      return yield* Product.decode(formatProduct(stripeProduct, productPrices)).pipe(Effect.orDie)
    })

    // ----------------------------------------------------------------------------------------

    const customersFind: PaymentClient.Methods["customers"]["find"] = Effect.fn(function* (args) {
      const customers = yield* stripe.customers
        .find({
          id: args.customerProviderId ? [args.customerProviderId] : undefined,
          email: args.email ? [args.email] : undefined,
          perPage: 1
        })
        .pipe(Effect.orDie)

      const customer = customers.at(0)
      if (!customer) {
        return Option.none<Customer>()
      }

      return yield* Customer.decode(formatCustomer(customer)).pipe(Effect.map(Option.some), Effect.orDie)
    })

    const customersGet: PaymentClient.Methods["customers"]["get"] = Effect.fn(function* (args) {
      const stripeCustomer = yield* stripe.customers.get({ customerId: args.customerProviderId }).pipe(Effect.orDie)

      return yield* Option.match(stripeCustomer, {
        onNone: () => Effect.succeed(Option.none<Customer>()),
        onSome: (customer) => Customer.decode(formatCustomer(customer)).pipe(Effect.map(Option.some), Effect.orDie)
      })
    })

    const customersCreate: PaymentClient.Methods["customers"]["create"] = Effect.fn(function* (args) {
      const stripeCustomer = yield* stripe.customers.create(args)

      return yield* Customer.decode(formatCustomer(stripeCustomer)).pipe(Effect.orDie)
    })

    const customersUpdate: PaymentClient.Methods["customers"]["update"] = Effect.fn(function* (args) {
      const stripeCustomer = yield* stripe.customers.update({
        customerId: args.customerProviderId,
        email: args.email,
        name: args.name,
        locale: args.locale
      })

      return yield* Customer.decode(formatCustomer(stripeCustomer)).pipe(Effect.orDie)
    })

    // ----------------------------------------------------------------------------------------

    const subscriptionStream: PaymentClient.Methods["subscriptions"]["stream"] = (args) =>
      paginateByLastId(args.after, (cursor) =>
        stripe.subscriptions
          .list({
            customerId: args.customerProviderId,
            status: args.status,
            after: cursor,
            perPage: args.perPage
          })
          .pipe(
            Effect.flatMap((subscriptions) => Subscription.decodeMany(subscriptions.map(formatSubscription))),
            Effect.orDie
          )
      )

    const subscriptionsList: PaymentClient.Methods["subscriptions"]["list"] = Effect.fn(function* (args) {
      return yield* subscriptionStream({
        customerProviderId: args.customerProviderId,
        after: args.after,
        perPage: args.perPage
      }).pipe(Stream.take(args.perPage ?? 10), Stream.runCollect, Effect.map(Chunk.toReadonlyArray))
    })

    const subscriptionsGet: PaymentClient.Methods["subscriptions"]["get"] = Effect.fn(function* (args) {
      const stripeSubscription = yield* stripe.subscriptions
        .get({ subscriptionId: args.subscriptionId })
        .pipe(Effect.orDie)

      return yield* Option.match(stripeSubscription, {
        onNone: () => Effect.succeed(Option.none<Subscription>()),
        onSome: (subscription) =>
          Subscription.decode(formatSubscription(subscription)).pipe(Effect.map(Option.some), Effect.orDie)
      })
    })

    const subscriptionsLatest: PaymentClient.Methods["subscriptions"]["latest"] = Effect.fn(function* (args) {
      return yield* subscriptionStream({ customerProviderId: args.customerProviderId, perPage: 10 }).pipe(
        Stream.take(1),
        Stream.runHead
      )
    })

    const subscriptionsCancel: PaymentClient.Methods["subscriptions"]["cancel"] = Effect.fn(function* (args) {
      yield* stripe.subscriptions
        .cancel({
          subscriptionId: args.subscriptionId,
          immediate: args.effectiveFrom === "immediately"
        })
        .pipe(Effect.orDie)
    })

    const subscriptionsChange: PaymentClient.Methods["subscriptions"]["change"] = Effect.fn(function* (args) {
      const subscription = yield* stripe.subscriptions
        .change({
          subscriptionId: args.subscriptionId,
          priceId: args.providerOfferId,
          quantity: args.quantity,
          prorationMode: args.prorationMode
        })
        .pipe(Effect.orDie)

      return yield* Subscription.decode(formatSubscription(subscription)).pipe(Effect.orDie)
    })

    const subscriptionsPreviewChange: PaymentClient.Methods["subscriptions"]["previewChange"] = Effect.fn(
      function* (args) {
        const preview = yield* stripe.subscriptions
          .previewChange({
            subscriptionId: args.subscriptionId,
            priceId: args.providerOfferId,
            quantity: args.quantity,
            prorationMode: args.prorationMode
          })
          .pipe(Effect.orDie)

        const encoded = {
          subscriptionId: args.subscriptionId,
          currencyCode: preview.nextInvoice.currency.toUpperCase(),
          items: formatStripePreviewItems(preview.subscription, preview.price, args.quantity),
          immediateCharge: args.prorationMode === "immediate" ? formatStripePreviewCharge(preview.nextInvoice) : null,
          nextCharge:
            args.prorationMode === "immediate"
              ? formatStripePreviewCharge(preview.recurringInvoice)
              : formatStripePreviewCharge(preview.nextInvoice),
          recurringCharge: formatStripePreviewCharge(preview.recurringInvoice)
        }

        return yield* SubscriptionChangePreview.decode(encoded).pipe(Effect.orDie)
      }
    )

    const subscriptionsCharge: PaymentClient.Methods["subscriptions"]["charge"] = Effect.fn(function* (args) {
      const nextEffectiveFrom = args.effectiveFrom ?? "immediately"

      const preview = yield* stripe.subscriptions
        .previewCharge({
          subscriptionId: args.subscriptionId,
          priceId: args.providerOfferId,
          quantity: args.quantity
        })
        .pipe(Effect.orDie)

      const result = yield* stripe.subscriptions
        .charge({
          subscriptionId: args.subscriptionId,
          priceId: args.providerOfferId,
          quantity: args.quantity,
          effectiveFrom: nextEffectiveFrom
        })
        .pipe(Effect.orDie)

      return yield* SubscriptionChargeResult.decode({
        subscriptionId: args.subscriptionId,
        currencyCode: preview.nextInvoice.currency.toUpperCase(),
        effectiveFrom: nextEffectiveFrom,
        status:
          nextEffectiveFrom === "next_billing_period"
            ? "scheduled"
            : formatTransactionStatus(result.invoice?.status ?? "draft"),
        providerStatus: nextEffectiveFrom === "next_billing_period" ? "scheduled" : (result.invoice?.status ?? "draft"),
        transactionId: result.invoice?.id ?? null,
        charge: formatStripePreviewCharge(preview.nextInvoice)
      }).pipe(Effect.orDie)
    })

    const subscriptionsPreviewCharge: PaymentClient.Methods["subscriptions"]["previewCharge"] = Effect.fn(
      function* (args) {
        const nextEffectiveFrom = args.effectiveFrom ?? "immediately"

        const preview = yield* stripe.subscriptions
          .previewCharge({
            subscriptionId: args.subscriptionId,
            priceId: args.providerOfferId,
            quantity: args.quantity,
            effectiveFrom: nextEffectiveFrom
          })
          .pipe(Effect.orDie)

        return yield* SubscriptionChargePreview.decode({
          subscriptionId: args.subscriptionId,
          currencyCode: preview.nextInvoice.currency.toUpperCase(),
          effectiveFrom: nextEffectiveFrom,
          charge: formatStripePreviewCharge(preview.nextInvoice)
        }).pipe(Effect.orDie)
      }
    )

    const subscriptionsPause: PaymentClient.Methods["subscriptions"]["pause"] = Effect.fn(function* (args) {
      return yield* stripe.subscriptions.pause(args)
    })

    const subscriptionsResume: PaymentClient.Methods["subscriptions"]["resume"] = Effect.fn(function* (args) {
      return yield* stripe.subscriptions.resume(args)
    })

    // ----------------------------------------------------------------------------------------

    const transactionStream: PaymentClient.Methods["transactions"]["stream"] = (args) =>
      paginateByLastId(args.after, (cursor) =>
        stripe.transactions
          .list({
            customerId: args.customerProviderId,
            status: args.status,
            after: cursor,
            perPage: args.perPage
          })
          .pipe(
            Effect.flatMap((transactions) => Transaction.decodeMany(transactions.map(formatTransaction))),
            Effect.orDie
          )
      )

    const transactionsList: PaymentClient.Methods["transactions"]["list"] = Effect.fn(function* (args) {
      return yield* transactionStream({
        customerProviderId: args.customerProviderId,
        after: args.after,
        perPage: args.perPage
      }).pipe(Stream.take(args.perPage ?? 10), Stream.runCollect, Effect.map(Chunk.toReadonlyArray))
    })

    const transactionsGet: PaymentClient.Methods["transactions"]["get"] = Effect.fn(function* (args) {
      const stripeTransaction = yield* stripe.transactions.get({ transactionId: args.transactionId }).pipe(Effect.orDie)

      return yield* Option.match(stripeTransaction, {
        onNone: () => Effect.succeed(Option.none<Transaction>()),
        onSome: (transaction) =>
          Transaction.decode(formatTransaction(transaction)).pipe(Effect.map(Option.some), Effect.orDie)
      })
    })

    const transactionsLatest: PaymentClient.Methods["transactions"]["latest"] = Effect.fn(function* (args) {
      return yield* transactionStream({ customerProviderId: args.customerProviderId, perPage: 10 }).pipe(
        Stream.take(1),
        Stream.runHead
      )
    })

    const transactionsGenerateInvoicePDF: PaymentClient.Methods["transactions"]["generateInvoicePDF"] = Effect.fn(
      function* (args) {
        return yield* stripe.transactions
          .generateInvoicePDF({ transactionId: args.transactionId })
          .pipe(Effect.mapError(() => new InvoiceNotFound()))
      }
    )

    const transactionsPreview: PaymentClient.Methods["transactions"]["preview"] = Effect.fn(function* (args) {
      const preview = yield* stripe.transactions
        .preview({
          customerId: args.providerCustomerId,
          currencyCode: args.currencyCode,
          items: args.items.map((item) => ({
            priceId: item.providerOfferId,
            quantity: item.quantity,
            includeInTotals: item.includeInTotals
          }))
        })
        .pipe(Effect.orDie)

      return yield* TransactionPreviewResult.decode({
        currencyCode: preview.currency.toUpperCase(),
        charge: formatStripePreviewCharge(preview)
      }).pipe(Effect.orDie)
    })

    const transactionsCreate: PaymentClient.Methods["transactions"]["create"] = Effect.fn(function* (args) {
      const invoice = yield* stripe.transactions
        .create({
          customerId: args.providerCustomerId,
          priceId: args.providerOfferId,
          quantity: args.quantity,
          collectionMode: args.collectionMode,
          dueInDays: args.dueInDays
        })
        .pipe(Effect.orDie)

      return yield* Transaction.decode(formatTransaction(invoice)).pipe(Effect.orDie)
    })

    // ----------------------------------------------------------------------------------------

    const refundsList: PaymentClient.Methods["refunds"]["list"] = Effect.fn(function* (args) {
      return yield* stripe.refunds
        .list({
          transactionId: args.transactionId,
          after: args.after,
          perPage: args.perPage
        })
        .pipe(
          Effect.flatMap((refunds) =>
            Effect.forEach(refunds, (refund) => RefundResult.decode(refund), { concurrency: "unbounded" })
          ),
          Effect.orDie
        )
    })

    const refundsGet: PaymentClient.Methods["refunds"]["get"] = Effect.fn(function* (args) {
      return yield* stripe.refunds.get({ refundId: args.refundId }).pipe(
        Effect.flatMap(
          Option.match({
            onNone: () => Effect.succeed(Option.none<RefundResult>()),
            onSome: (refund) => RefundResult.decode(refund).pipe(Effect.map(Option.some), Effect.orDie)
          })
        )
      )
    })

    const refundsCreate: PaymentClient.Methods["refunds"]["create"] = Effect.fn(function* (args) {
      return yield* stripe.transactions
        .refund({ transactionId: args.transactionId, amount: args.amount })
        .pipe(Effect.flatMap(RefundResult.decode), Effect.orDie)
    })

    // ----------------------------------------------------------------------------------------

    const checkoutPrepare: PaymentClient.Methods["checkout"]["prepare"] = Effect.fn(function* (args) {
      const metadata = {
        projectId: args.projectId,
        offerId: args.offerId,
        customerId: args.customerId,
        ...args.metadata
      }

      return yield* stripe.prices.get({ priceId: args.providerOfferId }).pipe(
        Effect.flatMap((priceOption) =>
          Option.match(priceOption, {
            onNone: () =>
              Effect.fail(
                new CheckoutNotSupported({
                  provider: "stripe",
                  message: `Missing Stripe price mapping for offer "${args.offerId}"`
                })
              ),
            onSome: (price) =>
              stripe.checkout.createSession({
                customerId: args.providerCustomerId,
                priceId: args.providerOfferId,
                mode: price.type === "recurring" ? "subscription" : "payment",
                clientReferenceId: args.providerCustomerId,
                successUrl: args.successUrl ?? "https://example.com/pay/success?session_id={CHECKOUT_SESSION_ID}",
                cancelUrl: args.cancelUrl ?? "https://example.com/pay/cancel",
                metadata,
                paymentIntentMetadata: metadata,
                subscriptionMetadata: metadata
              })
          })
        ),
        Effect.map((session) =>
          CheckoutSession.make({
            mode: "hosted",
            provider: "stripe",
            environment: config.environment,
            offerId: CommercialOfferId.make(args.offerId),
            providerCustomerId: args.providerCustomerId,
            ...(typeof session.invoice === "string"
              ? { providerTransactionId: TransactionId.make(session.invoice) }
              : {}),
            ...(typeof session.subscription === "string"
              ? { providerSubscriptionId: SubscriptionId.make(session.subscription) }
              : {}),
            ...(session.url ? { url: session.url } : {}),
            token: session.id,
            metadata
          })
        )
      )
    })

    // ----------------------------------------------------------------------------------------

    const billingPortalCreateSession: PaymentClient.Methods["billingPortal"]["createSession"] = Effect.fn(
      function* (args) {
        const session = yield* stripe.billingPortal
          .createSession({
            customerId: args.providerCustomerId,
            subscriptionId: args.providerSubscriptionId,
            flow: args.flow,
            returnUrl: args.returnUrl
          })
          .pipe(Effect.orDie)

        return yield* BillingPortalSession.decode({
          id: session.id,
          flow: args.flow ?? "general",
          provider: "stripe",
          environment: config.environment,
          providerCustomerId: args.providerCustomerId,
          providerSubscriptionId: args.providerSubscriptionId ?? null,
          url: session.url,
          createdAt: new Date(session.created * 1000).toISOString()
        }).pipe(Effect.orDie)
      }
    )

    const methods = {
      _tag: Stripe._tag,
      stripeHi,
      webhooksUnmarshal,
      webhooksNormalize,
      prices: {
        list: pricesList,
        get: pricesGet,
        create: pricesCreate,
        update: pricesUpdate,
        archive: pricesArchive
      },
      products: {
        list: productsList,
        get: productsGet,
        create: productsCreate,
        update: productsUpdate,
        archive: productsArchive,
        stream: productsStream
      },
      customers: {
        find: customersFind,
        get: customersGet,
        create: customersCreate,
        update: customersUpdate
      },
      subscriptions: {
        list: subscriptionsList,
        get: subscriptionsGet,
        latest: subscriptionsLatest,
        cancel: subscriptionsCancel,
        change: subscriptionsChange,
        previewChange: subscriptionsPreviewChange,
        previewCharge: subscriptionsPreviewCharge,
        charge: subscriptionsCharge,
        pause: subscriptionsPause,
        resume: subscriptionsResume,
        stream: subscriptionStream
      },
      transactions: {
        list: transactionsList,
        get: transactionsGet,
        latest: transactionsLatest,
        stream: transactionStream,
        generateInvoicePDF: transactionsGenerateInvoicePDF,
        preview: transactionsPreview,
        create: transactionsCreate
      },
      refunds: {
        list: refundsList,
        get: refundsGet,
        create: refundsCreate
      },
      checkout: {
        prepare: checkoutPrepare
      },
      billingPortal: {
        createSession: billingPortalCreateSession
      }
    } satisfies Omit<StripeImpl, "onDialect" | "onDialectOrElse">

    return makePaymentClient<StripeImpl>(Stripe._tag, methods)
  })

  static layerConfig = (config: StripeConfig) =>
    Layer.effect(PaymentClient, Stripe.make).pipe(Layer.provide(Layer.effect(StripeClient, makeStripeClient(config))))

  static layer = Layer.effect(PaymentClient, Stripe.make).pipe(
    Layer.provide(
      Layer.unwrapEffect(
        Effect.gen(function* () {
          const config = yield* StripeConfig

          return Layer.effect(StripeClient, makeStripeClient(config))
        })
      )
    )
  )
}

const toIso = (timestamp: number | null | undefined) => (timestamp ? new Date(timestamp * 1000).toISOString() : null)

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {}

const asArrayRecords = (value: unknown): ReadonlyArray<Record<string, unknown>> =>
  Array.isArray(value) ? value.map(asRecord) : []

const readString = (record: Record<string, unknown>, keys: ReadonlyArray<string>): string | undefined => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.length > 0) {
      return value
    }
  }

  return undefined
}

const readNumber = (record: Record<string, unknown>, keys: ReadonlyArray<string>): number | undefined => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "number" && Number.isFinite(value)) {
      return value
    }

    if (typeof value === "string" && value.length > 0) {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }

  return undefined
}

const readBoolean = (record: Record<string, unknown>, keys: ReadonlyArray<string>): boolean | undefined => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "boolean") {
      return value
    }

    if (typeof value === "number") {
      return value !== 0
    }
  }

  return undefined
}

const readDate = (record: Record<string, unknown>, keys: ReadonlyArray<string>): Date | undefined => {
  for (const key of keys) {
    const value = record[key]
    if (value instanceof Date) {
      return value
    }

    if (typeof value === "number") {
      return new Date(value * 1000)
    }

    if (typeof value === "string") {
      const parsed = new Date(value)
      if (!Number.isNaN(parsed.getTime())) {
        return parsed
      }
    }
  }

  return undefined
}

const readMetadata = (record: Record<string, unknown>) =>
  asRecord(record.metadata ?? record.custom_data ?? record.customData)

const detectWebhookKind = (eventType: string): PaymentWebhookKind => {
  if (eventType === "checkout.session.completed" || eventType === "checkout.completed") {
    return "checkout_completed"
  }

  if (eventType.includes("subscription.")) {
    return "subscription_updated"
  }

  if (eventType.includes("refund") || eventType.includes("adjustment.")) {
    return "refund_updated"
  }

  if (eventType.includes("transaction.") || eventType.includes("invoice.")) {
    return "transaction_updated"
  }

  if (eventType.includes("customer.")) {
    return "customer_updated"
  }

  return "webhook_unhandled"
}

const normalizeStripeWebhook = (event: unknown): PaymentWebhookNormalization => {
  const envelope = asRecord(event)
  const resource = asRecord(asRecord(envelope.data).object)
  const metadata = readMetadata(resource)
  const eventType = readString(envelope, ["type"]) ?? "webhook.unhandled"
  const firstSubscriptionItem = asArrayRecords(asRecord(asRecord(resource.items).data))[0]
  const firstInvoiceLine = asArrayRecords(asRecord(asRecord(resource.lines).data))[0]
  const charge = asRecord(resource.charge)

  return {
    providerEventId: readString(envelope, ["id"]) ?? crypto.randomUUID(),
    eventType,
    kind: detectWebhookKind(eventType),
    occurredAt: readDate(envelope, ["created"]),
    resource,
    metadata,
    checkoutSessionId: readString(resource, ["id"]),
    providerCustomerId:
      readString(resource, ["customer", "customer_id", "customerId"]) ??
      (detectWebhookKind(eventType) === "customer_updated" ? readString(resource, ["id"]) : undefined),
    providerSubscriptionId: readString(resource, ["subscription", "id"]),
    providerInvoiceId: readString(resource, ["invoice", "id"]) ?? readString(charge, ["invoice"]),
    providerTransactionId: readString(resource, ["payment_intent"]),
    providerOfferId:
      readString(asRecord(firstSubscriptionItem?.price), ["id"]) ??
      readString(asRecord(firstSubscriptionItem?.plan), ["id"]) ??
      readString(asRecord(asRecord(firstInvoiceLine?.pricing).price_details), ["price"]) ??
      readString(asRecord(firstInvoiceLine?.price), ["id"]),
    quantity: readNumber(resource, ["quantity"]) ?? readNumber(asRecord(firstSubscriptionItem ?? {}), ["quantity"]),
    status: readString(resource, ["status"]),
    canceled:
      readBoolean(resource, ["canceled"]) ??
      (eventType.includes("canceled") || readString(resource, ["status"]) === "canceled"),
    cancelAtPeriodEnd: readBoolean(resource, ["cancel_at_period_end"]),
    startedAt: readDate(resource, ["started_at", "start_date", "created"]),
    trialEndsAt: readDate(resource, ["trial_ends_at", "trial_end"]),
    currentPeriodStartAt: readDate(asRecord(firstSubscriptionItem ?? {}), ["starts_at", "current_period_start"]),
    currentPeriodEndAt: readDate(asRecord(firstSubscriptionItem ?? {}), [
      "ends_at",
      "current_period_end",
      "next_billed_at"
    ]),
    canceledAt: readDate(resource, ["canceled_at", "cancel_at"]),
    endedAt: readDate(resource, ["ended_at"]),
    amount: readNumber(resource, ["amount_refunded", "amount_paid", "amount_due", "total", "amount"]),
    currency: readString(resource, ["currency", "currency_code"]),
    description: readString(resource, ["description", "invoice_number"]),
    hostedUrl: readString(resource, ["hosted_invoice_url", "invoice_pdf"]),
    periodStartAt: readDate(resource, ["period_start", "starts_at"]),
    periodEndAt: readDate(resource, ["period_end", "ends_at"])
  }
}

const formatAmount = (amount: { toString(): string } | string | number | null | undefined) =>
  amount === null || typeof amount === "undefined" ? "0" : amount.toString()

const resolveProductId = (price: StripePrice | null | undefined, fallback: string) => {
  if (!price) {
    return fallback
  }

  return typeof price.product === "string" ? price.product : price.product.id
}

const resolveProduct = (price: StripePrice | null | undefined) => {
  if (!price || typeof price.product === "string" || "deleted" in price.product) {
    return null
  }

  return price.product
}

const formatSubscriptionStatus = (status: StripeSubscription["status"]): (typeof Subscription.Type)["status"] => {
  switch (status) {
    case "active":
    case "canceled":
    case "past_due":
    case "paused":
    case "trialing":
      return status
    case "incomplete":
    case "incomplete_expired":
    case "unpaid":
      return "past_due"
  }
}

const formatTransactionStatus = (status: StripeInvoice["status"]): (typeof Transaction.Type)["status"] => {
  switch (status) {
    case "open":
      return "billed"
    case "paid":
      return "paid"
    case "uncollectible":
      return "past_due"
    case "void":
      return "canceled"
    case "draft":
    case null:
    default:
      return "draft"
  }
}

const formatCustomer = (customer: StripeCustomer): typeof Customer.Encoded => {
  return {
    id: customer.id,
    email: customer.email ?? "",
    name: customer.name ?? customer.email ?? customer.id,
    metadata: customer.metadata ?? {}
  } satisfies typeof Customer.Encoded
}

const formatPrice = (price: StripePrice): typeof Price.Encoded => {
  return {
    id: price.id,
    name: price.nickname ?? "",
    productId: resolveProductId(price, price.id),
    unitPrice: {
      amount: formatAmount(price.unit_amount_decimal ?? price.unit_amount),
      currencyCode: price.currency.toUpperCase()
    },
    unitPriceOverride: Object.entries(price.currency_options ?? {}).map(([currencyCode, option]) => ({
      countryCodes: [],
      unitPrice: {
        amount: formatAmount(option.unit_amount_decimal ?? option.unit_amount),
        currencyCode: currencyCode.toUpperCase()
      }
    })),
    billingCycle: price.recurring
      ? {
          interval: price.recurring.interval,
          frequency: price.recurring.interval_count
        }
      : null,
    trialPeriod:
      typeof price.recurring?.trial_period_days === "number"
        ? {
            interval: "day",
            frequency: price.recurring.trial_period_days
          }
        : null,
    active: price.active,
    createdAt: new Date(price.created * 1000).toISOString(),
    updatedAt: new Date(price.created * 1000).toISOString(),
    quantity: {
      minimum: 1,
      maximum: 1
    },
    metadata: price.metadata ?? {}
  } satisfies typeof Price.Encoded
}

const formatProduct = (product: StripeProduct, prices: ReadonlyArray<StripePrice>): typeof Product.Encoded => {
  return {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? "",
    metadata: product.metadata ?? {},
    prices: prices.map(formatPrice)
  } satisfies typeof Product.Encoded
}

const formatSubscription = (subscription: StripeSubscription): typeof Subscription.Encoded => {
  const item = subscription.items.data[0]
  const price = item?.price
  const product = resolveProduct(price)
  const productId = resolveProductId(price, subscription.id)

  return {
    id: subscription.id,
    status: formatSubscriptionStatus(subscription.status),
    product: {
      id: productId,
      name: product?.name ?? subscription.description ?? productId,
      description: product?.description ?? subscription.description ?? ""
    },
    price: {
      id: price?.id ?? subscription.id,
      name: price?.nickname ?? product?.name ?? "",
      unitPrice: {
        amount: formatAmount(price?.unit_amount_decimal ?? price?.unit_amount),
        currencyCode: (price?.currency ?? subscription.currency).toUpperCase()
      }
    },
    addressId: "",
    currencyCode: subscription.currency.toUpperCase(),
    createdAt: new Date(subscription.created * 1000).toISOString(),
    updatedAt: new Date(subscription.created * 1000).toISOString(),
    startedAt: toIso(subscription.start_date),
    firstBilledAt: toIso(subscription.created),
    nextBilledAt: toIso(item?.current_period_end),
    pausedAt: subscription.status === "paused" ? toIso(subscription.trial_end ?? subscription.created) : null,
    canceledAt: toIso(subscription.canceled_at),
    currentBillingPeriod:
      item?.current_period_start && item.current_period_end
        ? {
            startsAt: new Date(item.current_period_start * 1000).toISOString(),
            endsAt: new Date(item.current_period_end * 1000).toISOString()
          }
        : null,
    billingCycle: price?.recurring
      ? {
          interval: price.recurring.interval,
          frequency: price.recurring.interval_count
        }
      : null,
    scheduledChange:
      subscription.cancel_at_period_end && item?.current_period_end
        ? {
            action: "cancel",
            effectiveAt: new Date(item.current_period_end * 1000).toISOString(),
            resumeAt: null
          }
        : null,
    managementUrls: {
      updatePaymentMethod: null
    },
    metadata: subscription.metadata ?? {},
    items: subscription.items.data.map((subscriptionItem) => {
      const itemPrice = subscriptionItem.price
      const itemProduct = resolveProduct(itemPrice)

      return {
        quantity: subscriptionItem.quantity ?? 1,
        recurring: itemPrice.type === "recurring",
        price: {
          id: itemPrice.id,
          unitPrice: {
            amount: formatAmount(itemPrice.unit_amount_decimal ?? itemPrice.unit_amount),
            currencyCode: itemPrice.currency.toUpperCase()
          },
          name: itemPrice.nickname ?? itemProduct?.name ?? itemPrice.id,
          description: itemProduct?.description ?? ""
        },
        product: {
          id: resolveProductId(itemPrice, subscriptionItem.id),
          name: itemProduct?.name ?? itemPrice.nickname ?? subscriptionItem.id,
          description: itemProduct?.description ?? ""
        }
      }
    }),
    nextTransaction: null
  } satisfies typeof Subscription.Encoded
}

const formatPreviewBillingPeriod = (start: number | null | undefined, end: number | null | undefined) =>
  start && end
    ? {
        startsAt: new Date(start * 1000).toISOString(),
        endsAt: new Date(end * 1000).toISOString()
      }
    : null

const formatStripePreviewLineItem = (lineItem: StripeInvoiceLineItem) => {
  const priceDetails = lineItem.pricing?.price_details
  if (!priceDetails?.product || !priceDetails.price) {
    return null
  }

  return {
    priceId: typeof priceDetails.price === "string" ? priceDetails.price : priceDetails.price.id,
    productId: priceDetails.product,
    quantity: lineItem.quantity ?? 1,
    amount: formatAmount(lineItem.amount),
    currencyCode: lineItem.currency.toUpperCase(),
    description: lineItem.description ?? "",
    billingPeriod: formatPreviewBillingPeriod(lineItem.period?.start, lineItem.period?.end)
  }
}

const formatStripePreviewCharge = (invoice: StripeInvoice) => ({
  subtotal: formatAmount(invoice.subtotal),
  tax: formatAmount((invoice.total_taxes ?? []).reduce((total, tax) => total + tax.amount, 0)),
  total: formatAmount(invoice.total),
  currencyCode: invoice.currency.toUpperCase(),
  billingPeriod: formatPreviewBillingPeriod(invoice.period_start, invoice.period_end),
  lineItems: invoice.lines.data.flatMap((lineItem) => {
    const formatted = formatStripePreviewLineItem(lineItem)
    return formatted ? [formatted] : []
  })
})

const formatStripePreviewItems = (
  subscription: StripeSubscription,
  previewPrice: StripePrice,
  quantity: number | undefined
) =>
  subscription.items.data.map((subscriptionItem, index) => {
    const nextPrice = index === 0 ? previewPrice : subscriptionItem.price
    return {
      priceId: nextPrice.id,
      productId: resolveProductId(nextPrice, subscriptionItem.id),
      quantity: index === 0 ? (quantity ?? subscriptionItem.quantity ?? 1) : (subscriptionItem.quantity ?? 1)
    }
  })

const getInvoiceUpdatedAt = (invoice: StripeInvoice) => {
  return (
    invoice.status_transitions.paid_at ??
    invoice.status_transitions.voided_at ??
    invoice.status_transitions.marked_uncollectible_at ??
    invoice.status_transitions.finalized_at ??
    invoice.created
  )
}

const formatStripePaymentTerms = (invoice: StripeInvoice) => {
  if (invoice.collection_method !== "send_invoice" || !invoice.due_date) {
    return null
  }

  const frequency = Math.max(1, Math.round((invoice.due_date - invoice.created) / (24 * 60 * 60)))

  return {
    interval: "day" as const,
    frequency
  }
}

const formatTransaction = (invoice: StripeInvoice): typeof Transaction.Encoded => {
  return {
    id: invoice.id,
    reason: invoice.billing_reason ?? invoice.description ?? "manual",
    status: formatTransactionStatus(invoice.status),
    collectionMode: invoice.collection_method === "send_invoice" ? "manual" : "automatic",
    invoiceId: invoice.id,
    invoiceNumber: invoice.number ?? null,
    currencyCode: invoice.currency.toUpperCase(),
    createdAt: new Date(invoice.created * 1000).toISOString(),
    billedAt: toIso(invoice.status_transitions.finalized_at ?? invoice.status_transitions.paid_at),
    updatedAt: new Date(getInvoiceUpdatedAt(invoice) * 1000).toISOString(),
    paymentTerms: formatStripePaymentTerms(invoice),
    checkoutUrl: invoice.hosted_invoice_url ?? null,
    discount: invoice.discounts?.[0]
      ? typeof invoice.discounts[0] === "string"
        ? invoice.discounts[0]
        : invoice.discounts[0].id
      : null,
    billingPeriod:
      invoice.period_start && invoice.period_end
        ? {
            startsAt: new Date(invoice.period_start * 1000).toISOString(),
            endsAt: new Date(invoice.period_end * 1000).toISOString()
          }
        : null,
    items: invoice.lines.data.map((item) => {
      const price = item.pricing?.price_details?.price

      return {
        name: item.description ?? item.id,
        productId: item.pricing?.price_details?.product ?? item.id,
        priceId: typeof price === "string" ? price : (price?.id ?? item.id),
        unitPrice: {
          amount: formatAmount(item.pricing?.unit_amount_decimal ?? item.amount),
          currencyCode: item.currency.toUpperCase()
        },
        quantity: item.quantity ?? 1
      }
    }),
    payments: [],
    dueAt: toIso(invoice.due_date)
  } satisfies typeof Transaction.Encoded
}

const paginateByLastId = <A extends { id: string }>(
  after: string | undefined,
  getPage: (cursor: string | undefined) => Effect.Effect<ReadonlyArray<A>>
) =>
  Stream.paginateChunkEffect(after, (cursor) =>
    Effect.map(getPage(cursor), (results) => [
      Chunk.fromIterable(results),
      results.length === 0 ? Option.none<string>() : Option.some(results[results.length - 1].id)
    ])
  )

const productStatusToActive = (status?: Array<string>) => {
  const values = status ?? ["active"]

  if (values.includes("active") && values.includes("archived")) {
    return [true, false] as const
  }

  if (values.includes("archived")) {
    return [false] as const
  }

  return [true] as const
}

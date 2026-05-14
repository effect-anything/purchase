import * as Chunk from "effect/Chunk"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Redacted from "effect/Redacted"
import * as Stream from "effect/Stream"

import type { PaymentProviderTag } from "../provider/types.ts"
import type {
  PaddleCustomer,
  PaddlePrice,
  PaddleProduct,
  PaddleSubscription,
  PaddleTransaction
} from "./internal/paddle-schema.ts"

import { CommercialOfferId } from "../core/commercial-schema.ts"
import { CheckoutNotSupported, InvoiceNotFound, PriceNotFound, ProviderOperationNotSupported } from "../errors.ts"
import {
  makePaymentClient,
  type PaddleImpl,
  PaymentClient,
  type PaymentWebhookKind,
  type PaymentWebhookNormalization
} from "../provider/client.ts"
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
} from "../provider/schema.ts"
import { makePaddleClient, PaddleClient, PaddleConfig } from "./internal/paddle-client.ts"

/**
 * Paddle payment client service.
 */
export class Paddle extends Context.Tag("@pay:provider-paddle")<Paddle, PaddleImpl>() {
  static readonly _tag: PaymentProviderTag = "paddle"

  static make = Effect.gen(function* () {
    const paddle = yield* PaddleClient
    const config = paddle.config

    const paddleHi: PaddleImpl["paddleHi"] = Effect.succeed("hi")

    const webhooksUnmarshal: PaymentClient.Methods["webhooksUnmarshal"] = ({ signature, payload }) =>
      paddle.webhooksUnmarshal(payload, Redacted.value(config.webhookToken), signature)

    const webhooksNormalize: PaymentClient.Methods["webhooksNormalize"] = (event) =>
      Effect.succeed(normalizePaddleWebhook(event))

    // ----------------------------------------------------------------------------------------

    const priceList: PaymentClient.Methods["prices"]["list"] = Effect.fn(function* (args) {
      const prices = yield* paddle.prices
        .list({
          productId: args.productId ? [args.productId] : undefined,
          after: args.after,
          perPage: args.perPage
        })
        .pipe(Effect.orDie)

      return yield* Price.decodeMany(prices.map(formatPrices)).pipe(Effect.orDie)
    })

    const priceGet: PaymentClient.Methods["prices"]["get"] = Effect.fn(function* (args) {
      const paddlePrice = yield* paddle.prices.get({ priceId: args.priceId }).pipe(Effect.orDie)

      return yield* Option.match(paddlePrice, {
        onNone: () => Effect.succeed(Option.none<Price>()),
        onSome: (price) => Price.decode(formatPrices(price)).pipe(Effect.map(Option.some), Effect.orDie)
      })
    })

    const priceCreate: PaymentClient.Methods["prices"]["create"] = Effect.fn(function* (args) {
      const paddlePrice = yield* paddle.prices.create(args)

      return yield* Price.decode(formatPrices(paddlePrice)).pipe(Effect.orDie)
    })

    const priceUpdate: PaymentClient.Methods["prices"]["update"] = Effect.fn(function* (args) {
      const paddlePrice = yield* paddle.prices.update(args)

      return yield* Price.decode(formatPrices(paddlePrice)).pipe(Effect.orDie)
    })

    const priceArchive: PaymentClient.Methods["prices"]["archive"] = Effect.fn(function* (args) {
      const paddlePrice = yield* paddle.prices.update({
        priceId: args.priceId,
        active: false
      })

      return yield* Price.decode(formatPrices(paddlePrice)).pipe(Effect.orDie)
    })

    // ----------------------------------------------------------------------------------------

    const productStream: PaymentClient.Methods["products"]["stream"] = (args = {}) =>
      Stream.unwrap(
        Effect.gen(function* () {
          const findStatus = args.status ?? ["active", "archived"]

          const prices = yield* paddle.prices
            .list({
              type: ["standard"],
              status: findStatus,
              perPage: args.perPage ?? 50
            })
            .pipe(Effect.orDie)

          const get = (cursor: string | undefined) =>
            paddle.products
              .list({ status: findStatus, after: cursor, perPage: args.perPage, orderBy: args.orderBy })
              .pipe(
                Effect.flatMap((products) =>
                  Product.decodeMany(products.map((product) => formatProduct(product, prices)))
                ),
                Effect.orDie
              )

          const products = Stream.paginateChunkEffect(args.after, (cursor) =>
            Effect.map(get(cursor), (results) => [
              Chunk.fromIterable(results),
              results.length === 0 ? Option.none<string>() : Option.some<string>(results[results.length - 1].id)
            ])
          )

          return products
        })
      )

    const productList: PaymentClient.Methods["products"]["list"] = Effect.fn(function* (args) {
      return yield* productStream({ after: args.after, status: ["active"], perPage: args.perPage }).pipe(
        Stream.take(args.perPage ?? 10),
        Stream.runCollect,
        Effect.map(Chunk.toReadonlyArray)
      )
    })

    const productGet: PaymentClient.Methods["products"]["get"] = Effect.fn(function* (args) {
      const [paddleProduct, productPrices] = yield* Effect.all(
        [paddle.products.get({ productId: args.productId }), paddle.prices.list({ productId: [args.productId] })],
        { concurrency: "unbounded" }
      ).pipe(Effect.orDie)

      return yield* Option.match(paddleProduct, {
        onNone: () => Effect.succeed(Option.none<Product>()),
        onSome: (product) =>
          pipe(Product.decode(formatProduct(product, productPrices)), Effect.map(Option.some), Effect.orDie)
      })
    })

    const productCreate: PaymentClient.Methods["products"]["create"] = Effect.fn(function* (args) {
      const paddleProduct = yield* paddle.products.create(args)
      const productPrices = yield* paddle.prices.list({ productId: [paddleProduct.id] }).pipe(Effect.orDie)

      return yield* Product.decode(formatProduct(paddleProduct, productPrices)).pipe(Effect.orDie)
    })

    const productUpdate: PaymentClient.Methods["products"]["update"] = Effect.fn(function* (args) {
      const paddleProduct = yield* paddle.products.update(args)
      const productPrices = yield* paddle.prices.list({ productId: [paddleProduct.id] }).pipe(Effect.orDie)

      return yield* Product.decode(formatProduct(paddleProduct, productPrices)).pipe(Effect.orDie)
    })

    const productArchive: PaymentClient.Methods["products"]["archive"] = Effect.fn(function* (args) {
      const paddleProduct = yield* paddle.products.update({
        productId: args.productId,
        active: false
      })
      const productPrices = yield* paddle.prices.list({ productId: [paddleProduct.id] }).pipe(Effect.orDie)

      return yield* Product.decode(formatProduct(paddleProduct, productPrices)).pipe(Effect.orDie)
    })

    // ----------------------------------------------------------------------------------------

    const customerFind: PaymentClient.Methods["customers"]["find"] = Effect.fn(function* (args) {
      const customers = yield* paddle.customers
        .find({
          id: args.customerProviderId ? [args.customerProviderId] : undefined,
          email: args.email ? [args.email] : undefined
        })
        .pipe(Effect.orDie)

      const customer = customers.at(0)

      if (!customer) {
        return Option.none<Customer>()
      }

      return yield* Customer.decode(formatCustomer(customer)).pipe(Effect.map(Option.some), Effect.orDie)
    })

    const customerGet: PaymentClient.Methods["customers"]["get"] = Effect.fn(function* (args) {
      const paddleCustomer = yield* paddle.customers
        .get({ customerId: args.customerProviderId })
        .pipe(Effect.map(Option.map(formatCustomer)), Effect.orDie)

      return yield* Option.match(paddleCustomer, {
        onNone: () => Effect.succeed(Option.none<Customer>()),
        onSome: (customer) => Customer.decode(customer).pipe(Effect.map(Option.some), Effect.orDie)
      })
    })

    const customerCreate: PaymentClient.Methods["customers"]["create"] = Effect.fn(function* (args) {
      const paddleCustomer = yield* paddle.customers.create(args).pipe(Effect.orDie)

      const customerEncoded = formatCustomer(paddleCustomer)

      return yield* Customer.decode(customerEncoded).pipe(Effect.orDie)
    })

    const customerUpdate: PaymentClient.Methods["customers"]["update"] = Effect.fn(function* (args) {
      const paddleCustomer = yield* paddle.customers
        .update({
          customerId: args.customerProviderId,
          email: args.email,
          name: args.name,
          locale: args.locale
        })
        .pipe(Effect.orDie)

      const customerEncoded = formatCustomer(paddleCustomer)

      return yield* Customer.decode(customerEncoded).pipe(Effect.orDie)
    })

    // ----------------------------------------------------------------------------------------

    const subscriptionStream: PaymentClient.Methods["subscriptions"]["stream"] = (args) =>
      Stream.unwrap(
        Effect.gen(function* () {
          const get = (after: string | undefined) =>
            paddle.subscriptions
              .list({
                customerId: args.customerProviderId,
                after,
                status: args.status,
                perPage: args.perPage ?? 10,
                orderBy: args.orderBy
              })
              .pipe(
                Effect.flatMap((transactions) => Subscription.decodeMany(transactions.map(formatSubscription))),
                Effect.orDie
              )

          return Stream.paginateChunkEffect(args.after, (after) =>
            Effect.map(get(after), (results) => [
              Chunk.fromIterable(results),
              results.length === 0 ? Option.none<string>() : Option.some<string>(results[results.length - 1].id)
            ])
          )
        })
      )

    const subscriptionList: PaymentClient.Methods["subscriptions"]["list"] = Effect.fn(function* (args) {
      return yield* subscriptionStream({
        customerProviderId: args.customerProviderId,
        after: args.after,
        orderBy: args.orderBy,
        perPage: args.perPage
      }).pipe(Stream.take(args.perPage ?? 10), Stream.runCollect, Effect.map(Chunk.toReadonlyArray))
    })

    const subscriptionGet: PaymentClient.Methods["subscriptions"]["get"] = Effect.fn(function* (args) {
      const paddleSubscription = yield* paddle.subscriptions
        .get({ subscriptionId: args.subscriptionId })
        .pipe(Effect.map(Option.map(formatSubscription)), Effect.orDie)

      const subscription = yield* Option.match(paddleSubscription, {
        onNone: () => Effect.succeed(Option.none<Subscription>()),
        onSome: (decodedSubscription) =>
          Subscription.decode(decodedSubscription).pipe(Effect.map(Option.fromNullable), Effect.orDie)
      })

      return subscription
    })

    const subscriptionLatest: PaymentClient.Methods["subscriptions"]["latest"] = Effect.fn(function* (args) {
      return yield* subscriptionStream({ customerProviderId: args.customerProviderId }).pipe(
        Stream.take(1),
        Stream.runHead
      )
    })

    const subscriptionChange: PaymentClient.Methods["subscriptions"]["change"] = Effect.fn(function* (args) {
      const subscription = yield* paddle.subscriptions
        .change({
          subscriptionId: args.subscriptionId,
          priceId: args.providerOfferId,
          quantity: args.quantity,
          prorationMode: args.prorationMode
        })
        .pipe(Effect.orDie)

      return yield* Subscription.decode(formatSubscription(subscription)).pipe(Effect.orDie)
    })

    const subscriptionPreviewChange: PaymentClient.Methods["subscriptions"]["previewChange"] = Effect.fn(
      function* (args) {
        const preview = yield* paddle.subscriptions
          .previewChange({
            subscriptionId: args.subscriptionId,
            priceId: args.providerOfferId,
            quantity: args.quantity,
            prorationMode: args.prorationMode
          })
          .pipe(Effect.orDie)

        return yield* SubscriptionChangePreview.decode(formatPaddlePreview(preview)).pipe(Effect.orDie)
      }
    )

    const subscriptionCharge: PaymentClient.Methods["subscriptions"]["charge"] = Effect.fn(function* (args) {
      const nextEffectiveFrom = args.effectiveFrom ?? "immediately"

      const preview = yield* paddle.subscriptions
        .previewCharge({
          subscriptionId: args.subscriptionId,
          priceId: args.providerOfferId,
          quantity: args.quantity,
          effectiveFrom: nextEffectiveFrom
        })
        .pipe(Effect.orDie)

      yield* paddle.subscriptions
        .charge({
          subscriptionId: args.subscriptionId,
          priceId: args.providerOfferId,
          quantity: args.quantity,
          effectiveFrom: nextEffectiveFrom
        })
        .pipe(Effect.orDie)

      const charge =
        nextEffectiveFrom === "immediately"
          ? preview.immediate_transaction
            ? formatPaddlePreviewCharge(
                preview.immediate_transaction.details,
                preview.immediate_transaction.billing_period
              )
            : preview.next_transaction
              ? formatPaddlePreviewCharge(preview.next_transaction.details, preview.next_transaction.billing_period)
              : null
          : preview.next_transaction
            ? formatPaddlePreviewCharge(preview.next_transaction.details, preview.next_transaction.billing_period)
            : null

      const latestTransaction =
        nextEffectiveFrom === "immediately"
          ? yield* paddle.transactions
              .list({
                subscriptionId: args.subscriptionId,
                perPage: 1,
                orderBy: "created_at[DESC]"
              })
              .pipe(
                Effect.map((transactions) => transactions[0]),
                Effect.orDie
              )
          : undefined

      return yield* SubscriptionChargeResult.decode({
        subscriptionId: args.subscriptionId,
        currencyCode: charge?.currencyCode ?? preview.currency_code,
        effectiveFrom: nextEffectiveFrom,
        status:
          nextEffectiveFrom === "next_billing_period"
            ? "scheduled"
            : latestTransaction
              ? formatTransactionStatus(latestTransaction.status)
              : "draft",
        providerStatus:
          nextEffectiveFrom === "next_billing_period" ? "scheduled" : (latestTransaction?.status ?? "draft"),
        transactionId: latestTransaction?.id ?? null,
        charge: charge ?? formatPaddlePreviewCharge(preview.recurring_transaction_details)
      }).pipe(Effect.orDie)
    })

    const subscriptionPreviewCharge: PaymentClient.Methods["subscriptions"]["previewCharge"] = Effect.fn(
      function* (args) {
        const nextEffectiveFrom = args.effectiveFrom ?? "immediately"
        const preview = yield* paddle.subscriptions
          .previewCharge({
            subscriptionId: args.subscriptionId,
            priceId: args.providerOfferId,
            quantity: args.quantity,
            effectiveFrom: nextEffectiveFrom
          })
          .pipe(Effect.orDie)

        const charge =
          nextEffectiveFrom === "immediately"
            ? preview.immediate_transaction
              ? formatPaddlePreviewCharge(
                  preview.immediate_transaction.details,
                  preview.immediate_transaction.billing_period
                )
              : preview.next_transaction
                ? formatPaddlePreviewCharge(preview.next_transaction.details, preview.next_transaction.billing_period)
                : null
            : preview.next_transaction
              ? formatPaddlePreviewCharge(preview.next_transaction.details, preview.next_transaction.billing_period)
              : null

        return yield* SubscriptionChargePreview.decode({
          subscriptionId: args.subscriptionId,
          currencyCode: charge?.currencyCode ?? preview.currency_code,
          effectiveFrom: nextEffectiveFrom,
          charge: charge ?? formatPaddlePreviewCharge(preview.recurring_transaction_details)
        }).pipe(Effect.orDie)
      }
    )

    const subscriptionCancel: PaymentClient.Methods["subscriptions"]["cancel"] = Effect.fn(function* (args) {
      return yield* paddle.subscriptions
        .cancel({ subscriptionId: args.subscriptionId, immediate: args.effectiveFrom === "immediately" })
        .pipe(Effect.orDie)
    })

    const subscriptionPause: PaymentClient.Methods["subscriptions"]["pause"] = Effect.fn(function* (args) {
      return yield* paddle.subscriptions.pause(args)
    })

    const subscriptionResume: PaymentClient.Methods["subscriptions"]["resume"] = Effect.fn(function* (args) {
      return yield* paddle.subscriptions.resume(args)
    })

    // ----------------------------------------------------------------------------------------

    const transactionStream: PaymentClient.Methods["transactions"]["stream"] = (args) =>
      Stream.unwrap(
        Effect.gen(function* () {
          const get = (after: string | undefined) =>
            paddle.transactions
              .list({
                customerId: args.customerProviderId,
                after,
                status: args.status ?? ["completed", "canceled", "past_due"],
                perPage: args.perPage,
                orderBy: args.orderBy
              })
              .pipe(
                Effect.flatMap((transactions) => Transaction.decodeMany(transactions.map(formatTransaction))),
                Effect.orDie
              )

          return Stream.paginateChunkEffect(args.after, (after) =>
            Effect.map(get(after), (results) => [
              Chunk.fromIterable(results),
              results.length === 0 ? Option.none<string>() : Option.some<string>(results[results.length - 1].id)
            ])
          )
        })
      )

    const transactionList: PaymentClient.Methods["transactions"]["list"] = Effect.fn(function* (args) {
      return yield* transactionStream({
        customerProviderId: args.customerProviderId,
        after: args.after,
        perPage: args.perPage
      }).pipe(Stream.take(args.perPage ?? 10), Stream.runCollect, Effect.map(Chunk.toReadonlyArray))
    })

    const transactionLatest: PaymentClient.Methods["transactions"]["latest"] = Effect.fn(function* (args) {
      return yield* transactionStream({
        status: ["paid", "completed"],
        customerProviderId: args.customerProviderId,
        perPage: 10
      }).pipe(Stream.take(1), Stream.runHead)
    })

    const transactionGet: PaymentClient.Methods["transactions"]["get"] = Effect.fn(function* (args) {
      const paddleTransaction = yield* paddle.transactions
        .get({ transactionId: args.transactionId })
        .pipe(Effect.map(Option.map(formatTransaction)), Effect.orDie)

      return yield* Option.match(paddleTransaction, {
        onNone: () => Effect.succeed(Option.none<Transaction>()),
        onSome: (transaction) => Transaction.decode(transaction).pipe(Effect.map(Option.some), Effect.orDie)
      })
    })

    const transactionGenerateInvoicePDF: PaymentClient.Methods["transactions"]["generateInvoicePDF"] = Effect.fn(
      function* (args) {
        return yield* paddle.transactions
          .generateInvoicePDF({ transactionId: args.transactionId })
          .pipe(Effect.mapError(() => new InvoiceNotFound()))
      }
    )

    const transactionPreview: PaymentClient.Methods["transactions"]["preview"] = Effect.fn(function* (args) {
      const preview = yield* paddle.transactions
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
        currencyCode: preview.currency_code,
        charge: formatPaddlePreviewCharge(preview.details)
      }).pipe(Effect.orDie)
    })

    const transactionCreate: PaymentClient.Methods["transactions"]["create"] = Effect.fn(function* (args) {
      const priceOption = yield* paddle.prices.get({ priceId: args.providerOfferId }).pipe(Effect.orDie)
      const price = yield* Option.match(priceOption, {
        onNone: () =>
          Effect.fail(
            new PriceNotFound({
              priceId: args.providerOfferId
            })
          ),
        onSome: Effect.succeed
      })

      if (price.billing_cycle) {
        return yield* new PriceNotFound({
          priceId: args.providerOfferId
        })
      }

      const transaction = yield* paddle.transactions
        .create({
          customerId: args.providerCustomerId,
          priceId: args.providerOfferId,
          quantity: args.quantity,
          collectionMode: args.collectionMode,
          dueInDays: args.dueInDays,
          enableCheckout: args.enableCheckout,
          purchaseOrderNumber: args.purchaseOrderNumber,
          additionalInformation: args.additionalInformation
        })
        .pipe(Effect.orDie)

      return yield* Transaction.decode(formatTransaction(transaction)).pipe(Effect.orDie)
    })

    // ----------------------------------------------------------------------------------------

    const refundList: PaymentClient.Methods["refunds"]["list"] = Effect.fn(function* (args) {
      return yield* paddle.refunds
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

    const refundGet: PaymentClient.Methods["refunds"]["get"] = Effect.fn(function* (args) {
      return yield* paddle.refunds.get({ refundId: args.refundId }).pipe(
        Effect.orDie,
        Effect.flatMap(
          Option.match({
            onNone: () => Effect.succeed(Option.none<RefundResult>()),
            onSome: (refund) => RefundResult.decode(refund).pipe(Effect.map(Option.some), Effect.orDie)
          })
        )
      )
    })

    const refundCreate: PaymentClient.Methods["refunds"]["create"] = Effect.fn(function* (args) {
      return yield* paddle.transactions
        .refund({ transactionId: args.transactionId, amount: args.amount })
        .pipe(Effect.flatMap(RefundResult.decode), Effect.orDie)
    })

    // ----------------------------------------------------------------------------------------

    const checkoutPrepare: PaymentClient.Methods["checkout"]["prepare"] = Effect.fn(function* (args) {
      const priceOption = yield* paddle.prices.get({ priceId: args.providerOfferId }).pipe(Effect.orDie)
      const metadata = {
        projectId: args.projectId,
        offerId: args.offerId,
        customerId: args.customerId,
        ...args.metadata
      }

      yield* Option.match(priceOption, {
        onNone: () =>
          Effect.fail(
            new CheckoutNotSupported({
              provider: "paddle",
              message: `Missing Paddle price mapping for offer "${args.offerId}"`
            })
          ),
        onSome: () => Effect.void
      })

      const transaction = yield* paddle.transactions
        .create({
          customerId: args.providerCustomerId,
          priceId: args.providerOfferId,
          checkoutUrl: args.checkoutUrl,
          customData: metadata
        })
        .pipe(Effect.orDie)

      return CheckoutSession.make({
        mode: "hosted",
        provider: "paddle",
        environment: config.environment,
        offerId: CommercialOfferId.make(args.offerId),
        providerCustomerId: args.providerCustomerId,
        ...(transaction.subscription_id
          ? { providerSubscriptionId: SubscriptionId.make(transaction.subscription_id) }
          : {}),
        providerTransactionId: TransactionId.make(transaction.id),
        url: transaction.checkout.url,
        metadata
      })
    })

    const billingPortalCreateSession: PaymentClient.Methods["billingPortal"]["createSession"] = Effect.fn(
      function* (args) {
        const nextFlow = args.flow ?? "general"
        const session = yield* paddle.billingPortal
          .createSession({
            customerId: args.providerCustomerId,
            subscriptionId: args.providerSubscriptionId
          })
          .pipe(Effect.orDie)

        const url = selectPaddlePortalUrl(session, nextFlow, args.providerSubscriptionId)
        if (!url) {
          return yield* new ProviderOperationNotSupported({
            provider: "paddle",
            operation: "billingPortal.createSession",
            message: `Unable to create Paddle portal URL for flow "${nextFlow}"`
          })
        }

        return yield* BillingPortalSession.decode({
          id: session.id,
          flow: nextFlow,
          provider: "paddle",
          environment: config.environment,
          providerCustomerId: args.providerCustomerId,
          providerSubscriptionId: args.providerSubscriptionId ?? null,
          url,
          createdAt: session.created_at.toISOString()
        }).pipe(Effect.orDie)
      }
    )

    const methods = {
      _tag: Paddle._tag,
      paddleHi,
      webhooksUnmarshal,
      webhooksNormalize,
      prices: {
        list: priceList,
        get: priceGet,
        create: priceCreate,
        update: priceUpdate,
        archive: priceArchive
      },
      products: {
        list: productList,
        get: productGet,
        create: productCreate,
        update: productUpdate,
        archive: productArchive,
        stream: productStream
      },
      customers: {
        find: customerFind,
        get: customerGet,
        create: customerCreate,
        update: customerUpdate
      },
      subscriptions: {
        list: subscriptionList,
        get: subscriptionGet,
        latest: subscriptionLatest,
        cancel: subscriptionCancel,
        change: subscriptionChange,
        previewChange: subscriptionPreviewChange,
        charge: subscriptionCharge,
        previewCharge: subscriptionPreviewCharge,
        pause: subscriptionPause,
        resume: subscriptionResume,
        stream: subscriptionStream
      },
      transactions: {
        list: transactionList,
        latest: transactionLatest,
        get: transactionGet,
        stream: transactionStream,
        generateInvoicePDF: transactionGenerateInvoicePDF,
        preview: transactionPreview,
        create: transactionCreate
      },
      refunds: {
        list: refundList,
        get: refundGet,
        create: refundCreate
      },
      checkout: {
        prepare: checkoutPrepare
      },
      billingPortal: {
        createSession: billingPortalCreateSession
      }
    } satisfies Omit<PaddleImpl, "onDialect" | "onDialectOrElse">

    return makePaymentClient<PaddleImpl>(Paddle._tag, methods)
  })

  static layerConfig = (config: PaddleConfig) =>
    Layer.effect(PaymentClient, Paddle.make).pipe(Layer.provide(Layer.effect(PaddleClient, makePaddleClient(config))))

  static layer = Layer.effect(PaymentClient, Paddle.make).pipe(
    Layer.provide(
      Layer.unwrapEffect(
        Effect.gen(function* () {
          const config = yield* PaddleConfig

          return Layer.effect(PaddleClient, makePaddleClient(config))
        })
      )
    )
  )
}

function getPaymentReason(origin: string) {
  if (origin === "web" || origin === "subscription_charge") {
    return "New"
  }
  return "Renewal of "
}

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

    if (typeof value === "string" || typeof value === "number") {
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

  if (eventType.includes("transaction.")) {
    return "transaction_updated"
  }

  if (eventType.includes("customer.")) {
    return "customer_updated"
  }

  return "webhook_unhandled"
}

const normalizePaddleWebhook = (event: unknown): PaymentWebhookNormalization => {
  const envelope = asRecord(event)
  const resource = asRecord(envelope.data)
  const metadata = readMetadata(resource)
  const eventType = readString(envelope, ["event_type", "type"]) ?? "webhook.unhandled"
  const firstItem = asArrayRecords(resource.items)[0]
  const firstLineItem = asArrayRecords(asRecord(asRecord(resource.details).line_items))[0]
  const totals = asRecord(asRecord(resource.details).totals ?? resource.totals)
  const period = asRecord(resource.billing_period)
  const currentPeriod = asRecord(resource.current_billing_period)
  const kind = detectWebhookKind(eventType)

  return {
    providerEventId: readString(envelope, ["notification_id", "id"]) ?? crypto.randomUUID(),
    eventType,
    kind,
    occurredAt: readDate(envelope, ["occurred_at", "occurredAt"]),
    resource,
    metadata,
    checkoutSessionId: readString(asRecord(resource.checkout), ["url"]),
    providerCustomerId:
      readString(resource, ["customer", "customer_id", "customerId"]) ??
      (kind === "customer_updated" ? readString(resource, ["id"]) : undefined),
    providerSubscriptionId: readString(resource, ["subscription_id", "id"]),
    providerInvoiceId: readString(resource, ["invoice_id"]),
    providerTransactionId:
      kind === "refund_updated"
        ? readString(resource, ["transaction_id", "id"])
        : readString(resource, ["id", "transaction_id"]),
    providerOfferId:
      readString(asRecord(firstItem?.price), ["id"]) ?? readString(asRecord(firstLineItem ?? {}), ["price_id"]),
    quantity: readNumber(asRecord(firstItem ?? {}), ["quantity"]),
    status: readString(resource, ["status"]),
    canceled:
      readBoolean(resource, ["canceled"]) ??
      (eventType.includes("canceled") || readString(resource, ["status"]) === "canceled"),
    cancelAtPeriodEnd: readBoolean(resource, ["cancel_at_period_end"]),
    startedAt: readDate(resource, ["started_at", "start_date", "created_at"]),
    trialEndsAt: readDate(resource, ["trial_ends_at", "trial_end"]),
    currentPeriodStartAt: readDate(currentPeriod, ["starts_at", "current_period_start"]),
    currentPeriodEndAt: readDate(currentPeriod, ["ends_at", "current_period_end", "next_billed_at"]),
    canceledAt: readDate(resource, ["canceled_at", "cancel_at"]),
    endedAt: readDate(resource, ["ended_at"]),
    amount: readNumber(totals, ["amount_paid", "amount_due", "total", "grand_total"]),
    currency: readString(totals, ["currency", "currency_code"]) ?? readString(resource, ["currency", "currency_code"]),
    description:
      readString(resource, ["description", "invoice_number"]) ?? readString(asRecord(resource.checkout), ["url"]),
    hostedUrl:
      readString(resource, ["hosted_invoice_url", "invoice_pdf"]) ?? readString(asRecord(resource.checkout), ["url"]),
    periodStartAt: readDate(period, ["period_start", "starts_at"]),
    periodEndAt: readDate(period, ["period_end", "ends_at"])
  }
}

const formatTransactionStatus = (status: typeof PaddleTransaction.Type.status): (typeof Transaction.Type)["status"] => {
  return status
}

const formatSubscriptionStatus = (
  status: typeof PaddleSubscription.Type.status
): (typeof Subscription.Type)["status"] => {
  return status
}

const formatCustomer = (_: PaddleCustomer): typeof Customer.Encoded => {
  return {
    id: _.id,
    email: _.email,
    name: _.name || _.email,
    metadata: _.custom_data
  } satisfies typeof Customer.Encoded
}

const formatPrices = (price: PaddlePrice): typeof Price.Encoded => {
  return {
    id: price.id,
    name: price.name || "unknown",
    productId: price.product_id,
    unitPrice: {
      amount: price.unit_price.amount,
      currencyCode: price.unit_price.currency_code
    },
    unitPriceOverride: price.unit_price_overrides.map((override) => {
      return {
        countryCodes: override.country_codes,
        unitPrice: {
          amount: override.unit_price.amount,
          currencyCode: override.unit_price.currency_code
        }
      }
    }),
    billingCycle: price.billing_cycle || null,
    trialPeriod: price.trial_period || null,
    active: price.status === "active",
    createdAt: price.created_at.toISOString(),
    updatedAt: price.updated_at.toISOString(),
    quantity: price.quantity,
    metadata: price.custom_data || {}
  } satisfies typeof Price.Encoded
}

const formatProduct = (product: PaddleProduct, prices: ReadonlyArray<PaddlePrice>): typeof Product.Encoded => {
  const currentPrices = prices.filter((price) => price.product_id === product.id)

  return {
    id: product.id,
    active: product.status === "active",
    name: product.name,
    description: product.description,
    metadata: product.custom_data,
    prices: currentPrices.map(formatPrices)
  } satisfies typeof Product.Encoded
}

const formatSubscription = (_: PaddleSubscription): typeof Subscription.Encoded => {
  const item = _.items[0]
  return {
    id: _.id,
    status: formatSubscriptionStatus(_.status),
    product: {
      id: item.product.id,
      name: item.product.name,
      description: item.product.description
    },
    price: {
      id: item.price.id,
      name: item.price.name || "",
      unitPrice: {
        amount: item.price.unit_price.amount,
        currencyCode: item.price.unit_price.currency_code
      }
    },
    addressId: _.address_id,
    currencyCode: _.currency_code,
    createdAt: _.created_at.toISOString(),
    updatedAt: _.updated_at.toISOString(),
    startedAt: _.started_at.toISOString(),
    firstBilledAt: _.first_billed_at?.toISOString() || null,
    nextBilledAt: _.next_billed_at?.toISOString() || null,
    pausedAt: _.paused_at?.toISOString() || null,
    canceledAt: _.canceled_at?.toISOString() || null,
    currentBillingPeriod: _.current_billing_period
      ? {
          startsAt: _.current_billing_period.starts_at.toISOString(),
          endsAt: _.current_billing_period.ends_at.toISOString()
        }
      : null,
    billingCycle: _.billing_cycle,
    scheduledChange: _.scheduled_change
      ? {
          action: _.scheduled_change.action,
          effectiveAt: _.scheduled_change.effective_at.toISOString(),
          resumeAt: _.scheduled_change.resume_at?.toISOString()
        }
      : null,
    managementUrls: {
      updatePaymentMethod: _.management_urls.update_payment_method,
      cancel: _.management_urls.cancel
    },
    metadata: _.custom_data ?? {},
    items: _.items.map((subscriptionItem) => ({
      quantity: subscriptionItem.quantity,
      recurring: subscriptionItem.recurring,
      price: {
        id: subscriptionItem.price.id,
        unitPrice: {
          amount: subscriptionItem.price.unit_price.amount,
          currencyCode: subscriptionItem.price.unit_price.currency_code
        },
        name: subscriptionItem.price.name || "unknown name",
        description: subscriptionItem.price.description || "unknown description"
      },
      product: {
        id: subscriptionItem.product.id,
        name: subscriptionItem.product.name || "unknown name",
        description: subscriptionItem.product.description || "unknown description"
      }
    })),
    nextTransaction: _.next_transaction
      ? {
          billingPeriod: {
            endsAt: _.next_transaction.billing_period.ends_at?.toISOString(),
            startsAt: _.next_transaction.billing_period.starts_at?.toISOString()
          },
          taxRatesUsed: _.next_transaction.details.tax_rates_used.map((taxRate) => {
            return {
              taxRate: taxRate.tax_rate,
              totals: taxRate.totals
            }
          }),
          totals: _.next_transaction.details.totals,
          items: _.next_transaction.details.line_items.map((lineItem) => ({
            priceId: lineItem.price_id,
            quantity: lineItem.quantity,
            taxRate: lineItem.tax_rate,
            totals: lineItem.totals,
            unitTotals: lineItem.unit_totals,
            product: {
              id: lineItem.product.id,
              name: lineItem.product.name || "",
              description: lineItem.product.description || ""
            }
          }))
        }
      : null
  } satisfies typeof Subscription.Encoded
}

const formatPaddlePreviewCharge = (
  details: {
    totals: {
      subtotal: string
      tax: string
      total: string
      currency_code: string
    }
    line_items: ReadonlyArray<{
      price_id: string
      quantity: number
      totals: {
        total: string
      }
      product: {
        id: string
        name: string
        description: string
      }
    }>
  },
  billingPeriod?: {
    starts_at: Date
    ends_at: Date
  } | null
) => ({
  subtotal: details.totals.subtotal,
  tax: details.totals.tax,
  total: details.totals.total,
  currencyCode: details.totals.currency_code,
  billingPeriod: billingPeriod
    ? {
        startsAt: billingPeriod.starts_at.toISOString(),
        endsAt: billingPeriod.ends_at.toISOString()
      }
    : null,
  lineItems: details.line_items.map((lineItem) => ({
    priceId: lineItem.price_id,
    productId: lineItem.product.id,
    quantity: lineItem.quantity,
    amount: lineItem.totals.total,
    currencyCode: details.totals.currency_code,
    description: lineItem.product.name || lineItem.product.description || "",
    billingPeriod: billingPeriod
      ? {
          startsAt: billingPeriod.starts_at.toISOString(),
          endsAt: billingPeriod.ends_at.toISOString()
        }
      : null
  }))
})

const formatPaddlePreview = (preview: {
  id: string
  currency_code: string
  items: ReadonlyArray<{
    quantity: number
    price: {
      id: string
    }
    product: {
      id: string
    }
  }>
  immediate_transaction?: {
    billing_period: {
      starts_at: Date
      ends_at: Date
    }
    details: Parameters<typeof formatPaddlePreviewCharge>[0]
  } | null
  next_transaction?: {
    billing_period: {
      starts_at: Date
      ends_at: Date
    }
    details: Parameters<typeof formatPaddlePreviewCharge>[0]
  } | null
  recurring_transaction_details: Parameters<typeof formatPaddlePreviewCharge>[0]
}) => ({
  subscriptionId: preview.id,
  currencyCode: preview.currency_code,
  items: preview.items.map((item) => ({
    priceId: item.price.id,
    productId: item.product.id,
    quantity: item.quantity
  })),
  immediateCharge: preview.immediate_transaction
    ? formatPaddlePreviewCharge(preview.immediate_transaction.details, preview.immediate_transaction.billing_period)
    : null,
  nextCharge: preview.next_transaction
    ? formatPaddlePreviewCharge(preview.next_transaction.details, preview.next_transaction.billing_period)
    : null,
  recurringCharge: formatPaddlePreviewCharge(preview.recurring_transaction_details)
})

const selectPaddlePortalUrl = (
  session: {
    urls: {
      general: {
        overview: string
      }
      subscriptions: ReadonlyArray<{
        id: string
        cancel_subscription: string
        update_subscription_payment_method: string
      }>
    }
  },
  flow: "general" | "payment_method_update" | "subscription_cancel" | "subscription_update",
  subscriptionId: string | undefined
) => {
  if (flow === "general") {
    return session.urls.general.overview
  }

  if (flow === "subscription_update") {
    return null
  }

  if (!subscriptionId) {
    return null
  }

  const subscriptionLink = session.urls.subscriptions.find((item) => item.id === subscriptionId)
  if (!subscriptionLink) {
    return null
  }

  return flow === "payment_method_update"
    ? subscriptionLink.update_subscription_payment_method
    : subscriptionLink.cancel_subscription
}

const formatPaddleTransactionDueAt = (transaction: PaddleTransaction) => {
  if (transaction.collection_mode !== "manual" || !transaction.billing_details) {
    return null
  }

  const { interval, frequency } = transaction.billing_details.payment_terms
  const dueAt = new Date(transaction.created_at)

  switch (interval) {
    case "day":
      dueAt.setUTCDate(dueAt.getUTCDate() + frequency)
      break
    case "week":
      dueAt.setUTCDate(dueAt.getUTCDate() + frequency * 7)
      break
    case "month":
      dueAt.setUTCMonth(dueAt.getUTCMonth() + frequency)
      break
    case "year":
      dueAt.setUTCFullYear(dueAt.getUTCFullYear() + frequency)
      break
  }

  return dueAt.toISOString()
}

const formatTransaction = (_: PaddleTransaction): typeof Transaction.Encoded => {
  return {
    id: _.id,
    reason: getPaymentReason(_.origin),
    status: formatTransactionStatus(_.status),
    collectionMode: _.collection_mode === "manual" ? "manual" : "automatic",
    invoiceId: _.invoice_id ?? null,
    invoiceNumber: _.invoice_number ?? null,
    currencyCode: _.currency_code,
    createdAt: _.created_at.toISOString(),
    billedAt: _.billed_at?.toISOString() ?? null,
    updatedAt: _.updated_at?.toISOString(),
    paymentTerms: _.billing_details?.payment_terms
      ? {
          interval: _.billing_details.payment_terms.interval,
          frequency: _.billing_details.payment_terms.frequency
        }
      : null,
    checkoutUrl: _.checkout.url ?? null,
    discount: _.discount_id ?? null,
    billingPeriod: _.billing_period
      ? {
          startsAt: _.billing_period.starts_at.toISOString(),
          endsAt: _.billing_period.ends_at.toISOString()
        }
      : null,
    items: _.items.map((item) => {
      return {
        name: item.price.name || "unknown",
        productId: item.price.product_id,
        priceId: item.price.id,
        unitPrice: {
          amount: item.price.unit_price.amount,
          currencyCode: item.price.unit_price.currency_code
        },
        quantity: item.quantity
      }
    }),
    payments: _.payments.map((payment) => {
      return {
        id: payment.id || "",
        amount: payment.amount,
        status: payment.status,
        error: payment.error || undefined,
        details: payment.details
          ? {
              type: payment.details.type,
              card: payment.details.card ?? null
            }
          : undefined,
        createdAt: payment.created_at.toISOString(),
        capturedAt: payment.captured_at?.toISOString() ?? null
      }
    }),
    dueAt: formatPaddleTransactionDueAt(_)
  } satisfies typeof Transaction.Encoded
}

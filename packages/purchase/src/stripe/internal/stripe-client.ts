import type StripeSdk from "stripe"

import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as HttpBody from "@effect/platform/HttpBody"
import * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientRequest from "@effect/platform/HttpClientRequest"
import * as HttpClientResponse from "@effect/platform/HttpClientResponse"
import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Redacted from "effect/Redacted"
import * as Schema from "effect/Schema"

import type {
  ChangeSubscriptionProrationMode,
  PauseSubscriptionParams,
  ResumeSubscriptionParams
} from "../../provider/client.ts"
import type { PaymentEnvironmentTag } from "../../provider/types.ts"

import {
  CustomerAlreadyExists,
  CustomerNotFound,
  PriceNotFound,
  ProductNotFound,
  ProviderOperationNotSupported,
  SubscriptionNotFound,
  TransactionNotFound,
  WebhookUnmarshalError
} from "../../errors.ts"
import { failUnexpectedStatus, withProviderTransientRetry } from "../../internal/provider-http-retry.ts"
import {
  StripeBillingPortalSession,
  StripeCheckoutSession,
  StripeCustomer,
  StripeDeletedCustomer,
  StripeDeletedObject,
  StripeErrorEnvelope,
  StripeEvent,
  StripeInvoice,
  StripeList,
  StripePrice,
  StripeProduct,
  StripeRefund,
  StripeSubscription
} from "./stripe-schema.ts"

export const StripeConfig = Config.all({
  apiKey: Config.redacted("STRIPE_API_KEY").pipe(Config.withDefault(Redacted.make(""))),
  webhookSecret: Config.redacted("STRIPE_WEBHOOK_SECRET").pipe(Config.withDefault(Redacted.make(""))),
  environment: Config.literal("sandbox", "production")("STRIPE_ENVIRONMENT").pipe(Config.withDefault("sandbox"))
})

export type StripeConfig = Config.Config.Success<typeof StripeConfig>

const stripeApiVersion = "2026-03-25.dahlia"
const stripeBaseUrl = "https://api.stripe.com/v1"

export const makeStripeClient = Effect.fnUntraced(function* (config: StripeConfig) {
  const client = (yield* HttpClient.HttpClient.pipe(Effect.provide(FetchHttpClient.layer))).pipe(
    HttpClient.mapRequest((request) =>
      request.pipe(
        HttpClientRequest.prependUrl(stripeBaseUrl),
        HttpClientRequest.bearerToken(Redacted.value(config.apiKey)),
        HttpClientRequest.acceptJson,
        HttpClientRequest.setHeader("Stripe-Version", stripeApiVersion)
      )
    ),
    withProviderTransientRetry
  )
  const unexpectedStatus = (
    request: HttpClientRequest.HttpClientRequest,
    response: HttpClientResponse.HttpClientResponse
  ) =>
    Effect.flatMap(
      Effect.all([
        Effect.orElseSucceed(response.text, () => "Unexpected status code"),
        Effect.orElseSucceed(
          pipe(response.json, Effect.flatMap(Schema.decodeUnknown(StripeErrorEnvelope))),
          () => undefined
        )
      ]),
      ([description, json]) =>
        failUnexpectedStatus(request, response, json ? json.error.message : description, json?.error)
    )
  const decodeJson =
    <A, I, R>(schema: Schema.Schema<A, I, R>) =>
    (response: HttpClientResponse.HttpClientResponse) =>
      pipe(response, HttpClientResponse.schemaBodyJson(schema), Effect.catchTag("ParseError", Effect.die))
  const expectJsonStatus200 =
    <A, I, R>(schema: Schema.Schema<A, I, R>) =>
    (response: HttpClientResponse.HttpClientResponse) =>
      HttpClientResponse.matchStatus({
        200: decodeJson(schema),
        orElse: (res) => unexpectedStatus(res.request, res)
      })(response)
  const getForm = (path: string, params?: StripeParamInput) =>
    client.get(path, {
      urlParams: params ? encodeStripeParams(params) : undefined
    })
  const postForm = (path: string, params?: StripeParamInput) =>
    client.post(path, {
      body: params ? HttpBody.urlParams(encodeStripeParams(params)) : undefined
    })
  const delForm = (path: string, params?: StripeParamInput) =>
    client.del(path, {
      body: params ? HttpBody.urlParams(encodeStripeParams(params)) : undefined
    })
  const collectPages = <
    A extends {
      id: string
    }
  >(
    load: (after: string | undefined) => Effect.Effect<
      {
        data: ReadonlyArray<A>
        has_more: boolean
      },
      never,
      never
    >
  ) =>
    Effect.gen(function* () {
      const results: Array<A> = []
      let after: string | undefined
      while (true) {
        const page = yield* load(after)
        results.push(...page.data)
        const last = page.data.at(-1)
        if (!page.has_more || !last) {
          break
        }
        after = last.id
      }
      return results as ReadonlyArray<A>
    })
  const getProductById = (productId: string) =>
    getForm(`/products/${productId}`).pipe(
      Effect.flatMap(
        HttpClientResponse.matchStatus({
          200: decodeJson(Schema.Union(StripeProduct, StripeDeletedObject)),
          404: () =>
            Effect.fail(
              new ProductNotFound({
                productId
              })
            ),
          orElse: (response) => unexpectedStatus(response.request, response)
        })
      )
    )
  const getPriceById = (priceId: string) =>
    getForm(`/prices/${priceId}`).pipe(
      Effect.flatMap(
        HttpClientResponse.matchStatus({
          200: decodeJson(StripePrice),
          404: () =>
            Effect.fail(
              new PriceNotFound({
                priceId
              })
            ),
          orElse: (response) => unexpectedStatus(response.request, response)
        })
      )
    )
  const getCustomerById = (customerId: string) =>
    getForm(`/customers/${customerId}`).pipe(
      Effect.flatMap(
        HttpClientResponse.matchStatus({
          200: decodeJson(Schema.Union(StripeCustomer, StripeDeletedCustomer)),
          404: () =>
            Effect.fail(
              new CustomerNotFound({
                customerId
              })
            ),
          orElse: (response) => unexpectedStatus(response.request, response)
        })
      )
    )
  const getSubscriptionById = (subscriptionId: string) => {
    const params = {
      expand: ["items.data.price.product", "latest_invoice"]
    } satisfies StripeSdk.SubscriptionRetrieveParams
    return getForm(`/subscriptions/${subscriptionId}`, params).pipe(
      Effect.flatMap(
        HttpClientResponse.matchStatus({
          200: decodeJson(StripeSubscription),
          404: () =>
            Effect.fail(
              new SubscriptionNotFound({
                subscriptionId
              })
            ),
          orElse: (response) => unexpectedStatus(response.request, response)
        })
      )
    )
  }
  const getInvoiceById = (transactionId: string, params?: StripeParamInput) =>
    getForm(`/invoices/${transactionId}`, params).pipe(
      Effect.flatMap(
        HttpClientResponse.matchStatus({
          200: decodeJson(StripeInvoice),
          404: () =>
            Effect.fail(
              new TransactionNotFound({
                transactionId
              })
            ),
          orElse: (response) => unexpectedStatus(response.request, response)
        })
      )
    )
  const products = {
    list: Effect.fn(function* (
      args: {
        active?: boolean | undefined
        after?: string | undefined
        perPage?: number | undefined
      } = {}
    ): Effect.fn.Return<ReadonlyArray<StripeProduct>> {
      const params = withOptional({
        active: args.active,
        starting_after: args.after,
        limit: pageLimit(args.perPage, 10)
      }) satisfies StripeSdk.ProductListParams
      return yield* getForm("/products", params).pipe(
        Effect.flatMap(expectJsonStatus200(StripeList(StripeProduct))),
        Effect.map((page) => page.data),
        Effect.catchAll(Effect.die)
      )
    }),
    get: Effect.fn(function* (args: { productId: string }): Effect.fn.Return<Option.Option<StripeProduct>> {
      return yield* getProductById(args.productId).pipe(
        Effect.map((product) => (isDeletedStripeObject(product) ? Option.none<StripeProduct>() : Option.some(product))),
        Effect.catchTag("ProductNotFound", () => Effect.succeed(Option.none<StripeProduct>())),
        Effect.catchAll(Effect.die)
      )
    }),
    create: Effect.fn(function* (args: {
      name: string
      description?: string | undefined
      metadata?: Record<string, unknown> | null | undefined
      active?: boolean | undefined
    }): Effect.fn.Return<StripeProduct> {
      const params = withOptional({
        active: args.active,
        description: args.description,
        metadata: encodeStripeMetadata(args.metadata),
        name: args.name
      }) satisfies StripeSdk.ProductCreateParams
      return yield* postForm("/products", params).pipe(
        Effect.flatMap(expectJsonStatus200(StripeProduct)),
        Effect.catchAll(Effect.die)
      )
    }),
    update: Effect.fn(function* (args: {
      productId: string
      name?: string | undefined
      description?: string | undefined
      metadata?: Record<string, unknown> | null | undefined
      active?: boolean | undefined
    }): Effect.fn.Return<StripeProduct, ProductNotFound> {
      const params = withOptional({
        active: args.active,
        description: args.description,
        metadata: encodeStripeMetadata(args.metadata),
        name: args.name
      }) satisfies StripeSdk.ProductUpdateParams
      return yield* postForm(`/products/${args.productId}`, params).pipe(
        Effect.flatMap(
          HttpClientResponse.matchStatus({
            200: decodeJson(StripeProduct),
            404: () =>
              Effect.fail(
                new ProductNotFound({
                  productId: args.productId
                })
              ),
            orElse: (response) => unexpectedStatus(response.request, response)
          })
        ),
        Effect.catchAll((error) => (error._tag === "ProductNotFound" ? Effect.fail(error) : Effect.die(error)))
      )
    })
  }
  const prices = {
    list: Effect.fn(function* (
      args: {
        productId?: string | undefined
        active?: boolean | undefined
        after?: string | undefined
        perPage?: number | undefined
      } = {}
    ): Effect.fn.Return<ReadonlyArray<StripePrice>> {
      const params = withOptional({
        active: args.active,
        limit: pageLimit(args.perPage, 100),
        product: args.productId,
        starting_after: args.after
      }) satisfies StripeSdk.PriceListParams
      return yield* getForm("/prices", params).pipe(
        Effect.flatMap(expectJsonStatus200(StripeList(StripePrice))),
        Effect.map((page) => page.data),
        Effect.catchAll(Effect.die)
      )
    }),
    listAll: Effect.fn(function* (
      args: {
        productId?: string | undefined
        active?: boolean | undefined
      } = {}
    ): Effect.fn.Return<ReadonlyArray<StripePrice>> {
      return yield* collectPages((after) => {
        const params = withOptional({
          active: args.active,
          limit: 100,
          product: args.productId,
          starting_after: after
        }) satisfies StripeSdk.PriceListParams
        return getForm("/prices", params).pipe(
          Effect.flatMap(expectJsonStatus200(StripeList(StripePrice))),
          Effect.catchAll(Effect.die)
        )
      })
    }),
    get: Effect.fn(function* (args: { priceId: string }): Effect.fn.Return<Option.Option<StripePrice>> {
      return yield* getPriceById(args.priceId).pipe(
        Effect.map(Option.some),
        Effect.catchTag("PriceNotFound", () => Effect.succeed(Option.none<StripePrice>())),
        Effect.catchAll(Effect.die)
      )
    }),
    create: Effect.fn(function* (args: {
      productId: string
      name?: string | undefined
      unitPrice: {
        amount: string
        currencyCode: string
      }
      billingCycle?:
        | {
            interval: "day" | "week" | "month" | "year"
            frequency: number
          }
        | undefined
      trialPeriod?:
        | {
            interval: "day" | "week" | "month" | "year"
            frequency: number
          }
        | undefined
      metadata?: Record<string, unknown> | null | undefined
      active?: boolean | undefined
    }): Effect.fn.Return<StripePrice, ProductNotFound | ProviderOperationNotSupported> {
      const product = yield* getProductById(args.productId).pipe(
        Effect.catchAll((error) => (error._tag === "ProductNotFound" ? Effect.fail(error) : Effect.die(error)))
      )
      if (isDeletedStripeObject(product)) {
        return yield* new ProductNotFound({
          productId: args.productId
        })
      }
      if (args.trialPeriod && args.trialPeriod.interval !== "day") {
        return yield* new ProviderOperationNotSupported({
          provider: "stripe",
          operation: "prices.create",
          message: "Stripe only supports trial periods expressed in days"
        })
      }
      const params = withOptional({
        active: args.active,
        currency: args.unitPrice.currencyCode.toLowerCase(),
        metadata: encodeStripeMetadata(args.metadata),
        nickname: args.name,
        product: args.productId,
        recurring: args.billingCycle
          ? withOptional({
              interval: args.billingCycle.interval,
              interval_count: args.billingCycle.frequency,
              trial_period_days: args.trialPeriod?.frequency
            })
          : undefined,
        unit_amount: parseMinorUnitAmount(args.unitPrice.amount, "unitPrice.amount")
      }) satisfies StripeSdk.PriceCreateParams
      return yield* postForm("/prices", params).pipe(
        Effect.flatMap(expectJsonStatus200(StripePrice)),
        Effect.catchAll(Effect.die)
      )
    }),
    update: Effect.fn(function* (args: {
      priceId: string
      name?: string | undefined
      metadata?: Record<string, unknown> | null | undefined
      active?: boolean | undefined
    }): Effect.fn.Return<StripePrice, PriceNotFound> {
      const params = withOptional({
        active: args.active,
        metadata: encodeStripeMetadata(args.metadata),
        nickname: args.name
      }) satisfies StripeSdk.PriceUpdateParams
      return yield* postForm(`/prices/${args.priceId}`, params).pipe(
        Effect.flatMap(
          HttpClientResponse.matchStatus({
            200: decodeJson(StripePrice),
            404: () =>
              Effect.fail(
                new PriceNotFound({
                  priceId: args.priceId
                })
              ),
            orElse: (response) => unexpectedStatus(response.request, response)
          })
        ),
        Effect.catchAll((error) => (error._tag === "PriceNotFound" ? Effect.fail(error) : Effect.die(error)))
      )
    })
  }
  const customers = {
    find: Effect.fn(function* (
      args: {
        id?: Array<string> | undefined
        email?: Array<string> | undefined
        perPage?: number | undefined
      } = {}
    ): Effect.fn.Return<ReadonlyArray<StripeCustomer>> {
      const providerId = args.id?.[0]
      if (providerId) {
        const customer = yield* getCustomerById(providerId).pipe(
          Effect.catchTag("CustomerNotFound", () => Effect.succeed(null)),
          Effect.catchAll(Effect.die)
        )
        if (customer && !isDeletedStripeCustomer(customer)) {
          return [customer] as const
        }
        return [] as const
      }
      const email = args.email?.[0]
      if (!email) {
        return [] as const
      }
      const params = {
        email,
        limit: pageLimit(args.perPage, 1)
      } satisfies StripeSdk.CustomerListParams
      return yield* getForm("/customers", params).pipe(
        Effect.flatMap(expectJsonStatus200(StripeList(StripeCustomer))),
        Effect.map((page) => page.data),
        Effect.catchAll(Effect.die)
      )
    }),
    get: Effect.fn(function* (args: { customerId: string }): Effect.fn.Return<Option.Option<StripeCustomer>> {
      return yield* getCustomerById(args.customerId).pipe(
        Effect.map((customer) =>
          isDeletedStripeCustomer(customer) ? Option.none<StripeCustomer>() : Option.some(customer)
        ),
        Effect.catchTag("CustomerNotFound", () => Effect.succeed(Option.none<StripeCustomer>())),
        Effect.catchAll(Effect.die)
      )
    }),
    create: Effect.fn(function* (args: {
      email: string
      userId: string
      name?: string | undefined
      locale?: string | undefined
    }): Effect.fn.Return<StripeCustomer, CustomerAlreadyExists> {
      const existing = yield* getForm("/customers", {
        email: args.email,
        limit: 1
      } satisfies StripeSdk.CustomerListParams).pipe(
        Effect.flatMap(expectJsonStatus200(StripeList(StripeCustomer))),
        Effect.map((page) => page.data[0]),
        Effect.catchAll(Effect.die)
      )
      if (existing) {
        return yield* new CustomerAlreadyExists({
          email: args.email,
          userId: args.userId
        })
      }
      const params = withOptional({
        email: args.email,
        metadata: {
          userId: args.userId
        },
        name: args.name,
        preferred_locales: args.locale ? [args.locale] : undefined
      }) satisfies StripeSdk.CustomerCreateParams
      return yield* postForm("/customers", params).pipe(
        Effect.flatMap(expectJsonStatus200(StripeCustomer)),
        Effect.catchAll(Effect.die)
      )
    }),
    update: Effect.fn(function* (args: {
      customerId: string
      email?: string | undefined
      name?: string | undefined
      locale?: string | undefined
    }): Effect.fn.Return<StripeCustomer, CustomerNotFound> {
      const current = yield* getCustomerById(args.customerId).pipe(
        Effect.catchAll((error) => (error._tag === "CustomerNotFound" ? Effect.fail(error) : Effect.die(error)))
      )
      if (isDeletedStripeCustomer(current)) {
        return yield* new CustomerNotFound({
          customerId: args.customerId
        })
      }
      const params = withOptional({
        email: args.email,
        name: args.name,
        preferred_locales: args.locale
          ? [args.locale]
          : current.preferred_locales
            ? [...current.preferred_locales]
            : undefined
      }) satisfies StripeSdk.CustomerUpdateParams
      return yield* postForm(`/customers/${args.customerId}`, params).pipe(
        Effect.flatMap(
          HttpClientResponse.matchStatus({
            200: decodeJson(StripeCustomer),
            404: () =>
              Effect.fail(
                new CustomerNotFound({
                  customerId: args.customerId
                })
              ),
            orElse: (response) => unexpectedStatus(response.request, response)
          })
        ),
        Effect.catchAll((error) => (error._tag === "CustomerNotFound" ? Effect.fail(error) : Effect.die(error)))
      )
    })
  }
  const subscriptions = {
    list: Effect.fn(function* (args: {
      customerId?: string | undefined
      status?: Array<string> | undefined
      after?: string | undefined
      perPage?: number | undefined
    }): Effect.fn.Return<ReadonlyArray<StripeSubscription>> {
      const allowed = args.status?.length ? new Set(args.status) : undefined
      const params = withOptional({
        customer: args.customerId,
        expand: ["data.items.data.price.product", "data.latest_invoice"],
        limit: pageLimit(args.perPage, 10),
        starting_after: args.after,
        status: "all" as const
      }) satisfies StripeSdk.SubscriptionListParams
      return yield* getForm("/subscriptions", params).pipe(
        Effect.flatMap(expectJsonStatus200(StripeList(StripeSubscription))),
        Effect.map((page) =>
          allowed ? page.data.filter((subscription) => allowed.has(subscription.status)) : page.data
        ),
        Effect.catchAll(Effect.die)
      )
    }),
    get: Effect.fn(function* (args: { subscriptionId: string }): Effect.fn.Return<Option.Option<StripeSubscription>> {
      return yield* getSubscriptionById(args.subscriptionId).pipe(
        Effect.map(Option.some),
        Effect.catchTag("SubscriptionNotFound", () => Effect.succeed(Option.none<StripeSubscription>())),
        Effect.catchAll(Effect.die)
      )
    }),
    cancel: Effect.fn(function* (args: {
      subscriptionId: string
      immediate?: boolean
    }): Effect.fn.Return<void, SubscriptionNotFound> {
      if (args.immediate) {
        yield* delForm(`/subscriptions/${args.subscriptionId}`).pipe(
          Effect.flatMap(
            HttpClientResponse.matchStatus({
              200: () => Effect.void,
              404: () =>
                Effect.fail(
                  new SubscriptionNotFound({
                    subscriptionId: args.subscriptionId
                  })
                ),
              orElse: (response) => unexpectedStatus(response.request, response)
            })
          ),
          Effect.catchAll((error) => (error._tag === "SubscriptionNotFound" ? Effect.fail(error) : Effect.die(error)))
        )
        return
      }
      const params = {
        cancel_at_period_end: true
      } satisfies StripeSdk.SubscriptionUpdateParams
      yield* postForm(`/subscriptions/${args.subscriptionId}`, params).pipe(
        Effect.flatMap(
          HttpClientResponse.matchStatus({
            200: () => Effect.void,
            404: () =>
              Effect.fail(
                new SubscriptionNotFound({
                  subscriptionId: args.subscriptionId
                })
              ),
            orElse: (response) => unexpectedStatus(response.request, response)
          })
        ),
        Effect.catchAll((error) => (error._tag === "SubscriptionNotFound" ? Effect.fail(error) : Effect.die(error)))
      )
    }),
    change: Effect.fn(function* (args: {
      subscriptionId: string
      priceId: string
      quantity?: number | undefined
      prorationMode?: ChangeSubscriptionProrationMode | undefined
    }): Effect.fn.Return<StripeSubscription, SubscriptionNotFound | PriceNotFound, never> {
      const current = yield* getSubscriptionById(args.subscriptionId).pipe(
        Effect.catchAll((error) => (error._tag === "SubscriptionNotFound" ? Effect.fail(error) : Effect.die(error)))
      )
      const item = current.items.data[0]
      if (!item) {
        return yield* new SubscriptionNotFound({
          subscriptionId: args.subscriptionId,
          message: "Subscription has no items to update"
        })
      }
      const price = yield* getPriceById(args.priceId).pipe(
        Effect.catchAll((error) => (error._tag === "PriceNotFound" ? Effect.fail(error) : Effect.die(error)))
      )
      if (price.type !== "recurring") {
        return yield* new PriceNotFound({
          priceId: args.priceId
        })
      }
      const params = {
        expand: ["items.data.price.product", "latest_invoice"],
        items: [
          {
            id: item.id,
            price: args.priceId,
            quantity: args.quantity ?? item.quantity ?? 1
          }
        ],
        payment_behavior: "allow_incomplete",
        proration_behavior: toStripeProrationBehavior(args.prorationMode)
      } satisfies StripeSdk.SubscriptionUpdateParams

      return yield* postForm(`/subscriptions/${args.subscriptionId}`, params).pipe(
        Effect.flatMap(
          HttpClientResponse.matchStatus({
            200: decodeJson(StripeSubscription),
            404: () =>
              Effect.fail(
                new SubscriptionNotFound({
                  subscriptionId: args.subscriptionId
                })
              ),
            orElse: (response) => unexpectedStatus(response.request, response)
          })
        ),
        Effect.catchAll((error) => (error._tag === "SubscriptionNotFound" ? Effect.fail(error) : Effect.die(error)))
      )
    }),
    previewChange: Effect.fn(function* (args: {
      subscriptionId: string
      priceId: string
      quantity?: number | undefined
      prorationMode?: ChangeSubscriptionProrationMode | undefined
    }): Effect.fn.Return<
      {
        subscription: StripeSubscription
        nextInvoice: StripeInvoice
        recurringInvoice: StripeInvoice
        price: StripePrice
      },
      SubscriptionNotFound | PriceNotFound,
      never
    > {
      const current = yield* getSubscriptionById(args.subscriptionId).pipe(
        Effect.catchAll((error) => (error._tag === "SubscriptionNotFound" ? Effect.fail(error) : Effect.die(error)))
      )
      const item = current.items.data[0]
      if (!item) {
        return yield* new SubscriptionNotFound({
          subscriptionId: args.subscriptionId,
          message: "Subscription has no items to preview"
        })
      }
      const price = yield* getPriceById(args.priceId).pipe(
        Effect.catchAll((error) => (error._tag === "PriceNotFound" ? Effect.fail(error) : Effect.die(error)))
      )
      if (price.type !== "recurring") {
        return yield* new PriceNotFound({
          priceId: args.priceId
        })
      }
      const customerId = resolveStripeCustomerId(current.customer)
      if (!customerId) {
        return yield* new SubscriptionNotFound({
          subscriptionId: args.subscriptionId,
          message: "Subscription has no customer"
        })
      }
      const previewInput = {
        customer: customerId,
        subscription: args.subscriptionId,
        subscription_details: withOptional({
          items: [
            {
              id: item.id,
              price: args.priceId,
              quantity: args.quantity ?? item.quantity ?? 1
            }
          ],
          proration_behavior: toStripeProrationBehavior(args.prorationMode)
        })
      } satisfies StripeSdk.InvoiceCreatePreviewParams
      const [nextInvoice, recurringInvoice] = yield* Effect.all([
        postForm(
          "/invoices/create_preview",
          withOptional({
            ...previewInput,
            preview_mode: "next" as const
          }) satisfies StripeSdk.InvoiceCreatePreviewParams
        ).pipe(Effect.flatMap(expectJsonStatus200(StripeInvoice))),
        postForm(
          "/invoices/create_preview",
          withOptional({
            ...previewInput,
            preview_mode: "recurring" as const
          }) satisfies StripeSdk.InvoiceCreatePreviewParams
        ).pipe(Effect.flatMap(expectJsonStatus200(StripeInvoice)))
      ]).pipe(Effect.catchAll(Effect.die))
      return {
        subscription: current,
        nextInvoice,
        recurringInvoice,
        price
      } as const
    }),
    previewCharge: Effect.fn(function* (args: {
      subscriptionId: string
      priceId: string
      quantity?: number | undefined
      effectiveFrom?: "immediately" | "next_billing_period" | undefined
    }): Effect.fn.Return<
      {
        subscription: StripeSubscription
        nextInvoice: StripeInvoice
        price: StripePrice
      },
      SubscriptionNotFound | PriceNotFound
    > {
      const current = yield* getSubscriptionById(args.subscriptionId).pipe(
        Effect.catchAll((error) => (error instanceof SubscriptionNotFound ? Effect.fail(error) : Effect.die(error)))
      )
      const customerId = resolveStripeCustomerId(current.customer)
      if (!customerId) {
        return yield* new SubscriptionNotFound({
          subscriptionId: args.subscriptionId,
          message: "Subscription has no customer"
        })
      }
      const price = yield* getPriceById(args.priceId).pipe(
        Effect.catchAll((error) => (error._tag === "PriceNotFound" ? Effect.fail(error) : Effect.die(error)))
      )
      if (price.type !== "one_time") {
        return yield* new PriceNotFound({
          priceId: args.priceId
        })
      }
      const params = {
        customer: customerId,
        invoice_items: [
          {
            price: args.priceId,
            quantity: args.quantity ?? 1
          }
        ],
        preview_mode: "next",
        subscription: args.subscriptionId
      } satisfies StripeSdk.InvoiceCreatePreviewParams
      const nextInvoice = yield* postForm("/invoices/create_preview", params).pipe(
        Effect.flatMap(expectJsonStatus200(StripeInvoice)),
        Effect.catchAll(Effect.die)
      )
      return {
        subscription: current,
        nextInvoice,
        price
      } as const
    }),
    charge: Effect.fn(function* (args: {
      subscriptionId: string
      priceId: string
      quantity?: number | undefined
      effectiveFrom?: "immediately" | "next_billing_period" | undefined
    }): Effect.fn.Return<
      {
        subscription: StripeSubscription
        invoice: StripeInvoice | null
        price: StripePrice
      },
      SubscriptionNotFound | PriceNotFound
    > {
      const current = yield* getSubscriptionById(args.subscriptionId).pipe(
        Effect.catchAll((error) => (error instanceof SubscriptionNotFound ? Effect.fail(error) : Effect.die(error)))
      )
      const customerId = resolveStripeCustomerId(current.customer)
      if (!customerId) {
        return yield* new SubscriptionNotFound({
          subscriptionId: args.subscriptionId,
          message: "Subscription has no customer"
        })
      }
      const price = yield* getPriceById(args.priceId).pipe(
        Effect.catchAll((error) => (error._tag === "PriceNotFound" ? Effect.fail(error) : Effect.die(error)))
      )
      if (price.type !== "one_time") {
        return yield* new PriceNotFound({
          priceId: args.priceId
        })
      }
      const quantity = args.quantity ?? 1
      const effectiveFrom = args.effectiveFrom ?? "immediately"
      if (effectiveFrom === "next_billing_period") {
        const params = {
          add_invoice_items: [
            {
              price: args.priceId,
              quantity
            }
          ],
          expand: ["items.data.price.product", "latest_invoice"]
        } satisfies StripeSdk.SubscriptionUpdateParams
        const subscription = yield* postForm(`/subscriptions/${args.subscriptionId}`, params).pipe(
          Effect.flatMap(
            HttpClientResponse.matchStatus({
              200: decodeJson(StripeSubscription),
              404: () =>
                Effect.fail(
                  new SubscriptionNotFound({
                    subscriptionId: args.subscriptionId
                  })
                ),
              orElse: (response) => unexpectedStatus(response.request, response)
            })
          ),
          Effect.catchAll((error) => (error._tag === "SubscriptionNotFound" ? Effect.fail(error) : Effect.die(error)))
        )
        return {
          subscription,
          invoice: null,
          price
        } as const
      }
      const invoiceItemParams = {
        customer: customerId,
        pricing: {
          price: args.priceId
        },
        quantity,
        subscription: args.subscriptionId
      } satisfies StripeSdk.InvoiceItemCreateParams
      yield* postForm("/invoiceitems", invoiceItemParams).pipe(
        Effect.flatMap(expectJsonStatus200(Schema.Any)),
        Effect.catchAll(Effect.die)
      )
      const createInvoiceParams = {
        auto_advance: false,
        collection_method: "charge_automatically",
        customer: customerId,
        pending_invoice_items_behavior: "include",
        subscription: args.subscriptionId
      } satisfies StripeSdk.InvoiceCreateParams
      const draftInvoice = yield* postForm("/invoices", createInvoiceParams).pipe(
        Effect.flatMap(expectJsonStatus200(StripeInvoice)),
        Effect.catchAll(Effect.die)
      )
      const finalizedInvoice = yield* postForm(`/invoices/${draftInvoice.id}/finalize`).pipe(
        Effect.flatMap(expectJsonStatus200(StripeInvoice)),
        Effect.catchAll(Effect.die)
      )
      const paidInvoice = yield* postForm(`/invoices/${finalizedInvoice.id}/pay`).pipe(
        Effect.flatMap(expectJsonStatus200(StripeInvoice)),
        Effect.catchAll(Effect.die)
      )
      return {
        subscription: current,
        invoice: paidInvoice,
        price
      } as const
    }),
    pause: Effect.fn(function* (
      args: PauseSubscriptionParams
    ): Effect.fn.Return<void, SubscriptionNotFound | ProviderOperationNotSupported> {
      if (args.mode !== "billing_collection") {
        return yield* new ProviderOperationNotSupported({
          provider: "stripe",
          operation: "subscriptions.pause",
          message:
            "Stripe only supports billing_collection pause through pause_collection; lifecycle pause is not supported"
        })
      }
      if (args.effectiveFrom && args.effectiveFrom !== "immediately") {
        return yield* new ProviderOperationNotSupported({
          provider: "stripe",
          operation: "subscriptions.pause",
          message: "Stripe pause_collection starts immediately and does not support next_billing_period"
        })
      }
      const params = {
        expand: ["items.data.price.product", "latest_invoice"],
        pause_collection: withOptional({
          behavior: args.invoiceBehavior ?? "void",
          resumes_at: args.resumeAt ? parseUnixTimestamp(args.resumeAt, "resumeAt") : undefined
        })
      } satisfies StripeSdk.SubscriptionUpdateParams
      yield* postForm(`/subscriptions/${args.subscriptionId}`, params).pipe(
        Effect.flatMap(
          HttpClientResponse.matchStatus({
            200: () => Effect.void,
            404: () =>
              Effect.fail(
                new SubscriptionNotFound({
                  subscriptionId: args.subscriptionId
                })
              ),
            orElse: (response) => unexpectedStatus(response.request, response)
          })
        ),
        Effect.catchAll((error) =>
          error instanceof SubscriptionNotFound || error instanceof ProviderOperationNotSupported
            ? Effect.fail(error)
            : Effect.die(error)
        )
      )
    }),
    resume: Effect.fn(function* (
      args: ResumeSubscriptionParams
    ): Effect.fn.Return<void, SubscriptionNotFound | ProviderOperationNotSupported> {
      if (args.mode === "billing_collection") {
        if (typeof args.effectiveFrom !== "undefined" && args.effectiveFrom !== "immediately") {
          return yield* new ProviderOperationNotSupported({
            provider: "stripe",
            operation: "subscriptions.resume",
            message: "Stripe cannot schedule a future billing_collection resume; unpausing happens immediately"
          })
        }
        const params = {
          expand: ["items.data.price.product", "latest_invoice"],
          pause_collection: "" as StripeSdk.Emptyable<StripeSdk.SubscriptionUpdateParams.PauseCollection>
        } satisfies StripeSdk.SubscriptionUpdateParams
        yield* postForm(`/subscriptions/${args.subscriptionId}`, params).pipe(
          Effect.flatMap(
            HttpClientResponse.matchStatus({
              200: () => Effect.void,
              404: () =>
                Effect.fail(
                  new SubscriptionNotFound({
                    subscriptionId: args.subscriptionId
                  })
                ),
              orElse: (response) => unexpectedStatus(response.request, response)
            })
          ),
          Effect.catchAll((error) => (error instanceof SubscriptionNotFound ? Effect.fail(error) : Effect.die(error)))
        )
        return
      }
      const current = yield* getSubscriptionById(args.subscriptionId).pipe(
        Effect.catchAll((error) => (error instanceof SubscriptionNotFound ? Effect.fail(error) : Effect.die(error)))
      )
      if (current.status !== "paused") {
        return yield* new ProviderOperationNotSupported({
          provider: "stripe",
          operation: "subscriptions.resume",
          message:
            "Stripe lifecycle resume only works for subscriptions already in status=paused; use billing_collection mode for pause_collection"
        })
      }
      if (args.resumePolicy) {
        return yield* new ProviderOperationNotSupported({
          provider: "stripe",
          operation: "subscriptions.resume",
          message: "Stripe lifecycle resume does not support Paddle-style resumePolicy values"
        })
      }
      const params = withOptional({
        billing_cycle_anchor: args.billingCycleAnchor,
        expand: ["items.data.price.product", "latest_invoice"],
        proration_behavior: args.prorationBehavior,
        proration_date: args.prorationDate ? parseUnixTimestamp(args.prorationDate, "prorationDate") : undefined
      }) satisfies StripeSdk.SubscriptionResumeParams
      yield* postForm(`/subscriptions/${args.subscriptionId}/resume`, params).pipe(
        Effect.flatMap(
          HttpClientResponse.matchStatus({
            200: () => Effect.void,
            404: () =>
              Effect.fail(
                new SubscriptionNotFound({
                  subscriptionId: args.subscriptionId
                })
              ),
            orElse: (response) => unexpectedStatus(response.request, response)
          })
        ),
        Effect.catchAll((error) =>
          error instanceof SubscriptionNotFound || error instanceof ProviderOperationNotSupported
            ? Effect.fail(error)
            : Effect.die(error)
        )
      )
    })
  }
  const transactions = {
    list: Effect.fn(function* (args: {
      customerId?: string | undefined
      status?: Array<string> | undefined
      after?: string | undefined
      perPage?: number | undefined
    }): Effect.fn.Return<ReadonlyArray<StripeInvoice>> {
      const allowed = invoiceStatusesFromTags(args.status)
      const params = withOptional({
        customer: args.customerId,
        limit: pageLimit(args.perPage, 10),
        starting_after: args.after
      }) satisfies StripeSdk.InvoiceListParams
      return yield* getForm("/invoices", params).pipe(
        Effect.flatMap(expectJsonStatus200(StripeList(StripeInvoice))),
        Effect.map((page) =>
          allowed ? page.data.filter((invoice) => (invoice.status ? allowed.has(invoice.status) : false)) : page.data
        ),
        Effect.catchAll(Effect.die)
      )
    }),
    preview: Effect.fn(function* (args: {
      customerId?: string | undefined
      currencyCode?: string | undefined
      items: ReadonlyArray<{
        priceId: string
        quantity?: number | undefined
        includeInTotals?: boolean | undefined
      }>
    }): Effect.fn.Return<StripeInvoice, PriceNotFound | CustomerNotFound> {
      for (const item of args.items) {
        const price = yield* getPriceById(item.priceId).pipe(
          Effect.catchAll((error) => (error._tag === "PriceNotFound" ? Effect.fail(error) : Effect.die(error)))
        )
        if (price.type !== "one_time") {
          return yield* new PriceNotFound({
            priceId: item.priceId
          })
        }
      }
      const params = withOptional({
        currency: args.currencyCode?.toLowerCase(),
        customer: args.customerId,
        invoice_items: args.items
          .filter((item) => item.includeInTotals ?? true)
          .map((item) => ({
            price: item.priceId,
            quantity: item.quantity ?? 1
          }))
      }) satisfies StripeSdk.InvoiceCreatePreviewParams
      return yield* postForm("/invoices/create_preview", params).pipe(
        Effect.flatMap(
          HttpClientResponse.matchStatus({
            200: decodeJson(StripeInvoice),
            404: (response) =>
              args.customerId
                ? Effect.fail(
                    new CustomerNotFound({
                      customerId: args.customerId
                    })
                  )
                : unexpectedStatus(response.request, response),
            orElse: (response) => unexpectedStatus(response.request, response)
          })
        ),
        Effect.catchAll((error) =>
          error._tag === "CustomerNotFound" || error instanceof PriceNotFound ? Effect.fail(error) : Effect.die(error)
        )
      )
    }),
    create: Effect.fn(function* (args: {
      customerId: string
      priceId: string
      quantity?: number | undefined
      collectionMode?: "automatic" | "manual" | undefined
      dueInDays?: number | undefined
    }): Effect.fn.Return<StripeInvoice, CustomerNotFound | PriceNotFound> {
      const customer = yield* getCustomerById(args.customerId).pipe(
        Effect.catchAll((error) => (error._tag === "CustomerNotFound" ? Effect.fail(error) : Effect.die(error)))
      )
      if (isDeletedStripeCustomer(customer)) {
        return yield* new CustomerNotFound({
          customerId: args.customerId
        })
      }
      const price = yield* getPriceById(args.priceId).pipe(
        Effect.catchAll((error) => (error._tag === "PriceNotFound" ? Effect.fail(error) : Effect.die(error)))
      )
      if (price.type !== "one_time") {
        return yield* new PriceNotFound({
          priceId: args.priceId
        })
      }
      const invoiceItemParams = {
        customer: args.customerId,
        pricing: {
          price: args.priceId
        },
        quantity: args.quantity ?? 1
      } satisfies StripeSdk.InvoiceItemCreateParams
      yield* postForm("/invoiceitems", invoiceItemParams).pipe(
        Effect.flatMap(expectJsonStatus200(Schema.Any)),
        Effect.catchAll(Effect.die)
      )
      const collectionMethod: StripeSdk.InvoiceCreateParams.CollectionMethod =
        args.collectionMode === "manual" ? "send_invoice" : "charge_automatically"
      const createInvoiceInput = withOptional({
        auto_advance: false,
        collection_method: collectionMethod,
        customer: args.customerId,
        days_until_due: collectionMethod === "send_invoice" ? (args.dueInDays ?? 30) : undefined,
        pending_invoice_items_behavior: "include" as const
      }) satisfies StripeSdk.InvoiceCreateParams
      const draftInvoice = yield* postForm("/invoices", createInvoiceInput).pipe(
        Effect.flatMap(expectJsonStatus200(StripeInvoice)),
        Effect.catchAll(Effect.die)
      )
      const finalizedInvoice = yield* postForm(`/invoices/${draftInvoice.id}/finalize`).pipe(
        Effect.flatMap(expectJsonStatus200(StripeInvoice)),
        Effect.catchAll(Effect.die)
      )
      if (collectionMethod === "send_invoice") {
        return yield* postForm(`/invoices/${finalizedInvoice.id}/send`).pipe(
          Effect.flatMap(expectJsonStatus200(StripeInvoice)),
          Effect.catchAll(Effect.die)
        )
      }
      return finalizedInvoice
    }),
    get: Effect.fn(function* (args: { transactionId: string }): Effect.fn.Return<Option.Option<StripeInvoice>> {
      return yield* getInvoiceById(args.transactionId).pipe(
        Effect.map(Option.some),
        Effect.catchTag("TransactionNotFound", () => Effect.succeed(Option.none<StripeInvoice>())),
        Effect.catchAll(Effect.die)
      )
    }),
    generateInvoicePDF: Effect.fn(function* (args: {
      transactionId: string
    }): Effect.fn.Return<string, TransactionNotFound> {
      const invoice = yield* getInvoiceById(args.transactionId).pipe(
        Effect.catchAll((error) => (error instanceof TransactionNotFound ? Effect.fail(error) : Effect.die(error)))
      )
      if (!invoice.invoice_pdf) {
        return yield* new TransactionNotFound({
          transactionId: args.transactionId,
          message: "Invoice PDF not found"
        })
      }
      return invoice.invoice_pdf
    }),
    refund: Effect.fn(function* (args: {
      transactionId: string
      amount?: string | undefined
    }): Effect.fn.Return<ReturnType<typeof formatStripeRefund>, TransactionNotFound> {
      const invoice = yield* getInvoiceById(args.transactionId, {
        expand: ["payment_intent"]
      } satisfies StripeSdk.InvoiceRetrieveParams).pipe(
        Effect.catchAll((error) => (error instanceof TransactionNotFound ? Effect.fail(error) : Effect.die(error)))
      )
      const paymentIntentId = resolveStripePaymentIntentId(invoice)
      if (!paymentIntentId) {
        return yield* new TransactionNotFound({
          transactionId: args.transactionId,
          message: "Transaction has no payment intent to refund"
        })
      }
      const params = withOptional({
        amount: args.amount ? parseMinorUnitAmount(args.amount, "amount") : undefined,
        payment_intent: paymentIntentId
      }) satisfies StripeSdk.RefundCreateParams
      const refund = yield* postForm("/refunds", params).pipe(
        Effect.flatMap(
          HttpClientResponse.matchStatus({
            200: decodeJson(StripeRefund),
            404: () =>
              Effect.fail(
                new TransactionNotFound({
                  transactionId: args.transactionId
                })
              ),
            orElse: (response) => unexpectedStatus(response.request, response)
          })
        ),
        Effect.catchAll((error) => (error instanceof TransactionNotFound ? Effect.fail(error) : Effect.die(error)))
      )
      return formatStripeRefund(refund, args.transactionId)
    })
  }
  const refunds = {
    get: Effect.fn(function* (args: {
      refundId: string
    }): Effect.fn.Return<Option.Option<ReturnType<typeof formatStripeRefund>>> {
      const params = {
        expand: ["charge"]
      } satisfies StripeSdk.RefundRetrieveParams
      return yield* getForm(`/refunds/${args.refundId}`, params).pipe(
        Effect.flatMap(
          HttpClientResponse.matchStatus({
            200: decodeJson(StripeRefund),
            404: () => Effect.succeed(null),
            orElse: (response) => unexpectedStatus(response.request, response)
          })
        ),
        Effect.map((refund) => {
          if (!refund) {
            return Option.none<ReturnType<typeof formatStripeRefund>>()
          }
          let transactionId: string | null = null
          if (refund.charge && typeof refund.charge !== "string") {
            const invoice =
              typeof refund.charge.invoice === "string" ? refund.charge.invoice : refund.charge.invoice?.id
            transactionId = invoice ?? null
          }
          return Option.some(formatStripeRefund(refund, transactionId))
        }),
        Effect.catchAll(Effect.die)
      )
    }),
    list: Effect.fn(function* (args: {
      transactionId?: string | undefined
      after?: string | undefined
      perPage?: number | undefined
    }): Effect.fn.Return<Array<ReturnType<typeof formatStripeRefund>>> {
      let paymentIntentId: string | undefined
      if (args.transactionId) {
        const invoice = yield* getInvoiceById(args.transactionId, {
          expand: ["payment_intent"]
        } satisfies StripeSdk.InvoiceRetrieveParams).pipe(
          Effect.catchTag("TransactionNotFound", () => Effect.succeed(null)),
          Effect.catchAll(Effect.die)
        )
        if (!invoice) {
          return [] as const
        }
        paymentIntentId = resolveStripePaymentIntentId(invoice) ?? undefined
        if (!paymentIntentId) {
          return [] as const
        }
      }
      const params = withOptional({
        limit: pageLimit(args.perPage, 10),
        payment_intent: paymentIntentId,
        starting_after: args.after
      }) satisfies StripeSdk.RefundListParams
      return yield* getForm("/refunds", params).pipe(
        Effect.flatMap(expectJsonStatus200(StripeList(StripeRefund))),
        Effect.map((page) => page.data.map((refund) => formatStripeRefund(refund, args.transactionId ?? null))),
        Effect.catchAll(Effect.die)
      )
    })
  }
  const checkout = {
    createSession: Effect.fn(function* (args: {
      customerId: string
      priceId: string
      mode: "payment" | "subscription"
      clientReferenceId?: string | undefined
      successUrl: string
      cancelUrl: string
      metadata?: Record<string, string> | undefined
      paymentIntentMetadata?: Record<string, string> | undefined
      subscriptionMetadata?: Record<string, string> | undefined
    }): Effect.fn.Return<StripeCheckoutSession> {
      const params = withOptional({
        cancel_url: args.cancelUrl,
        client_reference_id: args.clientReferenceId,
        customer: args.customerId,
        line_items: [
          {
            price: args.priceId,
            quantity: 1
          }
        ],
        metadata: args.metadata,
        mode: args.mode,
        payment_intent_data:
          args.mode === "payment" ? withOptional({ metadata: args.paymentIntentMetadata }) : undefined,
        subscription_data:
          args.mode === "subscription" ? withOptional({ metadata: args.subscriptionMetadata }) : undefined,
        success_url: args.successUrl
      }) satisfies StripeSdk.Checkout.SessionCreateParams
      return yield* postForm("/checkout/sessions", params).pipe(
        Effect.flatMap(expectJsonStatus200(StripeCheckoutSession)),
        Effect.catchAll(Effect.die)
      )
    })
  }
  const billingPortal = {
    createSession: Effect.fn(function* (args: {
      customerId: string
      returnUrl?: string | undefined
      flow?: "general" | "payment_method_update" | "subscription_cancel" | "subscription_update" | undefined
      subscriptionId?: string | undefined
    }): Effect.fn.Return<StripeBillingPortalSession, CustomerNotFound | ProviderOperationNotSupported> {
      if ((args.flow === "subscription_cancel" || args.flow === "subscription_update") && !args.subscriptionId) {
        return yield* new ProviderOperationNotSupported({
          provider: "stripe",
          operation: "billingPortal.createSession",
          message: `Stripe ${args.flow} portal flow requires subscriptionId`
        })
      }
      const flow =
        args.flow && args.flow !== "general"
          ? args.flow === "payment_method_update"
            ? {
                type: "payment_method_update" as const
              }
            : args.flow === "subscription_cancel"
              ? {
                  subscription_cancel: {
                    subscription: args.subscriptionId!
                  },
                  type: "subscription_cancel" as const
                }
              : {
                  subscription_update: {
                    subscription: args.subscriptionId!
                  },
                  type: "subscription_update" as const
                }
          : undefined
      const params = withOptional({
        customer: args.customerId,
        flow_data: flow,
        return_url: args.returnUrl
      }) satisfies StripeSdk.BillingPortal.SessionCreateParams
      return yield* postForm("/billing_portal/sessions", params).pipe(
        Effect.flatMap(
          HttpClientResponse.matchStatus({
            200: decodeJson(StripeBillingPortalSession),
            404: () =>
              Effect.fail(
                new CustomerNotFound({
                  customerId: args.customerId
                })
              ),
            orElse: (response) => unexpectedStatus(response.request, response)
          })
        ),
        Effect.catchAll((error) => (error._tag === "CustomerNotFound" ? Effect.fail(error) : Effect.die(error)))
      )
    })
  }
  const webhooksUnmarshal = Effect.fn(function* (
    payload: string,
    signature: string
  ): Effect.fn.Return<StripeEvent, WebhookUnmarshalError> {
    const webhookSecret = Redacted.value(config.webhookSecret)
    const signedPayload = yield* Effect.try({
      try: () => {
        const parsed = parseStripeSignatureHeader(signature)
        assertStripeWebhookFresh(parsed.timestamp)
        return parsed
      },
      catch: (cause) =>
        new WebhookUnmarshalError({
          error: "Invalid Stripe webhook payload",
          cause
        })
    })
    const expectedSignature = yield* Effect.tryPromise({
      try: () => computeStripeWebhookSignature(`${signedPayload.timestamp}.${payload}`, webhookSecret),
      catch: (cause) =>
        new WebhookUnmarshalError({
          error: "Invalid Stripe webhook payload",
          cause
        })
    })
    if (!signedPayload.signatures.some((candidate) => constantTimeEqual(candidate, expectedSignature))) {
      return yield* new WebhookUnmarshalError({
        error: "Invalid Stripe webhook payload"
      })
    }
    return yield* Effect.try({
      // @effect-diagnostics-next-line preferSchemaOverJson:off
      try: () => JSON.parse(payload),
      catch: (cause) =>
        new WebhookUnmarshalError({
          error: "Invalid Stripe webhook payload",
          cause
        })
    }).pipe(
      Effect.flatMap(Schema.decodeUnknown(StripeEvent)),
      Effect.mapError(
        (cause) =>
          new WebhookUnmarshalError({
            error: "Invalid Stripe webhook payload",
            cause
          })
      )
    )
  })
  return {
    config: {
      apiKey: config.apiKey,
      webhookSecret: config.webhookSecret,
      environment: config.environment as PaymentEnvironmentTag
    },
    products,
    prices,
    customers,
    subscriptions,
    transactions,
    refunds,
    checkout,
    billingPortal,
    webhooksUnmarshal
  } as const
})

export class StripeClient extends Context.Tag("StripeClient")<
  StripeClient,
  Effect.Effect.Success<ReturnType<typeof makeStripeClient>>
>() {}

export class StripeClientConfig extends Context.Tag("StripeClientConfig")<StripeClientConfig, StripeConfig>() {}

export const StripeConfigFromRecord = (config: StripeConfig) => Layer.succeed(StripeClientConfig, config)

export const StripeClientLayer = Layer.effect(StripeClient, Effect.flatMap(StripeClientConfig, makeStripeClient))

type StripeParamInput = Record<string, unknown>

const pageLimit = (perPage: number | undefined, fallback: number) => {
  const value = perPage ?? fallback
  return Math.max(1, Math.min(100, value))
}

const toStripeProrationBehavior = (mode: ChangeSubscriptionProrationMode | undefined) => {
  switch (mode) {
    case "immediate":
      return "always_invoice" as const
    case "none":
      return "none" as const
    case "next_billing_period":
    default:
      return "create_prorations" as const
  }
}

const parseMinorUnitAmount = (value: string, field: string) => {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new Error(`Invalid ${field}: expected a positive integer minor-unit string, received ${value}`)
  }

  return Number.parseInt(value, 10)
}

const encodeStripeMetadata = (metadata: Record<string, unknown> | null | undefined) => {
  if (metadata === null) {
    return {}
  }

  if (!metadata) {
    return undefined
  }

  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [key, typeof value === "string" ? value : JSON.stringify(value)])
  )
}

const encodeStripeParams = (input: StripeParamInput) => {
  const entries: Array<readonly [string, string]> = []

  const visit = (path: ReadonlyArray<string>, value: unknown): void => {
    if (typeof value === "undefined") {
      return
    }

    if (value === null) {
      entries.push([formatStripeParamPath(path), ""])
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => visit([...path, String(index)], item))
      return
    }

    if (typeof value === "object") {
      const objectEntries = Object.entries(value)
      if (objectEntries.length === 0) {
        entries.push([formatStripeParamPath(path), ""])
        return
      }

      objectEntries.forEach(([key, nested]) => visit([...path, key], nested))
      return
    }

    entries.push([formatStripeParamPath(path), String(value)])
  }

  Object.entries(input).forEach(([key, value]) => visit([key], value))

  return entries
}

const formatStripeParamPath = (path: ReadonlyArray<string>) =>
  path[0]! +
  path
    .slice(1)
    .map((segment) => `[${segment}]`)
    .join("")

const mapStripeRefundStatus = (status: string | null | undefined) => {
  switch (status) {
    case "succeeded":
      return "succeeded" as const
    case "failed":
      return "failed" as const
    case "canceled":
      return "canceled" as const
    case "pending":
    case "requires_action":
    case null:
    case undefined:
    default:
      return "pending" as const
  }
}

const resolveStripeCustomerId = (
  customer: string | StripeCustomer | typeof StripeDeletedCustomer.Type | null | undefined
) => {
  if (!customer) {
    return null
  }

  return typeof customer === "string" ? customer : customer.id
}

const resolveStripePaymentIntentId = (invoice: StripeInvoice) => {
  return typeof invoice.payment_intent === "string" ? invoice.payment_intent : invoice.payment_intent?.id
}

const formatStripeRefund = (refund: StripeRefund, transactionId: string | null) => ({
  id: refund.id,
  transactionId,
  amount: refund.amount.toString(),
  currencyCode: refund.currency.toUpperCase(),
  status: mapStripeRefundStatus(refund.status),
  providerStatus: refund.status ?? "pending",
  createdAt: new Date(refund.created * 1000).toISOString(),
  updatedAt: new Date(refund.created * 1000).toISOString()
})

const isDeletedStripeObject = (
  value: StripeProduct | typeof StripeDeletedObject.Type
): value is typeof StripeDeletedObject.Type =>
  typeof value === "object" && value !== null && "deleted" in value && value.deleted === true

const isDeletedStripeCustomer = (
  value: StripeCustomer | typeof StripeDeletedCustomer.Type
): value is typeof StripeDeletedCustomer.Type => typeof value === "object" && value !== null && "deleted" in value

const parseUnixTimestamp = (value: string, field: string) => {
  const timestamp = Date.parse(value)
  if (Number.isNaN(timestamp)) {
    throw new Error(`Invalid ${field}: ${value}`)
  }

  return Math.floor(timestamp / 1000)
}

const withOptional = <T extends Record<string, unknown>>(values: T) =>
  Object.fromEntries(Object.entries(values).filter(([, value]) => typeof value !== "undefined")) as {
    [K in keyof T as undefined extends T[K] ? never : K]: Exclude<T[K], undefined>
  } & {
    [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<T[K], undefined>
  }

const invoiceStatusesFromTags = (status?: Array<string>) => {
  if (!status?.length) {
    return undefined
  }

  const mapped = new Set<string>()
  for (const value of status) {
    switch (value) {
      case "draft":
        mapped.add("draft")
        break
      case "billed":
        mapped.add("open")
        break
      case "paid":
      case "completed":
        mapped.add("paid")
        break
      case "past_due":
        mapped.add("uncollectible")
        break
      case "canceled":
        mapped.add("void")
        break
    }
  }

  return mapped
}

const parseStripeSignatureHeader = (signature: string) => {
  const parts = signature
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)

  const timestampPart = parts.find((part) => part.startsWith("t="))
  const timestamp = timestampPart ? Number.parseInt(timestampPart.slice(2), 10) : Number.NaN
  const signatures = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3))

  if (!Number.isFinite(timestamp) || signatures.length === 0) {
    throw new Error("Invalid Stripe signature header")
  }

  return {
    timestamp,
    signatures
  } as const
}

const assertStripeWebhookFresh = (timestamp: number) => {
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - timestamp) > 300) {
    throw new Error("Expired Stripe webhook timestamp")
  }
}

const computeStripeWebhookSignature = async (payload: string, secret: string) => {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload))
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

const constantTimeEqual = (left: string, right: string) => {
  if (left.length !== right.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < left.length; i++) {
    result |= left.charCodeAt(i) ^ right.charCodeAt(i)
  }

  return result === 0
}

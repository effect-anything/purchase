import type * as HttpClientError from "@effect/platform/HttpClientError"
import type { IEvents } from "@paddle/paddle-node-sdk"

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
  PaddleAdjustment,
  PaddleCustomer,
  PaddleCustomerPortalSession,
  PaddleError,
  PaddlePrice,
  PaddleProduct,
  PaddleSubscription,
  PaddleSubscriptionPreview,
  PaddleTransaction,
  PaddleTransactionPreview
} from "./paddle-schema.ts"

export const PaddleConfig = Config.all({
  apiToken: Config.redacted("PADDLE_API_TOKEN").pipe(Config.withDefault(Redacted.make(""))),
  webhookToken: Config.redacted("PADDLE_WEBHOOK_TOKEN").pipe(Config.withDefault(Redacted.make(""))),
  environment: Config.literal("sandbox", "production")("PADDLE_ENVIRONMENT").pipe(Config.withDefault("sandbox"))
})
export type PaddleConfig = Config.Config.Success<typeof PaddleConfig>

interface PaddleRefundResult {
  readonly id: string
  readonly transactionId: string
  readonly amount: string
  readonly currencyCode: string
  readonly status: "succeeded" | "failed" | "canceled" | "pending"
  readonly providerStatus: string
  readonly createdAt: string
  readonly updatedAt: string
}

interface PaddlePartialRefundItem {
  readonly item_id: string
  readonly type: "partial"
  readonly amount: string
}

export const makePaddleClient = (config: PaddleConfig) =>
  Effect.gen(function* () {
    const { apiToken, environment } = config

    const apiUrl = environment === "sandbox" ? "https://sandbox-api.paddle.com" : "https://api.paddle.com"

    const client = (yield* HttpClient.HttpClient.pipe(Effect.provide(FetchHttpClient.layer))).pipe(
      HttpClient.mapRequest((request) =>
        request.pipe(
          HttpClientRequest.prependUrl(apiUrl),
          HttpClientRequest.bearerToken(Redacted.value(apiToken)),
          HttpClientRequest.acceptJson
        )
      ),
      withProviderTransientRetry
    )

    const unexpectedStatus = (
      request: HttpClientRequest.HttpClientRequest,
      response: HttpClientResponse.HttpClientResponse
    ): Effect.Effect<never, HttpClientError.ResponseError, never> =>
      Effect.flatMap(
        Effect.all([
          Effect.orElseSucceed(response.text, () => "Unexpected status code"),
          Effect.orElseSucceed(Schema.decodeUnknown(PaddleError)(response.json), () => {})
        ]),
        ([description, json]) =>
          failUnexpectedStatus(request, response, json ? json.error.detail : description, json ? json.error : undefined)
      )

    const clientOK = HttpClient.filterOrElse(
      client,
      (self) => {
        return self.status >= 200 && self.status < 300
      },
      (response) => unexpectedStatus(response.request, response)
    )

    const prices = {
      list: Effect.fn(function* (
        args: {
          recurring?: boolean | undefined
          status?: Array<string> | undefined
          productId?: Array<string> | undefined
          type?: Array<string> | undefined
          after?: string | undefined
          perPage?: number | undefined
        } = {}
      ): Effect.fn.Return<ReadonlyArray<PaddlePrice>, HttpClientError.HttpClientError, never> {
        const status = args.status ?? ["active", "archived"]
        const res = yield* clientOK.get("/prices", {
          urlParams: {
            recurring: args.recurring,
            after: args.after,
            status,
            product_id: args.productId,
            per_page: args.perPage
          }
        })

        const result = yield* pipe(
          res,
          HttpClientResponse.schemaBodyJson(Schema.Struct({ data: Schema.Array(PaddlePrice) })),
          Effect.map(({ data }) => data),
          Effect.catchTag("ParseError", Effect.die)
        )

        return result
      }),
      get: Effect.fn(function* (args: {
        priceId: string
      }): Effect.fn.Return<Option.Option<PaddlePrice>, HttpClientError.HttpClientError, never> {
        const res = yield* client.get(`/prices/${args.priceId}`)

        const result = yield* pipe(
          res,
          HttpClientResponse.matchStatus({
            200: (response) => HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddlePrice }))(response),
            404: (response) => Effect.fail(new PriceNotFound({ priceId: response.request.url })),
            orElse: (response) => unexpectedStatus(response.request, response)
          }),
          Effect.map(({ data }) => Option.fromNullable(data)),
          Effect.catchTags({
            ParseError: Effect.die,
            PriceNotFound: () => Effect.succeed(Option.none<PaddlePrice>())
          })
        )

        return result
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
        quantity?:
          | {
              minimum: number
              maximum: number
            }
          | undefined
        metadata?: Record<string, unknown> | null | undefined
        active?: boolean | undefined
      }): Effect.fn.Return<PaddlePrice, HttpClientError.HttpClientError | ProductNotFound, never> {
        const res = yield* client.post("/prices", {
          acceptJson: true,
          body: HttpBody.unsafeJson({
            product_id: args.productId,
            description: args.name ?? args.productId,
            name: args.name,
            billing_cycle: args.billingCycle,
            trial_period: args.trialPeriod,
            tax_mode: "account_setting",
            unit_price: {
              amount: args.unitPrice.amount,
              currency_code: args.unitPrice.currencyCode
            },
            quantity: args.quantity,
            custom_data: args.metadata ?? undefined
          })
        })

        return yield* pipe(
          res,
          HttpClientResponse.matchStatus({
            201: (response) => HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddlePrice }))(response),
            404: () =>
              Effect.fail(
                new ProductNotFound({
                  productId: args.productId
                })
              ),
            orElse: (response) => unexpectedStatus(response.request, response)
          }),
          Effect.map(({ data }) => data),
          Effect.catchTag("ParseError", Effect.die)
        )
      }),

      update: Effect.fn(function* (args: {
        priceId: string
        name?: string | undefined
        metadata?: Record<string, unknown> | null | undefined
        active?: boolean | undefined
      }): Effect.fn.Return<PaddlePrice, HttpClientError.HttpClientError | PriceNotFound, never> {
        const res = yield* client.patch(`/prices/${args.priceId}`, {
          acceptJson: true,
          body: HttpBody.unsafeJson({
            description: args.name,
            name: args.name,
            custom_data: args.metadata ?? undefined,
            status: typeof args.active === "boolean" ? (args.active ? "active" : "archived") : undefined
          })
        })

        return yield* pipe(
          res,
          HttpClientResponse.matchStatus({
            200: (response) => HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddlePrice }))(response),
            404: () =>
              Effect.fail(
                new PriceNotFound({
                  priceId: args.priceId
                })
              ),
            orElse: (response) => unexpectedStatus(response.request, response)
          }),
          Effect.map(({ data }) => data),
          Effect.catchTag("ParseError", Effect.die)
        )
      })
    }

    const products = {
      list: Effect.fn(function* (
        args: {
          after?: string | undefined
          status?: Array<string> | undefined
          perPage?: number | undefined
          orderBy?: string | undefined
        } = {}
      ): Effect.fn.Return<ReadonlyArray<PaddleProduct>, HttpClientError.HttpClientError, never> {
        const res = yield* clientOK.get("/products", {
          urlParams: {
            status: args.status,
            after: args.after,
            per_page: args.perPage,
            order_by: args.orderBy
          }
        })

        const result = yield* pipe(
          res,
          HttpClientResponse.schemaBodyJson(
            Schema.Struct({
              data: Schema.Array(PaddleProduct)
            })
          ),
          Effect.map(({ data }) => data),
          Effect.catchTag("ParseError", Effect.die)
        )

        return result
      }),

      get: Effect.fn(function* (args: {
        productId: string
      }): Effect.fn.Return<Option.Option<PaddleProduct>, HttpClientError.HttpClientError, never> {
        const res = yield* client.get(`/products/${args.productId}`)

        const result = yield* pipe(
          res,
          HttpClientResponse.matchStatus({
            200: (response) => HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleProduct }))(response),
            404: (response) => Effect.fail(new ProductNotFound({ productId: response.request.url })),
            orElse: (response) => unexpectedStatus(response.request, response)
          }),
          Effect.map(({ data }) => Option.fromNullable(data)),
          Effect.catchTags({
            ParseError: Effect.die,
            ProductNotFound: () => Effect.succeed(Option.none<PaddleProduct>())
          })
        )

        return result
      }),

      create: Effect.fn(function* (args: {
        name: string
        description?: string | undefined
        metadata?: Record<string, unknown> | null | undefined
        active?: boolean | undefined
      }): Effect.fn.Return<PaddleProduct, HttpClientError.HttpClientError, never> {
        const res = yield* client.post("/products", {
          acceptJson: true,
          body: HttpBody.unsafeJson({
            name: args.name,
            description: args.description ?? "",
            tax_category: "standard",
            custom_data: args.metadata ?? undefined
          })
        })

        return yield* pipe(
          res,
          HttpClientResponse.matchStatus({
            201: (response) => HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleProduct }))(response),
            orElse: (response) => unexpectedStatus(response.request, response)
          }),
          Effect.map(({ data }) => data),
          Effect.catchTag("ParseError", Effect.die)
        )
      }),

      update: Effect.fn(function* (args: {
        productId: string
        name?: string | undefined
        description?: string | undefined
        metadata?: Record<string, unknown> | null | undefined
        active?: boolean | undefined
      }): Effect.fn.Return<PaddleProduct, HttpClientError.HttpClientError | ProductNotFound, never> {
        const res = yield* client.patch(`/products/${args.productId}`, {
          acceptJson: true,
          body: HttpBody.unsafeJson({
            name: args.name,
            description: args.description,
            custom_data: args.metadata ?? undefined,
            status: typeof args.active === "boolean" ? (args.active ? "active" : "archived") : undefined
          })
        })

        return yield* pipe(
          res,
          HttpClientResponse.matchStatus({
            200: (response) => HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleProduct }))(response),
            404: () =>
              Effect.fail(
                new ProductNotFound({
                  productId: args.productId
                })
              ),
            orElse: (response) => unexpectedStatus(response.request, response)
          }),
          Effect.map(({ data }) => data),
          Effect.catchTag("ParseError", Effect.die)
        )
      })
    }

    const customers = {
      list: Effect.fn(function* (
        args: {
          active?: boolean | undefined
          after?: string | undefined
          perPage?: number | undefined
        } = {}
      ): Effect.fn.Return<ReadonlyArray<PaddleCustomer>, HttpClientError.HttpClientError, never> {
        const active = args.active ?? true
        const res = yield* clientOK.get("/customers", {
          urlParams: {
            status: active ? "active" : "archived",
            after: args.after,
            per_page: args.perPage
          }
        })

        const result = yield* pipe(
          res,
          HttpClientResponse.schemaBodyJson(Schema.Struct({ data: Schema.Array(PaddleCustomer) })),
          Effect.map(({ data }) => data),
          Effect.catchTag("ParseError", Effect.die)
        )

        return result
      }),

      get: Effect.fn(function* (args: {
        customerId: string
      }): Effect.fn.Return<Option.Option<PaddleCustomer>, HttpClientError.HttpClientError, never> {
        const res = yield* client.get(`/customers/${args.customerId}`)

        const result = yield* pipe(
          res,
          HttpClientResponse.matchStatus({
            200: (response) => HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleCustomer }))(response),
            404: (response) => Effect.fail(new CustomerNotFound({ customerId: response.request.url })),
            orElse: (response) => unexpectedStatus(response.request, response)
          }),
          Effect.map(({ data }) => Option.fromNullable(data)),
          Effect.catchTags({
            ParseError: Effect.die,
            CustomerNotFound: () => Effect.succeed(Option.none<PaddleCustomer>())
          })
        )

        return result
      }),

      find: Effect.fn(function* (
        args: {
          id?: Array<string> | undefined
          email?: Array<string> | undefined
          perPage?: number | undefined
        } = {}
      ): Effect.fn.Return<ReadonlyArray<PaddleCustomer>, HttpClientError.HttpClientError, never> {
        const res = yield* clientOK.get("/customers", {
          urlParams: {
            id: args.id,
            email: args.email,
            per_page: args.perPage
          }
        })

        const result = yield* pipe(
          res,
          HttpClientResponse.schemaBodyJson(Schema.Struct({ data: Schema.Array(PaddleCustomer) })),
          Effect.map(({ data }) => data),
          Effect.catchTag("ParseError", Effect.die)
        )

        return result
      }),

      create: Effect.fn(function* (args: {
        email: string
        userId: string
        name?: string | undefined
        locale?: string | undefined
      }): Effect.fn.Return<PaddleCustomer, HttpClientError.HttpClientError | CustomerAlreadyExists, never> {
        const res = yield* client.post("/customers", {
          acceptJson: true,
          body: HttpBody.unsafeJson({
            email: args.email,
            name: args.name,
            custom_data: {
              userId: args.userId
            },
            locale: args.locale
          })
        })

        const result = yield* pipe(
          res,
          HttpClientResponse.matchStatus({
            201: (response) => HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleCustomer }))(response),
            409: () =>
              Effect.fail(
                new CustomerAlreadyExists({
                  email: args.email,
                  userId: args.userId
                })
              ),
            orElse: (response) => unexpectedStatus(response.request, response)
          }),
          Effect.map(({ data }) => data),
          Effect.catchTag("ParseError", Effect.die)
        )

        return result
      }),

      update: Effect.fn(function* (args: {
        customerId: string
        email?: string | undefined
        name?: string | undefined
        locale?: string | undefined
      }): Effect.fn.Return<PaddleCustomer, HttpClientError.HttpClientError, never> {
        const res = yield* clientOK.patch(`/customers/${args.customerId}`, {
          body: HttpBody.unsafeJson({
            name: args.name,
            locale: args.locale,
            email: args.email
          })
        })

        const result = yield* pipe(
          res,
          HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleCustomer })),
          Effect.map(({ data }) => data),
          Effect.catchTag("ParseError", Effect.die)
        )

        return result
      }),

      createPortalSession: Effect.fn(function* (args: {
        customerId: string
        subscriptionIds?: ReadonlyArray<string> | undefined
      }): Effect.fn.Return<PaddleCustomerPortalSession, HttpClientError.HttpClientError | CustomerNotFound, never> {
        const res = yield* client.post(`/customers/${args.customerId}/portal-sessions`, {
          body: HttpBody.unsafeJson({
            subscription_ids: args.subscriptionIds
          })
        })

        return yield* pipe(
          res,
          HttpClientResponse.matchStatus({
            201: (response) =>
              HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleCustomerPortalSession }))(response),
            404: () =>
              Effect.fail(
                new CustomerNotFound({
                  customerId: args.customerId
                })
              ),
            orElse: (response) => unexpectedStatus(response.request, response)
          }),
          Effect.map(({ data }) => data),
          Effect.catchTags({
            ParseError: Effect.die
          })
        )
      })
    }

    const subscriptions = {
      list: Effect.fn(function* (args: {
        customerId?: string | undefined
        status?: Array<string> | undefined
        after?: string | undefined
        perPage?: number | undefined
        orderBy?: string | undefined
      }): Effect.fn.Return<ReadonlyArray<PaddleSubscription>, HttpClientError.HttpClientError, never> {
        const res = yield* clientOK.get("/subscriptions", {
          urlParams: {
            customer_id: args.customerId ? [args.customerId] : undefined,
            status: args.status,
            after: args.after,
            per_page: args.perPage,
            order_by: args.orderBy
          }
        })

        const result = yield* pipe(
          res,
          HttpClientResponse.schemaBodyJson(Schema.Struct({ data: Schema.Array(PaddleSubscription) })),
          Effect.map(({ data }) => data),
          Effect.catchTag("ParseError", Effect.die)
        )

        return result
      }),

      get: Effect.fn(function* (args: {
        subscriptionId: string
      }): Effect.fn.Return<Option.Option<PaddleSubscription>, HttpClientError.HttpClientError, never> {
        const res = yield* client.get(`/subscriptions/${args.subscriptionId}`)

        const result = yield* pipe(
          res,
          HttpClientResponse.matchStatus({
            200: (response) => HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleSubscription }))(response),
            404: (response) =>
              Effect.fail(
                new SubscriptionNotFound({
                  subscriptionId: response.request.url
                })
              ),
            orElse: (response) => unexpectedStatus(response.request, response)
          }),
          Effect.map(({ data }) => Option.fromNullable(data)),
          Effect.catchTags({
            ParseError: Effect.die,
            SubscriptionNotFound: () => Effect.succeed(Option.none<PaddleSubscription>())
          })
        )

        return result
      }),

      cancel: Effect.fn(function* (args: {
        subscriptionId: string
        immediate?: boolean
      }): Effect.fn.Return<void, HttpClientError.HttpClientError, never> {
        const immediate = args.immediate ?? false

        yield* clientOK.post(`/subscriptions/${args.subscriptionId}/cancel`, {
          body: HttpBody.unsafeJson({
            effective_from: immediate ? "immediately" : "next_billing_period"
          })
        })
      }),

      change: Effect.fn(function* (args: {
        subscriptionId: string
        priceId: string
        quantity?: number | undefined
        prorationMode?: ChangeSubscriptionProrationMode | undefined
      }): Effect.fn.Return<
        PaddleSubscription,
        HttpClientError.HttpClientError | SubscriptionNotFound | PriceNotFound,
        never
      > {
        const subscriptionOption = yield* client.get(`/subscriptions/${args.subscriptionId}`).pipe(
          Effect.flatMap(
            HttpClientResponse.matchStatus({
              200: (response) =>
                HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleSubscription }))(response),
              404: () => Effect.succeed({ data: null }),
              orElse: (response) => unexpectedStatus(response.request, response)
            })
          ),
          Effect.map(({ data }) => Option.fromNullable(data)),
          Effect.catchTags({
            ParseError: Effect.die
          })
        )

        const priceOption = yield* client.get(`/prices/${args.priceId}`).pipe(
          Effect.flatMap(
            HttpClientResponse.matchStatus({
              200: (response) => HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddlePrice }))(response),
              404: () => Effect.succeed({ data: null }),
              orElse: (response) => unexpectedStatus(response.request, response)
            })
          ),
          Effect.map(({ data }) => Option.fromNullable(data)),
          Effect.catchTags({
            ParseError: Effect.die
          })
        )

        const subscription = yield* Option.match(subscriptionOption, {
          onNone: () =>
            Effect.fail(
              new SubscriptionNotFound({
                subscriptionId: args.subscriptionId
              })
            ),
          onSome: Effect.succeed
        })

        const price = yield* Option.match(priceOption, {
          onNone: () =>
            Effect.fail(
              new PriceNotFound({
                priceId: args.priceId
              })
            ),
          onSome: Effect.succeed
        })

        if (!price.billing_cycle) {
          return yield* new PriceNotFound({
            priceId: args.priceId
          })
        }

        if (subscription.items.length === 0) {
          return yield* new SubscriptionNotFound({
            subscriptionId: args.subscriptionId,
            message: "Subscription has no items to update"
          })
        }

        const res = yield* clientOK.patch(`/subscriptions/${args.subscriptionId}`, {
          body: HttpBody.unsafeJson({
            items: subscription.items.map((item, index) => ({
              price_id: index === 0 ? args.priceId : item.price.id,
              quantity: index === 0 ? (args.quantity ?? item.quantity) : item.quantity
            })),
            proration_billing_mode: toPaddleProrationBillingMode(args.prorationMode)
          })
        })

        const result = yield* pipe(
          res,
          HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleSubscription })),
          Effect.map(({ data }) => data),
          Effect.catchTags({
            ParseError: Effect.die
          })
        )

        return result
      }),

      previewChange: Effect.fn(function* (args: {
        subscriptionId: string
        priceId: string
        quantity?: number | undefined
        prorationMode?: ChangeSubscriptionProrationMode | undefined
      }): Effect.fn.Return<
        PaddleSubscriptionPreview,
        HttpClientError.HttpClientError | SubscriptionNotFound | PriceNotFound,
        never
      > {
        const subscriptionOption = yield* client.get(`/subscriptions/${args.subscriptionId}`).pipe(
          Effect.flatMap(
            HttpClientResponse.matchStatus({
              200: (response) =>
                HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleSubscription }))(response),
              404: () => Effect.succeed({ data: null }),
              orElse: (response) => unexpectedStatus(response.request, response)
            })
          ),
          Effect.map(({ data }) => Option.fromNullable(data)),
          Effect.catchTags({
            ParseError: Effect.die
          })
        )

        const priceOption = yield* client.get(`/prices/${args.priceId}`).pipe(
          Effect.flatMap(
            HttpClientResponse.matchStatus({
              200: (response) => HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddlePrice }))(response),
              404: () => Effect.succeed({ data: null }),
              orElse: (response) => unexpectedStatus(response.request, response)
            })
          ),
          Effect.map(({ data }) => Option.fromNullable(data)),
          Effect.catchTags({
            ParseError: Effect.die
          })
        )

        const subscription = yield* Option.match(subscriptionOption, {
          onNone: () =>
            Effect.fail(
              new SubscriptionNotFound({
                subscriptionId: args.subscriptionId
              })
            ),
          onSome: Effect.succeed
        })

        const price = yield* Option.match(priceOption, {
          onNone: () =>
            Effect.fail(
              new PriceNotFound({
                priceId: args.priceId
              })
            ),
          onSome: Effect.succeed
        })

        if (!price.billing_cycle) {
          return yield* new PriceNotFound({
            priceId: args.priceId
          })
        }

        if (subscription.items.length === 0) {
          return yield* new SubscriptionNotFound({
            subscriptionId: args.subscriptionId,
            message: "Subscription has no items to preview"
          })
        }

        const res = yield* clientOK.patch(`/subscriptions/${args.subscriptionId}/preview`, {
          body: HttpBody.unsafeJson({
            items: subscription.items.map((item, index) => ({
              price_id: index === 0 ? args.priceId : item.price.id,
              quantity: index === 0 ? (args.quantity ?? item.quantity) : item.quantity
            })),
            proration_billing_mode: toPaddleProrationBillingMode(args.prorationMode)
          })
        })

        const result = yield* pipe(
          res,
          HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleSubscriptionPreview })),
          Effect.map(({ data }) => data),
          Effect.catchTags({
            ParseError: Effect.die
          })
        )

        return result
      }),

      previewCharge: Effect.fn(function* (args: {
        subscriptionId: string
        priceId: string
        quantity?: number | undefined
        effectiveFrom?: "immediately" | "next_billing_period" | undefined
      }): Effect.fn.Return<
        PaddleSubscriptionPreview,
        HttpClientError.HttpClientError | SubscriptionNotFound | PriceNotFound,
        never
      > {
        const subscriptionOption = yield* client.get(`/subscriptions/${args.subscriptionId}`).pipe(
          Effect.flatMap(
            HttpClientResponse.matchStatus({
              200: (response) =>
                HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleSubscription }))(response),
              404: () => Effect.succeed({ data: null }),
              orElse: (response) => unexpectedStatus(response.request, response)
            })
          ),
          Effect.map(({ data }) => Option.fromNullable(data)),
          Effect.catchTags({
            ParseError: Effect.die
          })
        )

        const priceOption = yield* client.get(`/prices/${args.priceId}`).pipe(
          Effect.flatMap(
            HttpClientResponse.matchStatus({
              200: (response) => HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddlePrice }))(response),
              404: () => Effect.succeed({ data: null }),
              orElse: (response) => unexpectedStatus(response.request, response)
            })
          ),
          Effect.map(({ data }) => Option.fromNullable(data)),
          Effect.catchTags({
            ParseError: Effect.die
          })
        )

        yield* Option.match(subscriptionOption, {
          onNone: () =>
            Effect.fail(
              new SubscriptionNotFound({
                subscriptionId: args.subscriptionId
              })
            ),
          onSome: Effect.succeed
        })

        const price = yield* Option.match(priceOption, {
          onNone: () =>
            Effect.fail(
              new PriceNotFound({
                priceId: args.priceId
              })
            ),
          onSome: Effect.succeed
        })

        if (price.billing_cycle) {
          return yield* new PriceNotFound({
            priceId: args.priceId
          })
        }

        const res = yield* clientOK.post(`/subscriptions/${args.subscriptionId}/charge/preview`, {
          body: HttpBody.unsafeJson({
            effective_from: args.effectiveFrom ?? "immediately",
            items: [
              {
                price_id: args.priceId,
                quantity: args.quantity ?? 1
              }
            ]
          })
        })

        return yield* pipe(
          res,
          HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleSubscriptionPreview })),
          Effect.map(({ data }) => data),
          Effect.catchTags({
            ParseError: Effect.die
          })
        )
      }),

      charge: Effect.fn(function* (args: {
        subscriptionId: string
        priceId: string
        quantity?: number | undefined
        effectiveFrom?: "immediately" | "next_billing_period" | undefined
      }): Effect.fn.Return<
        {
          readonly subscription: PaddleSubscription
          readonly price: PaddlePrice
        },
        HttpClientError.HttpClientError | SubscriptionNotFound | PriceNotFound,
        never
      > {
        const subscriptionOption = yield* client.get(`/subscriptions/${args.subscriptionId}`).pipe(
          Effect.flatMap(
            HttpClientResponse.matchStatus({
              200: (response) =>
                HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleSubscription }))(response),
              404: () => Effect.succeed({ data: null }),
              orElse: (response) => unexpectedStatus(response.request, response)
            })
          ),
          Effect.map(({ data }) => Option.fromNullable(data)),
          Effect.catchTags({
            ParseError: Effect.die
          })
        )

        const priceOption = yield* client.get(`/prices/${args.priceId}`).pipe(
          Effect.flatMap(
            HttpClientResponse.matchStatus({
              200: (response) => HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddlePrice }))(response),
              404: () => Effect.succeed({ data: null }),
              orElse: (response) => unexpectedStatus(response.request, response)
            })
          ),
          Effect.map(({ data }) => Option.fromNullable(data)),
          Effect.catchTags({
            ParseError: Effect.die
          })
        )

        yield* Option.match(subscriptionOption, {
          onNone: () =>
            Effect.fail(
              new SubscriptionNotFound({
                subscriptionId: args.subscriptionId
              })
            ),
          onSome: Effect.succeed
        })

        const price = yield* Option.match(priceOption, {
          onNone: () =>
            Effect.fail(
              new PriceNotFound({
                priceId: args.priceId
              })
            ),
          onSome: Effect.succeed
        })

        if (price.billing_cycle) {
          return yield* new PriceNotFound({
            priceId: args.priceId
          })
        }

        const effectiveFrom = args.effectiveFrom ?? "immediately"
        const res = yield* clientOK.post(`/subscriptions/${args.subscriptionId}/charge`, {
          body: HttpBody.unsafeJson({
            effective_from: effectiveFrom,
            items: [
              {
                price_id: args.priceId,
                quantity: args.quantity ?? 1
              }
            ]
          })
        })

        const subscription = yield* pipe(
          res,
          HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleSubscription })),
          Effect.map(({ data }) => data),
          Effect.catchTags({
            ParseError: Effect.die
          })
        )

        return {
          subscription,
          price
        } as const
      }),

      pause: Effect.fn(function* (
        args: PauseSubscriptionParams
      ): Effect.fn.Return<void, SubscriptionNotFound | ProviderOperationNotSupported, never> {
        if (args.mode !== "lifecycle") {
          return yield* new ProviderOperationNotSupported({
            provider: "paddle",
            operation: "subscriptions.pause",
            message: "Paddle only supports lifecycle pause; billing_collection pause is Stripe-specific"
          })
        }

        yield* client
          .post(`/subscriptions/${args.subscriptionId}/pause`, {
            body: HttpBody.unsafeJson({
              effective_from: args.effectiveFrom ?? "next_billing_period",
              resume_at: args.resumeAt ? parseDateTime(args.resumeAt, "resumeAt") : undefined,
              on_resume: args.resumePolicy
            })
          })
          .pipe(
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
            Effect.asVoid,
            Effect.catchTags({
              RequestError: Effect.die,
              ResponseError: Effect.die
            })
          )
      }),

      resume: Effect.fn(function* (
        args: ResumeSubscriptionParams
      ): Effect.fn.Return<void, SubscriptionNotFound | ProviderOperationNotSupported, never> {
        if (args.mode !== "lifecycle") {
          return yield* new ProviderOperationNotSupported({
            provider: "paddle",
            operation: "subscriptions.resume",
            message: "Paddle only supports lifecycle resume; billing_collection resume is Stripe-specific"
          })
        }

        if (args.billingCycleAnchor || args.prorationBehavior || args.prorationDate) {
          return yield* new ProviderOperationNotSupported({
            provider: "paddle",
            operation: "subscriptions.resume",
            message: "Paddle lifecycle resume does not support Stripe billingCycleAnchor or proration parameters"
          })
        }

        yield* client
          .post(`/subscriptions/${args.subscriptionId}/resume`, {
            body: HttpBody.unsafeJson({
              effective_from:
                args.effectiveFrom === "immediately"
                  ? "immediately"
                  : parseDateTime(args.effectiveFrom, "effectiveFrom"),
              on_resume: args.resumePolicy
            })
          })
          .pipe(
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
            Effect.asVoid,
            Effect.catchTags({
              RequestError: Effect.die,
              ResponseError: Effect.die
            })
          )
      })
    }

    const transactions = {
      list: Effect.fn(function* (args: {
        customerId?: string | undefined
        subscriptionId?: string | undefined
        include?: Array<string> | undefined
        status?: Array<string> | undefined
        after?: string | undefined
        perPage?: number | undefined
        orderBy?: string | undefined
      }): Effect.fn.Return<ReadonlyArray<PaddleTransaction>, HttpClientError.HttpClientError, never> {
        const res = yield* clientOK.get("/transactions", {
          urlParams: {
            customer_id: typeof args.customerId !== "undefined" ? [args.customerId] : undefined,
            subscription_id: typeof args.subscriptionId !== "undefined" ? [args.subscriptionId] : undefined,
            status: args.status,
            after: args.after,
            per_page: args.perPage,
            order_by: args.orderBy
          }
        })

        const result = yield* pipe(
          res,
          HttpClientResponse.schemaBodyJson(Schema.Struct({ data: Schema.Array(PaddleTransaction) })),
          Effect.map(({ data }) => data),
          Effect.catchTag("ParseError", Effect.die)
        )

        return result
      }),

      preview: Effect.fn(function* (args: {
        customerId?: string | undefined
        currencyCode?: string | undefined
        items: ReadonlyArray<{
          priceId: string
          quantity?: number | undefined
          includeInTotals?: boolean | undefined
        }>
      }): Effect.fn.Return<PaddleTransactionPreview, HttpClientError.HttpClientError | PriceNotFound, never> {
        for (const item of args.items) {
          const priceOption = yield* prices.get({ priceId: item.priceId })
          if (Option.isNone(priceOption)) {
            return yield* new PriceNotFound({
              priceId: item.priceId
            })
          }
        }

        const res = yield* clientOK.post("/transactions/preview", {
          body: HttpBody.unsafeJson({
            customer_id: args.customerId,
            currency_code: args.currencyCode,
            items: args.items.map((item) => ({
              price_id: item.priceId,
              quantity: item.quantity ?? 1,
              include_in_totals: item.includeInTotals
            }))
          })
        })

        return yield* pipe(
          res,
          HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleTransactionPreview })),
          Effect.map(({ data }) => data),
          Effect.catchTags({
            ParseError: Effect.die
          })
        )
      }),

      get: Effect.fn(function* (args: {
        transactionId: string
      }): Effect.fn.Return<Option.Option<PaddleTransaction>, HttpClientError.HttpClientError, never> {
        const res = yield* client.get(`/transactions/${args.transactionId}`)

        const result = yield* pipe(
          res,
          HttpClientResponse.matchStatus({
            200: (response) => HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleTransaction }))(response),
            404: (response) =>
              Effect.fail(
                new TransactionNotFound({
                  transactionId: response.request.url
                })
              ),
            orElse: (response) => unexpectedStatus(response.request, response)
          }),
          Effect.map(({ data }) => Option.fromNullable(data)),
          Effect.catchTags({
            ParseError: Effect.die,
            TransactionNotFound: () => Effect.succeed(Option.none<PaddleTransaction>())
          })
        )

        return result
      }),

      generateInvoicePDF: Effect.fn(function* (args: {
        transactionId: string
      }): Effect.fn.Return<string, HttpClientError.HttpClientError, never> {
        const res = yield* clientOK.get(`/transactions/${args.transactionId}/invoice`)

        const result = yield* pipe(
          res,
          HttpClientResponse.schemaBodyJson(Schema.Struct({ url: Schema.String })),
          Effect.map(({ url }) => url),
          Effect.catchTag("ParseError", Effect.die)
        )

        return result
      }),

      create: Effect.fn(function* (args: {
        customerId: string
        priceId: string
        quantity?: number | undefined
        collectionMode?: "automatic" | "manual" | undefined
        dueInDays?: number | undefined
        enableCheckout?: boolean | undefined
        purchaseOrderNumber?: string | undefined
        additionalInformation?: string | undefined
        checkoutUrl?: string | undefined
        customData?: Record<string, unknown> | undefined
      }): Effect.fn.Return<PaddleTransaction, HttpClientError.HttpClientError, never> {
        const collectionMode = args.collectionMode ?? "automatic"
        const res = yield* clientOK.post("/transactions", {
          body: HttpBody.unsafeJson({
            customer_id: args.customerId,
            collection_mode: collectionMode,
            items: [
              {
                price_id: args.priceId,
                quantity: args.quantity ?? 1
              }
            ],
            billing_details:
              collectionMode === "manual"
                ? {
                    enable_checkout: args.enableCheckout ?? false,
                    purchase_order_number: args.purchaseOrderNumber ?? "",
                    additional_information: args.additionalInformation ?? null,
                    payment_terms: {
                      interval: "day",
                      frequency: args.dueInDays ?? 30
                    }
                  }
                : undefined,
            checkout: args.checkoutUrl ? { url: args.checkoutUrl } : undefined,
            custom_data: args.customData
          })
        })

        const result = yield* pipe(
          res,
          HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleTransaction })),
          Effect.map(({ data }) => data),
          Effect.catchTag("ParseError", Effect.die)
        )

        return result
      }),

      refund: Effect.fn(function* (args: {
        transactionId: string
        amount?: string | undefined
      }): Effect.fn.Return<PaddleRefundResult, HttpClientError.HttpClientError | TransactionNotFound, never> {
        const transaction = yield* client.get(`/transactions/${args.transactionId}`).pipe(
          Effect.flatMap(
            HttpClientResponse.matchStatus({
              200: (response) =>
                HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleTransaction }))(response),
              404: () =>
                Effect.fail(
                  new TransactionNotFound({
                    transactionId: args.transactionId
                  })
                ),
              orElse: (response) => unexpectedStatus(response.request, response)
            })
          ),
          Effect.map(({ data }) => data),
          Effect.catchTags({
            ParseError: Effect.die
          })
        )

        const res = yield* clientOK.post("/adjustments", {
          body: HttpBody.unsafeJson({
            action: "refund",
            transaction_id: transaction.id,
            type: args.amount ? "partial" : "full",
            tax_mode: args.amount ? "internal" : undefined,
            items: args.amount ? buildPaddlePartialRefundItems(transaction, args.amount) : undefined,
            reason: "refund"
          })
        })

        const adjustment = yield* pipe(
          res,
          HttpClientResponse.schemaBodyJson(Schema.Struct({ data: PaddleAdjustment })),
          Effect.map(({ data }) => data),
          Effect.catchTags({
            ParseError: Effect.die
          })
        )

        return {
          ...formatPaddleRefund(adjustment)
        } as const
      })
    }

    const refunds = {
      get: Effect.fn(function* (args: {
        refundId: string
      }): Effect.fn.Return<Option.Option<PaddleRefundResult>, HttpClientError.HttpClientError, never> {
        const res = yield* clientOK.get("/adjustments", {
          urlParams: {
            id: [args.refundId]
          }
        })

        return yield* pipe(
          res,
          HttpClientResponse.schemaBodyJson(Schema.Struct({ data: Schema.Array(PaddleAdjustment) })),
          Effect.map(({ data }) => Option.fromNullable(data[0]).pipe(Option.map(formatPaddleRefund))),
          Effect.catchTag("ParseError", Effect.die)
        )
      }),

      list: Effect.fn(function* (args: {
        transactionId?: string | undefined
        after?: string | undefined
        perPage?: number | undefined
      }): Effect.fn.Return<ReadonlyArray<PaddleRefundResult>, HttpClientError.HttpClientError, never> {
        const res = yield* clientOK.get("/adjustments", {
          urlParams: {
            action: ["refund"],
            transaction_id: args.transactionId ? [args.transactionId] : undefined,
            after: args.after,
            per_page: args.perPage
          }
        })

        return yield* pipe(
          res,
          HttpClientResponse.schemaBodyJson(Schema.Struct({ data: Schema.Array(PaddleAdjustment) })),
          Effect.map(({ data }) => data.map(formatPaddleRefund)),
          Effect.catchTag("ParseError", Effect.die)
        )
      })
    }

    const billingPortal = {
      createSession: Effect.fn(function* (args: {
        customerId: string
        subscriptionId?: string | undefined
      }): Effect.fn.Return<PaddleCustomerPortalSession, HttpClientError.HttpClientError | CustomerNotFound, never> {
        return yield* customers.createPortalSession({
          customerId: args.customerId,
          subscriptionIds: args.subscriptionId ? [args.subscriptionId] : undefined
        })
      })
    }

    const webhooksUnmarshal = Effect.fn(function* (
      requestBody: string,
      secretKey: string,
      signature: string
    ): Effect.fn.Return<IEvents, WebhookUnmarshalError, never> {
      yield* Effect.tryPromise(() => new Webhooks().isValidSignature(requestBody, secretKey, signature)).pipe(
        Effect.filterOrFail(
          (isSignatureValid) => isSignatureValid,
          () => new WebhookUnmarshalError({ error: "Invalid signature" })
        ),
        Effect.mapError(
          (error) =>
            new WebhookUnmarshalError({
              error: "Invalid request body",
              cause: error
            })
        )
      )

      return Webhooks.fromJson(requestBody)
    })

    return {
      config,
      prices,
      products,
      customers,
      subscriptions,
      transactions,
      refunds,
      billingPortal,
      webhooksUnmarshal
    } as const
  })

export class PaddleClient extends Context.Tag("PaddleClient")<
  PaddleClient,
  Effect.Effect.Success<ReturnType<typeof makePaddleClient>>
>() {}

export class PaddleClientConfig extends Context.Tag("PaddleClientConfig")<PaddleClientConfig, PaddleConfig>() {}

export const PaddleConfigFromRecord = (config: PaddleConfig) => Layer.succeed(PaddleClientConfig, config)

export const PaddleClientLayer = Layer.effect(PaddleClient, Effect.flatMap(PaddleClientConfig, makePaddleClient))

interface ParsedHeaders {
  ts: number
  h1: string
}

class Webhooks {
  private static readonly MAX_VALID_TIME_DIFFERENCE = 5

  private extractHeader(header: string): ParsedHeaders {
    const parts = header.split(";")
    let ts = ""
    let h1 = ""
    for (const part of parts) {
      const [key, value] = part.split("=")
      if (value) {
        if (key === "ts") {
          ts = value
        } else if (key === "h1") {
          h1 = value
        }
      }
    }
    if (ts && h1) {
      return { ts: Number.parseInt(ts), h1 }
    }
    throw new Error("[Paddle] Invalid webhook signature")
  }

  private async computeHmac(payload: string, secret: string): Promise<string> {
    const byteHexMapping = Array.from({ length: 256 })
    for (let i = 0; i < byteHexMapping.length; i++) {
      byteHexMapping[i] = i.toString(16).padStart(2, "0")
    }
    const encoder = new TextEncoder()

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      {
        name: "HMAC",
        hash: { name: "SHA-256" }
      },
      false,
      ["sign"]
    )

    const signatureBuffer = await crypto.subtle.sign("hmac", key, encoder.encode(payload))

    // crypto.subtle returns the signature in base64 format. This must be
    // encoded in hex to match the CryptoProvider contract. We map each byte in
    // the buffer to its corresponding hex octet and then combine into a string.
    const signatureBytes = new Uint8Array(signatureBuffer)
    const signatureHexCodes = Array.from({ length: signatureBytes.length })

    for (let i = 0; i < signatureBytes.length; i++) {
      if (signatureBytes[i] !== undefined && signatureBytes[i] !== null) {
        signatureHexCodes[i] = byteHexMapping[signatureBytes[i]!]
      }
    }

    return signatureHexCodes.join("")
  }

  public async isValidSignature(requestBody: string, secretKey: string, signature: string): Promise<boolean> {
    const headers = this.extractHeader(signature)
    const payloadWithTime = `${headers.ts}:${requestBody}`

    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - headers.ts) > Webhooks.MAX_VALID_TIME_DIFFERENCE) {
      return false
    }

    const computedHash = await this.computeHmac(payloadWithTime, secretKey)
    return computedHash === headers.h1
  }

  public static fromJson(parsedRequest: string): IEvents {
    return JSON.parse(parsedRequest) as IEvents
  }
}

const toPaddleProrationBillingMode = (
  mode: ChangeSubscriptionProrationMode | undefined
): "prorated_immediately" | "do_not_bill" | "prorated_next_billing_period" => {
  switch (mode) {
    case "immediate":
      return "prorated_immediately" as const
    case "none":
      return "do_not_bill" as const
    case "next_billing_period":
    default:
      return "prorated_next_billing_period" as const
  }
}

const parseMinorUnitAmount = (value: string, field: string): number => {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new Error(`Invalid ${field}: expected a positive integer minor-unit string, received ${value}`)
  }

  return Number.parseInt(value, 10)
}

const buildPaddlePartialRefundItems = (
  transaction: PaddleTransaction,
  amount: string
): ReadonlyArray<PaddlePartialRefundItem> => {
  let remaining = parseMinorUnitAmount(amount, "amount")

  const items = transaction.details.line_items.flatMap((lineItem) => {
    if (remaining === 0) {
      return []
    }

    const lineTotal = parseMinorUnitAmount(lineItem.totals.total, `line item ${lineItem.id} total`)
    const refundAmount = Math.min(remaining, lineTotal)
    remaining -= refundAmount

    return refundAmount > 0
      ? [
          {
            item_id: lineItem.id,
            type: "partial" as const,
            amount: refundAmount.toString()
          }
        ]
      : []
  })

  if (remaining > 0 || items.length === 0) {
    throw new Error(`Refund amount exceeds refundable transaction amount: ${amount}`)
  }

  return items
}

const mapPaddleRefundStatus = (status: string): PaddleRefundResult["status"] => {
  switch (status) {
    case "approved":
      return "succeeded" as const
    case "rejected":
      return "failed" as const
    case "reversed":
      return "canceled" as const
    case "pending_approval":
    default:
      return "pending" as const
  }
}

const formatPaddleRefund = (adjustment: PaddleAdjustment): PaddleRefundResult => ({
  id: adjustment.id,
  transactionId: adjustment.transaction_id,
  amount: adjustment.totals.total,
  currencyCode: adjustment.currency_code,
  status: mapPaddleRefundStatus(adjustment.status),
  providerStatus: adjustment.status,
  createdAt: adjustment.created_at.toISOString(),
  updatedAt: adjustment.updated_at.toISOString()
})

const parseDateTime = (value: string, field: string): string => {
  const timestamp = Date.parse(value)
  if (Number.isNaN(timestamp)) {
    throw new Error(`Invalid ${field}: ${value}`)
  }

  return new Date(timestamp).toISOString()
}

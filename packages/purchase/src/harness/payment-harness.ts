import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Ref from "effect/Ref"

import type { PaymentProviderTag } from "../provider/types.ts"

import { PaymentProvider } from "../provider/client.ts"
import { makePaddleTestDriver } from "./paddle/paddle-driver.ts"
import {
  type CompleteProviderCheckoutInput,
  type PaymentTestBrowserOptions,
  type PaymentTestDriver,
  PaymentTestError,
  type ProviderSubscriptionSnapshot,
  type ProviderTransactionSnapshot,
  type SandboxCustomerInput,
  type SandboxPaymentMethod,
  type WaitForSubscriptionInput,
  type WaitForTransactionInput
} from "./types.ts"

export class PaymentHarness extends Context.Tag("@xstack/purchase/PaymentHarness")<
  PaymentHarness,
  {
    readonly provider: PaymentProviderTag

    readonly completeCheckout: (input: CompleteProviderCheckoutInput) => Effect.Effect<void, PaymentTestError>

    readonly payCheckout: (input: PayCheckoutInput) => Effect.Effect<ProviderPaymentResult, PaymentTestError>

    readonly waitForTransaction: (
      input: WaitForTransactionInput
    ) => Effect.Effect<ProviderTransactionSnapshot, PaymentTestError>

    readonly waitForSubscription: (
      input: WaitForSubscriptionInput
    ) => Effect.Effect<ProviderSubscriptionSnapshot, PaymentTestError>
  }
>() {
  static make = (
    input: {
      readonly browser?: PaymentTestBrowserOptions | undefined
      readonly cleanup?: PaymentHarnessCleanupOptions | false | undefined
    } = {}
  ) =>
    Layer.scoped(
      PaymentHarness,
      Effect.gen(function* () {
        const defaultBrowserOptions: Required<PaymentTestBrowserOptions> = {
          headless: false,
          userAgent: undefined
        }
        const browser = { ...defaultBrowserOptions, ...input.browser }

        const provider = yield* PaymentProvider
        const trackedPayments = yield* Ref.make<ReadonlyArray<TrackedPayment>>([])
        const cleanup =
          input.cleanup === false ? false : { cancelSubscriptions: true, refundTransactions: false, ...input.cleanup }

        const driver = provider.onDialect({
          paddle: () => makePaddleTestDriver({ provider, browser }),
          stripe: (_) => makeUnsupportedDriver(_._tag)
        })

        if (cleanup) {
          const cleanupPayments = Effect.fn(function* (
            provider: PaymentProvider.Methods,
            payments: ReadonlyArray<TrackedPayment>,
            options: Required<PaymentHarnessCleanupOptions>
          ) {
            if (options.cancelSubscriptions) {
              const emails = [
                ...new Set(
                  payments.map((payment) => payment.customer?.email).filter((email): email is string => !!email)
                )
              ]

              yield* Effect.forEach(
                emails,
                (email) =>
                  provider.customers.find({ email: email as never }).pipe(
                    Effect.flatMap(
                      Option.match({
                        onNone: () => Effect.void,
                        onSome: (customer) =>
                          provider.subscriptions.list({ customerProviderId: customer.id }).pipe(
                            Effect.flatMap((subscriptions) =>
                              Effect.forEach(
                                subscriptions.filter((subscription) =>
                                  ["active", "trialing", "past_due", "paused"].includes(subscription.status)
                                ),
                                (subscription) =>
                                  provider.subscriptions.cancel({
                                    subscriptionId: subscription.id,
                                    effectiveFrom: "immediately"
                                  }),
                                { concurrency: 2 }
                              )
                            )
                          )
                      })
                    ),
                    Effect.catchAllCause((cause) =>
                      Effect.logWarning("Failed to clean provider customer resources", { email, cause })
                    )
                  ),
                { concurrency: 2 }
              )
            }

            if (options.refundTransactions) {
              yield* Effect.forEach(
                payments.filter((payment) => ["paid", "completed"].includes(payment.transaction.status)),
                (payment) =>
                  provider.refunds.create({ transactionId: payment.transaction.id as never }).pipe(
                    Effect.catchAllCause((cause) =>
                      Effect.logWarning("Failed to refund payment harness transaction", {
                        transactionId: payment.transaction.id,
                        cause
                      })
                    )
                  ),
                { concurrency: 2 }
              )
            }
          })

          yield* Effect.addFinalizer(() =>
            Effect.gen(function* () {
              const payments = yield* Ref.get(trackedPayments)

              yield* cleanupPayments(provider, payments, cleanup)
            }).pipe(
              Effect.catchAllCause((cause) =>
                Effect.logWarning("Failed to clean payment harness resources", { provider: provider._tag, cause })
              )
            )
          )
        }

        const payCheckout = Effect.fn(function* (
          args: PayCheckoutInput
        ): Effect.fn.Return<ProviderPaymentResult, PaymentTestError> {
          if (args.checkout.provider && args.checkout.provider !== driver.provider) {
            return yield* new PaymentTestError({
              message: `Checkout provider "${args.checkout.provider}" does not match harness provider "${driver.provider}"`
            })
          }

          const checkoutUrl = args.checkout.url
          if (!checkoutUrl) {
            return yield* new PaymentTestError({ message: "Checkout did not include a URL" })
          }

          yield* driver.completeCheckout({
            checkoutUrl,
            mode: args.mode,
            customer: args.customer,
            paymentMethod: args.paymentMethod
          })

          const transaction = yield* driver.waitForTransaction({ transactionId: args.checkout.sessionId })

          yield* Ref.update(trackedPayments, (payments) => [
            ...payments,
            {
              mode: args.mode,
              customer: args.customer,
              transaction
            }
          ])

          return {
            provider: driver.provider,
            transaction
          }
        })

        return {
          provider: driver.provider,
          completeCheckout: driver.completeCheckout,
          waitForTransaction: driver.waitForTransaction,
          waitForSubscription: driver.waitForSubscription,
          payCheckout
        }
      })
    )
}

export interface PayCheckoutInput {
  readonly checkout: {
    readonly provider?: PaymentProviderTag | undefined
    readonly sessionId: string
    readonly url?: string | undefined
  }
  readonly mode: "subscription" | "one_time" | "payment"
  readonly customer?: SandboxCustomerInput | undefined
  readonly paymentMethod?: SandboxPaymentMethod | undefined
}

export interface ProviderPaymentResult {
  readonly provider: PaymentProviderTag
  readonly transaction: ProviderTransactionSnapshot
}

export interface PaymentHarnessCleanupOptions {
  readonly cancelSubscriptions?: boolean | undefined
  readonly refundTransactions?: boolean | undefined
}

interface TrackedPayment {
  readonly mode: PayCheckoutInput["mode"]
  readonly customer: SandboxCustomerInput | undefined
  readonly transaction: ProviderTransactionSnapshot
}

const makeUnsupportedDriver = (provider: PaymentProviderTag): PaymentTestDriver => ({
  provider,
  completeCheckout: () => Effect.fail(unsupportedProvider(provider, "checkout automation")),
  waitForTransaction: () => Effect.fail(unsupportedProvider(provider, "transaction polling")),
  waitForSubscription: () => Effect.fail(unsupportedProvider(provider, "subscription polling"))
})

const unsupportedProvider = (provider: PaymentProviderTag, operation: string) =>
  new PaymentTestError({ message: `Payment test provider "${provider}" does not support ${operation} yet` })

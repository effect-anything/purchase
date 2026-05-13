import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import type { PaymentProviderTag } from "../provider/types.ts"

import { PaymentClient } from "../provider/client.ts"
import { makePaddleTestDriver } from "./provider-drivers/paddle-driver.ts"
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

export interface PayCheckoutInput {
  readonly checkout: {
    readonly provider?: PaymentProviderTag | undefined
    readonly sessionId: string
    readonly url?: string | undefined
  }
  readonly checkoutUrl?: string | undefined
  readonly mode: "subscription" | "one_time" | "payment"
  readonly customer?: SandboxCustomerInput | undefined
  readonly paymentMethod?: SandboxPaymentMethod | undefined
}

export interface ProviderPaymentResult {
  readonly provider: PaymentProviderTag
  readonly transaction: ProviderTransactionSnapshot
}

export class PaymentHarness extends Context.Tag("PaymentHarness")<
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
  static make = (input: { readonly browser?: PaymentTestBrowserOptions | undefined }) =>
    Layer.effect(
      PaymentHarness,
      Effect.gen(function* () {
        const defaultBrowserOptions: Required<PaymentTestBrowserOptions> = {
          headless: true,
          userAgent: "PurchaseSDK-Test/1.0"
        }
        const browser = { ...defaultBrowserOptions, ...input.browser }

        const provider = yield* PaymentClient
        const driver = provider.onDialect({
          paddle: () => makePaddleTestDriver({ provider, browser }),
          stripe: (_) => makeUnsupportedDriver(_._tag)
        })

        const payCheckout = Effect.fn(function* (
          args: PayCheckoutInput
        ): Effect.fn.Return<ProviderPaymentResult, PaymentTestError> {
          if (args.checkout.provider && args.checkout.provider !== driver.provider) {
            return yield* new PaymentTestError({
              message: `Checkout provider "${args.checkout.provider}" does not match harness provider "${driver.provider}"`
            })
          }

          const checkoutUrl = args.checkoutUrl ?? args.checkout.url
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

const makeUnsupportedDriver = (provider: PaymentProviderTag): PaymentTestDriver => ({
  provider,
  completeCheckout: () => Effect.fail(unsupportedProvider(provider, "checkout automation")),
  waitForTransaction: () => Effect.fail(unsupportedProvider(provider, "transaction polling")),
  waitForSubscription: () => Effect.fail(unsupportedProvider(provider, "subscription polling"))
})

const unsupportedProvider = (provider: PaymentProviderTag, operation: string) =>
  new PaymentTestError({ message: `Payment test provider "${provider}" does not support ${operation} yet` })

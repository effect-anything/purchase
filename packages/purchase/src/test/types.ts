import type * as Duration from "effect/Duration"
import type * as Effect from "effect/Effect"

import * as Data from "effect/Data"

import type { PaymentProviderTag } from "../provider.ts"

export interface SandboxPaymentMethod {
  readonly cardNumber?: string | undefined
  readonly expiry?: string | undefined
  readonly cvv?: string | undefined
  readonly cardholderName?: string | undefined
}

export interface CompleteProviderCheckoutInput {
  readonly checkoutUrl: string
  readonly mode: "subscription" | "one_time" | "payment"
  readonly customer?: SandboxCustomerInput | undefined
  readonly paymentMethod?: SandboxPaymentMethod | undefined
}

export interface PaymentTestBrowserOptions {
  readonly headless?: boolean | undefined
  readonly userAgent?: string | undefined
}

export interface SandboxCustomerInput {
  readonly email?: string | undefined
  readonly name?: string | undefined
  readonly country?: string | undefined
  readonly postcode?: string | undefined
}

export interface WaitForTransactionInput {
  readonly transactionId: string
  readonly expected?: ReadonlyArray<string> | undefined
  readonly timeout?: Duration.DurationInput | undefined
  readonly interval?: Duration.DurationInput | undefined
}

export interface WaitForSubscriptionInput {
  readonly customerProviderId: string
  readonly subscriptionId: string
  readonly expected?: ReadonlyArray<string> | undefined
  readonly timeout?: Duration.DurationInput | undefined
  readonly interval?: Duration.DurationInput | undefined
}

export interface ProviderTransactionSnapshot {
  readonly id: string
  readonly status: string
}

export interface ProviderSubscriptionSnapshot {
  readonly id: string
  readonly status: string
}

export class PaymentTestError extends Data.TaggedError("PaymentTestError")<{
  readonly message: string
  readonly cause?: unknown
}> {}

export interface PaymentTestDriver {
  readonly provider: PaymentProviderTag
  readonly completeCheckout: (input: CompleteProviderCheckoutInput) => Effect.Effect<void, PaymentTestError>
  readonly waitForTransaction: (
    input: WaitForTransactionInput
  ) => Effect.Effect<ProviderTransactionSnapshot, PaymentTestError>
  readonly waitForSubscription: (
    input: WaitForSubscriptionInput
  ) => Effect.Effect<ProviderSubscriptionSnapshot, PaymentTestError>
}

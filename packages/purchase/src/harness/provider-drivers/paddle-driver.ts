import { Playwright } from "effect-playwright"
import * as Effect from "effect/Effect"
import { chromium } from "playwright-core"

import type { PaymentClient } from "../../provider/client.ts"

import {
  type CompleteProviderCheckoutInput,
  type PaymentTestBrowserOptions,
  type PaymentTestDriver,
  type ProviderSubscriptionSnapshot,
  type ProviderTransactionSnapshot,
  type WaitForSubscriptionInput,
  type WaitForTransactionInput,
  PaymentTestError
} from "../types.ts"
import { optionOrPaymentTestError, waitUntil } from "../utils.ts"

export const makePaddleTestDriver = (input: {
  readonly provider: PaymentClient.Methods
  readonly browser?: Required<PaymentTestBrowserOptions> | undefined
}): PaymentTestDriver => {
  const completeCheckout = Effect.fn(
    function* (args: CompleteProviderCheckoutInput) {
      const playwright = yield* Playwright
      const browser = yield* playwright.launchScoped(chromium, { headless: input.browser?.headless ?? true })
      const context = yield* browser.newContext({ userAgent: input.browser?.userAgent ?? "PurchaseSDK-E2E/1.0" })
      const page = yield* context.newPage

      yield* page.goto(args.checkoutUrl, { waitUntil: "domcontentloaded", timeout: 60_000 })
      yield* page.waitForTimeout(10_000)

      const paddleFrame = yield* page.frames.pipe(
        Effect.map((frames) => frames.find((frame) => frame.name() === "paddle_frame")),
        Effect.flatMap((frame) =>
          frame
            ? Effect.succeed(frame)
            : Effect.fail(new PaymentTestError({ message: "Paddle checkout iframe was not rendered" }))
        )
      )

      const country = paddleFrame.locator('select[name="countryCode"]')
      if ((yield* country.count) > 0) {
        const countryCode = args.customer?.country ?? "US"
        yield* country.evaluate((element: SVGElement | HTMLElement, value) => {
          const select = element as HTMLSelectElement
          select.value = value
          select.dispatchEvent(new Event("input", { bubbles: true }))
          select.dispatchEvent(new Event("change", { bubbles: true }))
        }, countryCode)
      }

      const postcode = paddleFrame.locator('input[name="postcode"]')
      if ((yield* postcode.count) > 0) {
        yield* postcode.fill(args.customer?.postcode ?? "10001")
      }

      const continueButton = paddleFrame.getByRole("button", { name: /Continue/i })
      if ((yield* continueButton.count) > 0) {
        yield* continueButton.click()
      }
      yield* page.waitForTimeout(10_000)

      const paymentFrame = yield* page.frames.pipe(
        Effect.map((frames) => frames.find((frame) => frame.name() === "paddle_frame")),
        Effect.flatMap((frame) =>
          frame
            ? Effect.succeed(frame)
            : Effect.fail(new PaymentTestError({ message: "Paddle checkout iframe disappeared" }))
        )
      )

      const cardNumber = paymentFrame.locator('input[name="cardNumber"]')
      if ((yield* cardNumber.count) === 0) {
        const text = yield* paymentFrame.locator("body").innerText({ timeout: 5_000 })
        return yield* new PaymentTestError({ message: `Paddle card fields were not visible: ${text.slice(0, 500)}` })
      }

      yield* cardNumber.fill(args.paymentMethod?.cardNumber ?? "4242424242424242")
      yield* paymentFrame
        .locator('input[name="cardHolder"]')
        .fill(args.paymentMethod?.cardholderName ?? args.customer?.name ?? "Purchase SDK E2E User")
      yield* paymentFrame.locator('input[name="expiry"]').fill(args.paymentMethod?.expiry ?? "12/30")
      yield* paymentFrame.locator('input[name="cvv"]').fill(args.paymentMethod?.cvv ?? "100")
      yield* page.waitForTimeout(1_000)
      yield* paymentFrame.getByRole("button", { name: /Subscribe now|Pay now|Complete purchase/i }).click()
    },
    Effect.provide(Playwright.layer),
    Effect.scoped,
    Effect.mapError((cause) =>
      cause._tag === "PaymentTestError"
        ? cause
        : new PaymentTestError({ message: "Paddle checkout automation failed", cause })
    )
  )

  const waitForTransaction = (args: WaitForTransactionInput) =>
    waitUntil({
      poll: input.provider.transactions.get({ transactionId: args.transactionId as never }).pipe(
        Effect.flatMap((transaction) =>
          optionOrPaymentTestError(transaction, `Paddle transaction "${args.transactionId}" was not found`)
        ),
        Effect.map(
          (transaction): ProviderTransactionSnapshot => ({
            id: transaction.id,
            status: transaction.status
          })
        ),
        Effect.mapError((cause) =>
          cause instanceof PaymentTestError
            ? cause
            : new PaymentTestError({ message: "Failed to read Paddle transaction", cause })
        )
      ),
      isDone: (transaction) => (args.expected ?? ["paid", "completed"]).includes(transaction.status),
      timeout: args.timeout,
      interval: args.interval,
      timeoutMessage: `Paddle transaction "${args.transactionId}" did not reach an expected status`
    })

  const waitForSubscription = (args: WaitForSubscriptionInput) =>
    waitUntil({
      poll: input.provider.subscriptions
        .get({ customerProviderId: args.customerProviderId as never, subscriptionId: args.subscriptionId as never })
        .pipe(
          Effect.flatMap((subscription) =>
            optionOrPaymentTestError(subscription, `Paddle subscription "${args.subscriptionId}" was not found`)
          ),
          Effect.map(
            (subscription): ProviderSubscriptionSnapshot => ({
              id: subscription.id,
              status: subscription.status
            })
          ),
          Effect.mapError((cause) =>
            cause instanceof PaymentTestError
              ? cause
              : new PaymentTestError({ message: "Failed to read Paddle subscription", cause })
          )
        ),
      isDone: (subscription) => (args.expected ?? ["active", "trialing"]).includes(subscription.status),
      timeout: args.timeout,
      interval: args.interval,
      timeoutMessage: `Paddle subscription "${args.subscriptionId}" did not reach an expected status`
    })

  return {
    provider: "paddle",
    completeCheckout,
    waitForTransaction,
    waitForSubscription
  }
}

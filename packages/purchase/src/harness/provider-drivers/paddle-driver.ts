import { Playwright } from "effect-playwright"
import * as Effect from "effect/Effect"
import { chromium, type Frame, type Locator, type Page } from "playwright-core"

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
      const context = yield* browser.newContext(input.browser?.userAgent ? { userAgent: input.browser.userAgent } : {})
      const page = yield* context.newPage

      yield* page.use((nativePage) => gotoWithRetry(nativePage, args.checkoutUrl))
      yield* page.use((nativePage) => continuePastNgrokWarning(nativePage))
      const iframeReady = yield* page
        .use((nativePage) => nativePage.locator('iframe[name="paddle_frame"]').first().waitFor({ timeout: 30_000 }))
        .pipe(Effect.either)
      if (iframeReady._tag === "Left") {
        yield* page.use((nativePage) => continuePastNgrokWarning(nativePage))
      }
      yield* page.waitForTimeout(5_000)

      const checkoutScope: Pick<typeof page, "locator" | "getByRole" | "getByLabel" | "getByText"> =
        (yield* page.locator('iframe[name="paddle_frame"]').count) > 0
          ? page.locator('iframe[name="paddle_frame"]').first().contentFrame()
          : page

      const email =
        (yield* checkoutScope.locator('input[name="email"]').count) > 0
          ? checkoutScope.locator('input[name="email"]')
          : checkoutScope.getByLabel(/Email address/i)
      if ((yield* email.count) > 0) {
        yield* email.fill(args.customer?.email ?? `purchase-sdk-e2e-${Date.now()}@example.com`)
      }

      const country = checkoutScope.locator('select[name="countryCode"]')
      if ((yield* country.count) > 0) {
        const countryCode = args.customer?.country ?? "US"
        yield* country.selectOption(countryCode)
      } else {
        const countryCode = args.customer?.country ?? "US"
        const countryName = countryNameForCode(countryCode)
        const countryInput = checkoutScope.locator('input[name="countryCode"]')
        if ((yield* countryInput.count) > 0) {
          yield* countryInput.fill(countryCode).pipe(Effect.either)
        }
        const countryLabel = checkoutScope.getByLabel(/Country/i)
        if ((yield* countryLabel.count) > 0) {
          yield* countryLabel.click({ force: true }).pipe(Effect.either)
          yield* countryLabel.fill(countryName).pipe(Effect.either)
        }
        const countryPicker = checkoutScope.getByRole("combobox", { name: /Country/i })
        if ((yield* countryPicker.count) > 0) {
          yield* countryPicker.click({ force: true })
        }
        const selectCountry = checkoutScope.getByText(/Select a country/i)
        if ((yield* selectCountry.count) > 0) {
          const opened = yield* selectCountry
            .first()
            .evaluate((element: SVGElement | HTMLElement) => {
              ;(element as HTMLElement).click()
            })
            .pipe(Effect.either)
          if (opened._tag === "Right") {
            for (let index = 0; index < countryKeyboardOffset(countryCode); index++) {
              yield* page.keyboard.press("ArrowDown").pipe(Effect.either)
            }
            yield* page.keyboard.press("Enter").pipe(Effect.either)
          }
        }
        const countryOption = checkoutScope.getByText(new RegExp(`^${escapeRegExp(countryName)}$`, "i"))
        if ((yield* countryOption.count) > 0) {
          yield* countryOption
            .first()
            .evaluate((element: SVGElement | HTMLElement) => {
              ;(element as HTMLElement).click()
            })
            .pipe(Effect.either)
        }
        const countryRoleOption = checkoutScope.getByRole("option", { name: new RegExp(countryName, "i") })
        if ((yield* countryRoleOption.count) > 0) {
          yield* countryRoleOption
            .first()
            .evaluate((element: SVGElement | HTMLElement) => {
              ;(element as HTMLElement).click()
            })
            .pipe(Effect.either)
        }
        if ((yield* checkoutScope.getByText(/Select a country/i).count) > 0) {
          yield* page.keyboard.press("Escape").pipe(Effect.either)
          yield* page.keyboard.press("Tab").pipe(Effect.either)
          yield* page.keyboard.press("Tab").pipe(Effect.either)
          yield* page.keyboard.type(countryName).pipe(Effect.either)
          yield* page.keyboard.press("Enter").pipe(Effect.either)
        }
      }

      const postcode = checkoutScope.locator('input[name="postcode"]')
      if ((yield* postcode.count) > 0) {
        yield* postcode.fill(args.customer?.postcode ?? "10001")
      }

      const continueButton = checkoutScope.getByRole("button", { name: /Continue/i })
      if ((yield* continueButton.count) > 0) {
        yield* continueButton.click({ force: true })
      }
      yield* page.waitForTimeout(10_000)

      const paymentScope: Pick<typeof page, "locator" | "getByRole" | "getByLabel" | "getByText"> =
        (yield* page.locator('iframe[name="paddle_frame"]').count) > 0
          ? page.locator('iframe[name="paddle_frame"]').first().contentFrame()
          : page

      const cardResult = yield* page.use((nativePage) =>
        fillPaddleCardForm(nativePage, {
          cardNumber: args.paymentMethod?.cardNumber ?? "4000056655665556",
          cardholderName: args.paymentMethod?.cardholderName ?? args.customer?.name ?? "Purchase SDK E2E User",
          cvv: args.paymentMethod?.cvv ?? "100",
          expiry: args.paymentMethod?.expiry ?? "12/30"
        })
      )
      if (cardResult._tag === "Failure") {
        const text = yield* paymentScope.locator("body").innerText({ timeout: 5_000 }).pipe(Effect.either)
        return yield* new PaymentTestError({
          message: `Paddle card fields could not be filled: ${cardResult.message}\n${text._tag === "Right" ? text.right.slice(0, 500) : ""}`
        })
      }
      yield* page.waitForTimeout(1_000)
      const submitButton = paymentScope.getByRole("button", {
        name: /Subscribe now|Pay now|Complete purchase|Start subscription|Add payment method/i
      })
      if ((yield* submitButton.count) === 0) {
        const text = yield* paymentScope.locator("body").innerText({ timeout: 5_000 })
        return yield* new PaymentTestError({ message: `Paddle submit button was not visible: ${text.slice(0, 500)}` })
      }
      yield* page
        .use(async (nativePage) => {
          await submitPaddleCardPayment(nativePage)
          await nativePage
            .waitForFunction(
              () => /success|complete|thank you|paid|processing|redirecting/i.test(document.body.innerText),
              undefined,
              { timeout: 20_000 }
            )
            .catch(() => undefined)
        })
        .pipe(
          Effect.mapError(
            (cause) => new PaymentTestError({ message: "Paddle submit button could not be clicked", cause })
          )
        )
      const checkoutText = yield* paymentScope.locator("body").innerText({ timeout: 5_000 }).pipe(Effect.either)
      if (
        checkoutText._tag === "Right" &&
        /Email address|Country|Card number|CVV|CVC|Select a country/i.test(checkoutText.right)
      ) {
        const diagnostics = yield* page.use((nativePage) => paddleCheckoutDiagnostics(nativePage))
        return yield* new PaymentTestError({
          message: `Paddle checkout remained on the payment form after submit: ${checkoutText.right.slice(0, 700)}\n${diagnostics}`
        })
      }
    },
    Effect.provide(Playwright.layer),
    Effect.scoped,
    Effect.mapError((cause) =>
      cause instanceof PaymentTestError
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

const countryNameForCode = (countryCode: string) =>
  countryCode === "US" ? "United States" : countryCode === "AU" ? "Australia" : countryCode

const countryKeyboardOffset = (countryCode: string) => (countryCode === "AU" ? 12 : 1)

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

type PaddleCardInput = {
  readonly cardNumber: string
  readonly cardholderName: string
  readonly expiry: string
  readonly cvv: string
}

type PaddleCardFillResult = { readonly _tag: "Success" } | { readonly _tag: "Failure"; readonly message: string }

const fillPaddleCardForm = async (page: Page, input: PaddleCardInput): Promise<PaddleCardFillResult> => {
  const cardNumber = await findVisibleField(page, [
    'input[name="cardNumber"]',
    'input[autocomplete="cc-number"]',
    'input[aria-label*="Card number" i]',
    'input[placeholder*="Card number" i]',
    '[contenteditable="true"][aria-label*="Card number" i]',
    'input[name*="number" i]'
  ])
  if (!cardNumber) {
    return { _tag: "Failure", message: await paddleCheckoutDiagnostics(page) }
  }

  await typeIntoField(cardNumber, input.cardNumber)
  await fillOptionalField(
    page,
    [
      'input[name="cardHolder"]',
      'input[name="cardholderName"]',
      'input[autocomplete="cc-name"]',
      'input[aria-label*="Name on card" i]',
      'input[placeholder*="Name on card" i]',
      'input[name*="name" i]'
    ],
    input.cardholderName
  )
  await fillOptionalField(
    page,
    [
      'input[name="expiry"]',
      'input[autocomplete="cc-exp"]',
      'input[aria-label*="Expiration" i]',
      'input[aria-label*="Expiry" i]',
      'input[placeholder*="MM" i]',
      'input[name*="exp" i]'
    ],
    input.expiry
  )
  await fillOptionalField(
    page,
    [
      'input[name="cvv"]',
      'input[name="cvc"]',
      'input[autocomplete="cc-csc"]',
      'input[aria-label*="Security code" i]',
      'input[aria-label*="CVV" i]',
      'input[aria-label*="CVC" i]',
      'input[placeholder*="CVV" i]',
      'input[placeholder*="CVC" i]',
      'input[name*="cv" i]'
    ],
    input.cvv
  )

  return { _tag: "Success" }
}

const gotoWithRetry = async (page: Page, url: string) => {
  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 })
      return
    } catch (cause) {
      lastError = cause
      await page.waitForTimeout(2_000 * (attempt + 1))
    }
  }
  throw lastError
}

const continuePastNgrokWarning = async (page: Page) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    const warningVisible = await page
      .getByText(/served for free through ngrok\.com/i)
      .isVisible({ timeout: 2_000 })
      .catch(() => false)
    if (!warningVisible) {
      return
    }

    const visitSite = page
      .locator("button")
      .filter({ hasText: /^Visit Site$/i })
      .first()
    if (await visitSite.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await visitSite.evaluate((element: SVGElement | HTMLElement) => {
        ;(element as HTMLElement).click()
      })
      await page.waitForLoadState("domcontentloaded", { timeout: 30_000 }).catch(() => undefined)
      await page.waitForTimeout(1_000)
    }
  }
}

const fillOptionalField = async (page: Page, selectors: ReadonlyArray<string>, value: string) => {
  const field = await findVisibleField(page, selectors)
  if (field) {
    await typeIntoField(field, value)
  } else {
    await page.keyboard.press("Tab")
    await page.keyboard.type(value, { delay: 20 })
  }
}

const submitPaddleCardPayment = async (page: Page) => {
  const selectors = ['[data-testid="cardPaymentFormSubmitButton"]', 'button[type="submit"]', "button"]
  for (const frame of page.frames()) {
    for (const selector of selectors) {
      const buttons = frame
        .locator(selector)
        .filter({ hasText: /Subscribe now|Pay now|Complete purchase|Start subscription|Add payment method/i })
      const count = await buttons.count().catch(() => 0)
      for (let index = count - 1; index >= 0; index--) {
        const button = buttons.nth(index)
        if (!(await button.isVisible().catch(() => false))) {
          continue
        }
        await button.focus()
        await page.keyboard.press("Enter")
        await page.waitForTimeout(2_000)
        return
      }
    }
  }
  throw new Error(await paddleCheckoutDiagnostics(page))
}

const typeIntoField = async (field: Locator, value: string) => {
  await field.click({ force: true, timeout: 10_000 })
  await field.fill("", { timeout: 5_000 }).catch(() => undefined)
  await field.pressSequentially(value, { delay: 20, timeout: 10_000 }).catch(async () => {
    await field.page().keyboard.type(value, { delay: 20 })
  })
}

const findVisibleField = async (page: Page, selectors: ReadonlyArray<string>): Promise<Locator | undefined> => {
  for (const frame of page.frames()) {
    const field = await findVisibleFieldInFrame(frame, selectors)
    if (field) {
      return field
    }
  }
}

const findVisibleFieldInFrame = async (
  frame: Frame,
  selectors: ReadonlyArray<string>
): Promise<Locator | undefined> => {
  for (const selector of selectors) {
    const locator = frame.locator(selector)
    const count = await locator.count().catch(() => 0)
    for (let index = 0; index < count; index++) {
      const field = locator.nth(index)
      if (await field.isVisible().catch(() => false)) {
        return field
      }
    }
  }
}

const paddleCheckoutDiagnostics = async (page: Page) => {
  const frames = await Promise.all(
    page.frames().map(async (frame, index) => {
      const inputs = await frame
        .locator("input, textarea, [contenteditable='true']")
        .evaluateAll((elements) =>
          elements.slice(0, 12).map((element) => ({
            ariaLabel: element.getAttribute("aria-label"),
            autocomplete: element.getAttribute("autocomplete"),
            disabled: element.hasAttribute("disabled"),
            name: element.getAttribute("name"),
            placeholder: element.getAttribute("placeholder"),
            tagName: element.tagName,
            valueLength:
              element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
                ? element.value.length
                : (element.textContent?.length ?? 0)
          }))
        )
        .catch((cause) => [{ error: String(cause) }])
      const buttons = await frame
        .locator("button")
        .evaluateAll((elements) =>
          elements.slice(0, 8).map((element) => ({
            disabled: element.hasAttribute("disabled"),
            text: element.textContent?.trim() ?? ""
          }))
        )
        .catch((cause) => [`button-error:${String(cause)}`])

      return {
        buttons,
        index,
        inputs,
        name: frame.name(),
        url: frame.url()
      }
    })
  )
  return JSON.stringify(frames, undefined, 2).slice(0, 2_000)
}

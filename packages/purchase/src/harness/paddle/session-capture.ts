import { Playwright } from "effect-playwright"
import * as Effect from "effect/Effect"
import { chromium, type Page } from "playwright-core"

import type { PaymentEnvironmentTag } from "../../provider/types.ts"

import { paddleVendorUrl, writePaddleVendorCaptureSession } from "../../paddle/internal/paddle-vendor-prepare.ts"
import { PaddleVendorSessionState } from "../../paddle/internal/paddle-vendor-schema.ts"

export const captureVendorSession = Effect.fn(
  function* (input: {
    readonly environment: PaymentEnvironmentTag
    readonly headless?: boolean | undefined
    readonly timeoutMs?: number | undefined
    readonly credentials?:
      | {
          readonly email: string
          readonly password: string
        }
      | undefined
    readonly outputPath: string
  }) {
    const playwright = yield* Playwright
    const browser = yield* playwright.launchScoped(chromium, { headless: input.headless ?? false })
    const context = yield* browser.newContext({
      userAgent: "PurchaseSDK-PaddleVendorSession/1.0"
    })
    const page = yield* context.newPage
    const vendorUrl = paddleVendorUrl(input.environment)
    const timeoutMs = input.timeoutMs ?? 300_000

    yield* page.goto(`${vendorUrl}/checkout-settings`, { waitUntil: "domcontentloaded", timeout: 60_000 })
    const credentials = input.credentials
    if (credentials) {
      yield* page.use((nativePage) => signInToPaddleVendor(nativePage, credentials, timeoutMs))
    }

    yield* page.waitForURL(/\/checkout-settings/, { timeout: timeoutMs })

    const cookies = yield* context.cookies()

    const cookieHeader = buildCookieHeader(cookies)
    const xsrfToken = readCookieValue(cookies, "XSRF-TOKEN")

    if (!cookieHeader) {
      return yield* Effect.dieMessage(
        "Paddle vendor login completed but no cookies were available to build a session header."
      )
    }
    if (!xsrfToken) {
      return yield* Effect.dieMessage("Paddle vendor login completed but XSRF-TOKEN cookie was not found.")
    }

    const session = PaddleVendorSessionState.make({
      environment: input.environment,
      vendorUrl,
      cookieHeader,
      xsrfToken,
      capturedAt: new Date(),
      cookies
    })

    writePaddleVendorCaptureSession(session, input.outputPath)
  },
  Effect.provide(Playwright.layer),
  Effect.scoped
)

async function signInToPaddleVendor(
  page: Page,
  credentials: {
    readonly email: string
    readonly password: string
  },
  timeoutMs: number
) {
  const email = page.locator('input[type="email"], input[name="email"], input[autocomplete="email"]').first()
  if (!(await email.isVisible({ timeout: 5_000 }).catch(() => false))) return

  await email.fill(credentials.email)

  const password = page
    .locator('input[type="password"], input[name="password"], input[autocomplete="current-password"]')
    .first()
  if (!(await password.isVisible({ timeout: 1_000 }).catch(() => false))) {
    await clickSubmitButton(page, /continue|next|log in|sign in/i)
  }

  await password.waitFor({ state: "visible", timeout: 60_000 })
  await password.fill(credentials.password)
  await clickSubmitButton(page, /log in|sign in|continue/i)
  await page.waitForURL(/\/checkout-settings/, { timeout: timeoutMs }).catch(() => undefined)
}

async function clickSubmitButton(page: Page, name: RegExp) {
  const button = page.getByRole("button", { name }).first()
  if ((await button.count()) > 0 && (await button.isVisible().catch(() => false))) {
    await button.click()
    return
  }

  await page.keyboard.press("Enter")
}

const buildCookieHeader = (cookies: ReadonlyArray<{ name: string; value: string }>) =>
  cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ")

const readCookieValue = (cookies: ReadonlyArray<{ name: string; value: string }>, name: string) =>
  cookies.find((cookie) => cookie.name === name)?.value

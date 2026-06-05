import type * as Scope from "effect/Scope"

import * as FileSystem from "@effect/platform/FileSystem"
import { Playwright, type PlaywrightError } from "effect-playwright"
import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import path from "node:path"
import { chromium, type Page } from "playwright-core"

import type { PaymentEnvironmentTag } from "../../provider/types.ts"

import { PaddleVendorSessionState } from "./paddle-vendor-schema.ts"

const resolveDefaultVendorSessionPath = (environment: PaymentEnvironmentTag) =>
  path.resolve(process.cwd(), ".purchase", `paddle-vendor-${environment}-session.json`)

export const paddleVendorUrl = (environment: PaymentEnvironmentTag) =>
  environment === "production" ? "https://vendors.paddle.com" : "https://sandbox-vendors.paddle.com"

export interface PaddleVendorCaptureConfig {
  readonly environment: "sandbox" | "production"
  readonly headless: boolean
  readonly outputPath: string
  readonly credentials: {
    readonly email: string
    readonly password: string
  }
}

export class PaddleVendorSession extends Context.Tag("PaddleVendorSession")<
  PaddleVendorSession,
  {
    readonly load: (environment: PaymentEnvironmentTag) => Effect.Effect<Option.Option<PaddleVendorSessionState>>
    readonly write: (session: PaddleVendorSessionState, outputPath: string) => Effect.Effect<void>
    readonly capture: (
      environment: PaymentEnvironmentTag,
      options?:
        | {
            timeout?: number | undefined
            headless?: boolean | undefined
          }
        | undefined
    ) => Effect.Effect<void, PlaywrightError, Scope.Scope>
    readonly ensure: (
      environment: PaymentEnvironmentTag,
      options?:
        | {
            timeout?: number | undefined
            headless?: boolean | undefined
            force?: boolean | undefined
          }
        | undefined
    ) => Effect.Effect<void, never, Scope.Scope>
  }
>() {
  static Default = Layer.effect(
    PaddleVendorSession,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const playwright = yield* Playwright

      const load = Effect.fn("Paddle.vendorSession.load")(
        function* (environment: PaymentEnvironmentTag) {
          const filePath = resolveDefaultVendorSessionPath(environment)

          const exists = yield* fs.exists(filePath)
          if (!exists) {
            return Option.none<PaddleVendorSessionState>()
          }

          const content = yield* fs.readFileString(filePath, "utf8")
          const session = yield* Schema.decodeUnknown(PaddleVendorSessionState.JSON)(content)

          return Option.some(session)
        },
        Effect.catchAll(() => Effect.succeed(Option.none<PaddleVendorSessionState>()))
      )

      const write = Effect.fn("Paddle.vendorSession.write")(function* (
        session: PaddleVendorSessionState,
        outputPath: string
      ) {
        yield* fs.makeDirectory(path.dirname(outputPath), { recursive: true })
        yield* fs.writeFileString(outputPath, JSON.stringify(session, null, 2))

        yield* Effect.logInfo(
          JSON.stringify({
            saved: outputPath,
            environment: session.environment,
            vendorUrl: session.vendorUrl,
            capturedAt: session.capturedAt,
            cookieNames: session.cookies.map((cookie) => cookie.name)
          })
        )
      }, Effect.orDie)

      const getCaptureConfig = Effect.fn("Paddle.vendorSession.getCaptureConfig")(function* (
        environment: PaymentEnvironmentTag
      ) {
        const filePath = resolveDefaultVendorSessionPath(environment)

        const config = yield* Config.all({
          email: Config.string("PADDLE_VENDOR_EMAIL").pipe(
            environment === "production"
              ? Config.orElse(() => Config.string("PADDLE_PRODUCTION_EMAIL"))
              : Config.orElse(() =>
                  Config.string("PADDLE_SANDBOX_EMAIL").pipe(Config.orElse(() => Config.string("PADDLE_SANBOX_EMAIL")))
                ),
            Config.withDefault("")
          ),
          password: Config.string("PADDLE_VENDOR_PASSWORD").pipe(
            Config.orElse(() =>
              Config.string(environment === "production" ? "PADDLE_PRODUCTION_PASSWORD" : "PADDLE_SANDBOX_PASSWORD")
            ),
            Config.withDefault("")
          ),
          headless: Config.boolean("PADDLE_VENDOR_HEADLESS").pipe(Config.withDefault(false))
        })

        if (!config.email || !config.password) {
          return yield* Effect.dieMessage(
            environment === "production"
              ? "Missing Paddle vendor credentials. Set PADDLE_VENDOR_EMAIL/PADDLE_VENDOR_PASSWORD or PADDLE_PRODUCTION_EMAIL/PADDLE_PRODUCTION_PASSWORD."
              : "Missing Paddle vendor credentials. Set PADDLE_SANDBOX_EMAIL/PADDLE_SANDBOX_PASSWORD in .env.local. PADDLE_SANBOX_EMAIL is also accepted for the email typo."
          )
        }

        return {
          environment,
          headless: config.headless,
          credentials: { email: config.email, password: config.password },
          outputPath: filePath
        }
      }, Effect.orDie)

      const capture = Effect.fn("Paddle.vendorSession.capture")(function* (
        environment: PaymentEnvironmentTag,
        options?:
          | {
              timeout?: number | undefined
              headless?: boolean | undefined
            }
          | undefined
      ) {
        const config = yield* getCaptureConfig(environment)

        const credentials = config.credentials
        const vendorUrl = paddleVendorUrl(config.environment)
        const timeout = options?.timeout ?? 300_000
        const headless = options?.headless ?? false

        const browser = yield* playwright
          .launchScoped(chromium, { headless })
          .pipe(Effect.withSpan("Playwright.launch-browser", { attributes: { headless: headless } }))

        const context = yield* browser.newContext({
          userAgent:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
        })

        const page = yield* context.newPage

        yield* page
          .goto(`${vendorUrl}/checkout-settings`, { waitUntil: "domcontentloaded", timeout: 60_000 })
          .pipe(Effect.withSpan("Playwright.goto-checkout-settings"))

        yield* page
          .use((nativePage) => signInToPaddleVendor(nativePage, credentials, timeout))
          .pipe(Effect.withSpan("Playwright.sign-in"))

        yield* page
          .waitForURL(/\/checkout-settings/, { timeout: timeout })
          .pipe(Effect.withSpan("Playwright.wait-checkout-settings"))

        const cookies = yield* context.cookies().pipe(Effect.withSpan("Playwright.read-cookies"))

        const cookieHeader = buildCookieHeader(cookies)
        const xsrfToken = readCookieValue(cookies, "XSRF-TOKEN")

        yield* Effect.annotateCurrentSpan({
          "session.cookies.count": cookies.length,
          "session.xsrf_token.present": xsrfToken !== undefined
        })

        if (!cookieHeader) {
          yield* Effect.dieMessage(
            "Paddle vendor login completed but no cookies were available to build a session header."
          )
          return
        }

        if (!xsrfToken) {
          yield* Effect.dieMessage("Paddle vendor login completed but XSRF-TOKEN cookie was not found.")
          return
        }

        const session = PaddleVendorSessionState.make({
          environment: config.environment,
          vendorUrl,
          cookieHeader,
          xsrfToken,
          capturedAt: new Date(),
          cookies
        })

        yield* write(session, config.outputPath)
      })

      const ensure = Effect.fn("Paddle.vendorSession.ensure")(function* (
        environment: PaymentEnvironmentTag,
        options?:
          | {
              timeout?: number | undefined
              headless?: boolean | undefined
              force?: boolean | undefined
            }
          | undefined
      ) {
        if (options?.force) {
          yield* Effect.annotateCurrentSpan({
            "vendor.session.force": true
          })

          return yield* capture(environment)
        }

        const session = yield* load(environment)
        const hasConfiguredPaddleVendorSession = Option.isSome(session)

        yield* Effect.annotateCurrentSpan({
          "vendor.session.configured": hasConfiguredPaddleVendorSession,
          "vendor.session.file.loaded": Option.isSome(session)
        })

        if (hasConfiguredPaddleVendorSession) {
          return
        }

        return yield* capture(environment)
      }, Effect.orDie)

      return PaddleVendorSession.of({ load, write, capture, ensure })
    })
  ).pipe(Layer.provide(Playwright.layer))
}

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

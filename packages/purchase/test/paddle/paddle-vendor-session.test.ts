import { describe, expect, it } from "@effect/vitest"

import { parseEnvValue, readPaddleVendorCaptureConfig } from "../../src/harness/paddle/capture-paddle-vendor-session.ts"
import { decodePaddleVendorSessionStateSync } from "../../src/paddle/internal/paddle-vendor-session.ts"

describe("paddle vendor session", () => {
  it("decodes captured vendor session state", () => {
    const session = decodePaddleVendorSessionStateSync({
      environment: "sandbox",
      vendorUrl: "https://sandbox-vendors.paddle.com",
      cookieHeader: "XSRF-TOKEN=token; sandbox_paddle_session_vendor=session",
      xsrfToken: "token",
      capturedAt: "2026-05-13T00:00:00.000Z",
      cookies: [
        {
          name: "XSRF-TOKEN",
          value: "token",
          domain: "sandbox-vendors.paddle.com",
          path: "/",
          expires: -1,
          httpOnly: false,
          secure: true,
          sameSite: "Lax"
        },
        {
          name: "sandbox_paddle_session_vendor",
          value: "session",
          domain: "sandbox-vendors.paddle.com",
          path: "/",
          expires: -1,
          httpOnly: true,
          secure: true,
          sameSite: "Lax"
        }
      ]
    })

    expect(session.environment).toBe("sandbox")
    expect(session.cookieHeader).toContain("XSRF-TOKEN=token")
    expect(session.xsrfToken).toBe("token")
  })

  it("reads sandbox capture credentials from env", () => {
    const config = readPaddleVendorCaptureConfig(
      {
        PADDLE_SANDBOX_EMAIL: "seller@example.test",
        PADDLE_SANDBOX_PASSWORD: "secret",
        PADDLE_VENDOR_HEADLESS: "1"
      },
      "/repo/packages/purchase"
    )

    expect(config.environment).toBe("sandbox")
    expect(config.headless).toBe(true)
    expect(config.credentials).toEqual({
      email: "seller@example.test",
      password: "secret"
    })
    expect(config.outputPath).toBe("/repo/packages/purchase/.purchase/paddle-vendor-sandbox-session.json")
  })

  it("parses quoted env values", () => {
    expect(parseEnvValue('"line\\nnext"')).toBe("line\nnext")
    expect(parseEnvValue("'literal # value'")).toBe("literal # value")
    expect(parseEnvValue("plain # comment")).toBe("plain")
  })
})

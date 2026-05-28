import { describe, expect, it } from "@effect/vitest"

import { PaddleVendorSessionState } from "../../src/paddle/internal/paddle-vendor-schema.ts"

describe("paddle vendor session", () => {
  it("decodes captured vendor session state", () => {
    const session = PaddleVendorSessionState.decodeSync({
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
})

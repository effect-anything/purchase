import * as W from "../src/testing/workers.ts"
import * as Test from "@effect-x/server-testing/workers"
import { NodeContext } from "@effect/platform-node"
import { expect } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { basename, resolve } from "node:path"

const TestLive = W.workers({
  persist: basename(import.meta.url),
  cwd: resolve(import.meta.dirname, "fixtures/email-worker"),
  tsconfig: resolve(import.meta.dirname, "../tsconfig.json"),
  env: {
    NAME: "email-worker",
    NAMESPACE: "cloudflare-email-e2e"
  }
}).pipe(Layer.provideMerge(NodeContext.layer))

const fetchJson = Effect.fn("fetchJson")(function* (path: string, init?: RequestInit | undefined) {
  const w = yield* W.Miniflare
  const response = yield* w.fetch(`http://localhost${path}`, init)
  expect(response.status).toBe(200)
  return yield* Effect.promise(() => response.json() as Promise<any>)
})

const triggerEmail = Effect.fn("triggerEmail")(function* (subject: string) {
  const w = yield* W.Miniflare
  const baseUrl = yield* w.url
  const raw = [
    "From: sender@example.com",
    "To: receiver@example.com",
    `Subject: ${subject}`,
    "Message-ID: <mail@example.com>",
    "",
    `hello from ${subject}`
  ].join("\r\n")
  const response = yield* Effect.promise(() =>
    fetch(new URL("/cdn-cgi/handler/email?from=sender@example.com&to=receiver@example.com", baseUrl), {
      method: "POST",
      headers: {
        "content-type": "message/rfc822"
      },
      body: raw
    })
  )
  return {
    status: response.status,
    text: yield* Effect.promise(() => response.text()),
    raw
  }
})

Test.test(TestLive)("Cloudflare email workers", (it) => {
  it.effect(
    "processes a real inbound email and forwards it through the email handle wrapper",
    Effect.fn(function* () {
      const result = yield* triggerEmail("forward")

      expect(result.status).toBe(200)
      expect(result.text).toBe("Worker successfully processed email")

      const json = yield* fetchJson("/email-result")

      expect(json.action).toBe("forward")
      expect(json.subject).toBe("forward")
      expect(json.rawText).toContain("hello from forward")
      expect(Number(json.rawSize)).toBeGreaterThan(0)
      expect(json.forwardedTo).toBe("archive@example.com")
      expect(typeof json.forwardMessageId).toBe("string")
      expect(json.forwardMessageId).toContain("@example.com")
    })
  )

  it.effect(
    "invokes setReject through the real email entrypoint and persists rejection state",
    Effect.fn(function* () {
      const result = yield* triggerEmail("reject")

      expect(result.status).toBe(200)
      expect(result.text).toBe("Worker successfully processed email")

      const json = yield* fetchJson("/email-result")

      expect(json).toEqual({
        action: "reject",
        subject: "reject",
        rawText: result.raw,
        rawSize: String(result.raw.length),
        forwardedTo: null,
        forwardMessageId: null
      })
    })
  )
})

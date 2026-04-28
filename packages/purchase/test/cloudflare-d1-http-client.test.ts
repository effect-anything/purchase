import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as SqlClient from "@effect/sql/SqlClient"
import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"

import * as CloudflareD1HttpClient from "../src/internal/cloudflare-d1-http-client.ts"

describe("cloudflare d1 http sql client", () => {
  it.effect("executes sql through the cloudflare query endpoint", () => {
    const requests: Array<{
      readonly body: unknown
      readonly headers: Headers
      readonly method: string
      readonly url: string
    }> = []

    const fetchImpl: typeof fetch = async (input, init) => {
      const bodyText =
        typeof init?.body === "string"
          ? init.body
          : init?.body instanceof Uint8Array
            ? new TextDecoder().decode(init.body)
            : String(init?.body)
      requests.push({
        body: JSON.parse(bodyText),
        headers: new Headers(init?.headers),
        method: init?.method ?? "GET",
        url: String(input)
      })

      return new Response(
        JSON.stringify({
          errors: [],
          messages: [],
          result: [
            {
              meta: {
                changed_db: false,
                changes: 0,
                duration: 1
              },
              results: [
                {
                  id: "offer_1",
                  provider_id: "price_1"
                }
              ],
              success: true
            }
          ],
          success: true
        }),
        {
          headers: {
            "content-type": "application/json"
          },
          status: 200
        }
      )
    }

    const layer = CloudflareD1HttpClient.layer({
      accountId: "account_123",
      apiToken: Redacted.make("cf_token"),
      baseUrl: "https://api.example.test/client/v4",
      databaseId: "database_123",
      transformResultNames: (value) => value.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase())
    }).pipe(Layer.provide(Layer.succeed(FetchHttpClient.Fetch, fetchImpl)))

    return Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient
      const rows = yield* sql.unsafe<{ readonly id: string; readonly providerId: string }>(
        "SELECT id, provider_id FROM paykit_provider_ref WHERE owner_id = ?",
        ["offer_1"]
      )

      expect(rows).toEqual([
        {
          id: "offer_1",
          providerId: "price_1"
        }
      ])
      expect(requests).toEqual([
        {
          body: {
            params: ["offer_1"],
            sql: "SELECT id, provider_id FROM paykit_provider_ref WHERE owner_id = ?"
          },
          headers: expect.any(Headers),
          method: "POST",
          url: "https://api.example.test/client/v4/accounts/account_123/d1/database/database_123/query"
        }
      ])
      expect(requests[0]?.headers.get("authorization")).toBe("Bearer cf_token")
    }).pipe(Effect.provide(layer))
  })
})

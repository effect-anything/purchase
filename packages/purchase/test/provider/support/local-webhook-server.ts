import type { AddressInfo } from "node:net"

import * as Effect from "effect/Effect"
import { createServer, type IncomingMessage } from "node:http"

export interface CapturedWebhookRequest {
  readonly url: string
  readonly headers: IncomingMessage["headers"]
  readonly body: string
}

export interface LocalWebhookServer {
  readonly url: string
  readonly waitForRequest: (timeoutMs?: number | undefined) => Effect.Effect<CapturedWebhookRequest, unknown>
}

const readBody = (request: IncomingMessage) =>
  Effect.tryPromise({
    try: () =>
      new Promise<string>((resolve, reject) => {
        const chunks: Array<Buffer> = []

        request.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        })

        request.on("end", () => {
          resolve(Buffer.concat(chunks).toString())
        })

        request.on("error", reject)
      }),
    catch: (cause) => cause
  })

export const makeLocalWebhookServer = Effect.acquireRelease(
  Effect.tryPromise({
    try: async () => {
      const queuedRequests: Array<CapturedWebhookRequest> = []
      const waiters: Array<{
        resolve: (request: CapturedWebhookRequest) => void
        reject: (error: Error) => void
      }> = []

      const takeRequest = () =>
        new Promise<CapturedWebhookRequest>((resolve, reject) => {
          const queued = queuedRequests.shift()
          if (queued) {
            resolve(queued)
            return
          }

          waiters.push({ resolve, reject })
        })

      const server = createServer(async (request, response) => {
        try {
          const body = await Effect.runPromise(readBody(request))

          const captured = {
            url: request.url ?? "/",
            headers: request.headers,
            body
          } satisfies CapturedWebhookRequest

          const waiter = waiters.shift()
          if (waiter) {
            waiter.resolve(captured)
          } else {
            queuedRequests.push(captured)
          }

          response.writeHead(200, { "content-type": "application/json" })
          response.end(JSON.stringify({ ok: true }))
        } catch (error) {
          const waiter = waiters.shift()
          waiter?.reject(error instanceof Error ? error : new Error(String(error)))
          response.writeHead(500)
          response.end()
        }
      })

      await new Promise<void>((resolve, reject) => {
        server.listen(0, "127.0.0.1", () => resolve())
        server.on("error", reject)
      })

      const address = server.address()
      if (!address || typeof address === "string") {
        throw new Error("Unable to resolve local webhook server address")
      }

      const info = address as AddressInfo

      return {
        server,
        requestPromise: () => takeRequest(),
        url: `http://127.0.0.1:${info.port}`
      }
    },
    catch: (cause) => cause
  }),
  ({ server }) =>
    Effect.tryPromise({
      try: () =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error) {
              reject(error)
              return
            }

            resolve()
          })
        }),
      catch: (cause) => cause
    }).pipe(Effect.catchAll(() => Effect.void))
).pipe(
  Effect.map(
    ({ url, requestPromise }) =>
      ({
        url,
        waitForRequest: (timeoutMs = 15_000) =>
          Effect.timeoutFail({
            duration: timeoutMs,
            onTimeout: () => new Error(`Timed out waiting for webhook request after ${timeoutMs}ms`)
          })(
            Effect.tryPromise({
              try: () => requestPromise(),
              catch: (cause) => cause
            })
          )
      }) satisfies LocalWebhookServer
  )
)

import { CloudflareFetchHandle, CloudflareQueueHandle, make } from "../../../src/entry.ts"
import * as CloudflareKv from "../../../src/kv.ts"
import * as CloudflareQueue from "../../../src/queue.ts"
import * as ServerKv from "@effect-x/server/kv"
import * as ServerQueue from "@effect-x/server/queue"
import * as HttpApi from "@effect/platform/HttpApi"
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as HttpApiGroup from "@effect/platform/HttpApiGroup"
import { Effect, Layer, Option, Schema } from "effect"

const readOptional = <A, E>(effect: Effect.Effect<A, E>) => effect.pipe(Effect.option, Effect.map(Option.getOrNull))

class QueueControlApiGroup extends HttpApiGroup.make("queue-control").add(
  HttpApiEndpoint.get("health", "/_health").addSuccess(
    Schema.Struct({
      ok: Schema.Boolean
    })
  )
) {}

class QueueControlApi extends HttpApi.make("QueueControlApi").add(QueueControlApiGroup) {}

const BaseLayer = Layer.mergeAll(
  CloudflareKv.fromName(() => "STATE_KV"),
  CloudflareQueue.fromName(() => "TASK_QUEUE")
)

const FetchLive = CloudflareFetchHandle.make(
  Layer.mergeAll(
    BaseLayer,
    HttpApiBuilder.api(QueueControlApi).pipe(
      Layer.provide(
        HttpApiBuilder.group(QueueControlApi, "queue-control", (handlers) =>
          handlers.handle("health", () =>
            Effect.succeed({
              ok: true
            })
          )
        )
      )
    )
  ),
  {
    handle: (request) =>
      Effect.gen(function* () {
        const url = new URL(request.url)

        switch (url.pathname) {
          case "/enqueue-single": {
            const queue = yield* ServerQueue.Queue

            yield* queue.send(
              {
                id: "single",
                value: "queue:single"
              },
              {
                contentType: "json"
              }
            )

            return Response.json({
              enqueued: true
            })
          }

          case "/queue-control-results": {
            const kv = yield* ServerKv.KV

            return Response.json({
              attempts: yield* readOptional(kv.get("queue-control:attempts")),
              batchSize: yield* readOptional(kv.get("queue-control:batch-size")),
              firstMessageId: yield* readOptional(kv.get("queue-control:first-message-id")),
              finalMessageId: yield* readOptional(kv.get("queue-control:final-message-id")),
              receivedValue: yield* readOptional(kv.get("queue-control:received-value"))
            })
          }

          default:
            return new Response("Not Found", { status: 404 })
        }
      }).pipe(Effect.orDie)
  }
)

const QueueLive = CloudflareQueueHandle.make(
  CloudflareKv.fromName(() => "STATE_KV"),
  (event) =>
    Effect.gen(function* () {
      const kv = yield* ServerKv.KV
      const messages = yield* event.messages
      const previousAttempts = yield* readOptional(kv.get("queue-control:attempts"))
      const attempt = Number(previousAttempts ?? "0") + 1
      const firstMessage = messages[0]
      const body = firstMessage?.body as { value?: string } | undefined

      yield* kv.put("queue-control:attempts", String(attempt)).pipe(Effect.orDie)
      yield* kv.put("queue-control:batch-size", String(messages.length)).pipe(Effect.orDie)
      yield* kv.put("queue-control:received-value", body?.value ?? "missing").pipe(Effect.orDie)

      if (attempt === 1) {
        yield* kv.put("queue-control:first-message-id", firstMessage?.id ?? "missing").pipe(Effect.orDie)
        yield* event.retryAll({ delaySeconds: 0 })
        return
      }

      yield* kv.put("queue-control:final-message-id", firstMessage?.id ?? "missing").pipe(Effect.orDie)
      yield* event.ackAll
    })
)

export default make({
  fetch: FetchLive,
  queue: QueueLive
})

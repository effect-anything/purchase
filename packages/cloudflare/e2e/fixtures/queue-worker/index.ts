import { CloudflareFetchHandle, CloudflareQueueHandle, make } from "../../../src/entry.ts"
import * as CloudflareKv from "../../../src/kv.ts"
import * as CloudflareQueue from "../../../src/queue.ts"
import * as CloudflareR2 from "../../../src/r2.ts"
import * as ServerKv from "@effect-x/server/kv"
import * as ServerQueue from "@effect-x/server/queue"
import * as ServerS3 from "@effect-x/server/s3"
import * as HttpApi from "@effect/platform/HttpApi"
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as HttpApiGroup from "@effect/platform/HttpApiGroup"
import { Effect, Layer, Option, Schema } from "effect"

const QueueBody = Schema.Struct({
  id: Schema.String,
  value: Schema.String,
  shouldFail: Schema.Boolean
})
const QueueResultsJson = Schema.parseJson(Schema.Array(Schema.String))
const encodeQueueResults = Schema.encodeUnknownSync(QueueResultsJson)

const readOptional = <A, E>(effect: Effect.Effect<A, E>) => effect.pipe(Effect.option, Effect.map(Option.getOrNull))

class QueueApiGroup extends HttpApiGroup.make("queue").add(
  HttpApiEndpoint.get("health", "/_health").addSuccess(
    Schema.Struct({
      ok: Schema.Boolean
    })
  )
) {}

class QueueApi extends HttpApi.make("QueueApi").add(QueueApiGroup) {}

const FetchLive = CloudflareFetchHandle.make(
  Layer.mergeAll(
    CloudflareKv.fromName(() => "STATE_KV"),
    CloudflareQueue.fromName(() => "TASK_QUEUE"),
    CloudflareR2.fromName(() => "STATE_BUCKET"),
    HttpApiBuilder.api(QueueApi).pipe(
      Layer.provide(
        HttpApiBuilder.group(QueueApi, "queue", (handlers) =>
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
          case "/enqueue": {
            const queue = yield* ServerQueue.Queue

            yield* queue.sendBatch([
              {
                body: {
                  id: "ok",
                  value: "queue:ok",
                  shouldFail: false
                },
                contentType: "json"
              },
              {
                body: {
                  id: "retry",
                  value: "queue:retry",
                  shouldFail: true
                },
                contentType: "json"
              },
              {
                body: {
                  invalid: true
                },
                contentType: "json"
              }
            ])

            return Response.json({ enqueued: true })
          }

          case "/queue-results": {
            const kv = yield* ServerKv.KV
            const s3 = yield* ServerS3.S3
            const [successes, failures, processed, r2Object] = yield* Effect.all([
              readOptional(kv.get("queue:successes")),
              readOptional(kv.get("queue:failures")),
              readOptional(kv.get("queue:processed:ok")),
              readOptional(s3.get("queue/ok.txt"))
            ])

            const objectText = r2Object ? yield* Effect.promise(() => r2Object.text()) : null

            return Response.json({
              successes,
              failures,
              processed,
              objectText
            })
          }

          default:
            return new Response("Not Found", { status: 404 })
        }
      }).pipe(Effect.orDie)
  }
)

const QueueLive = CloudflareQueueHandle.make(
  Layer.mergeAll(
    CloudflareKv.fromName(() => "STATE_KV"),
    CloudflareR2.fromName(() => "STATE_BUCKET")
  ),
  (event) =>
    Effect.gen(function* () {
      const kv = yield* ServerKv.KV
      const s3 = yield* ServerS3.S3
      const result = yield* event.process(
        QueueBody,
        Effect.fn(function* (message) {
          if (message.body.shouldFail) {
            return yield* Effect.fail("retry")
          }

          yield* kv.put(`queue:processed:${message.body.id}`, message.body.value).pipe(Effect.orDie)
          yield* s3.put(`queue/${message.body.id}.txt`, message.body.value).pipe(Effect.orDie)
        })
      )

      const successes = result.successes.map((message) => message.body.id)
      const failures = result.failures.map((message) => {
        const body = message.body

        return typeof body === "object" && body !== null && "id" in body && typeof body.id === "string"
          ? body.id
          : "invalid"
      })

      yield* kv.put("queue:successes", encodeQueueResults(successes)).pipe(Effect.orDie)
      yield* kv.put("queue:failures", encodeQueueResults(failures)).pipe(Effect.orDie)
    })
)

export default make({
  fetch: FetchLive,
  queue: QueueLive
})

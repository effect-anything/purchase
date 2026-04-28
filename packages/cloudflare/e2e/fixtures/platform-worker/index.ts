import { CloudflareBindings } from "../../../src/bindings.ts"
import { CloudflareFetchHandle, CloudflareQueueHandle, make } from "../../../src/entry.ts"
import * as CloudflareKv from "../../../src/kv.ts"
import * as CloudflareQueue from "../../../src/queue.ts"
import * as CloudflareR2 from "../../../src/r2.ts"
import * as WorkerService from "../../../src/worker-service.ts"
import * as ServerKv from "@effect-x/server/kv"
import * as ServerQueue from "@effect-x/server/queue"
import * as ServerS3 from "@effect-x/server/s3"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as HttpApi from "@effect/platform/HttpApi"
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as HttpApiGroup from "@effect/platform/HttpApiGroup"
import * as HttpClient from "@effect/platform/HttpClient"
import { Effect, Layer, Option, Schema } from "effect"

const QueueBody = Schema.Struct({
  id: Schema.String,
  value: Schema.String,
  shouldFail: Schema.Boolean
})
const QueueResultsJson = Schema.parseJson(Schema.Array(Schema.String))
const encodeQueueResults = Schema.encodeUnknownSync(QueueResultsJson)

class PlatformApiGroup extends HttpApiGroup.make("platform").add(
  HttpApiEndpoint.get("health", "/_health").addSuccess(
    Schema.Struct({
      ok: Schema.Boolean
    })
  )
) {}

class PlatformApi extends HttpApi.make("PlatformApi").add(PlatformApiGroup) {}

const AppLayer = Layer.mergeAll(
  WorkerService.make("echo-service", () => "ECHO_SERVICE"),
  CloudflareKv.fromName(() => "STATE_KV"),
  CloudflareQueue.fromName(() => "TASK_QUEUE"),
  CloudflareR2.fromName(() => "STATE_BUCKET"),
  HttpApiBuilder.api(PlatformApi).pipe(
    Layer.provide(
      HttpApiBuilder.group(PlatformApi, "platform", (handlers) =>
        handlers.handle("health", () =>
          Effect.succeed({
            ok: true
          })
        )
      )
    )
  )
)

const readOptional = <A, E>(effect: Effect.Effect<A, E>) => effect.pipe(Effect.option, Effect.map(Option.getOrNull))

const FetchLive = CloudflareFetchHandle.make(AppLayer, {
  handle: (request) =>
    Effect.gen(function* () {
      const url = new URL(request.url)

      switch (url.pathname) {
        case "/bindings": {
          const bindings = yield* Effect.all({
            hasKv: CloudflareBindings.hasBinding("STATE_KV"),
            hasBucket: CloudflareBindings.hasBinding("STATE_BUCKET"),
            hasQueue: CloudflareBindings.hasBinding("TASK_QUEUE"),
            hasService: CloudflareBindings.hasBinding("ECHO_SERVICE"),
            env: CloudflareBindings.getEnv()
          })

          return Response.json(bindings)
        }

        case "/service": {
          const client = yield* HttpClient.HttpClient
          const response = yield* client
            .get("/echo", {
              headers: {
                authorization: "Bearer explicit",
                "user-agent": "platform-worker"
              }
            })
            .pipe(Effect.provideService(FetchHttpClient.RequestInit, { headers: request.headers }))

          const json = yield* response.json
          return Response.json(json)
        }

        case "/service-retry": {
          const client = yield* HttpClient.HttpClient
          const response = yield* client.get("/retry")
          const json = yield* response.json

          return Response.json(json)
        }

        case "/storage": {
          const kv = yield* ServerKv.KV
          const s3 = yield* ServerS3.S3

          yield* kv.put("greeting", "hello from kv")
          yield* s3.put("greeting.txt", "hello from r2", {
            customMetadata: { source: "e2e" },
            httpMetadata: { contentType: "text/plain" }
          })

          const kvValue = yield* kv.get("greeting")
          const r2Object = yield* s3.get("greeting.txt")
          const r2Value = yield* Effect.promise(() => r2Object.text())
          const head = yield* s3.head("greeting.txt")

          return Response.json({
            kvValue,
            r2Value,
            size: head.size,
            etag: head.etag,
            customMetadata: head.customMetadata,
            httpMetadata: head.httpMetadata
          })
        }

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
          return
      }
    }).pipe(Effect.orDie)
})

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

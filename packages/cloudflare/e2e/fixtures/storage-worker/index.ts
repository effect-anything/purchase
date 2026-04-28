import { WaitUntilGlobalLive } from "../../../src/context.ts"
import { CloudflareFetchHandle, make } from "../../../src/entry.ts"
import * as CloudflareKv from "../../../src/kv.ts"
import * as CloudflareR2 from "../../../src/r2.ts"
import * as ServerCacheStorage from "@effect-x/server/cache-storage"
import * as ServerKv from "@effect-x/server/kv"
import * as ServerS3 from "@effect-x/server/s3"
import { WaitUntil } from "@effect-x/server/wait-until"
import * as HttpApi from "@effect/platform/HttpApi"
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as HttpApiGroup from "@effect/platform/HttpApiGroup"
import { Effect, Layer, Option, Schema } from "effect"

const readOptional = <A, E>(effect: Effect.Effect<A, E>) => effect.pipe(Effect.option, Effect.map(Option.getOrNull))
const KvJsonValue = Schema.Struct({
  hello: Schema.String,
  count: Schema.Number
})
const KvJsonString = Schema.parseJson(KvJsonValue)
const encodeKvJson = Schema.encodeUnknownSync(KvJsonString)

class StorageApiGroup extends HttpApiGroup.make("storage").add(
  HttpApiEndpoint.get("health", "/_health").addSuccess(
    Schema.Struct({
      ok: Schema.Boolean
    })
  )
) {}

class StorageApi extends HttpApi.make("StorageApi").add(StorageApiGroup) {}

const AppLayer = Layer.mergeAll(
  CloudflareKv.fromName(() => "STATE_KV"),
  CloudflareR2.fromName(() => "STATE_BUCKET"),
  WaitUntilGlobalLive,
  HttpApiBuilder.api(StorageApi).pipe(
    Layer.provide(
      HttpApiBuilder.group(StorageApi, "storage", (handlers) =>
        handlers.handle("health", () =>
          Effect.succeed({
            ok: true
          })
        )
      )
    )
  )
)

const FetchLive = CloudflareFetchHandle.make(AppLayer, {
  handle: (request) =>
    Effect.gen(function* () {
      const url = new URL(request.url)

      switch (url.pathname) {
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

        case "/storage/kv-details": {
          const kv = yield* ServerKv.KV

          yield* kv.put("kv/json", encodeKvJson({ hello: "world", count: 2 }))
          yield* kv.put("kv/meta", "meta-value", {
            metadata: {
              version: 1,
              source: "storage-worker"
            }
          })
          yield* kv.put("kv/binary", Uint8Array.from([65, 66, 67]))
          yield* kv.put(
            "kv/stream",
            new ReadableStream({
              start(controller) {
                controller.enqueue(new TextEncoder().encode("streamed-value"))
                controller.close()
              }
            })
          )

          const jsonValue = yield* kv.getJson("kv/json")
          const metadataResult = yield* kv.metadata.get("kv/meta")
          const binaryValue = yield* kv.getArrayBuffer("kv/binary")
          const streamValue = yield* kv.getStream("kv/stream")
          const listed = yield* kv.list({ prefix: "kv/" })

          return Response.json({
            jsonValue,
            metadataValue: metadataResult.value,
            metadata: metadataResult.metadata,
            binaryText: new TextDecoder().decode(binaryValue as unknown as ArrayBuffer),
            streamText: yield* Effect.promise(() => new Response(streamValue as ReadableStream).text()),
            listedKeys: listed.keys.map((item) => item.name).toSorted()
          })
        }

        case "/storage/r2-details": {
          const s3 = yield* ServerS3.S3

          yield* s3.put("r2/a.txt", "abcdef", {
            httpMetadata: { contentType: "text/plain" }
          })
          yield* s3.put("r2/b.txt", "second", {
            httpMetadata: { contentType: "text/plain" }
          })

          const listedBeforeDelete = yield* s3.list({ prefix: "r2/" })
          const ranged = yield* s3.get("r2/a.txt", {
            range: {
              offset: 1,
              length: 3
            }
          })

          yield* s3.delete("r2/b.txt")

          const listedAfterDelete = yield* s3.list({ prefix: "r2/" })

          return Response.json({
            listedBeforeDelete: listedBeforeDelete.objects.map((item) => item.key).toSorted(),
            rangedText: yield* Effect.promise(() => ranged.text()),
            listedAfterDelete: listedAfterDelete.objects.map((item) => item.key).toSorted()
          })
        }

        case "/cache/put": {
          const cacheStorage = yield* ServerCacheStorage.CacheStorage
          const defaultRequest = new Request("http://localhost/cache/default?x=1")
          const namedRequest = new Request("http://localhost/cache/named?x=1")
          const responseInit = {
            headers: {
              "cache-control": "public, max-age=3600"
            }
          }

          yield* cacheStorage.put(defaultRequest, new Response("default-cache", responseInit))

          const namedCache = yield* cacheStorage.open("named-cache")
          yield* namedCache.put(namedRequest, new Response("named-cache", responseInit))

          return Response.json({
            stored: true
          })
        }

        case "/cache/read": {
          const cacheStorage = yield* ServerCacheStorage.CacheStorage
          const defaultRequest = new Request("http://localhost/cache/default?x=1")
          const namedRequest = new Request("http://localhost/cache/named?x=1")

          const defaultMatch = yield* cacheStorage.match(defaultRequest)
          const defaultText = Option.isSome(defaultMatch)
            ? yield* Effect.promise(() => defaultMatch.value.text())
            : null

          const namedCache = yield* cacheStorage.open("named-cache")
          const namedMatch = yield* namedCache.match(namedRequest)
          const namedText = Option.isSome(namedMatch) ? yield* Effect.promise(() => namedMatch.value.text()) : null

          return Response.json({
            defaultText,
            namedText
          })
        }

        case "/cache/delete": {
          const cacheStorage = yield* ServerCacheStorage.CacheStorage
          const defaultRequest = new Request("http://localhost/cache/default?x=1")
          const namedRequest = new Request("http://localhost/cache/named?x=1")

          const defaultDeleted = yield* cacheStorage.delete(defaultRequest)
          const defaultAfterDelete = yield* cacheStorage.match(defaultRequest)

          const namedCache = yield* cacheStorage.open("named-cache")
          const namedDeleted = yield* namedCache.delete(namedRequest)
          const namedAfterDelete = yield* namedCache.match(namedRequest)

          return Response.json({
            defaultDeleted,
            defaultAfterDelete: Option.isSome(defaultAfterDelete),
            namedDeleted,
            namedAfterDelete: Option.isSome(namedAfterDelete)
          })
        }

        case "/wait-until": {
          const kv = yield* ServerKv.KV

          yield* WaitUntil.effect(kv.put("wait-until", "done").pipe(Effect.orDie))

          return Response.json({
            queued: true
          })
        }

        case "/wait-until-result": {
          const kv = yield* ServerKv.KV

          return Response.json({
            result: yield* readOptional(kv.get("wait-until"))
          })
        }

        default:
          return new Response("Not Found", { status: 404 })
      }
    }).pipe(Effect.orDie)
})

export default make({
  fetch: FetchLive
})

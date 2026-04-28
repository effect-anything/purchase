import { CloudflareEmailHandle, CloudflareFetchHandle, make } from "../../../src/entry.ts"
import * as CloudflareKv from "../../../src/kv.ts"
import * as ServerKv from "@effect-x/server/kv"
import * as HttpApi from "@effect/platform/HttpApi"
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as HttpApiGroup from "@effect/platform/HttpApiGroup"
import { Effect, Layer, Option, Schema } from "effect"

const readOptional = <A, E>(effect: Effect.Effect<A, E>) => effect.pipe(Effect.option, Effect.map(Option.getOrNull))

class EmailApiGroup extends HttpApiGroup.make("email").add(
  HttpApiEndpoint.get("health", "/_health").addSuccess(
    Schema.Struct({
      ok: Schema.Boolean
    })
  )
) {}

class EmailApi extends HttpApi.make("EmailApi").add(EmailApiGroup) {}

const BaseLayer = CloudflareKv.fromName(() => "STATE_KV")

const FetchLive = CloudflareFetchHandle.make(
  Layer.mergeAll(
    BaseLayer,
    HttpApiBuilder.api(EmailApi).pipe(
      Layer.provide(
        HttpApiBuilder.group(EmailApi, "email", (handlers) =>
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
          case "/email-result": {
            const kv = yield* ServerKv.KV

            return Response.json({
              action: yield* readOptional(kv.get("email:action")),
              subject: yield* readOptional(kv.get("email:subject")),
              rawText: yield* readOptional(kv.get("email:raw-text")),
              rawSize: yield* readOptional(kv.get("email:raw-size")),
              forwardedTo: yield* readOptional(kv.get("email:forwarded-to")),
              forwardMessageId: yield* readOptional(kv.get("email:forward-message-id"))
            })
          }

          default:
            return
        }
      }).pipe(Effect.orDie)
  }
)

const EmailLive = CloudflareEmailHandle.make(BaseLayer, (event) =>
  Effect.gen(function* () {
    const kv = yield* ServerKv.KV
    const subject = event.headers.get("subject") ?? "missing-subject"
    const rawText = yield* Effect.promise(() => new Response(event.raw).text())

    yield* kv.put("email:subject", subject).pipe(Effect.orDie)
    yield* kv.put("email:raw-text", rawText).pipe(Effect.orDie)
    yield* kv.put("email:raw-size", String(event.rawSize)).pipe(Effect.orDie)

    if (subject === "reject") {
      yield* kv.put("email:action", "reject").pipe(Effect.orDie)
      yield* event.setReject("blocked by policy")
      return
    }

    const forwardedTo = "archive@example.com"
    const result = yield* event.forward(forwardedTo, new Headers({ "x-email-mode": "archive" }))

    yield* kv.put("email:action", "forward").pipe(Effect.orDie)
    yield* kv.put("email:forwarded-to", forwardedTo).pipe(Effect.orDie)
    yield* kv.put("email:forward-message-id", result.messageId).pipe(Effect.orDie)
  })
)

export default make({
  fetch: FetchLive,
  email: EmailLive
})

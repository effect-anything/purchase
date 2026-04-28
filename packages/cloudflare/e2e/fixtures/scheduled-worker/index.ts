import { WaitUntilGlobalLive } from "../../../src/context.ts"
import { CloudflareFetchHandle, CloudflareScheduledHandle, make } from "../../../src/entry.ts"
import * as CloudflareKv from "../../../src/kv.ts"
import * as ServerKv from "@effect-x/server/kv"
import { WaitUntil } from "@effect-x/server/wait-until"
import * as HttpApi from "@effect/platform/HttpApi"
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as HttpApiGroup from "@effect/platform/HttpApiGroup"
import { Effect, Layer, Option, Schema } from "effect"

const readOptional = <A, E>(effect: Effect.Effect<A, E>) => effect.pipe(Effect.option, Effect.map(Option.getOrNull))

class ScheduledApiGroup extends HttpApiGroup.make("scheduled").add(
  HttpApiEndpoint.get("health", "/_health").addSuccess(
    Schema.Struct({
      ok: Schema.Boolean
    })
  )
) {}

class ScheduledApi extends HttpApi.make("ScheduledApi").add(ScheduledApiGroup) {}

const BaseLayer = Layer.mergeAll(
  CloudflareKv.fromName(() => "STATE_KV"),
  WaitUntilGlobalLive
)

const FetchLive = CloudflareFetchHandle.make(
  Layer.mergeAll(
    BaseLayer,
    HttpApiBuilder.api(ScheduledApi).pipe(
      Layer.provide(
        HttpApiBuilder.group(ScheduledApi, "scheduled", (handlers) =>
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
          case "/scheduled-result": {
            const kv = yield* ServerKv.KV

            return Response.json({
              cron: yield* readOptional(kv.get("scheduled:cron")),
              scheduledTime: yield* readOptional(kv.get("scheduled:time")),
              noRetry: yield* readOptional(kv.get("scheduled:no-retry")),
              waitUntil: yield* readOptional(kv.get("scheduled:wait-until"))
            })
          }

          default:
            return
        }
      }).pipe(Effect.orDie)
  }
)

const ScheduledLive = CloudflareScheduledHandle.make(BaseLayer, (event) =>
  Effect.gen(function* () {
    const kv = yield* ServerKv.KV

    yield* kv.put("scheduled:cron", event.cron).pipe(Effect.orDie)
    yield* kv.put("scheduled:time", event.scheduledTime.toISOString()).pipe(Effect.orDie)

    yield* event.noRetry
    yield* kv.put("scheduled:no-retry", "called").pipe(Effect.orDie)

    yield* WaitUntil.effect(kv.put("scheduled:wait-until", "done").pipe(Effect.orDie))
  })
)

export default make({
  fetch: FetchLive,
  scheduled: ScheduledLive
})

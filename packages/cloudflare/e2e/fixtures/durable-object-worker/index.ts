/// <reference types="@cloudflare/workers-types" />

import { CloudflareBindings } from "../../../src/bindings.ts"
import { wrapStub } from "../../../src/durable-object.ts"
import { CloudflareFetchHandle, make } from "../../../src/entry.ts"
import * as HttpApi from "@effect/platform/HttpApi"
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as HttpApiGroup from "@effect/platform/HttpApiGroup"
import { DurableObject } from "cloudflare:workers"
import { Effect, Layer, Option, Schema } from "effect"

interface CounterRpc {
  increment(by: number): Promise<number>
  current(): Promise<number>
  fail(message: string): Promise<void>
}

export class CounterDurableObject extends DurableObject {
  async increment(by: number) {
    const current = ((await this.ctx.storage.get<number>("count")) ?? 0) + by
    await this.ctx.storage.put("count", current)
    return current
  }

  async current() {
    return (await this.ctx.storage.get<number>("count")) ?? 0
  }

  async fail(message: string) {
    throw new Error(`boom:${message}`)
  }
}

class DurableObjectApiGroup extends HttpApiGroup.make("durable-object").add(
  HttpApiEndpoint.get("health", "/_health").addSuccess(
    Schema.Struct({
      ok: Schema.Boolean
    })
  )
) {}

class DurableObjectApi extends HttpApi.make("DurableObjectApi").add(DurableObjectApiGroup) {}

const AppLayer = HttpApiBuilder.api(DurableObjectApi).pipe(
  Layer.provide(
    HttpApiBuilder.group(DurableObjectApi, "durable-object", (handlers) =>
      handlers.handle("health", () =>
        Effect.succeed({
          ok: true
        })
      )
    )
  )
)

const FetchLive = CloudflareFetchHandle.make(AppLayer, {
  handle: (request) =>
    Effect.gen(function* () {
      const url = new URL(request.url)
      const name = url.searchParams.get("name") ?? "default"

      const namespace = yield* CloudflareBindings.use((bindings) =>
        bindings.getDurableObjectNamespace("COUNTER_DURABLE_OBJECT")
      ).pipe(
        Effect.flatMap(
          Option.match({
            onNone: () => Effect.dieMessage("COUNTER_DURABLE_OBJECT not found"),
            onSome: Effect.succeed
          })
        )
      )

      const id = namespace.idFromName(name)
      const stub = namespace.get(id)
      const counter = wrapStub<CounterRpc>(() => stub as any)

      switch (url.pathname) {
        case "/do/increment": {
          const by = Number(url.searchParams.get("by") ?? "1")

          return Response.json({
            value: yield* counter.increment(by)
          })
        }

        case "/do/current": {
          return Response.json({
            value: yield* counter.current()
          })
        }

        case "/do/error": {
          const error = yield* Effect.flip(counter.fail("broken"))

          return Response.json({
            tag: error._tag,
            message: error.message,
            reason: String(error.reason)
          })
        }

        case "/do/bindings": {
          return Response.json({
            hasDurableObject: yield* CloudflareBindings.hasBinding("COUNTER_DURABLE_OBJECT")
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

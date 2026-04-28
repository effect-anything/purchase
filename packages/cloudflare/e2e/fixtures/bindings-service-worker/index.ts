import { CloudflareBindings } from "../../../src/bindings.ts"
import { CloudflareFetchHandle, make } from "../../../src/entry.ts"
import * as WorkerService from "../../../src/worker-service.ts"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as HttpApi from "@effect/platform/HttpApi"
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as HttpApiGroup from "@effect/platform/HttpApiGroup"
import * as HttpClient from "@effect/platform/HttpClient"
import { Effect, Layer, Schema } from "effect"
import * as Config from "effect/Config"

class BindingsApiGroup extends HttpApiGroup.make("bindings").add(
  HttpApiEndpoint.get("health", "/_health").addSuccess(
    Schema.Struct({
      ok: Schema.Boolean
    })
  )
) {}

class BindingsApi extends HttpApi.make("BindingsApi").add(BindingsApiGroup) {}

const AppLayer = Layer.mergeAll(
  WorkerService.make("echo-service", () => "ECHO_SERVICE"),
  HttpApiBuilder.api(BindingsApi).pipe(
    Layer.provide(
      HttpApiBuilder.group(BindingsApi, "bindings", (handlers) =>
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
        case "/bindings": {
          const bindings = yield* Effect.all({
            hasDb: CloudflareBindings.hasBinding("DB"),
            hasKv: CloudflareBindings.hasBinding("STATE_KV"),
            hasBucket: CloudflareBindings.hasBinding("STATE_BUCKET"),
            hasQueue: CloudflareBindings.hasBinding("TASK_QUEUE"),
            hasService: CloudflareBindings.hasBinding("ECHO_SERVICE"),
            env: CloudflareBindings.getEnv()
          })

          return Response.json(bindings)
        }

        case "/config": {
          const config = yield* Config.all({
            appName: Config.string("APP_NAME"),
            name: Config.string("NAME"),
            namespace: Config.string("NAMESPACE"),
            featureEnabled: Config.boolean("FEATURE_ENABLED"),
            retryCount: Config.integer("RETRY_COUNT"),
            syncUrl: Config.string("URL").pipe(Config.nested("SYNC"))
          }).pipe(Effect.orDie)

          return Response.json(config)
        }

        case "/service": {
          const client = yield* HttpClient.HttpClient
          const response = yield* client
            .get("/echo", {
              headers: {
                authorization: "Bearer explicit",
                "user-agent": "bindings-service-worker"
              }
            })
            .pipe(Effect.provideService(FetchHttpClient.RequestInit, { headers: request.headers }))

          return Response.json(yield* response.json)
        }

        case "/service-retry": {
          const client = yield* HttpClient.HttpClient
          const response = yield* client.get("/retry")

          return Response.json(yield* response.json)
        }

        default:
          return
      }
    }).pipe(Effect.orDie)
})

export default make({
  fetch: FetchLive
})

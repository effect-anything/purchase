import { CloudflareBindings } from "../../../src/bindings.ts"
import { CloudflareFetchHandle, make } from "../../../src/entry.ts"
import * as WorkflowHelpers from "../../../src/workflows.ts"
import * as HttpApi from "@effect/platform/HttpApi"
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as HttpApiGroup from "@effect/platform/HttpApiGroup"
import { DateTime, Duration, Effect, Layer, Option, Schema } from "effect"

const WorkflowPayload = Schema.Struct({
  id: Schema.String,
  value: Schema.Number,
  wakeAt: Schema.Number
})
const WorkflowTimerResult = Schema.Struct({
  value: Schema.Number,
  wokeUp: Schema.Boolean
})
const WorkflowTimerResultJson = Schema.parseJson(WorkflowTimerResult)
const encodeWorkflowTimerResult = Schema.encodeUnknownSync(WorkflowTimerResultJson)
const decodeWorkflowTimerResult = Schema.decodeUnknownSync(WorkflowTimerResultJson)

const WorkflowsRecord = () => ({ TimerWorkflow }) satisfies Record<string, WorkflowHelpers.WorkflowClass<any, any>>

const getResultKv = CloudflareBindings.use((bindings) => bindings.getKVNamespace("RESULT_KV")).pipe(
  Effect.flatMap(
    Option.match({
      onNone: () => Effect.dieMessage("RESULT_KV not found"),
      onSome: Effect.succeed
    })
  )
)

export const TimerWorkflow = WorkflowHelpers.makeWorkflow(
  {
    binding: "TIMER_WORKFLOW",
    schema: WorkflowPayload
  },
  (payload) =>
    Effect.gen(function* () {
      const kv = yield* getResultKv

      yield* WorkflowHelpers.Workflow.sleep("delay", Duration.millis(25))
      yield* WorkflowHelpers.Workflow.sleepUntil("wake", DateTime.unsafeMake(payload.wakeAt))
      yield* WorkflowHelpers.Workflow.do(
        "persist",
        Effect.promise(() =>
          kv.put(
            payload.id,
            encodeWorkflowTimerResult({
              value: payload.value,
              wokeUp: true
            })
          )
        )
      )
    })
)

class WorkflowTimerApiGroup extends HttpApiGroup.make("workflow-timer").add(
  HttpApiEndpoint.get("health", "/_health").addSuccess(
    Schema.Struct({
      ok: Schema.Boolean
    })
  )
) {}

class WorkflowTimerApi extends HttpApi.make("WorkflowTimerApi").add(WorkflowTimerApiGroup) {}

const AppLayer = Layer.mergeAll(
  WorkflowHelpers.Workflows.fromRecord(WorkflowsRecord),
  HttpApiBuilder.api(WorkflowTimerApi).pipe(
    Layer.provide(
      HttpApiBuilder.group(WorkflowTimerApi, "workflow-timer", (handlers) =>
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
      const workflow = yield* WorkflowHelpers.Workflows.getWorkflow<ReturnType<typeof WorkflowsRecord>>("TimerWorkflow")
      const kv = yield* getResultKv

      switch (url.pathname) {
        case "/workflow/create": {
          const id = url.searchParams.get("id") ?? crypto.randomUUID()
          const value = Number(url.searchParams.get("value") ?? "1")
          const wakeAt = Number(url.searchParams.get("wakeAt") ?? `${Date.now() + 100}`)
          const instance = yield* workflow.create({
            id,
            params: {
              id,
              value,
              wakeAt
            }
          })

          return Response.json({
            id: yield* instance.id
          })
        }

        case "/workflow/result": {
          const id = url.searchParams.get("id") ?? ""
          const value = yield* Effect.promise(() => kv.get(id))

          if (!value) {
            return Response.json({
              exists: false,
              value: null
            })
          }

          return Response.json({
            exists: true,
            value: decodeWorkflowTimerResult(value)
          })
        }

        default:
          return
      }
    }).pipe(Effect.orDie)
})

export default make({
  fetch: FetchLive
})

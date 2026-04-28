import { CloudflareFetchHandle, make } from "../../../src/entry.ts"
import * as WorkflowHelpers from "../../../src/workflows.ts"
import * as HttpApi from "@effect/platform/HttpApi"
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as HttpApiGroup from "@effect/platform/HttpApiGroup"
import { Effect, Layer, Option, Schema } from "effect"

const WorkflowPayload = Schema.Struct({
  name: Schema.String,
  value: Schema.Number
})

const WorkflowsRecord = () => ({ MirrorWorkflow }) satisfies Record<string, WorkflowHelpers.WorkflowClass<any, any>>

export const MirrorWorkflow = WorkflowHelpers.makeWorkflow(
  {
    binding: "MIRROR_WORKFLOW",
    schema: WorkflowPayload
  },
  (payload) =>
    Effect.gen(function* () {
      const doubled = yield* WorkflowHelpers.Workflow.do("double", Effect.succeed(payload.value * 2))
      yield* WorkflowHelpers.Workflow.do("triple", Effect.succeed(payload.value * 3))
      yield* WorkflowHelpers.Workflow.do("final", Effect.succeed({ name: payload.name, doubled }))
    })
)

class WorkflowApiGroup extends HttpApiGroup.make("workflow").add(
  HttpApiEndpoint.get("health", "/_health").addSuccess(
    Schema.Struct({
      ok: Schema.Boolean
    })
  )
) {}

class WorkflowApi extends HttpApi.make("WorkflowApi").add(WorkflowApiGroup) {}

const AppLayer = Layer.mergeAll(
  WorkflowHelpers.Workflows.fromRecord(WorkflowsRecord),
  HttpApiBuilder.api(WorkflowApi).pipe(
    Layer.provide(
      HttpApiBuilder.group(WorkflowApi, "workflow", (handlers) =>
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
      const workflow =
        yield* WorkflowHelpers.Workflows.getWorkflow<ReturnType<typeof WorkflowsRecord>>("MirrorWorkflow")

      switch (url.pathname) {
        case "/workflow/create": {
          const id = url.searchParams.get("id") ?? "workflow-single"
          const name = url.searchParams.get("name") ?? "single"
          const value = Number(url.searchParams.get("value") ?? "2")
          const instance = yield* workflow.create({
            id,
            params: {
              name,
              value
            }
          })

          return Response.json({
            id: yield* instance.id
          })
        }

        case "/workflow/create-batch": {
          const prefix = url.searchParams.get("prefix") ?? "workflow-batch"
          const instances = yield* workflow.createBatch([
            {
              id: `${prefix}-a`,
              params: {
                name: "batch-a",
                value: 1
              }
            },
            {
              id: `${prefix}-b`,
              params: {
                name: "batch-b",
                value: 3
              }
            }
          ])

          return Response.json({
            ids: yield* Effect.forEach(instances, (instance) => instance.id, { concurrency: "unbounded" })
          })
        }

        case "/workflow/get": {
          const id = url.searchParams.get("id") ?? ""
          const instance = yield* workflow.get(id)

          if (Option.isNone(instance)) {
            return Response.json({
              exists: false,
              id: null
            })
          }

          return Response.json({
            exists: true,
            id: yield* instance.value.id
          })
        }

        case "/workflow/result": {
          return Response.json({
            stored: null
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

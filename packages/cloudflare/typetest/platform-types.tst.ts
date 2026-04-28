import type { DurableObjectNamespace, EmailSendResult, Queue } from "@cloudflare/workers-types"
import type { QueueEvent, QueueProcessResult } from "../src/queue.ts"
import type { ScheduledEvent } from "../src/schedule.ts"

import { CloudflareBindings } from "../src/bindings.ts"
import { type RPCError, wrapStub } from "../src/durable-object.ts"
import type { EmailEvent } from "../src/email.ts"
import { CloudflareEmailHandle, CloudflareQueueHandle, CloudflareScheduledHandle } from "../src/entry.ts"
import { Workflow, type WorkflowClass, Workflows, type WorkflowInstance } from "../src/workflows.ts"
import { DateTime, Effect, Layer, type Option, Schema } from "effect"
import { describe, expect, test } from "tstyche"

const QueueBodySchema = Schema.Struct({
  id: Schema.String,
  attempts: Schema.Number
})

type QueueBody = Schema.Schema.Type<typeof QueueBodySchema>

declare const queueEvent: QueueEvent
declare const durableNamespace: DurableObjectNamespace

const WorkflowPayload = Schema.Struct({
  id: Schema.String,
  value: Schema.Number
})

declare const MirrorWorkflow: WorkflowClass<
  Schema.Schema.Type<typeof WorkflowPayload>,
  Schema.Schema.Encoded<typeof WorkflowPayload>
>

describe("@effect-x/cloudflare public typing", () => {
  test("CloudflareBindings.getQueue preserves the message body generic", () => {
    const readQueue = CloudflareBindings.use((bindings) => bindings.getQueue<QueueBody>("TASK_QUEUE"))

    expect<typeof readQueue>().type.toBe<Effect.Effect<Option.Option<Queue<QueueBody>>, never, never>>()
  })

  test("CloudflareBindings.getDurableObjectNamespace returns the runtime namespace type", () => {
    const readNamespace = CloudflareBindings.use((bindings) => bindings.getDurableObjectNamespace("COUNTER_DO"))

    expect<typeof readNamespace>().type.toBe<Effect.Effect<Option.Option<DurableObjectNamespace>, never, never>>()
  })

  test("QueueEvent.process returns decoded successes and encoded failures when a schema is provided", () => {
    const result = queueEvent.process(QueueBodySchema, (message) => {
      expect(message.body).type.toBe<QueueBody>()
      return Effect.void
    })

    expect<typeof result>().type.toBe<Effect.Effect<QueueProcessResult<QueueBody, unknown>, never, never>>()
  })

  test("QueueEvent.process keeps the same body type without a schema and retryAll is effectful", () => {
    const result = queueEvent.process<{ id: string }>((message) => {
      expect(message.body).type.toBe<{ id: string }>()
      return Effect.void
    })

    const retryAll = queueEvent.retryAll({ delaySeconds: 5 })

    expect<typeof result>().type.toBe<Effect.Effect<QueueProcessResult<{ id: string }>, never, never>>()
    expect<typeof retryAll>().type.toBe<Effect.Effect<void, never, never>>()
  })

  test("CloudflareQueueHandle.make exposes the decoded queue body inside handlers", () => {
    const handle = CloudflareQueueHandle.make(Layer.empty, (event) =>
      event
        .process(QueueBodySchema, (message) => {
          expect(message.body).type.toBe<QueueBody>()
          return Effect.void
        })
        .pipe(Effect.asVoid)
    )

    expect<typeof handle>().type.toBeAssignableTo<Layer.Layer<CloudflareQueueHandle, never, never>>()
  })

  test("CloudflareScheduledHandle.make passes a ScheduledEvent instead of the raw controller", () => {
    const scheduled = CloudflareScheduledHandle.make(Layer.empty, (event) => {
      expect<typeof event>().type.toBe<ScheduledEvent>()
      return event.noRetry
    })

    expect<typeof scheduled>().type.toBeAssignableTo<Layer.Layer<CloudflareScheduledHandle, never, never>>()
  })

  test("CloudflareEmailHandle.make passes an EmailEvent into handlers", () => {
    const email = CloudflareEmailHandle.make(Layer.empty, (event) => {
      const forward = event.forward("archive@example.com")

      expect<typeof event>().type.toBe<EmailEvent>()
      expect<typeof forward>().type.toBe<Effect.Effect<EmailSendResult, never, never>>()
      return event.setReject("blocked")
    })

    expect<typeof email>().type.toBeAssignableTo<Layer.Layer<CloudflareEmailHandle, never, never>>()
  })

  test("wrapStub effectifies durable object RPC methods and maps failures to RPCError", () => {
    const rpc = wrapStub<{ increment: (by: number) => Promise<number> }>(
      () => durableNamespace.get(durableNamespace.idFromName("alpha")) as any
    )
    const result = rpc.increment(1)

    expect<typeof result>().type.toBe<Effect.Effect<number, RPCError, never>>()
  })

  test("Workflows.getWorkflow preserves create and createBatch payload types", () => {
    const workflow = Workflows.getWorkflow<{ MirrorWorkflow: typeof MirrorWorkflow }>("MirrorWorkflow")

    expect<typeof workflow>().type.toBeAssignableTo<
      Effect.Effect<
        {
          get: (id: string) => Effect.Effect<Option.Option<WorkflowInstance>, never, never>
          create: (options: {
            id?: string | undefined
            params: Schema.Schema.Type<typeof WorkflowPayload> | undefined
          }) => Effect.Effect<WorkflowInstance, never, never>
          createBatch: (
            options: Array<{ id?: string | undefined; params: Schema.Schema.Type<typeof WorkflowPayload> | undefined }>
          ) => Effect.Effect<Array<WorkflowInstance>, never, never>
        },
        never,
        Workflows
      >
    >()
  })

  test("Workflow.waitForEvent preserves the event payload generic and sleepUntil stays effectful", () => {
    const waitForEvent = Workflow.waitForEvent<{ increment: number }>("signal", { type: "increment" })
    const sleepUntil = Workflow.sleepUntil("wake", DateTime.unsafeMake(Date.now()))

    expect<typeof waitForEvent>().type.toBe<
      Effect.Effect<
        {
          payload: { increment: number }
          timestamp: Date
          type: string
        },
        never,
        Workflow
      >
    >()

    expect<typeof sleepUntil>().type.toBe<Effect.Effect<void, never, Workflow>>()
  })
})

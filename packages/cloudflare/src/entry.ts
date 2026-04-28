import type { ExportedHandler, Response } from "@cloudflare/workers-types"
import type * as Layer from "effect/Layer"

import { CloudflareEmailHandle } from "./entry/email.ts"
import { CloudflareFetchHandle } from "./entry/fetch.ts"
import { CloudflareQueueHandle } from "./entry/queue.ts"
import { CloudflareScheduledHandle } from "./entry/scheduled.ts"

export const make = <Env extends Record<string, unknown>>(handles: {
  fetch?: Layer.Layer<CloudflareFetchHandle, never, never> | undefined
  queue?: Layer.Layer<CloudflareQueueHandle, never, never>
  scheduled?: Layer.Layer<CloudflareScheduledHandle, never, never>
  email?: Layer.Layer<CloudflareEmailHandle, never, never>
}) => {
  const handlers: ExportedHandler<Env, unknown, unknown> = {}

  if (handles.fetch) {
    const layer = handles.fetch
    handlers.fetch = (request, env, ctx) => {
      return CloudflareFetchHandle.run(
        { request: request as any, env, context: ctx },
        layer
      ) as unknown as Promise<Response>
    }
  }

  if (handles.queue) {
    const layer = handles.queue
    handlers.queue = (batch, env, ctx) => {
      return CloudflareQueueHandle.run(batch, env, ctx, layer)
    }
  }

  if (handles.scheduled) {
    const layer = handles.scheduled
    handlers.scheduled = (controller, env, ctx) => {
      return CloudflareScheduledHandle.run(controller, env, ctx, layer)
    }
  }

  if (handles.email) {
    const layer = handles.email
    handlers.email = (message, env, ctx) => {
      return CloudflareEmailHandle.run(message, env, ctx, layer)
    }
  }

  return handlers
}

export * from "./entry/email.ts"
export * from "./entry/fetch.ts"
export * from "./entry/queue.ts"
export * from "./entry/scheduled.ts"

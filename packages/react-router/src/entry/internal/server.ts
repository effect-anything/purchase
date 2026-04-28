import type * as ManagedRuntime from "effect/ManagedRuntime"
import type * as Tracer from "effect/Tracer"
import type { ReactNode } from "react"
import type { ActionFunctionArgs, AppLoadContext, EntryContext, LoaderFunctionArgs } from "react-router"

import * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import { identity } from "effect/Function"
import { isbot } from "isbot"

export interface PlatformConfig {
  runtime: "node" | "cloudflare-workers"
  component: (options: { context: EntryContext; loadContext: AppLoadContext; request: Request }) => ReactNode
  render: (options: {
    children: ReactNode
    isBot: boolean
    request: Request
    responseHeaders: Headers
    responseStatusCode: number
    headers?: Record<string, string> | undefined
    timeout: number
  }) => Promise<Response>
}

export interface UserConfig {
  headers?: Record<string, string> | undefined
  timeout?: number | undefined
  wrapper?:
    | (({
        children,
        request,
        context,
        loadContext
      }: {
        children: ReactNode
        request: Request
        context: EntryContext
        loadContext: AppLoadContext
      }) => Promise<ReactNode>)
    | undefined
}

export function makeServer({ component, render }: PlatformConfig) {
  return ({ timeout, wrapper, headers }: UserConfig = {}) =>
    async function handleRequest(
      request: Request,
      responseStatusCode: number,
      responseHeaders: Headers,
      context: EntryContext,
      loadContext: AppLoadContext & {
        runtime?: ManagedRuntime.ManagedRuntime<never, never> | undefined
        globalHandleRequestTraceSpan?: Tracer.AnySpan | undefined
      }
    ) {
      const parentRequestHandleTraceSpace = loadContext?.globalHandleRequestTraceSpan
      const renderId = context.staticHandlerContext._deepestRenderedBoundaryId ?? "root"
      const requestTimeout = timeout || 10_000

      // Check if this is a SPA prerender request (build time)
      // During SPA prerender, loadContext.runtime is not available
      const isSpaPrerender = request.headers.get("X-React-Router-SPA-Mode") === "yes"

      // If no runtime is available (SPA prerender), render directly without Effect
      if (!loadContext?.runtime) {
        if (!isSpaPrerender) {
          throw new Error("Runtime context is not available. This requires a server runtime.")
        }

        // Simple render for SPA prerender - no Effect runtime needed
        const content = component({ context, loadContext, request })
        const isBot = isbot(request.headers.get("user-agent"))

        responseHeaders.set("Content-Type", "text/html")
        if (headers) {
          for (const [key, value] of Object.entries(headers)) {
            responseHeaders.set(key, value)
          }
        }

        return render({
          children: content,
          isBot,
          headers,
          request,
          responseHeaders,
          responseStatusCode,
          timeout: requestTimeout
        })
      }

      return loadContext.runtime
        .runPromise(
          Effect.gen(function* () {
            const content = component({ context, loadContext, request })
            const children = wrapper
              ? yield* Effect.promise(() =>
                  wrapper({
                    children: content,
                    request,
                    context,
                    loadContext
                  })
                ).pipe(Effect.withSpan("ReactRouter.wrapper"))
              : content

            const isBot = isbot(request.headers.get("user-agent"))

            const response: Response = yield* Effect.promise(() =>
              render({
                children,
                isBot,
                headers,
                request,
                responseHeaders,
                responseStatusCode,
                timeout: requestTimeout
              })
            )

            const internalError = response.headers.get("X-Error-Status")

            if (internalError) {
              return new Response(response.body, {
                status: parseInt(internalError),
                statusText: response.statusText,
                headers: response.headers
              })
            }

            return response
          }).pipe(
            Effect.exit,
            Effect.withSpan(`ReactRouter.render-${renderId}`),
            parentRequestHandleTraceSpace ? Effect.withParentSpan(parentRequestHandleTraceSpace) : identity
          )
        )
        .then((exit) =>
          Exit.match(exit, {
            onFailure: (cause) => Promise.reject(Cause.squash(cause)),
            onSuccess: identity
          })
        )
    }
}

const ignoreErrors = [400, 401, 403, 404, 429, 499]

export function handleError(error: unknown, { request }: LoaderFunctionArgs | ActionFunctionArgs) {
  if (request.signal.aborted) return
  let status = error instanceof Response ? error.status : (error as any)?.status
  if (ignoreErrors.includes(status)) return

  if (error instanceof Error) {
    if ((error as { _tag?: string })?._tag === "RatelimitError") return

    console.log(`Handle Error: ${request.url}`, error)
  }
}

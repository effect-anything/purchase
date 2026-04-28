import type { i18n as I18nInstance } from "i18next"

import { I18nServerWrapper } from "@effect-x/i18n/server-wrapper"
import { handleError, makeServer } from "./internal/server.ts"
import { createReadableStreamFromReadable } from "@react-router/node"
// @ts-ignore
import { PassThrough } from "node:stream"
import { createElement } from "react"
import { renderToPipeableStream } from "react-dom/server"
import { type AppLoadContext, ServerRouter } from "react-router"

export const make = makeServer({
  runtime: "node",
  component: ({ context, loadContext, request }) => {
    // During SPA prerender, skip I18nServerWrapper as i18n context is not available
    // i18n will be loaded client-side during hydration
    const isSpaPrerender = request.headers.get("X-React-Router-SPA-Mode") === "yes"

    if (isSpaPrerender) {
      return createElement(ServerRouter, { context, url: request.url })
    }

    const i18n = (loadContext as AppLoadContext & { i18n?: I18nInstance }).i18n

    if (!i18n) {
      throw new Error("i18n not found in load context")
    }

    return createElement(I18nServerWrapper, {
      children: createElement(ServerRouter, { context, url: request.url }),
      i18n
    })
  },
  render: ({ children, isBot, responseHeaders, responseStatusCode, timeout, request, headers }) => {
    return new Promise<Response>((resolve, reject) => {
      const callbackName = isBot ? "onAllReady" : "onShellReady"
      responseHeaders.set("Content-Type", "text/html")

      if (headers) {
        for (const [key, value] of Object.entries(headers)) {
          responseHeaders.set(key, value)
        }
      }

      const { abort, pipe } = renderToPipeableStream(children, {
        [callbackName]: () => {
          const body = new PassThrough()
          const stream = createReadableStreamFromReadable(body)

          const response = new Response(stream, {
            headers: responseHeaders,
            status: responseStatusCode
          })

          resolve(response)

          pipe(body)
        },
        onError: (error: any) => {
          if (error?.status) {
            responseHeaders.set("X-Error-Status", error.status)
          }
        },
        onShellError: (error: any) => {
          reject(error)
        }
      })

      const handleAbort = () => {
        request.signal.removeEventListener("abort", handleAbort)
        abort()
      }

      request.signal.addEventListener("abort", handleAbort)
      setTimeout(abort, timeout)
    })
  }
})

export { handleError }

import type { i18n as I18nInstance } from "i18next"

import { I18nServerWrapper } from "@effect-x/i18n/server-wrapper"
import { handleError, makeServer } from "./internal/server.ts"
import { createElement } from "react"
// @ts-ignore
import { type ReactDOMServerReadableStream, renderToReadableStream } from "react-dom/server.edge"
import { type AppLoadContext, ServerRouter } from "react-router"

export const make = makeServer({
  runtime: "cloudflare-workers",
  component: ({ context, loadContext, request }) => {
    const i18n = (loadContext as AppLoadContext & { i18n?: I18nInstance | undefined }).i18n

    if (!i18n) {
      throw new Error("i18n not found in load context")
    }

    return createElement(I18nServerWrapper, {
      children: createElement(ServerRouter, { context, url: request.url }),
      i18n
    })
  },
  render: ({ children, isBot, responseHeaders, responseStatusCode, headers, request }) => {
    return new Promise<Response>((resolve, reject) => {
      responseHeaders.set("Content-Type", "text/html")

      if (headers) {
        for (const [key, value] of Object.entries(headers)) {
          responseHeaders.set(key, value)
        }
      }

      renderToReadableStream(children, {
        signal: request.signal,
        onError: (error: any) => {
          if (error?.status) {
            responseHeaders.set("X-Error-Status", error.status)
          }

          reject(error)
        }
      })
        .then((body: ReactDOMServerReadableStream) => {
          if (isBot) {
            return body.allReady.then(() => body)
          }

          return body
        })
        .then((body: ReactDOMServerReadableStream) => {
          const response = new Response(body, {
            headers: responseHeaders,
            status: responseStatusCode
          })

          resolve(response)
        })
    })
  }
})

export { handleError }

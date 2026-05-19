import * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientRequest from "@effect/platform/HttpClientRequest"
import * as HttpClientResponse from "@effect/platform/HttpClientResponse"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Schema from "effect/Schema"

import { formatUnknownBodyMessage, ProviderClientParseError, ProviderClientUnknownError } from "./errors.ts"
import {
  type AnyOperation,
  type OperationContext,
  type OperationError,
  type OperationInput,
  type OperationOutput
} from "./operation.ts"
import { makeBody, splitRequestParts } from "./request.ts"

export interface ProviderClientConfig {
  readonly provider: string
  readonly baseUrl: string
  readonly headers?: Record<string, string | undefined>
  readonly transientRetry?: boolean
  readonly matchError?: (args: {
    readonly status: number
    readonly body: unknown
    readonly message?: string | undefined
  }) => OperationError | undefined
}

export interface ProviderClient {
  readonly request: <Op extends AnyOperation>(
    operation: Op,
    input: OperationInput<Op>
  ) => Effect.Effect<OperationOutput<Op>, OperationError, OperationContext<Op>>
  readonly make: <Op extends AnyOperation>(
    operation: Op
  ) => (input: OperationInput<Op>) => Effect.Effect<OperationOutput<Op>, OperationError, OperationContext<Op>>
}

export const makeProviderClient = (httpClient: HttpClient.HttpClient, config: ProviderClientConfig): ProviderClient => {
  const client = httpClient.pipe(
    HttpClient.mapRequest((request) => {
      let next = request.pipe(HttpClientRequest.prependUrl(config.baseUrl), HttpClientRequest.acceptJson)
      for (const [key, value] of Object.entries(config.headers ?? {})) {
        if (value !== undefined) {
          next = next.pipe(HttpClientRequest.setHeader(key, value))
        }
      }
      return next
    })
  )

  const readBody = (response: HttpClientResponse.HttpClientResponse) =>
    response.json.pipe(
      Effect.catchAll(() => response.text),
      Effect.catchAll(() => Effect.succeed(undefined))
    )

  const decodeOutput = <Op extends AnyOperation>(operation: Op, response: HttpClientResponse.HttpClientResponse) =>
    pipe(
      response,
      HttpClientResponse.schemaBodyJson(operation.outputSchema),
      Effect.catchTag("ParseError", (cause) =>
        Effect.flatMap(readBody(response), (body) =>
          Effect.fail(
            new ProviderClientParseError({
              provider: config.provider,
              operation: operation.id,
              body,
              cause
            })
          )
        )
      )
    )

  const failStatus = (response: HttpClientResponse.HttpClientResponse) =>
    Effect.flatMap(readBody(response), (body) => {
      const message = extractMessage(body)
      const matched = config.matchError?.({ status: response.status, body, message })
      return Effect.fail(
        matched ??
          new ProviderClientUnknownError({
            provider: config.provider,
            status: response.status,
            message: message ?? formatUnknownBodyMessage(config.provider, response.status),
            body
          })
      )
    })

  const request = <Op extends AnyOperation>(
    operation: Op,
    input: OperationInput<Op>
  ): Effect.Effect<OperationOutput<Op>, OperationError, OperationContext<Op>> =>
    Effect.gen(function* () {
      const decoded = yield* Schema.decodeUnknown(operation.inputSchema)(input).pipe(
        Effect.mapError(
          (cause) =>
            new ProviderClientParseError({
              provider: config.provider,
              operation: operation.id,
              body: input,
              cause
            })
        )
      )
      const parts = splitRequestParts(operation.path, decoded as Record<string, unknown>, operation)
      const options = {
        urlParams: parts.query,
        body: operation.method === "GET" ? undefined : makeBody(operation.contentType, parts.body)
      }

      const response = yield* requestByMethod(client, operation.method, parts.path, options as never)
      return yield* operation.status.includes(response.status)
        ? decodeOutput(operation, response)
        : failStatus(response)
    })

  return {
    request,
    make: (operation) => (input) => request(operation, input)
  }
}

export const makeProviderClientEffect = (
  config: ProviderClientConfig
): Effect.Effect<ProviderClient, never, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    return makeProviderClient(yield* HttpClient.HttpClient, config)
  })

const requestByMethod = (
  client: HttpClient.HttpClient,
  method: AnyOperation["method"],
  path: string,
  options: never
) => {
  switch (method) {
    case "DELETE":
      return client.del(path, options)
    case "GET":
      return client.get(path, options)
    case "PATCH":
      return client.patch(path, options)
    case "POST":
      return client.post(path, options)
    case "PUT":
      return client.put(path, options)
  }
}

const extractMessage = (body: unknown): string | undefined => {
  if (typeof body === "string") {
    return body
  }
  if (typeof body !== "object" || body === null) {
    return undefined
  }

  const record = body as Record<string, unknown>
  if (typeof record.message === "string") {
    return record.message
  }
  if (typeof record.error === "string") {
    return record.error
  }
  if (
    typeof record.error === "object" &&
    record.error !== null &&
    typeof (record.error as Record<string, unknown>).message === "string"
  ) {
    return (record.error as Record<string, string>).message
  }

  return undefined
}

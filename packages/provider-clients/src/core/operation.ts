import type * as HttpClientError from "@effect/platform/HttpClientError"

import type * as Effect from "effect/Effect"
import type * as Schema from "effect/Schema"

import type { ProviderClientParseError, ProviderClientUnknownError } from "./errors.ts"

export type HttpMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT"

export interface Operation<A, I, R, O, OI, OR> {
  readonly id: string
  readonly method: HttpMethod
  readonly path: string
  readonly inputSchema: Schema.Schema<A, I, R>
  readonly outputSchema: Schema.Schema<O, OI, OR>
  readonly status: ReadonlyArray<number>
  readonly contentType: "form" | "json"
  readonly pathParams?: ReadonlyArray<string>
  readonly queryParams?: ReadonlyArray<string>
  readonly bodyParams?: ReadonlyArray<string>
}

export type AnyOperation = Operation<any, any, any, any, any, any>

export type OperationInput<T> =
  T extends Operation<infer A, infer _I, infer _R, infer _O, infer _OI, infer _OR> ? A : never
export type OperationOutput<T> =
  T extends Operation<infer _A, infer _I, infer _R, infer O, infer _OI, infer _OR> ? O : never
export type OperationContext<T> =
  T extends Operation<infer _A, infer _I, infer R, infer _O, infer _OI, infer OR> ? R | OR : never

export type OperationError =
  | HttpClientError.HttpClientError
  | ProviderClientParseError
  | ProviderClientUnknownError
  | { readonly _tag: string }

export type OperationEffect<T extends AnyOperation> = Effect.Effect<
  OperationOutput<T>,
  OperationError,
  OperationContext<T>
>

export const defineOperation = <A, I, R, O, OI, OR>(operation: Operation<A, I, R, O, OI, OR>) => operation

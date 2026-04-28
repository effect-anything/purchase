import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { pipe } from "effect/Function"
import type * as ManagedRuntime from "effect/ManagedRuntime"
import * as V from "vitest"

export class Testing extends Context.Tag("@testing:runner-hooks")<
  Testing,
  {
    beforeEach: Effect.Effect<any, any, any>
    afterEach: Effect.Effect<any, any, any>
    mapEffect: <_A, E, R>(
      effect: Effect.Effect<any, any, any>,
      managedRuntime: ManagedRuntime.ManagedRuntime<R, E>
    ) => Effect.Effect<any, any, any>
  }
>() {}

export const expect = {
  success: Effect.tap<Response, void>((res) => {
    V.expect(res.ok).toBeTruthy()
    V.expect(res.status).toBe(200)
  }),
  jsonSuccess: Effect.tap<Response, void>((res) =>
    pipe(
      Effect.promise(() => res.clone().json()),
      Effect.tap((json: any) => {
        V.expect(json).toBeDefined()
      })
    )
  ),
  status: (status: number) => Effect.tap<Response, void>((res) => Effect.sync(() => V.expect(res.status).toBe(status))),

  redirect: Effect.tap<Response, void>((res) => {
    V.expect(res.ok).toBeFalsy()
    V.expect(res.status).toBe(302)
  }),
  notFound: Effect.tap<Response, void>((res) => {
    V.expect(res.ok).toBeFalsy()
    V.expect(res.status).toBe(404)
  }),

  failure: Effect.tap<Response, void>((res) => {
    V.expect(res.ok).toBeFalsy()
    V.expect(res.status).not.toBe(200)
  }),
  formDataParseError: Effect.tap<Response, void>((res) => {
    V.expect(res.ok).toBeFalsy()
    V.expect(res.status).toBe(400)
  }),
  bodyParseError: Effect.tap<Response, void>((res) => {
    V.expect(res.ok).toBeFalsy()
    V.expect(res.status).toBe(400)
  }),
  searchParamsParseError: Effect.tap<Response, void>((res) => {
    V.expect(res.ok).toBeFalsy()
    V.expect(res.status).toBe(400)
  }),
  internalServerError: Effect.tap<Response, void>((res) => {
    V.expect(res.ok).toBeFalsy()
    V.expect(res.status).toBe(500)
  }),
  appError: Effect.tap<Response, void>((res) => {
    V.expect(res.ok).toBeFalsy()
    V.expect(res.status).toBe(500)
  }),
  badRequestError: Effect.tap<Response, void>((res) => {
    V.expect(res.ok).toBeFalsy()
    V.expect(res.status).toBe(400)
  }),
  unauthorizedError: Effect.tap<Response, void>((res) => {
    V.expect(res.ok).toBeFalsy()
    V.expect(res.status).toBe(401)
  }),
  forbiddenError: Effect.tap<Response, void>((res) => {
    V.expect(res.ok).toBeFalsy()
    V.expect(res.status).toBe(403)
  })
}

// ----- api -----

export const withApi =
  <A, E, R, MA, ME = never, MR = never>(layer: Layer.Layer<A, E, R>, middleware?: Layer.Layer<MA, ME, MR>) =>
  <EA, EE, ER>(effect: Effect.Effect<EA, EE, ER>) =>
    effect.pipe(
      Effect.provide(
        HttpApiBuilder.serve().pipe(Layer.provide([layer, middleware || Layer.empty, NodeHttpServer.layerTest]))
      )
    )

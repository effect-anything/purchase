import { describe, expect, it } from "@effect/vitest"
import * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"

import { findCookieByName, removeCookieByName } from "../src/cookie.ts"
import {
  ReactRouterBodyParseError,
  ReactRouterFormDataParseError,
  ReactRouterParamsParseError,
  ReactRouterSearchParamsParseError
} from "../src/errors/server.ts"
import {
  context as contextEffect,
  Cookies,
  getBody,
  getFormData,
  getFormDataEntries,
  getParams,
  getSearchParams,
  Headers as RequestHeaders,
  makeRequestContext,
  redirect,
  redirectDocument,
  replace,
  request as requestEffect,
  RequestContext
} from "../src/request.ts"

const makeLoadContext = () =>
  ({
    env: {},
    caches: {} as CacheStorage,
    waitUntil: () => undefined,
    passThroughOnException: () => undefined,
    runtime: undefined
  }) as const

const makeArgs = ({
  request = new Request("http://localhost/test", {
    headers: {
      Cookie: "theme=dark; token=part.one=two"
    }
  }),
  params = { id: "123" },
  context = makeLoadContext(),
  headers = new globalThis.Headers({
    "x-test": "1"
  })
}: {
  request?: Request
  params?: Record<string, string>
  context?: ReturnType<typeof makeLoadContext>
  headers?: globalThis.Headers
} = {}) => ({
  request,
  params,
  context,
  headers
})

const provideRequestContext = <A, E>(
  effect: Effect.Effect<A, E>,
  options?: Parameters<typeof makeArgs>[0]
): Effect.Effect<A, E> => pipe(effect, Effect.provideService(RequestContext, makeRequestContext(makeArgs(options))))

const runRequestEffect = <A, E>(effect: Effect.Effect<A, E>, options?: Parameters<typeof makeArgs>[0]) =>
  Effect.runPromise(provideRequestContext(effect, options))

const runRequestExit = <A, E>(effect: Effect.Effect<A, E>, options?: Parameters<typeof makeArgs>[0]) =>
  Effect.runPromiseExit(provideRequestContext(effect, options))

describe("react-router cookie helpers", () => {
  it("finds cookies by name and preserves values that contain equals signs", () => {
    expect(findCookieByName("theme", "theme=dark; token=part.one=two")).toBe("dark")
    expect(findCookieByName("token", "theme=dark; token=part.one=two")).toBe("part.one=two")
    expect(findCookieByName("missing", "theme=dark; token=part.one=two")).toBeUndefined()
  })

  it("removes a cookie by name without disturbing the rest of the header", () => {
    expect(removeCookieByName("theme", "theme=dark; token=part.one=two; session=abc")).toBe(
      " token=part.one=two; session=abc"
    )
    expect(removeCookieByName("missing", "theme=dark; token=part.one=two")).toBe("theme=dark; token=part.one=two")
  })
})

describe("react-router request context", () => {
  it.effect("injects the request and load context services", () =>
    Effect.gen(function* () {
      const request = new Request("http://localhost/users/123?tab=profile", {
        headers: {
          Cookie: "theme=dark; token=part.one=two"
        }
      })
      const context = makeLoadContext()

      const result = yield* Effect.all({
        request: requestEffect,
        context: contextEffect
      }).pipe((effect) =>
        provideRequestContext(effect, {
          request,
          params: { id: "123" },
          context
        })
      )

      expect(result.request.url).toBe("http://localhost/users/123?tab=profile")
      expect(result.context).toBe(context)
    })
  )

  it("captures request cookies, params, and response headers in the raw request context", () => {
    const request = new Request("http://localhost/users/123?tab=profile", {
      headers: {
        Cookie: "theme=dark; token=part.one=two"
      }
    })
    const headers = new globalThis.Headers({
      "x-response": "ok"
    })

    const result = makeRequestContext({
      request,
      params: {
        id: "123"
      },
      context: makeLoadContext(),
      headers
    })

    expect(result.request).toBe(request)
    expect(result.params).toEqual({
      id: "123"
    })
    expect(result.stub.cookies.raw).toBe("theme=dark; token=part.one=two")
    expect(result.stub.cookies.records.get("theme")).toBe("dark")
    expect(result.stub.cookies.records.get("token")).toBe("part.one=two")
    expect(result.stub.headers).toBe(headers)
  })
})

describe("react-router request parsing helpers", () => {
  it("reads form data entries from the current request", async () => {
    const formData = new FormData()
    formData.set("email", "test@example.com")
    formData.set("remember", "yes")

    const request = new Request("http://localhost/test", {
      method: "POST",
      body: formData
    })

    await expect(runRequestEffect(getFormDataEntries, { request })).resolves.toEqual({
      email: "test@example.com",
      remember: "yes"
    })
  })

  it("maps form data read failures to ReactRouterFormDataParseError", async () => {
    const request = {
      headers: new globalThis.Headers(),
      formData: () => Promise.reject(new Error("invalid multipart body")),
      url: "http://localhost/test"
    } as unknown as Request

    const exit = await runRequestExit(getFormDataEntries, { request })

    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      expect(Cause.squash(exit.cause)).toBeInstanceOf(ReactRouterFormDataParseError)
    }
  })

  it("decodes form data with a schema and maps parse failures to ReactRouterFormDataParseError", async () => {
    const formData = new FormData()
    formData.set("email", "test@example.com")

    const request = new Request("http://localhost/test", {
      method: "POST",
      body: formData
    })

    const schema = Schema.Struct({
      email: Schema.String
    })

    await expect(runRequestEffect(getFormData(schema), { request })).resolves.toEqual({
      email: "test@example.com"
    })

    const missingFieldSchema = Schema.Struct({
      email: Schema.String,
      password: Schema.String
    })

    const exit = await runRequestExit(getFormData(missingFieldSchema), { request })

    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      expect(Cause.squash(exit.cause)).toBeInstanceOf(ReactRouterFormDataParseError)
    }
  })

  it("decodes JSON bodies and maps read failures to ReactRouterBodyParseError", async () => {
    const request = new Request("http://localhost/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "moo"
      })
    })

    const schema = Schema.Struct({
      name: Schema.String
    })

    await expect(runRequestEffect(getBody(schema), { request })).resolves.toEqual({
      name: "moo"
    })

    const invalidRequest = {
      headers: new globalThis.Headers(),
      json: () => Promise.reject(new Error("invalid json")),
      url: "http://localhost/test"
    } as unknown as Request

    const exit = await runRequestExit(getBody(schema), { request: invalidRequest })

    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      expect(Cause.squash(exit.cause)).toBeInstanceOf(ReactRouterBodyParseError)
    }
  })

  it("decodes search params and params with schema-aware errors", async () => {
    const request = new Request("http://localhost/test?page=2&tab=profile")

    const searchSchema = Schema.Struct({
      page: Schema.String,
      tab: Schema.String
    })

    await expect(runRequestEffect(getSearchParams(searchSchema), { request })).resolves.toEqual({
      page: "2",
      tab: "profile"
    })

    const invalidSearchExit = await runRequestExit(
      getSearchParams(
        Schema.Struct({
          page: Schema.String,
          sort: Schema.String
        })
      ),
      { request }
    )

    expect(Exit.isFailure(invalidSearchExit)).toBe(true)
    if (Exit.isFailure(invalidSearchExit)) {
      expect(Cause.squash(invalidSearchExit.cause)).toBeInstanceOf(ReactRouterSearchParamsParseError)
    }

    const paramsSchema = Schema.Struct({
      id: Schema.String
    })

    await expect(runRequestEffect(getParams(paramsSchema))).resolves.toEqual({
      id: "123"
    })

    const invalidParamsExit = await runRequestExit(
      getParams(
        Schema.Struct({
          slug: Schema.String
        })
      )
    )

    expect(Exit.isFailure(invalidParamsExit)).toBe(true)
    if (Exit.isFailure(invalidParamsExit)) {
      expect(Cause.squash(invalidParamsExit.cause)).toBeInstanceOf(ReactRouterParamsParseError)
    }
  })
})

describe("react-router request mutation helpers", () => {
  it.effect("reads, mutates, and serializes cookies", () =>
    Effect.gen(function* () {
      const result = yield* Effect.gen(function* () {
        expect(yield* Cookies.fromHeader).toBe("theme=dark; token=part.one=two")
        expect(yield* Cookies.get("theme")).toBe("dark")
        expect(yield* Cookies.get("missing", () => "fallback")).toBe("fallback")

        yield* Cookies.set("session", "next", {
          httpOnly: true,
          path: "/"
        })
        yield* Cookies.delete("theme")

        return yield* Cookies.serialize
      }).pipe(provideRequestContext)

      expect(result).toContain("session=next; Path=/; HttpOnly")
      expect(result).toContain("theme=")
    })
  )

  it.effect("mutates and serializes response headers", () =>
    Effect.gen(function* () {
      const result = yield* Effect.gen(function* () {
        yield* RequestHeaders.set("x-app", "moo")
        yield* RequestHeaders.append(["set-cookie", "a=1"], ["set-cookie", "b=2"])

        expect(Option.getOrUndefined(yield* RequestHeaders.get("x-app"))).toBe("moo")
        expect(yield* RequestHeaders.has("set-cookie")).toBe(true)
        expect(yield* RequestHeaders.keys).toContain("x-app")
        expect(yield* RequestHeaders.values).toContain("moo")

        return yield* RequestHeaders.entries
      }).pipe(provideRequestContext)

      expect(result).toEqual(
        expect.arrayContaining([
          ["set-cookie", "a=1"],
          ["set-cookie", "b=2"],
          ["x-app", "moo"],
          ["x-test", "1"]
        ])
      )
    })
  )
})

describe("react-router redirect helpers", () => {
  const expectRedirect = async (
    effect: Effect.Effect<void>,
    expected: {
      location: string
      status: number
      extraHeaders?: Record<string, string>
    }
  ) => {
    const exit = await runRequestExit(effect)

    expect(Exit.isFailure(exit)).toBe(true)
    if (!Exit.isFailure(exit)) {
      return
    }

    const error = Cause.squash(exit.cause) as any
    expect(error.response).toBeInstanceOf(Response)
    expect(error.response.status).toBe(expected.status)
    expect(error.response.headers.get("Location")).toBe(expected.location)

    for (const [key, value] of Object.entries(expected.extraHeaders ?? {})) {
      expect(error.response.headers.get(key)).toBe(value)
    }
  }

  it("throws redirect responses with the expected Remix headers", async () => {
    await expectRedirect(redirect("/signin", 303), {
      location: "/signin",
      status: 303
    })

    await expectRedirect(redirectDocument("/docs", 307), {
      location: "/docs",
      status: 307,
      extraHeaders: {
        "X-Remix-Reload-Document": "true"
      }
    })

    await expectRedirect(replace("/settings", 308), {
      location: "/settings",
      status: 308,
      extraHeaders: {
        "X-Remix-Replace": "true"
      }
    })
  })
})

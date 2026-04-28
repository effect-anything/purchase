import { BadRequestError, InternalServerError, NotFoundError, RatelimitError } from "@effect-x/errors/server"
import { describe, expect, it, vi } from "@effect/vitest"
import * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as ParseResult from "effect/ParseResult"
import * as Schema from "effect/Schema"

import { handleError, makeServer, type PlatformConfig } from "../src/entry/internal/server.ts"
import { isReactRouterServerError, isServerError } from "../src/errors/common.ts"
import { ReactRouterFormDataParseError, transformReactRouterError } from "../src/errors/server.ts"
import { Cookies, redirect } from "../src/request.ts"
import { action, loader } from "../src/request-handle.ts"

const makeRuntime = () => ({
  runPromise: <A, E>(effect: Effect.Effect<A, E>, options?: { signal?: AbortSignal }) =>
    Effect.runPromise(effect, options)
})

const makeArgs = (
  options: {
    request?: Request
    params?: Record<string, string>
    runtime?: ReturnType<typeof makeRuntime> | undefined
    context?: Record<string, unknown>
  } = {}
) => {
  const hasRuntime = Object.prototype.hasOwnProperty.call(options, "runtime")

  return {
    request: options.request ?? new Request("http://localhost/test"),
    params: options.params ?? {},
    context: {
      env: {},
      waitUntil: () => undefined,
      passThroughOnException: () => undefined,
      runtime: hasRuntime ? options.runtime : makeRuntime(),
      ...options.context
    }
  } as any
}

const toDataWithResponseInit = async (promise: Promise<unknown>) => (await promise) as any

describe("react-router server error helpers", () => {
  it("recognizes public server errors, internal router errors, and status-tagged Effect errors", () => {
    expect(isServerError(new NotFoundError({ message: "missing route" }))).toBe(true)
    expect(
      isServerError(
        new ReactRouterFormDataParseError({
          cause: new ParseResult.ParseError({
            issue: new ParseResult.Type(Schema.String.ast, 123)
          })
        })
      )
    ).toBe(true)
    expect(
      isServerError({
        _tag: "RuntimeException",
        message: "boom",
        status: 503
      })
    ).toBe(true)
    expect(
      isServerError({
        _tag: "RuntimeException",
        message: "boom"
      })
    ).toBe(false)
    expect(isServerError(new Error("boom"))).toBe(false)
  })

  it("recognizes only @react-router:* errors as react-router server errors", () => {
    expect(
      isReactRouterServerError(
        new ReactRouterFormDataParseError({
          cause: new ParseResult.ParseError({
            issue: new ParseResult.Type(Schema.String.ast, 123)
          })
        })
      )
    ).toBe(true)
    expect(isReactRouterServerError(new NotFoundError({ message: "missing route" }))).toBe(false)
  })

  it("maps parse failures to BadRequestError and leaves non-parse failures unchanged", () => {
    const parseExit = Effect.runSyncExit(
      Schema.decodeUnknown(
        Schema.Struct({
          email: Schema.String
        })
      )({})
    )

    expect(Exit.isFailure(parseExit)).toBe(true)
    if (Exit.isFailure(parseExit)) {
      const transformed = transformReactRouterError(parseExit.cause as any)

      expect(transformed._tag).toBe("Fail")
      if (transformed._tag === "Fail") {
        const error = transformed.error as BadRequestError

        expect(error).toBeInstanceOf(BadRequestError)
        expect(error.message).toBe("Invalid request")
        expect(error.issues.length).toBeGreaterThan(0)
      }
    }

    const parseError = new ReactRouterFormDataParseError({
      cause: new ParseResult.ParseError({
        issue: new ParseResult.Type(Schema.Struct({ email: Schema.String }).ast, {})
      })
    })
    const wrapped = transformReactRouterError(Cause.fail(parseError) as any)

    expect(wrapped._tag).toBe("Fail")
    if (wrapped._tag === "Fail") {
      expect(wrapped.error).toBeInstanceOf(BadRequestError)
      expect(wrapped.error.message).toBe("Invalid request")
    }

    const original = Cause.fail(new InternalServerError({ message: "boom" }))
    expect(transformReactRouterError(original as any)).toBe(original)
  })
})

describe("react-router request handlers", () => {
  it("returns DataWithResponseInit for successful loaders and appends committed cookies", async () => {
    const handle = loader(
      Effect.gen(function* () {
        yield* Cookies.set("session", "next", {
          path: "/"
        })

        return {
          ok: true
        }
      }),
      {
        name: "load-profile"
      }
    )

    const result = await toDataWithResponseInit(handle(makeArgs()))

    expect(result.type).toBe("DataWithResponseInit")
    expect(result.data).toEqual({
      success: true,
      result: {
        ok: true
      }
    })
    expect(result.init.headers.get("Set-Cookie")).toContain("session=next")
  })

  it("returns encoded business failures for actions", async () => {
    const handle = action(Effect.fail(new BadRequestError({ message: "invalid form" })), {
      name: "submit-form"
    })

    const result = await toDataWithResponseInit(
      handle(
        makeArgs({
          request: new Request("http://localhost/test", {
            method: "POST"
          })
        })
      )
    )

    expect(result.type).toBe("DataWithResponseInit")
    expect(result.data.success).toBe(false)
    expect(result.data.error).toMatchObject({
      _tag: "BadRequestError",
      message: "invalid form",
      status: 400
    })
    expect(result.init.status).toBe(400)
  })

  it("encodes unexpected failures as InternalServerError responses", async () => {
    const handle = loader(Effect.die(new Error("unexpected boom")), {
      name: "load-crash"
    })

    const result = await toDataWithResponseInit(handle(makeArgs()))

    expect(result.data.success).toBe(false)
    expect(result.data.error).toMatchObject({
      _tag: "InternalServerError",
      message: "unexpected boom"
    })
    expect(result.init.status).toBe(500)
  })

  it("passes Response results through unchanged", async () => {
    const handle = loader(
      Effect.succeed(
        new Response("ready", {
          status: 201,
          headers: {
            "x-body": "1"
          }
        })
      ),
      {
        name: "load-response"
      }
    )

    const response = (await handle(makeArgs())) as unknown as Response

    expect(response).toBeInstanceOf(Response)
    expect(response.status).toBe(201)
    expect(response.headers.get("x-body")).toBe("1")
    await expect(response.text()).resolves.toBe("ready")
  })

  it("throws redirect responses and preserves committed cookies", async () => {
    const handle = loader(
      Effect.gen(function* () {
        yield* Cookies.set("session", "redirecting", {
          path: "/"
        })
        yield* redirect("/signin", 303)
        return {
          ok: true
        }
      }),
      {
        name: "load-redirect"
      }
    )

    let error: unknown
    try {
      await handle(makeArgs())
    } catch (cause) {
      error = cause
    }

    expect(error).toBeInstanceOf(Response)
    const response = error as Response
    expect(response.status).toBe(303)
    expect(response.headers.get("Location")).toBe("/signin")
    expect(response.headers.get("Set-Cookie")).toContain("session=redirecting")
  })

  it("returns a minimal SPA prerender payload when runtime is missing in SPA mode", async () => {
    const handle = loader(Effect.succeed({ ok: true }))

    const result = await handle(
      makeArgs({
        request: new Request("http://localhost/test", {
          headers: {
            "X-React-Router-SPA-Mode": "yes"
          }
        }),
        runtime: undefined as any
      })
    )

    expect(result).toEqual({
      success: true,
      result: {}
    })
  })

  it("throws a clear error when a non-SPA loader runs without a runtime", async () => {
    const handle = loader(Effect.succeed({ ok: true }))

    expect(() =>
      handle(
        makeArgs({
          runtime: undefined as any
        })
      )
    ).toThrow("Runtime context is not available. This loader requires a server runtime.")
  })
})

describe("react-router server entry handling", () => {
  it("uses the runtime path, wrapper, headers, and bot detection during rendering", async () => {
    const component = vi.fn(({ request }: { request: Request }) => `content:${request.url}`)
    const wrapper = vi.fn(async ({ children }: { children: unknown }) => `wrapped:${String(children)}`)
    const render = vi.fn(
      async ({
        children,
        isBot,
        responseHeaders,
        responseStatusCode,
        timeout,
        headers: customHeaders
      }: Parameters<PlatformConfig["render"]>[0]) => {
        const finalHeaders = new Headers(responseHeaders)
        finalHeaders.set("Content-Type", "text/html")
        for (const [key, value] of Object.entries(customHeaders ?? {})) {
          finalHeaders.set(key, value)
        }

        return new Response(JSON.stringify({ children, isBot, timeout }), {
          status: responseStatusCode,
          headers: finalHeaders
        })
      }
    )

    const handle = makeServer({
      runtime: "node",
      component,
      render
    })({
      timeout: 2_500,
      headers: {
        "x-app": "moo"
      },
      wrapper
    })

    const response = await handle(
      new Request("http://localhost/robots.txt", {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
        }
      }),
      201,
      new Headers(),
      {
        staticHandlerContext: {
          _deepestRenderedBoundaryId: "root"
        }
      } as any,
      {
        runtime: makeRuntime()
      } as any
    )

    expect(component).toHaveBeenCalledTimes(1)
    expect(wrapper).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(201)
    expect(response.headers.get("Content-Type")).toBe("text/html")
    expect(response.headers.get("x-app")).toBe("moo")
    await expect(response.json()).resolves.toEqual({
      children: "wrapped:content:http://localhost/robots.txt",
      isBot: true,
      timeout: 2500
    })
  })

  it("renders SPA prerender requests without a runtime and skips the wrapper", async () => {
    const component = vi.fn(() => "spa-content")
    const wrapper = vi.fn(async ({ children }: { children: unknown }) => `wrapped:${String(children)}`)
    const render = vi.fn(
      async ({
        children,
        isBot,
        responseHeaders,
        responseStatusCode,
        timeout,
        headers: customHeaders
      }: Parameters<PlatformConfig["render"]>[0]) => {
        const finalHeaders = new Headers(responseHeaders)
        finalHeaders.set("Content-Type", "text/html")
        for (const [key, value] of Object.entries(customHeaders ?? {})) {
          finalHeaders.set(key, value)
        }

        return new Response(JSON.stringify({ children, isBot, timeout }), {
          status: responseStatusCode,
          headers: finalHeaders
        })
      }
    )

    const handle = makeServer({
      runtime: "node",
      component,
      render
    })({
      timeout: 1_500,
      headers: {
        "x-app": "spa"
      },
      wrapper
    })

    const response = await handle(
      new Request("http://localhost/spa", {
        headers: {
          "X-React-Router-SPA-Mode": "yes"
        }
      }),
      200,
      new Headers(),
      {
        staticHandlerContext: {
          _deepestRenderedBoundaryId: "root"
        }
      } as any,
      {} as any
    )

    expect(component).toHaveBeenCalledTimes(1)
    expect(wrapper).not.toHaveBeenCalled()
    expect(response.headers.get("x-app")).toBe("spa")
    await expect(response.json()).resolves.toEqual({
      children: "spa-content",
      isBot: false,
      timeout: 1500
    })
  })

  it("rewrites X-Error-Status responses and fails fast when runtime is missing outside SPA mode", async () => {
    const handle = makeServer({
      runtime: "node",
      component: () => "content",
      render: async ({ responseHeaders }: { responseHeaders: Headers }) =>
        new Response("failed", {
          status: 200,
          headers: new Headers([...responseHeaders.entries(), ["X-Error-Status", "418"]])
        })
    })()

    const rewritten = await handle(
      new Request("http://localhost/failure"),
      200,
      new Headers(),
      {
        staticHandlerContext: {
          _deepestRenderedBoundaryId: "root"
        }
      } as any,
      {
        runtime: makeRuntime()
      } as any
    )

    expect(rewritten.status).toBe(418)
    await expect(rewritten.text()).resolves.toBe("failed")

    const missingRuntime = makeServer({
      runtime: "node",
      component: () => "content",
      render: async () => new Response("ok")
    })()

    await expect(
      missingRuntime(
        new Request("http://localhost/failure"),
        200,
        new Headers(),
        {
          staticHandlerContext: {
            _deepestRenderedBoundaryId: "root"
          }
        } as any,
        {} as any
      )
    ).rejects.toThrow("Runtime context is not available. This requires a server runtime.")
  })
})

describe("react-router handleError", () => {
  it("ignores aborted requests and known HTTP statuses", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined)

    const abortedController = new AbortController()
    abortedController.abort()

    handleError(new Error("ignore"), {
      request: new Request("http://localhost/aborted", {
        signal: abortedController.signal
      })
    } as any)
    handleError(new Response(null, { status: 404 }), {
      request: new Request("http://localhost/missing")
    } as any)
    handleError(
      new RatelimitError({
        reason: "RemainingLimitExceeded",
        message: "slow down"
      }),
      {
        request: new Request("http://localhost/ratelimit")
      } as any
    )

    expect(logSpy).not.toHaveBeenCalled()
  })

  it("logs unexpected errors with the request URL", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined)
    const error = new Error("boom")

    handleError(error, {
      request: new Request("http://localhost/unexpected")
    } as any)

    expect(logSpy).toHaveBeenCalledWith("Handle Error: http://localhost/unexpected", error)
  })
})

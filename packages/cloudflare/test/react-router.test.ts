import { CloudflareBindings } from "../src/bindings.ts"
import { RequestAppLoadContext } from "@effect-x/react-router/request"
import { Testing } from "@effect-x/server-testing/test"
import { NodeContext } from "@effect/platform-node"
import * as SqlD1 from "@effect/sql-d1/D1Client"
import { describe, expect, it } from "@effect/vitest"
import { Cause, Context, Effect, Exit, Layer, ManagedRuntime } from "effect"
import { resolve } from "node:path"

import * as PresetCloudflareReactRouter from "../src/react-router.ts"
import * as ReactRouterTesting from "../src/testing/react-router.ts"
import { Miniflare, setup } from "../src/testing/react-router.ts"
import type * as WorkersTesting from "../src/testing/workers.ts"

const tsconfig = resolve(import.meta.dirname, "..", "tsconfig.json")
const fixtures = resolve(import.meta.dirname, "fixtures")

const makeTestingRuntime = async (
  layer: Layer.Layer<
    Layer.Layer.Success<ReturnType<typeof WorkersTesting.simple>>,
    never,
    Layer.Layer.Context<ReturnType<typeof WorkersTesting.simple>>
  >
) => {
  const runtime = ManagedRuntime.make(Layer.provideMerge(layer, NodeContext.layer))

  await runtime.runtime()

  const testing = await runtime.runPromise(
    Effect.map(Effect.context<Testing>(), (context) => Context.get(context, Testing))
  )

  return {
    runtime,
    testing
  }
}

describe("cloudflare react-router testing helpers", () => {
  it("setup.withD1 builds a sql layer from a real Miniflare D1 binding", async () => {
    const { runtime } = await makeTestingRuntime(
      ReactRouterTesting.simple({
        persist: false,
        logLevel: "Debug",
        configs: {
          name: "cloudflare-react-router-simple",
          modules: true,
          bindings: {
            NAME: "cloudflare-react-router-simple",
            NAMESPACE: "cloudflare"
          },
          script: `
            export default {
              fetch() {
                return new Response("ok")
              },
            }
          `,
          d1Databases: {
            APP_DB: "cloudflare-react-router-db"
          }
        }
      })
    )

    try {
      const [config, db] = await Promise.all([
        runtime.runPromise(setup.withD1("APP_DB")(Effect.map(SqlD1.D1Client, (client) => client.config))),
        runtime.runPromise(Effect.flatMap(Miniflare, (miniflare) => miniflare.getD1Database("APP_DB")))
      ])

      expect(config.db).toBe(db)
      expect(config.transformQueryNames?.("firstName")).toBe("first_name")
      expect(config.transformResultNames?.("last_name")).toBe("lastName")
    } finally {
      await runtime.dispose()
    }
  })

  it("setup.withD1 dies when the requested D1 binding does not exist", async () => {
    const { runtime } = await makeTestingRuntime(
      ReactRouterTesting.simple({
        persist: false,
        logLevel: "Debug",
        configs: {
          name: "cloudflare-react-router-simple",
          modules: true,
          bindings: {
            NAME: "cloudflare-react-router-simple",
            NAMESPACE: "cloudflare"
          },
          script: `
            export default {
              fetch() {
                return new Response("ok")
              },
            }
          `
        }
      })
    )

    try {
      const exit = await runtime.runPromiseExit(
        setup.withD1("MISSING_DB")(Effect.map(SqlD1.D1Client, (client) => client.config))
      )

      expect(Exit.isFailure(exit)).toBe(true)
      if (Exit.isFailure(exit)) {
        expect(String(Cause.squash(exit.cause))).toContain("No miniflare state")
      }
    } finally {
      await runtime.dispose()
    }
  })

  it("reactRouter.simple injects RequestAppLoadContext from real Miniflare bindings and preserves the provided runtime", async () => {
    const delegatedRuntime = ManagedRuntime.make(Layer.empty)
    await delegatedRuntime.runtime()

    const { runtime, testing } = await makeTestingRuntime(
      ReactRouterTesting.simple({
        persist: false,
        logLevel: "Debug",
        configs: {
          name: "cloudflare-react-router-simple",
          modules: true,
          bindings: {
            NAME: "cloudflare-react-router-simple",
            NAMESPACE: "cloudflare"
          },
          script: `
            export default {
              fetch() {
                return new Response("ok")
              },
            }
          `
        }
      })
    )

    try {
      const loadContext = await runtime.runPromise(
        testing.mapEffect(
          Effect.map(RequestAppLoadContext, (context) => context),
          delegatedRuntime
        )
      )

      expect(loadContext.env.NAME).toBe("cloudflare-react-router-simple")
      expect(loadContext.env.LOG_LEVEL).toBe("Debug")
      expect(loadContext.caches).toBeDefined()
      expect(loadContext.runtime).toBe(delegatedRuntime)
      await expect(loadContext.runtime.runPromise(Effect.succeed("ok"))).resolves.toBe("ok")
    } finally {
      await runtime.dispose()
      await delegatedRuntime.dispose()
    }
  })

  it("reactRouter() reads real wrangler bindings and uses the provided getLoadContext output", async () => {
    const baseGetLoadContext = PresetCloudflareReactRouter.make(Layer.empty).getLoadContext

    const { runtime, testing } = await makeTestingRuntime(
      ReactRouterTesting.reactRouter({
        cwd: resolve(fixtures, "service-app"),
        persist: false,
        tsconfig,
        env: {
          NAME: "cloudflare-react-router-app",
          NAMESPACE: "cloudflare"
        },
        additionalWorkers: [{ path: resolve(fixtures, "echo-service", "wrangler.jsonc") }],
        getLoadContext: (params) => {
          const loadContext = baseGetLoadContext(params)

          return {
            ...loadContext,
            env: {
              ...loadContext.env,
              injected: "from-get-load-context"
            }
          }
        }
      })
    )

    try {
      const loadContext = await runtime.runPromise(
        testing.mapEffect(
          Effect.map(RequestAppLoadContext, (context) => context),
          runtime
        )
      )

      const serviceResponse = await loadContext.env.ECHO_SERVICE.fetch("http://echo-service/from-load-context")
      const serviceJson = await serviceResponse.json()
      const hasServiceBinding = await loadContext.runtime.runPromise(CloudflareBindings.hasBinding("ECHO_SERVICE"))

      expect(loadContext.env.NAME).toBe("cloudflare-react-router-app")
      expect(loadContext.env.injected).toBe("from-get-load-context")
      expect(serviceJson).toEqual({
        service: "echo-service",
        pathname: "/from-load-context",
        method: "GET"
      })
      expect(hasServiceBinding).toBe(true)
      await expect(loadContext.runtime.runPromise(Effect.succeed("ok"))).resolves.toBe("ok")
    } finally {
      await runtime.dispose()
    }
  })
})

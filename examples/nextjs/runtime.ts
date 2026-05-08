import { HttpLayerRouter } from "@effect/platform"
import { env, waitUntil } from "cloudflare:workers"
import { Layer, ManagedRuntime } from "effect"

import { Live } from "./context.ts"
import { CloudflareBindings } from "./lib/cloudflare/bindings.ts"
import { makeConfigProvider } from "./lib/cloudflare/config-provider.ts"
import { CloudflareExecutionContext } from "./lib/cloudflare/execution-context.ts"
import { AllRoutes } from "./router.ts"

const CloudflareLive = Layer.mergeAll(
  CloudflareBindings.fromEnv(env),
  CloudflareExecutionContext.fromContext(
    {
      waitUntil: (promise: Promise<any>) => waitUntil(promise)
    },
    env
  ),
  Layer.setConfigProvider(makeConfigProvider(env))
)

const ServerLive = Live.pipe(Layer.provideMerge(CloudflareLive))

export const HttpApiLive = AllRoutes.pipe(Layer.provideMerge(ServerLive))

// RSC

export type ServerRuntime = ManagedRuntime.ManagedRuntime<Layer.Layer.Success<typeof ServerLive>, never>

export type ClientRuntime = ManagedRuntime.ManagedRuntime<Layer.Layer<never>, never>

export const make = () => {
  // TODO: provider next context
  const serverRuntime = ManagedRuntime.make(ServerLive)
  // @ts-expect-error
  globalThis.serverRuntime = serverRuntime

  const clientRuntime = ManagedRuntime.make(Layer.empty, serverRuntime.memoMap)
  // @ts-expect-error
  globalThis.clientRuntime = clientRuntime

  const dispose = () => {
    serverRuntime.dispose()
    clientRuntime.dispose()
  }

  return { dispose }
}

export const serverRuntime: ServerRuntime = (globalThis as any).serverRuntime as ServerRuntime

export const clientRuntime: ClientRuntime = (globalThis as any).clientRuntime as ClientRuntime

// Api

const httpHandler = HttpLayerRouter.toWebHandler(HttpApiLive, { memoMap: serverRuntime?.memoMap })

export const handleApiRequest = async (request: Request) => {
  return await httpHandler.handler(request)
}

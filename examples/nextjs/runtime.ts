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
      waitUntil: (promise: Promise<unknown>) => waitUntil(promise)
    },
    env
  ),
  Layer.setConfigProvider(makeConfigProvider(env))
)

const ServerLive = Live.pipe(Layer.provideMerge(CloudflareLive))

export const HttpApiLive = AllRoutes.pipe(Layer.provideMerge(ServerLive))

// RSC

export type ServerRuntime = ManagedRuntime.ManagedRuntime<Layer.Layer.Success<typeof ServerLive>, never>

export type ClientRuntime = ManagedRuntime.ManagedRuntime<never, never>

declare global {
  var serverRuntime: ServerRuntime | undefined
  var clientRuntime: ClientRuntime | undefined
}

export const make = () => {
  // TODO: provider next context
  const serverRuntime = ManagedRuntime.make(ServerLive)
  globalThis.serverRuntime = serverRuntime

  const clientRuntime = ManagedRuntime.make(Layer.empty, serverRuntime.memoMap)
  globalThis.clientRuntime = clientRuntime

  const dispose = async () => {
    await serverRuntime.dispose()
    await clientRuntime.dispose()
  }

  return { dispose }
}

export const serverRuntime = globalThis.serverRuntime as ServerRuntime

export const clientRuntime = globalThis.clientRuntime as ClientRuntime

// Api

const httpHandler = HttpLayerRouter.toWebHandler(HttpApiLive, { memoMap: serverRuntime?.memoMap })

export const handleApiRequest = async (request: Request) => {
  return await httpHandler.handler(request)
}

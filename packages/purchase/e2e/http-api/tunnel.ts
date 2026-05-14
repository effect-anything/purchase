import type { Readable } from "node:stream"

/** @effect-diagnostics preferSchemaOverJson:off */
import { Context, Data, Effect, Layer } from "effect"
import { spawn, type ChildProcessByStdio } from "node:child_process"

export interface TunnelRuntimeConfig {
  readonly localBaseURL: string
  readonly publicBaseURL: string
  readonly checkoutURL?: string | undefined
  readonly webhookURL: string
}

class TunnelRuntimeError extends Data.TaggedError("TunnelRuntimeError")<{
  readonly message: string
  readonly cause?: unknown
}> {}

export class TunnelRuntime extends Context.Tag("TunnelRuntime")<TunnelRuntime, TunnelRuntimeConfig>() {
  static layer = (input: { readonly localBaseURL: string }) =>
    Layer.scoped(
      TunnelRuntime,
      Effect.gen(function* () {
        const configuredPublicBaseURL =
          normalizeUrl(process.env.PURCHASE_E2E_PUBLIC_URL) ?? normalizeUrl(process.env.PADDLE_PUBLIC_URL)
        const publicBaseURL =
          configuredPublicBaseURL ??
          (yield* makeNgrokTunnel({
            localBaseURL: input.localBaseURL
          }))

        return makeTunnelRuntime({
          localBaseURL: input.localBaseURL,
          publicBaseURL,
          checkoutURL: normalizeUrl(process.env.PURCHASE_E2E_CHECKOUT_URL)
        })
      })
    )
}

export const makeTunnelRuntime = (input: {
  readonly localBaseURL: string
  readonly publicBaseURL: string
  readonly checkoutURL?: string | undefined
}): TunnelRuntimeConfig => {
  const publicBaseURL = stripTrailingSlash(input.publicBaseURL)

  return {
    localBaseURL: stripTrailingSlash(input.localBaseURL),
    publicBaseURL,
    ...(input.checkoutURL ? { checkoutURL: input.checkoutURL } : {}),
    webhookURL: `${publicBaseURL}/api/webhooks/paddle`
  }
}

const makeNgrokTunnel = (input: { readonly localBaseURL: string }) =>
  Effect.acquireRelease(
    Effect.gen(function* () {
      const localUrl = new URL(input.localBaseURL)
      const port = localUrl.port
      if (!port) {
        return yield* new TunnelRuntimeError({
          message: `Cannot start ngrok without a local port: ${input.localBaseURL}`
        })
      }

      const process = yield* spawnNgrok({ port })
      const publicBaseURL = yield* waitForNgrokPublicUrl()

      return { process, publicBaseURL }
    }),
    ({ process }) => stopProcess(process)
  ).pipe(Effect.map(({ publicBaseURL }) => publicBaseURL))

const spawnNgrok = (input: { readonly port: string }) =>
  Effect.try({
    try: () => {
      const args = ["http", input.port, "--log=stdout"]
      return spawn("ngrok", args, {
        env: process.env,
        stdio: ["ignore", "pipe", "pipe"]
      })
    },
    catch: (cause) => new TunnelRuntimeError({ message: "Failed to start ngrok", cause })
  })

const waitForNgrokPublicUrl = (timeoutMs = 20_000) =>
  Effect.gen(function* () {
    const startedAt = Date.now()

    while (Date.now() - startedAt < timeoutMs) {
      const url = yield* fetchNgrokTunnelUrl().pipe(Effect.catchAll(() => Effect.succeed(void 0)))
      if (url) {
        return url
      }

      yield* Effect.sleep(500)
    }

    return yield* new TunnelRuntimeError({ message: `Timed out waiting for ngrok public URL after ${timeoutMs}ms` })
  })

const fetchNgrokTunnelUrl = () =>
  Effect.tryPromise({
    try: async () => {
      const response = await fetch("http://127.0.0.1:4040/api/tunnels")
      const json = (await response.json()) as {
        readonly tunnels?: ReadonlyArray<{
          readonly public_url?: string
          readonly proto?: string
        }>
      }
      const tunnel = json.tunnels?.find((entry) => entry.proto === "https" && entry.public_url)
      if (!tunnel?.public_url) {
        throw new Error("ngrok has not exposed an https tunnel yet")
      }

      return tunnel.public_url
    },
    catch: (cause) => new TunnelRuntimeError({ message: "Failed to read ngrok tunnel API", cause })
  })

const stopProcess = (process: ChildProcessByStdio<null, Readable, Readable>) =>
  Effect.sync(() => {
    process.kill("SIGTERM")
  }).pipe(Effect.catchAllDefect(() => Effect.succeed(undefined)))

const normalizeUrl = (value: string | undefined) => {
  if (!value) {
    return undefined
  }

  return stripTrailingSlash(value)
}

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "")

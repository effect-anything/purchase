/** @effect-diagnostics preferSchemaOverJson:off */
import type { Readable } from "node:stream"

import { Config, Context, Data, Effect, Layer, Option, Redacted } from "effect"
import { spawn, type ChildProcessByStdio } from "node:child_process"

interface CloudflareTunnelSummary {
  readonly id: string
  readonly name: string
}

interface BrokerTunnelEndpoint {
  readonly publicBaseURL: string
}

interface ManagedTunnelProcess {
  readonly child: ChildProcessByStdio<null, Readable, Readable>
}

interface CloudflareTunnelState {
  readonly config: {
    readonly accountId?: string | undefined
    readonly apiToken?: Redacted.Redacted<string> | undefined
    readonly devTunnelDomain?: URL | undefined
  }
  readonly managedProcesses: Array<ManagedTunnelProcess>
  brokerEndpoint?: BrokerTunnelEndpoint | undefined
}

interface CloudflareTunnelService {
  readonly listTunnels: () => Effect.Effect<ReadonlyArray<CloudflareTunnelSummary>, CloudflareTunnelError>
  readonly resolveBrokerEndpoint: (input: {
    readonly localBaseURL: string
  }) => Effect.Effect<BrokerTunnelEndpoint, CloudflareTunnelError>
}

interface CloudflareTunnelRuntime extends CloudflareTunnelService {
  readonly managedProcesses: Array<ManagedTunnelProcess>
}

export class CloudflareTunnelError extends Data.TaggedError("CloudflareTunnelError")<{
  readonly message: string
  readonly cause?: unknown
}> {}

const CloudflareTunnelConfig = Config.all({
  accountId: Config.option(Config.string("CLOUDFLARE_ACCOUNT_ID")).pipe(Config.map((_) => Option.getOrUndefined(_))),
  apiToken: Config.option(Config.redacted("CLOUDFLARE_API_TOKEN")).pipe(Config.map((_) => Option.getOrUndefined(_))),
  devTunnelDomain: Config.option(Config.url("DEV_TUNNEL_DOMAIN")).pipe(Config.map((_) => Option.getOrUndefined(_)))
})

const tunnelName = "dev-purchase-broker"

export class CloudflareTunnel extends Context.Tag("CloudflareTunnel")<CloudflareTunnel, CloudflareTunnelService>() {
  static Default = Layer.scoped(
    CloudflareTunnel,
    Effect.acquireRelease(
      Effect.gen(function* () {
        const config = yield* CloudflareTunnelConfig

        const state: CloudflareTunnelState = {
          config,
          managedProcesses: []
        }

        const listTunnels = () =>
          canUseManagedTunnel(state.config)
            ? listCloudflareTunnels(state.config)
            : Effect.succeed<ReadonlyArray<CloudflareTunnelSummary>>([])

        const resolveBrokerEndpoint = Effect.fn(function* (input: { readonly localBaseURL: string }) {
          const existing = state.brokerEndpoint
          if (existing) {
            return existing
          }
          if (!canUseManagedTunnel(state.config) || !state.config.devTunnelDomain) {
            yield* Effect.logWarning(
              "Managed Cloudflare tunnel requested but DEV_TUNNEL_DOMAIN is missing; falling back to Wrangler quick-start"
            )
            const child = yield* spawnWranglerQuickTunnel({
              env: toWranglerEnv(state.config),
              localBaseURL: input.localBaseURL
            })
            state.managedProcesses.push({ child })
            const publicBaseURL = yield* waitForWranglerQuickTunnelPublicUrl(child)
            yield* logQuickTunnel({
              localBaseURL: input.localBaseURL,
              publicBaseURL
            })
            const endpoint = { publicBaseURL }
            state.brokerEndpoint = endpoint
            return endpoint
          }
          const tunnel = yield* ensureCloudflareTunnel(state.config, tunnelName)
          const publicBaseURL = toBrokerPublicBaseURL(tunnelName, state.config.devTunnelDomain)
          const hostname = new URL(publicBaseURL).hostname
          const localService = toWranglerTunnelTarget(input.localBaseURL)
          yield* updateCloudflareTunnelConfiguration(state.config, {
            tunnelId: tunnel.id,
            hostname,
            service: localService
          })
          yield* ensureCloudflareTunnelDnsRecord(state.config, {
            tunnelId: tunnel.id,
            hostname
          })
          yield* deleteCloudflareTunnelHostnameRoutes(state.config, {
            hostname
          })
          const child = yield* spawnWranglerNamedTunnel({
            env: toWranglerEnv(state.config),
            tunnelId: tunnel.id
          })
          state.managedProcesses.push({ child })
          yield* waitForWranglerNamedTunnelReady(child)
          yield* logManagedTunnel({
            tunnelId: tunnel.id,
            localBaseURL: input.localBaseURL,
            publicBaseURL
          })
          const endpoint = { publicBaseURL }
          state.brokerEndpoint = endpoint
          return endpoint
        })

        return {
          managedProcesses: state.managedProcesses,
          listTunnels,
          resolveBrokerEndpoint
        } satisfies CloudflareTunnelRuntime
      }),
      ({ managedProcesses }) =>
        Effect.forEach(managedProcesses, (process) => stopProcess(process.child), {
          discard: true,
          concurrency: "unbounded"
        })
    )
  )
}

const canUseManagedTunnel = (config: {
  readonly accountId?: string | undefined
  readonly apiToken?: Redacted.Redacted<string> | undefined
}) => Boolean(config.accountId && config.apiToken)

const listCloudflareTunnels = (config: {
  readonly accountId?: string | undefined
  readonly apiToken?: Redacted.Redacted<string> | undefined
}) =>
  cloudflareApiRequest<{
    readonly result?: ReadonlyArray<{
      readonly id?: string
      readonly name?: string
    }>
  }>(config, `/accounts/${config.accountId}/cfd_tunnel`).pipe(
    Effect.map((response) =>
      (response.result ?? []).flatMap((tunnel) =>
        typeof tunnel.id === "string" && typeof tunnel.name === "string"
          ? [
              {
                id: tunnel.id,
                name: tunnel.name
              } satisfies CloudflareTunnelSummary
            ]
          : []
      )
    )
  )

const ensureCloudflareTunnel = (
  config: { readonly accountId?: string | undefined; readonly apiToken?: Redacted.Redacted<string> | undefined },
  name: string
) =>
  Effect.gen(function* () {
    const tunnels = yield* listCloudflareTunnels(config)
    const existing = tunnels.find((tunnel) => tunnel.name === name)
    if (existing) {
      return existing
    }

    const created = yield* cloudflareApiRequest<{
      readonly result?: {
        readonly id?: string
        readonly name?: string
      }
    }>(config, `/accounts/${config.accountId}/cfd_tunnel`, {
      method: "POST",
      body: JSON.stringify({
        config_src: "cloudflare",
        name
      })
    })

    if (typeof created.result?.id !== "string" || typeof created.result?.name !== "string") {
      return yield* new CloudflareTunnelError({ message: `Cloudflare did not return a valid tunnel for ${name}` })
    }

    return {
      id: created.result.id,
      name: created.result.name
    } satisfies CloudflareTunnelSummary
  })

const updateCloudflareTunnelConfiguration = (
  config: { readonly accountId?: string | undefined; readonly apiToken?: Redacted.Redacted<string> | undefined },
  input: {
    readonly tunnelId: string
    readonly hostname: string
    readonly service: string
  }
) =>
  cloudflareApiRequest(config, `/accounts/${config.accountId}/cfd_tunnel/${input.tunnelId}/configurations`, {
    method: "PUT",
    body: JSON.stringify({
      config: {
        ingress: [
          {
            hostname: input.hostname,
            service: input.service
          },
          {
            service: "http_status:404"
          }
        ]
      }
    })
  }).pipe(Effect.asVoid)

const deleteCloudflareTunnelHostnameRoutes = (
  config: { readonly accountId?: string | undefined; readonly apiToken?: Redacted.Redacted<string> | undefined },
  input: {
    readonly hostname: string
  }
) =>
  Effect.gen(function* () {
    const routes = yield* cloudflareApiRequest<{
      readonly result?: ReadonlyArray<{
        readonly id?: string
        readonly hostname?: string
        readonly tunnel_id?: string
      }>
    }>(config, `/accounts/${config.accountId}/zerotrust/routes/hostname`)

    const matchingRoutes = (routes.result ?? []).filter(
      (route) => route.hostname === input.hostname && typeof route.id === "string"
    )

    yield* Effect.forEach(
      matchingRoutes,
      (route) =>
        cloudflareApiRequest(config, `/accounts/${config.accountId}/zerotrust/routes/hostname/${route.id}`, {
          method: "DELETE"
        }).pipe(Effect.asVoid),
      {
        discard: true,
        concurrency: "unbounded"
      }
    )
  })

const ensureCloudflareTunnelDnsRecord = (
  config: { readonly accountId?: string | undefined; readonly apiToken?: Redacted.Redacted<string> | undefined },
  input: {
    readonly tunnelId: string
    readonly hostname: string
  }
) =>
  Effect.gen(function* () {
    const zone = yield* resolveZoneForHostname(config, input.hostname)
    const target = `${input.tunnelId}.cfargotunnel.com`
    const records = yield* cloudflareApiRequest<{
      readonly result?: ReadonlyArray<{
        readonly id?: string
        readonly type?: string
        readonly name?: string
        readonly content?: string
        readonly proxied?: boolean
      }>
    }>(config, `/zones/${zone.id}/dns_records?type=CNAME&name=${encodeURIComponent(input.hostname)}`)

    const existing = (records.result ?? []).find((record) => record.name === input.hostname && record.type === "CNAME")

    if (existing?.content === target && existing.proxied === true) {
      return
    }

    const body = JSON.stringify({
      type: "CNAME",
      name: input.hostname,
      content: target,
      proxied: true,
      comment: "Dev Purchase broker tunnel"
    })

    if (typeof existing?.id === "string") {
      yield* cloudflareApiRequest(config, `/zones/${zone.id}/dns_records/${existing.id}`, {
        method: "PUT",
        body
      }).pipe(Effect.asVoid)
      return
    }

    yield* cloudflareApiRequest(config, `/zones/${zone.id}/dns_records`, {
      method: "POST",
      body
    }).pipe(Effect.asVoid)
  })

const resolveZoneForHostname = (
  config: { readonly accountId?: string | undefined; readonly apiToken?: Redacted.Redacted<string> | undefined },
  hostname: string
) =>
  Effect.gen(function* () {
    const candidates = zoneCandidates(hostname)

    for (const name of candidates) {
      const zones = yield* cloudflareApiRequest<{
        readonly result?: ReadonlyArray<{
          readonly id?: string
          readonly name?: string
        }>
      }>(config, `/zones?name=${encodeURIComponent(name)}`)

      const zone = (zones.result ?? []).find((zone) => zone.name === name && typeof zone.id === "string")
      if (zone?.id && zone.name) {
        return { id: zone.id, name: zone.name }
      }
    }

    return yield* new CloudflareTunnelError({ message: `Could not find Cloudflare zone for hostname ${hostname}` })
  })

const cloudflareApiRequest = <A>(
  config: { readonly accountId?: string | undefined; readonly apiToken?: Redacted.Redacted<string> | undefined },
  path: string,
  init?: RequestInit | undefined
) =>
  Effect.tryPromise({
    try: async () => {
      if (!config.accountId || !config.apiToken) {
        throw new Error("Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN")
      }

      const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
        ...init,
        headers: {
          authorization: `Bearer ${Redacted.value(config.apiToken)}`,
          "content-type": "application/json",
          ...init?.headers
        }
      })
      const json = (await response.json()) as {
        readonly success?: boolean
        readonly errors?: ReadonlyArray<{ readonly message?: string }>
      } & A

      if (!response.ok || json.success === false) {
        const message = json.errors
          ?.map((error) => error.message)
          .filter(Boolean)
          .join("; ")
        throw new Error(message || `Cloudflare API returned ${response.status}`)
      }

      return json
    },
    catch: (cause) => new CloudflareTunnelError({ message: `Cloudflare API request failed for ${path}`, cause })
  })

const spawnWranglerQuickTunnel = (input: { readonly env: NodeJS.ProcessEnv; readonly localBaseURL: string }) =>
  Effect.try({
    try: () =>
      spawn("pnpm", ["exec", "wrangler", "tunnel", "quick-start", toWranglerTunnelTarget(input.localBaseURL)], {
        detached: true,
        env: input.env,
        stdio: ["ignore", "pipe", "pipe"]
      }),
    catch: (cause) =>
      new CloudflareTunnelError({ message: "Failed to start Wrangler quick tunnel for webhook broker", cause })
  })

const spawnWranglerNamedTunnel = (input: { readonly env: NodeJS.ProcessEnv; readonly tunnelId: string }) =>
  Effect.try({
    try: () =>
      spawn("pnpm", ["exec", "wrangler", "tunnel", "run", input.tunnelId], {
        detached: true,
        env: input.env,
        stdio: ["ignore", "pipe", "pipe"]
      }),
    catch: (cause) => new CloudflareTunnelError({ message: `Failed to start Wrangler tunnel ${input.tunnelId}`, cause })
  })

const waitForWranglerQuickTunnelPublicUrl = (
  child: ChildProcessByStdio<null, Readable, Readable>,
  timeoutMs = 120_000
) =>
  Effect.tryPromise({
    try: () =>
      new Promise<string>((resolve, reject) => {
        let combined = ""
        const timer = setTimeout(() => {
          cleanup()
          reject(
            new Error(
              `Timed out waiting for webhook broker Wrangler tunnel public URL after ${timeoutMs}ms\n${summarizeOutput(combined)}`
            )
          )
        }, timeoutMs)

        const onChunk = (chunk: Buffer) => {
          combined += chunk.toString()
          const url = extractWranglerTunnelUrl(combined)
          if (url) {
            cleanup()
            resolve(url)
          }
        }

        const onExit = (code: number | null, signal: NodeJS.Signals | null) => {
          cleanup()
          reject(
            new Error(
              `Wrangler tunnel exited before exposing a public URL (code: ${String(code)}, signal: ${String(signal)})\n${combined}`
            )
          )
        }

        const cleanup = () => {
          clearTimeout(timer)
          child.stdout.off("data", onChunk)
          child.stderr.off("data", onChunk)
          child.off("exit", onExit)
          child.off("error", onError)
        }

        const onError = (cause: Error) => {
          cleanup()
          reject(cause)
        }

        child.stdout.on("data", onChunk)
        child.stderr.on("data", onChunk)
        child.on("exit", onExit)
        child.on("error", onError)
      }),
    catch: (cause) => new CloudflareTunnelError({ message: "Failed to read Wrangler tunnel output", cause })
  })

const waitForWranglerNamedTunnelReady = (child: ChildProcessByStdio<null, Readable, Readable>, timeoutMs = 120_000) =>
  Effect.tryPromise({
    try: () =>
      new Promise<void>((resolve, reject) => {
        let combined = ""
        const timer = setTimeout(() => {
          cleanup()
          reject(
            new Error(
              `Timed out waiting for webhook broker named Wrangler tunnel after ${timeoutMs}ms\n${summarizeOutput(combined)}`
            )
          )
        }, timeoutMs)

        const onChunk = (chunk: Buffer) => {
          combined += chunk.toString()
          if (isWranglerNamedTunnelReady(combined)) {
            cleanup()
            resolve()
          }
        }

        const onExit = (code: number | null, signal: NodeJS.Signals | null) => {
          cleanup()
          reject(
            new Error(
              `Wrangler named tunnel exited before it was ready (code: ${String(code)}, signal: ${String(signal)})\n${combined}`
            )
          )
        }

        const cleanup = () => {
          clearTimeout(timer)
          child.stdout.off("data", onChunk)
          child.stderr.off("data", onChunk)
          child.off("exit", onExit)
          child.off("error", onError)
        }

        const onError = (cause: Error) => {
          cleanup()
          reject(cause)
        }

        child.stdout.on("data", onChunk)
        child.stderr.on("data", onChunk)
        child.on("exit", onExit)
        child.on("error", onError)
      }),
    catch: (cause) => new CloudflareTunnelError({ message: "Failed to read Wrangler named tunnel output", cause })
  })

const extractWranglerTunnelUrl = (output: string) => {
  const matches = output.matchAll(/https:\/\/([a-z0-9-]+)\.trycloudflare\.com/gi)
  for (const match of matches) {
    const hostname = match[1]?.toLowerCase()
    if (hostname && hostname !== "api") {
      return match[0]
    }
  }

  return undefined
}

const stopProcess = (child: ChildProcessByStdio<null, Readable, Readable>) =>
  Effect.sync(() => {
    if (child.pid) {
      try {
        globalThis.process.kill(-child.pid, "SIGTERM")
      } catch {
        child.kill("SIGTERM")
      }
    } else {
      child.kill("SIGTERM")
    }
    child.stdout.destroy()
    child.stderr.destroy()
  }).pipe(Effect.catchAllDefect(() => Effect.void))

const summarizeOutput = (output: string) => output.trim().split("\n").slice(-40).join("\n")

const isWranglerNamedTunnelReady = (output: string) =>
  /Registered tunnel connection|Tunnel connection .*registered/i.test(output)

const toWranglerTunnelTarget = (localBaseURL: string) => {
  const url = new URL(localBaseURL)
  if (url.hostname === "0.0.0.0" || url.hostname === "::") {
    url.hostname = "127.0.0.1"
  }

  return url.toString().replace(/\/+$/, "")
}

const toWranglerEnv = (config: {
  readonly accountId?: string | undefined
  readonly apiToken?: Redacted.Redacted<string> | undefined
}): NodeJS.ProcessEnv => ({
  ...globalThis.process.env,
  ...(config.accountId ? { CLOUDFLARE_ACCOUNT_ID: config.accountId } : {}),
  ...(config.apiToken ? { CLOUDFLARE_API_TOKEN: Redacted.value(config.apiToken) } : {})
})

const zoneCandidates = (hostname: string) => {
  const parts = hostname.split(".").filter(Boolean)
  const candidates: Array<string> = []
  for (let index = 0; index <= parts.length - 2; index++) {
    candidates.push(parts.slice(index).join("."))
  }
  return candidates
}

const toBrokerPublicBaseURL = (tunnelName: string, tunnelDomain: URL) => {
  const url = tunnelDomain
  if (!url.hostname.startsWith(`${tunnelName}.`)) {
    url.hostname = `${tunnelName}.${url.hostname}`
  }
  return url.toString().replace(/\/+$/, "")
}

const logManagedTunnel = (input: {
  readonly tunnelId: string
  readonly localBaseURL: string
  readonly publicBaseURL: string
}) =>
  Effect.logInfo("Using Cloudflare named tunnel").pipe(
    Effect.annotateLogs({
      tunnelId: input.tunnelId,
      publicBaseURL: input.publicBaseURL,
      localBaseURL: input.localBaseURL
    })
  )

const logQuickTunnel = (input: { readonly localBaseURL: string; readonly publicBaseURL: string }) =>
  Effect.logInfo("Using Wrangler quick tunnel").pipe(
    Effect.annotateLogs({
      publicBaseURL: input.publicBaseURL,
      localBaseURL: input.localBaseURL
    })
  )

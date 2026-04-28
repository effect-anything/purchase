import { OTEL_CONFIG, type OtelConfig } from "@effect-x/otel/config"
import {
  removeInvalidOtelIds,
  removeInvalidOtelIdsFromTraces,
  type ResourceLogsInput,
  type ResourceSpansInput
} from "@effect-x/otel/shared"
import * as Otlp from "@effect/opentelemetry/Otlp"
import * as OtlpSerialization from "@effect/opentelemetry/OtlpSerialization"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import { ATTR_PROCESS_RUNTIME_NAME, ATTR_SERVICE_NAMESPACE } from "@opentelemetry/semantic-conventions/incubating"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Redacted from "effect/Redacted"

const decoder = new TextDecoder()

export const OtelLive = Layer.unwrapScoped(
  Effect.gen(function* () {
    const config = yield* OTEL_CONFIG.pipe(Effect.orDie)

    const destination = createDestinations(config)

    if (!destination) {
      return Layer.empty
    }

    return Otlp.layer({
      baseUrl: destination.baseUrl,
      resource: {
        serviceName: config.name ?? "unknown",
        attributes: {
          [ATTR_SERVICE_NAMESPACE]: config.namespace,
          [ATTR_PROCESS_RUNTIME_NAME]: "workerd"
        },
        serviceVersion: config.version
      },
      headers: destination.headers
    }).pipe(
      Layer.provide(FetchHttpClient.layer),
      Layer.provide(
        Layer.succeed(FetchHttpClient.Fetch, ((input, init) => {
          let init_ = init

          if (input instanceof URL && input.pathname.endsWith("/logs")) {
            const data = decoder.decode(init!.body as any)
            const { resourceLogs }: { resourceLogs: ResourceLogsInput } = JSON.parse(data)
            const fixLogs = removeInvalidOtelIds(resourceLogs)
            const newBody = new TextEncoder().encode(JSON.stringify({ resourceLogs: fixLogs }))
            const headers = (init_?.headers ?? {}) as Record<string, string>
            headers["content-length"] = String(newBody.byteLength)
            init_ = {
              ...init_,
              headers,
              body: newBody
            }
          }

          if (input instanceof URL && input.pathname.endsWith("/traces")) {
            const data = decoder.decode(init!.body as any)
            const { resourceSpans }: { resourceSpans: ResourceSpansInput } = JSON.parse(data)
            const fixTraces = removeInvalidOtelIdsFromTraces(resourceSpans)
            const newBody = new TextEncoder().encode(JSON.stringify({ resourceSpans: fixTraces }))
            const headers = (init_?.headers ?? {}) as Record<string, string>
            headers["content-length"] = String(newBody.byteLength)
            init_ = {
              ...init_,
              headers,
              body: newBody
            }
          }

          return globalThis.fetch(input, init_)
        }) as typeof globalThis.fetch)
      ),
      Layer.provide(OtlpSerialization.layerJson)
    )
  })
)

type OtelProvider = "axiom" | "local"

function createDestinations(config: OtelConfig) {
  const provider = resolveProvider(Option.getOrUndefined(config.provider))
  const baseUrl = computeBaseUrl(provider)
  const headers = computeDefaultHeaders(
    provider,
    Option.match(config.apiKey, { onNone: () => "", onSome: Redacted.value })
  )

  return { provider, baseUrl, headers }
}

function resolveProvider(provider: string | undefined): OtelProvider {
  switch (provider) {
    case "axiom":
    case "local":
      return provider
    default:
      return "local"
  }
}

function computeBaseUrl(provider: OtelProvider, configuredUrl?: string | undefined): string {
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "")
  }

  switch (provider) {
    case "axiom":
      return "https://api.axiom.co"
    case "local":
    default:
      return "http://127.0.0.1:4318"
  }
}

function computeDefaultHeaders(provider: OtelProvider, apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {}

  if (provider === "axiom") {
    headers.Authorization = `Bearer ${apiKey}`
    headers["X-Axiom-Dataset"] = "xstack"
  }

  return headers
}

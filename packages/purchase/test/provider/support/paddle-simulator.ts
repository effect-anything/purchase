import * as Effect from "effect/Effect"
import * as Schedule from "effect/Schedule"
import { createHmac } from "node:crypto"

export interface PaddleSimulatorCapture {
  readonly payload: string
  readonly signature: string
  readonly webhookSecret: string
}

interface PaddleSimulationEventRecord {
  readonly id?: string | undefined
  readonly event_type?: string | undefined
  readonly created_at?: string | undefined
  readonly request?:
    | {
        readonly body?: unknown
      }
    | undefined
  readonly payload?: unknown
}

export interface PaddleNotificationSetting {
  readonly id: string
  readonly description: string
  readonly destination: string
  readonly active: boolean
  readonly include_sensitive_fields: boolean
  readonly subscribed_events: ReadonlyArray<{
    readonly name: string
  }>
  readonly endpoint_secret_key: string
}

const paddleBaseUrl = "https://sandbox-api.paddle.com"

const paddleRequest = <A>(path: string, init: RequestInit, parse: (json: any) => A) =>
  Effect.tryPromise({
    try: async () => {
      const response = await fetch(`${paddleBaseUrl}${path}`, init)
      const text = await response.text()
      const json = text ? JSON.parse(text) : undefined

      if (!response.ok) {
        throw new Error(
          `Paddle simulator request failed (${response.status}) for ${path}: ${text || "<empty response body>"}`
        )
      }

      if (!json) {
        throw new Error(`Paddle simulator request returned an empty JSON body for ${path}`)
      }

      return parse(json)
    },
    catch: (cause) => cause
  })

const toPaddleSignature = (payload: string, secret: string, timestamp: number) => {
  const digest = createHmac("sha256", secret).update(`${timestamp}:${payload}`).digest("hex")
  return `ts=${timestamp};h1=${digest}`
}

export const paddleSimulatorEnabled = Boolean(process.env.PADDLE_SIMULATOR_API_TOKEN)

const defaultNotificationSettingDescription = "local-provider-test-all"
const defaultNotificationSettingDestination = "https://example.invalid/webhooks/paddle"
const notificationSettingIdPattern = /^pdl_(ntfset_[^_]+)_/

const getPaddleHeaders = (apiToken: string) => ({
  Authorization: `Bearer ${apiToken}`,
  "Content-Type": "application/json",
  Accept: "application/json",
  "Paddle-Version": "1"
})

const toStoredPaddlePayload = (event: PaddleSimulationEventRecord) => {
  if (typeof event.request?.body === "string") {
    return event.request.body
  }

  if (event.request?.body && typeof event.request.body === "object") {
    return JSON.stringify(event.request.body)
  }

  if (event.payload && event.event_type && event.created_at && event.id) {
    return JSON.stringify({
      event_id: event.id,
      notification_id: event.id,
      event_type: event.event_type,
      occurred_at: event.created_at,
      data: event.payload
    })
  }

  throw new Error("Paddle simulator event payload is not ready yet")
}

const loadPaddleNotificationSettings = (headers: Record<string, string>) =>
  paddleRequest(
    "/notification-settings?per_page=100",
    {
      method: "GET",
      headers
    },
    (json) => json.data as ReadonlyArray<PaddleNotificationSetting>
  ).pipe(
    Effect.retry({
      times: 3,
      schedule: Schedule.spaced("500 millis")
    })
  )

const coversSubscribedEvents = (setting: PaddleNotificationSetting, subscribedEvents: ReadonlyArray<string>) => {
  const names = new Set(setting.subscribed_events.map((event) => event.name))
  return subscribedEvents.every((eventType) => names.has(eventType))
}

const sortNotificationSettings = (
  settings: ReadonlyArray<PaddleNotificationSetting>,
  description: string,
  destination: string
) =>
  [...settings].toSorted((left, right) => {
    const leftScore =
      Number(left.active) * 100 +
      Number(left.description === description) * 10 +
      Number(left.destination === destination) * 5 +
      Number(left.include_sensitive_fields)
    const rightScore =
      Number(right.active) * 100 +
      Number(right.description === description) * 10 +
      Number(right.destination === destination) * 5 +
      Number(right.include_sensitive_fields)

    return rightScore - leftScore
  })

export const ensurePaddleNotificationSetting = (options: {
  readonly subscribedEvents: ReadonlyArray<string>
  readonly env?: NodeJS.ProcessEnv | undefined
  readonly description?: string | undefined
  readonly destination?: string | undefined
}) =>
  Effect.gen(function* () {
    const apiToken = options.env?.PADDLE_SIMULATOR_API_TOKEN ?? process.env.PADDLE_SIMULATOR_API_TOKEN
    const notificationSettingId =
      options.env?.PADDLE_NOTIFICATION_SETTING_ID ?? process.env.PADDLE_NOTIFICATION_SETTING_ID
    const webhookSecret =
      options.env?.PADDLE_NOTIFICATION_WEBHOOK_SECRET ?? process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET

    if (!apiToken) {
      return yield* Effect.fail(new Error("PADDLE_SIMULATOR_API_TOKEN is required for simulator-backed tests"))
    }

    if (notificationSettingId && webhookSecret) {
      return {
        id: notificationSettingId,
        webhookSecret
      } as const
    }

    if (webhookSecret) {
      const match = webhookSecret.match(notificationSettingIdPattern)
      if (match?.[1]) {
        return {
          id: match[1],
          webhookSecret
        } as const
      }
    }

    const description = options.description ?? defaultNotificationSettingDescription
    const destination = options.destination ?? defaultNotificationSettingDestination
    const headers = getPaddleHeaders(apiToken)
    const subscribedEvents = [...new Set(options.subscribedEvents)]
    const settings = yield* loadPaddleNotificationSettings(headers)

    const reusableSetting = sortNotificationSettings(
      settings.filter((setting) => setting.active && coversSubscribedEvents(setting, subscribedEvents)),
      description,
      destination
    )[0]

    if (reusableSetting) {
      return {
        id: reusableSetting.id,
        webhookSecret: reusableSetting.endpoint_secret_key
      } as const
    }

    const notificationSetting = yield* paddleRequest(
      "/notification-settings",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          description,
          destination,
          type: "url",
          include_sensitive_fields: true,
          subscribed_events: subscribedEvents,
          traffic_source: "all"
        })
      },
      (json) => json.data as { id: string; endpoint_secret_key: string }
    ).pipe(
      Effect.retry({
        times: 2,
        schedule: Schedule.spaced("500 millis")
      })
    )

    return {
      id: notificationSetting.id,
      webhookSecret: notificationSetting.endpoint_secret_key
    } as const
  })

const resolvePaddleNotificationSetting = (options: {
  readonly notificationSettingId?: string | undefined
  readonly webhookSecret?: string | undefined
  readonly subscribedEvents: ReadonlyArray<string>
  readonly env?: NodeJS.ProcessEnv | undefined
}) =>
  options.notificationSettingId && options.webhookSecret
    ? Effect.succeed({
        id: options.notificationSettingId,
        webhookSecret: options.webhookSecret
      } as const)
    : ensurePaddleNotificationSetting({
        subscribedEvents: options.subscribedEvents,
        env: options.env
      })

const runPaddleSimulation = (options: {
  readonly simulationType: string
  readonly subscribedEvents: ReadonlyArray<string>
  readonly notificationSettingId?: string | undefined
  readonly webhookSecret?: string | undefined
  readonly simulationConfig?: Record<string, unknown> | undefined
  readonly env?: NodeJS.ProcessEnv | undefined
}) =>
  Effect.gen(function* () {
    const apiToken = options.env?.PADDLE_SIMULATOR_API_TOKEN ?? process.env.PADDLE_SIMULATOR_API_TOKEN

    if (!apiToken) {
      return yield* Effect.fail(new Error("PADDLE_SIMULATOR_API_TOKEN is required for simulator-backed tests"))
    }

    const headers = getPaddleHeaders(apiToken)
    const notificationSetting = yield* resolvePaddleNotificationSetting({
      notificationSettingId: options.notificationSettingId,
      webhookSecret: options.webhookSecret,
      subscribedEvents: options.subscribedEvents,
      env: options.env
    })

    const simulation = yield* paddleRequest(
      "/simulations",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          notification_setting_id: notificationSetting.id,
          type: options.simulationType,
          name: `local-${options.simulationType}`,
          ...(options.simulationConfig ? { config: options.simulationConfig } : {})
        })
      },
      (json) => json.data as { id: string }
    ).pipe(
      Effect.retry({
        times: 3,
        schedule: Schedule.spaced("500 millis")
      })
    )

    const run = yield* paddleRequest(
      `/simulations/${simulation.id}/runs`,
      {
        method: "POST",
        headers
      },
      (json) => json.data as { id: string }
    ).pipe(
      Effect.retry({
        times: 3,
        schedule: Schedule.spaced("500 millis")
      })
    )

    const events = yield* paddleRequest(
      `/simulations/${simulation.id}/runs/${run.id}/events`,
      {
        method: "GET",
        headers
      },
      (json) => json.data as ReadonlyArray<PaddleSimulationEventRecord>
    ).pipe(
      Effect.retry({
        times: 10,
        schedule: Schedule.spaced("500 millis")
      })
    )

    return {
      events,
      webhookSecret: notificationSetting.webhookSecret
    } as const
  })

export const capturePaddleSimulation = (options: {
  readonly eventType: string
  readonly notificationSettingId?: string | undefined
  readonly webhookSecret?: string | undefined
  readonly env?: NodeJS.ProcessEnv | undefined
}) =>
  Effect.gen(function* () {
    const simulation = yield* runPaddleSimulation({
      simulationType: options.eventType,
      subscribedEvents: [options.eventType],
      notificationSettingId: options.notificationSettingId,
      webhookSecret: options.webhookSecret,
      env: options.env
    })
    const firstEvent = simulation.events[0]

    if (!firstEvent) {
      return yield* Effect.fail(new Error(`Paddle simulator did not emit any events for ${options.eventType}`))
    }

    const payload = toStoredPaddlePayload(firstEvent)
    const timestamp = Math.floor(Date.now() / 1000)

    return {
      payload,
      signature: toPaddleSignature(payload, simulation.webhookSecret, timestamp),
      webhookSecret: simulation.webhookSecret
    } satisfies PaddleSimulatorCapture
  })

export const capturePaddleScenarioWebhook = (options: {
  readonly scenarioType: string
  readonly targetEventType: string
  readonly notificationSettingId?: string | undefined
  readonly webhookSecret?: string | undefined
  readonly env?: NodeJS.ProcessEnv | undefined
}) =>
  Effect.gen(function* () {
    const simulation = yield* runPaddleSimulation({
      simulationType: options.scenarioType,
      subscribedEvents: [options.targetEventType],
      notificationSettingId: options.notificationSettingId,
      webhookSecret: options.webhookSecret,
      simulationConfig: {
        [options.scenarioType]: {}
      },
      env: options.env
    })

    const event = simulation.events.find((candidate) => candidate.event_type === options.targetEventType)

    if (!event) {
      return yield* Effect.fail(
        new Error(
          `Paddle scenario ${options.scenarioType} did not emit ${options.targetEventType}; emitted ${simulation.events.map((candidate) => candidate.event_type).join(", ")}`
        )
      )
    }

    const payload = toStoredPaddlePayload(event)
    const timestamp = Math.floor(Date.now() / 1000)

    return {
      payload,
      signature: toPaddleSignature(payload, simulation.webhookSecret, timestamp),
      webhookSecret: simulation.webhookSecret
    } satisfies PaddleSimulatorCapture
  })

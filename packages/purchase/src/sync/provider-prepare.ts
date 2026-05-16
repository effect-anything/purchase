import * as Redacted from "effect/Redacted"

import type { PurchaseProviderSettings } from "../core/config.ts"
import type { PaymentEnvironmentTag, PaymentProviderTag } from "../provider/types.ts"

export interface ProviderPrepareInput extends PurchaseProviderSettings {
  /**
   * Builds the provider settings plan without mutating provider configuration.
   */
  readonly dryRun?: boolean | undefined
  readonly current?: PurchaseProviderSettings | undefined
  readonly environment: PaymentEnvironmentTag
}

export interface ProviderPreparePlan {
  readonly status: "ready" | "unsupported"
  readonly reason?: string | undefined
  readonly changes: ReadonlyArray<ProviderPreparePlanChange>
  readonly checkoutUrl?:
    | {
        readonly current?: string | undefined
        readonly desired: string
        readonly action: "create" | "update" | "none" | "unsupported"
      }
    | undefined
  readonly webhookUrl?:
    | {
        readonly current?: string | undefined
        readonly desired: string
        readonly action: "create" | "update" | "none" | "unsupported"
      }
    | undefined
}

export interface ProviderPreparePlanChange {
  readonly path: string
  readonly current?: unknown
  readonly desired: unknown
  readonly action: "create" | "update" | "none" | "unsupported"
}

export interface ProviderPrepareResult {
  readonly provider: PaymentProviderTag
  readonly dryRun: boolean
  readonly plan: ProviderPreparePlan
  readonly secrets?:
    | {
        readonly webhook?:
          | {
              readonly current?: string | undefined
            }
          | undefined
      }
    | undefined
}

export const buildUnsupportedPrepareResult = (
  provider: PaymentProviderTag,
  input: ProviderPrepareInput
): ProviderPrepareResult => ({
  provider,
  dryRun: input.dryRun === true,
  plan: {
    status: "unsupported",
    reason: `Provider prepare is not implemented for ${provider} yet.`,
    changes: collectPrepareChanges(input),
    ...(input.checkoutUrl
      ? {
          checkoutUrl: {
            current: input.current?.checkoutUrl,
            desired: input.checkoutUrl,
            action: determineUnsupportedAction(input.current?.checkoutUrl, input.checkoutUrl)
          }
        }
      : {}),
    ...(input.webhookUrl
      ? {
          webhookUrl: {
            current: input.current?.webhookUrl,
            desired: input.webhookUrl,
            action: determineUnsupportedAction(input.current?.webhookUrl, input.webhookUrl)
          }
        }
      : {})
  }
})

export const collectPrepareChanges = (input: ProviderPrepareInput): ReadonlyArray<ProviderPreparePlanChange> => {
  const changes: Array<ProviderPreparePlanChange> = []

  if (input.checkoutUrl) {
    changes.push({
      path: "checkout.defaultCheckoutUrl",
      current: input.current?.checkoutUrl,
      desired: input.checkoutUrl,
      action: determineUnsupportedAction(input.current?.checkoutUrl, input.checkoutUrl)
    })
  }
  if (input.webhookUrl) {
    changes.push({
      path: "webhook.destinationUrl",
      current: input.current?.webhookUrl,
      desired: input.webhookUrl,
      action: determineUnsupportedAction(input.current?.webhookUrl, input.webhookUrl)
    })
  }
  appendNestedChanges(changes, "checkout.settings", input.checkout?.settings, input.current?.checkout?.settings)
  appendNestedChanges(
    changes,
    "checkout.paymentMethods",
    input.checkout?.paymentMethods,
    input.current?.checkout?.paymentMethods
  )
  appendNestedChanges(changes, "checkout.overlay", input.checkout?.overlay, input.current?.checkout?.overlay)
  appendNestedChanges(changes, "checkout.styles", input.checkout?.styles, input.current?.checkout?.styles)

  return changes
}

const appendNestedChanges = (
  changes: Array<ProviderPreparePlanChange>,
  prefix: string,
  value: unknown,
  currentValue: unknown
) => {
  if (!isRecord(value)) {
    return
  }

  for (const [key, entry] of Object.entries(value)) {
    if (entry === undefined) {
      continue
    }

    const path = `${prefix}.${key}`
    const currentEntry = isRecord(currentValue) ? currentValue[key] : undefined

    if (isRecord(entry) && hasNestedRecord(entry)) {
      appendNestedChanges(changes, path, entry, currentEntry)
    } else {
      changes.push({
        path,
        current: currentEntry,
        desired: entry,
        action: determineUnsupportedAction(currentEntry, entry)
      })
    }
  }
}

export const determineUnsupportedAction = (
  current: unknown,
  desired: unknown
): ProviderPreparePlanChange["action"] | NonNullable<ProviderPreparePlan["checkoutUrl"]>["action"] => {
  if (Object.is(current, desired)) {
    return "none"
  }
  return current === undefined ? "create" : "update"
}

const hasNestedRecord = (value: Record<string, unknown>) => Object.values(value).some((entry) => isRecord(entry))

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value)

const describeAction = (action: string) => {
  switch (action) {
    case "create":
      return "+ create"
    case "update":
      return "~ update"
    case "none":
      return "= no change"
    case "unsupported":
      return "! unsupported"
    default:
      return action
  }
}

export const formatPrepareResult = <
  TOptions extends { readonly environment: PaymentEnvironmentTag; readonly showSecrets: boolean }
>(
  options: TOptions,
  result: ProviderPrepareResult
) => {
  const lines = [
    "Connected",
    `  Provider · ${result.provider} (${options.environment})`,
    `  Mode     · ${result.dryRun ? "dry-run" : "apply"}`,
    "",
    "Provider prepare"
  ]

  if (result.plan.reason) {
    lines.push(`  ${result.plan.reason}`)
  }
  if (result.plan.checkoutUrl) {
    lines.push(`  Checkout URL · ${describeAction(result.plan.checkoutUrl.action)} ${result.plan.checkoutUrl.desired}`)
  }
  if (result.plan.webhookUrl) {
    lines.push(`  Webhook URL  · ${describeAction(result.plan.webhookUrl.action)} ${result.plan.webhookUrl.desired}`)
  }
  if (!result.plan.checkoutUrl && !result.plan.webhookUrl) {
    lines.push("  No desired settings provided")
  }
  if (result.plan.changes.length > 0) {
    lines.push("", "Desired settings")
    for (const change of result.plan.changes) {
      lines.push(
        `  ${describeAction(change.action)} ${change.path}${change.action === "none" ? "" : ` (${formatChange(change.current)} -> ${formatChange(change.desired)})`}`
      )
    }
  }

  if (result.secrets?.webhook?.current) {
    lines.push(
      "",
      `Webhook Secret · ${options.showSecrets ? result.secrets.webhook.current : maskSecret(result.secrets.webhook.current)}`
    )
  }

  lines.push("", `Done · ${result.plan.status}`)

  return {
    string: lines.join("\n"),
    secrets: {
      webhook: result.secrets?.webhook?.current ? Redacted.make(result.secrets?.webhook?.current) : undefined
    }
  }
}

const formatChange = (value: unknown) => {
  if (typeof value === "string") {
    return value
  }
  if (value === undefined) {
    return "undefined"
  }
  return JSON.stringify(value)
}

const maskSecret = (value: string) => {
  if (value.length <= 12) {
    return "*".repeat(value.length)
  }
  return `${value.slice(0, 8)}...${value.slice(-6)}`
}

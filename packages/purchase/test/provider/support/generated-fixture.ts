import { existsSync, mkdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const supportDir = path.dirname(fileURLToPath(import.meta.url))
const providerDir = path.resolve(supportDir, "..")
const generatedDir = path.join(providerDir, "fixtures", "generated")
type ProviderName = "stripe" | "paddle"

export interface StoredWebhookFixture {
  readonly payload: string
  readonly webhookSecret: string
  readonly source: string
  readonly eventType: string
  readonly capturedAt: string
}

export const ensureGeneratedFixtureDir = (provider?: ProviderName | undefined) => {
  const dir = provider ? path.join(generatedDir, provider) : generatedDir
  mkdirSync(dir, { recursive: true })
  return dir
}

export const generatedFixturePath = (provider: ProviderName, eventType: string) =>
  path.join(generatedDir, provider, `${eventType}.json`)

export const loadGeneratedWebhookFixture = (
  provider: ProviderName,
  eventType: string
): StoredWebhookFixture | undefined => {
  const filePath = generatedFixturePath(provider, eventType)
  if (!existsSync(filePath)) {
    return undefined
  }

  return JSON.parse(readFileSync(filePath, "utf8")) as StoredWebhookFixture
}

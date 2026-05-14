import type { PaymentProviderTag } from '../../src/provider/types.ts';
import { existsSync, mkdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const supportDir = path.dirname(fileURLToPath(import.meta.url))
const generatedDir = path.resolve(supportDir, "..", "provider", "fixtures", "generated")


export interface StoredWebhookFixture {
  readonly payload: string
  readonly webhookSecret: string
  readonly source: string
  readonly eventType: string
  readonly capturedAt: string
}

export const ensureGeneratedFixtureDir = (provider?: PaymentProviderTag | undefined) => {
  const dir = provider ? path.join(generatedDir, provider) : generatedDir
  mkdirSync(dir, { recursive: true })
  return dir
}

export const generatedFixturePath = (provider: PaymentProviderTag, eventType: string) =>
  path.join(generatedDir, provider, `${eventType}.json`)

export const loadGeneratedWebhookFixture = (
  provider: PaymentProviderTag,
  eventType: string
): StoredWebhookFixture | undefined => {
  const filePath = generatedFixturePath(provider, eventType)
  if (!existsSync(filePath)) {
    return undefined
  }

  return JSON.parse(readFileSync(filePath, "utf8")) as StoredWebhookFixture
}

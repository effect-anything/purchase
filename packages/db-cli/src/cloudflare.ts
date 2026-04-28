import * as Config from "effect/Config"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Crypto from "node:crypto"
import type { Unstable_Config } from "wrangler"
import { parseJSONC } from "confbox"

export const CloudflareConfig = Config.all({
  ACCOUNT_ID: Config.string("CLOUDFLARE_ACCOUNT_ID"),
  ACCOUNT_EMAIL: Config.string("CLOUDFLARE_EMAIL"),
  API_TOKEN: Config.string("CLOUDFLARE_API_TOKEN")
})

export class CloudflareError extends Data.TaggedError("CloudflareError")<{
  status: number
  errors: Array<{
    code?: number
    message?: string
  }>
}> {}

const durableObjectNamespaceIdFromName = (uniqueKey: string, data: string) => {
  const key = Crypto.createHash("sha256").update(uniqueKey).digest()
  const nameHmac = Crypto.createHmac("sha256", key).update(data).digest().subarray(0, 16)
  const hmac = Crypto.createHmac("sha256", key).update(nameHmac).digest().subarray(0, 16)
  return Buffer.concat([nameHmac, hmac]).toString("hex")
}

// R2BucketObject
// KVNamespaceObject
// QueueBrokerObject
export const getD1Name = (id: string) => durableObjectNamespaceIdFromName("miniflare-D1DatabaseObject", id)

const mergeEnvConfig = (config: Record<string, any>, env: string): Unstable_Config => {
  const envOverrides =
    env.length > 0 && config.env && typeof config.env === "object"
      ? (config.env[env] as Record<string, any> | undefined)
      : undefined

  return {
    ...config,
    ...envOverrides,
    env: config.env
  } as unknown as Unstable_Config
}

const readConfigFile = (configPath: string, env: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const source = yield* fs.readFileString(configPath)
    const parsed = yield* Effect.try({
      try: () => parseJSONC<Record<string, any>>(source),
      catch: (error) => error
    })

    return {
      config: mergeEnvConfig(parsed, env),
      path: configPath
    }
  }).pipe(
    Effect.withSpan("wrangler.read-config", {
      attributes: {
        configPath,
        env
      }
    }),
    Effect.orElseSucceed(() => undefined)
  )

export const parseConfig = Effect.fn("wrangler.parse-config")(function* (
  path: string | Array<string>,
  nodeEnv: "development" | "production" = "development",
  stage: "test" | "staging" | "production" = "test"
) {
  // Test 表示测试环境, Staging 表示预发布环境, 为空表示生产环境或者本地沿用生产配置
  const env = nodeEnv === "development" || stage === "production" ? "" : stage
  const configPaths = Array.isArray(path) ? path : [path]

  for (const configPath of configPaths) {
    const parsed = yield* readConfigFile(configPath, env)

    if (parsed) {
      return parsed
    }
  }

  return yield* Effect.die(`No configuration found, ${path}`)
})

import { NodeRuntime } from "@effect/platform-node"
import { Effect } from "effect"
import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

import { capturePaddleVendorSession } from "./paddle-vendor-session.ts"

export interface PaddleVendorCaptureConfig {
  readonly environment: "sandbox" | "production"
  readonly headless: boolean
  readonly outputPath: string
  readonly credentials: {
    readonly email: string
    readonly password: string
  }
}

export const readPaddleVendorCaptureConfig = (
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd()
): PaddleVendorCaptureConfig => {
  const rawEnvironment = env.PADDLE_VENDOR_ENVIRONMENT ?? env.PADDLE_ENVIRONMENT ?? "sandbox"
  const environment = rawEnvironment === "production" ? "production" : "sandbox"
  const email =
    environment === "production"
      ? (env.PADDLE_VENDOR_EMAIL ?? env.PADDLE_PRODUCTION_EMAIL)
      : (env.PADDLE_VENDOR_EMAIL ?? env.PADDLE_SANDBOX_EMAIL ?? env.PADDLE_SANBOX_EMAIL)
  const password =
    environment === "production"
      ? (env.PADDLE_VENDOR_PASSWORD ?? env.PADDLE_PRODUCTION_PASSWORD)
      : (env.PADDLE_VENDOR_PASSWORD ?? env.PADDLE_SANDBOX_PASSWORD)

  if (!email || !password) {
    throw new Error(
      environment === "production"
        ? "Missing Paddle vendor credentials. Set PADDLE_VENDOR_EMAIL/PADDLE_VENDOR_PASSWORD or PADDLE_PRODUCTION_EMAIL/PADDLE_PRODUCTION_PASSWORD."
        : "Missing Paddle vendor credentials. Set PADDLE_SANDBOX_EMAIL/PADDLE_SANDBOX_PASSWORD in .env.local. PADDLE_SANBOX_EMAIL is also accepted for the email typo."
    )
  }

  return {
    environment,
    headless: env.PADDLE_VENDOR_HEADLESS === "1",
    outputPath: path.resolve(
      cwd,
      env.PADDLE_VENDOR_SESSION_FILE ?? `.purchase/paddle-vendor-${environment}-session.json`
    ),
    credentials: { email, password }
  }
}

export const runPaddleVendorCapture = () => {
  loadEnvLocal()
  const config = readPaddleVendorCaptureConfig()

  return capturePaddleVendorSession({
    environment: config.environment,
    headless: config.headless,
    credentials: config.credentials
  }).pipe(
    Effect.tap((session) =>
      Effect.sync(() => {
        fs.mkdirSync(path.dirname(config.outputPath), { recursive: true })
        fs.writeFileSync(config.outputPath, JSON.stringify(session, null, 2))
        console.log(
          JSON.stringify(
            {
              saved: config.outputPath,
              environment: session.environment,
              vendorUrl: session.vendorUrl,
              capturedAt: session.capturedAt,
              cookieNames: session.cookies.map((cookie) => cookie.name)
            },
            null,
            2
          )
        )
      })
    )
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  NodeRuntime.runMain(runPaddleVendorCapture())
}

export function loadEnvLocal(start: string = process.cwd()) {
  const envPath = findEnvLocal(start)
  if (!envPath) return

  const contents = fs.readFileSync(envPath, "utf8")
  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)?\s*$/)
    if (!match) continue

    const key = match[1]
    if (process.env[key] !== undefined) continue

    process.env[key] = parseEnvValue(match[2] ?? "")
  }
}

export function findEnvLocal(start: string): string | undefined {
  let current = start
  while (true) {
    const candidate = path.join(current, ".env.local")
    if (fs.existsSync(candidate)) return candidate

    const parent = path.dirname(current)
    if (parent === current) return undefined
    current = parent
  }
}

export function parseEnvValue(value: string) {
  const trimmed = value.trim()
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) return trimmed.slice(1, -1).replace(/\\n/g, "\n")
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1)
  return trimmed.replace(/\s+#.*$/, "")
}

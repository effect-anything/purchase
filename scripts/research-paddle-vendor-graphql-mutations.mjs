import fs from "node:fs"
import path from "node:path"

loadLocalEnv(".env")
loadLocalEnv(".env.local")

const endpointByEnvironment = {
  sandbox: "https://sandbox-vendors.paddle.com/graphql",
  production: "https://vendors.paddle.com/graphql"
}

const refererByEnvironment = {
  sandbox: "https://sandbox-vendors.paddle.com/checkout-settings",
  production: "https://vendors.paddle.com/checkout-settings"
}

const environment = process.env.PADDLE_VENDOR_ENVIRONMENT ?? "sandbox"
const endpoint = process.env.PADDLE_VENDOR_GRAPHQL_URL ?? endpointByEnvironment[environment]
const cookie = process.env.PADDLE_VENDOR_COOKIE
const xsrfToken = process.env.PADDLE_VENDOR_XSRF_TOKEN
const origin = process.env.PADDLE_VENDOR_ORIGIN ?? endpoint.replace(/\/graphql$/, "")
const referer = process.env.PADDLE_VENDOR_REFERER ?? refererByEnvironment[environment] ?? `${origin}/checkout-settings`
const userAgent =
  process.env.PADDLE_VENDOR_USER_AGENT ??
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"

if (!endpoint) {
  throw new Error(`Unsupported PADDLE_VENDOR_ENVIRONMENT "${environment}".`)
}

if (!cookie) {
  throw new Error("Missing PADDLE_VENDOR_COOKIE.")
}

const payloadSource = process.env.PADDLE_VENDOR_MUTATION_PAYLOAD_FILE

if (!payloadSource) {
  console.log(
    JSON.stringify(
      {
        endpoint,
        message:
          "Set PADDLE_VENDOR_MUTATION_PAYLOAD_FILE to a JSON file copied from browser Network request payload before running this script."
      },
      null,
      2
    )
  )
  process.exit(0)
}

const payload = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), payloadSource), "utf8"))

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    accept: "*/*",
    "content-type": "application/json",
    cookie,
    origin,
    referer,
    "user-agent": userAgent,
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    ...(xsrfToken ? { "x-xsrf-token": xsrfToken } : {})
  },
  body: JSON.stringify(payload)
})

const text = await response.text()
let json
try {
  json = JSON.parse(text)
} catch {
  json = { raw: text }
}

console.log(
  JSON.stringify(
    {
      endpoint,
      operationName: payload.operationName,
      variables: payload.variables,
      status: response.status,
      ok: response.ok,
      json
    },
    null,
    2
  )
)

function loadLocalEnv(fileName) {
  const filePath = path.resolve(process.cwd(), fileName)
  if (!fs.existsSync(filePath)) {
    return
  }

  const content = fs.readFileSync(filePath, "utf8")
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    const separator = trimmed.indexOf("=")
    if (separator === -1) {
      continue
    }

    const key = trimmed.slice(0, separator).trim()
    const value = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "")
    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

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
const sellerId = process.env.PADDLE_VENDOR_SELLER_ID
const includeRaw = process.env.PADDLE_VENDOR_INCLUDE_RAW === "1"
const origin = process.env.PADDLE_VENDOR_ORIGIN ?? endpoint.replace(/\/graphql$/, "")
const referer = process.env.PADDLE_VENDOR_REFERER ?? refererByEnvironment[environment] ?? `${origin}/checkout-settings`
const userAgent =
  process.env.PADDLE_VENDOR_USER_AGENT ??
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
const accept = process.env.PADDLE_VENDOR_ACCEPT ?? "*/*"

if (!endpoint) {
  throw new Error(`Unsupported PADDLE_VENDOR_ENVIRONMENT "${environment}".`)
}

if (!cookie) {
  throw new Error("Missing PADDLE_VENDOR_COOKIE. Pass it only as a local environment variable; do not commit it.")
}

const operations = [
  {
    operationName: "IntrospectionQueryTypes",
    responseDataPath: ["data", "__schema"],
    mapsToConfigPaths: [],
    variables: {},
    query: `query IntrospectionQueryTypes {
  __schema {
    queryType {
      name
      fields {
        name
        args {
          name
          type {
            kind
            name
            ofType {
              kind
              name
            }
          }
        }
        type {
          kind
          name
          ofType {
            kind
            name
          }
        }
      }
    }
    mutationType {
      name
      fields {
        name
        args {
          name
          type {
            kind
            name
            ofType {
              kind
              name
            }
          }
        }
        type {
          kind
          name
          ofType {
            kind
            name
          }
        }
      }
    }
  }
}`
  },
  {
    operationName: "GetCheckoutSettings",
    responseDataPath: ["data", "getCheckoutSettings", "data"],
    mapsToConfigPaths: [
      "checkoutUrl -> defaultCheckoutUrl.url",
      "checkout.settings.audienceOptin",
      "checkout.settings.checkoutDiscounts",
      "checkout.settings.enableSavedPaymentMethods",
      "checkout.settings.orderConfirmationEmail.freeCheckoutReceipts",
      "checkout.settings.orderConfirmationEmail.receiptShowMessage",
      "checkout.paymentMethods.*"
    ],
    variables: {},
    query: `query GetCheckoutSettings {
  getCheckoutSettings {
    data {
      vendorName
      audienceOptin
      checkoutDiscounts
      enableSavedPaymentMethods
      statementDescription
      vendorFeatures {
        toggleCardPayments
        wireTransfers
        paypal
        __typename
      }
      defaultCheckoutUrl {
        url
        state
        __typename
      }
      featureFlags {
        defaultCheckoutUrl
        showAliPaySetting
        showIdealSetting
        showGooglePaySetting
        showBancontactSetting
        showSavedPaymentMethodsSetting
        showApplePayDomainVerificationTab
        showPixSetting
        showUpiSetting
        showWeChatSetting
        showMBWaySetting
        showBlikSetting
        showSouthKoreaLocalCardSetting
        showNaverPaySetting
        showKakaoPaySetting
        showSamsungPaySetting
        showPaycoSetting
        __typename
      }
      orderConfirmationEmail {
        freeCheckoutReceipts
        receiptShowMessage
        __typename
      }
      paymentMethods {
        card
        paypal
        wireTransfer
        alipay
        googlePay
        applePay
        ideal
        bancontact
        pix
        upi
        blik
        mbway
        wechat
        southKoreaLocalCard
        naverPay
        kakaoPay
        samsungPay
        payco
        __typename
      }
      __typename
    }
    __typename
  }
}`
  },
  {
    operationName: "GetOverlaySettings",
    responseDataPath: ["data", "getOverlaySettings", "data"],
    mapsToConfigPaths: ["checkout.overlay.brandColor"],
    variables: {},
    query: `query GetOverlaySettings {
  getOverlaySettings {
    data {
      brandColor
      __typename
    }
    __typename
  }
}`
  },
  {
    operationName: "GetCheckoutStyles",
    responseDataPath: ["data", "getCheckoutStyles", "data"],
    mapsToConfigPaths: ["checkout.styles.theme.*"],
    variables: sellerId ? { sellerId } : {},
    query: `query GetCheckoutStyles($sellerId: ID) {
  getCheckoutStyles(sellerId: $sellerId) {
    data {
      theme {
        globals {
          activeFocusBorderColor
          activeFocusBoxShadowColor
          borderRadius
          fontFamily
          primaryFontSize
          secondaryFontSize
          useContainerPadding
          maxWidth
          __typename
        }
        inputs {
          text {
            activeColor
            backgroundColor
            borderColor
            borderRadius
            borderWidth
            color
            fontSize
            minHeight
            placeholderColor
            withBoxShadow
            __typename
          }
          checkbox {
            backgroundColor
            borderRadius
            __typename
          }
          select {
            backgroundColor
            borderColor
            borderRadius
            borderWidth
            color
            fontSize
            height
            minHeight
            withBoxShadow
            __typename
          }
          selectFieldWithLabel {
            labelVisible
            labelPosition
            __typename
          }
          inputFieldWithLabel {
            labelVisible
            labelPosition
            __typename
          }
          __typename
        }
        buttons {
          primary {
            activeFocusBorderColor
            activeFocusBoxShadowColor
            borderColor
            borderColorHover
            borderWidth
            color
            colorHover
            backgroundColor
            backgroundColorHover
            borderRadius
            fontSize
            height
            width
            __typename
          }
          secondary {
            activeFocusBorderColor
            activeFocusBoxShadowColor
            borderColor
            borderColorHover
            borderWidth
            color
            colorHover
            backgroundColor
            backgroundColorHover
            borderRadius
            fontSize
            height
            width
            __typename
          }
          __typename
        }
        paddleBar {
          container {
            backgroundColor
            borderColor
            borderRadius
            __typename
          }
          dataSharedAndPaddleAddress {
            fontSize
            __typename
          }
          paddleMerchantOrderProcess {
            fontSize
            __typename
          }
          __typename
        }
        label {
          color
          fontSize
          fontWeight
          __typename
        }
        link {
          color
          colorHover
          fontSize
          __typename
        }
        notification {
          container {
            backgroundColor
            borderColor
            borderRadius
            __typename
          }
          text {
            fontSize
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
}`
  }
]

const request = async (operation) => {
  const declaredVariables = extractDeclaredVariables(operation.query)
  const missingVariables = declaredVariables.filter((name) => !(name in operation.variables))
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      accept,
      "content-type": "application/json",
      cookie,
      origin,
      referer,
      "user-agent": userAgent,
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-ch-ua": '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      ...(xsrfToken ? { "x-xsrf-token": xsrfToken } : {})
    },
    body: JSON.stringify(operation)
  })

  const text = await response.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text }
  }

  return {
    operationName: operation.operationName,
    status: response.status,
    ok: response.ok,
    request: {
      endpoint,
      variables: operation.variables,
      declaredVariables,
      missingVariables,
      hasCookie: true,
      hasXsrfToken: Boolean(xsrfToken),
      origin,
      referer,
      accept,
      userAgent
    },
    mapping: {
      responseDataPath: operation.responseDataPath,
      configPaths: operation.mapsToConfigPaths
    },
    response: summarizeResponse(operation, json),
    ...(includeRaw ? { json } : {})
  }
}

const summarizeResponse = (operation, json) => {
  const data = readPath(json, operation.responseDataPath)

  return {
    shape: summarize(data ?? json),
    leafPaths: collectLeafPaths(data ?? json),
    errorMessages: Array.isArray(json?.errors)
      ? json.errors.map((error) => error?.message ?? "Unknown GraphQL error")
      : []
  }
}

const summarize = (value) => {
  if (Array.isArray(value)) {
    return value.length === 0 ? [] : [summarize(value[0])]
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, summarize(entry)]))
  }
  return typeof value
}

const readPath = (value, pathSegments) => {
  let current = value
  for (const segment of pathSegments) {
    if (!current || typeof current !== "object") {
      return undefined
    }
    current = current[segment]
  }
  return current
}

const collectLeafPaths = (value, prefix = "") => {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return prefix ? [`${prefix}[]`] : ["[]"]
    }
    return collectLeafPaths(value[0], prefix ? `${prefix}[]` : "[]")
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, entry]) => collectLeafPaths(entry, prefix ? `${prefix}.${key}` : key))
  }

  return [prefix || "<root>"]
}

const extractDeclaredVariables = (query) => {
  const match = query.match(/^[^(]+\(([^)]+)\)/m)
  if (!match) {
    return []
  }

  return match[1]
    .split(",")
    .map((entry) => entry.trim().match(/^\$([A-Za-z0-9_]+)/)?.[1])
    .filter(Boolean)
}

const results = []
for (const operation of operations) {
  results.push(await request(operation))
}

console.log(JSON.stringify({ endpoint, operations: results }, null, 2))

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

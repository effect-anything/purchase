import * as HttpBody from "@effect/platform/HttpBody"

export type ProviderRequestEncoding = "form" | "json"

export interface RequestParts {
  readonly path: string
  readonly query: ReadonlyArray<readonly [string, string]>
  readonly body: unknown | undefined
}

export const buildPath = (template: string, input: Record<string, unknown>, pathParams: ReadonlySet<string>) => {
  let path = template
  for (const key of pathParams) {
    path = path.replace(`{${key}}`, encodeURIComponent(String(input[key])))
  }
  return path
}

export const splitRequestParts = (
  pathTemplate: string,
  input: Record<string, unknown>,
  options: {
    readonly pathParams?: ReadonlyArray<string>
    readonly queryParams?: ReadonlyArray<string>
    readonly bodyParams?: ReadonlyArray<string>
  } = {}
): RequestParts => {
  const pathParams = new Set(options.pathParams ?? [])
  const explicitQueryParams = options.queryParams ? new Set(options.queryParams) : undefined
  const explicitBodyParams = options.bodyParams ? new Set(options.bodyParams) : undefined
  const querySource: Record<string, unknown> = {}
  const bodySource: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || pathParams.has(key)) {
      continue
    }
    if (explicitBodyParams?.has(key)) {
      bodySource[key] = value
      continue
    }
    if (explicitQueryParams?.has(key) || !explicitBodyParams) {
      querySource[key] = value
      continue
    }
    bodySource[key] = value
  }

  return {
    path: buildPath(pathTemplate, input, pathParams),
    query: encodeQuery(querySource),
    body: Object.keys(bodySource).length > 0 ? bodySource : undefined
  }
}

export const encodeQuery = (input: Record<string, unknown>) => encodeNested(input, "repeat")

export const encodeStripeForm = (input: Record<string, unknown>) => encodeNested(input, "indexed")

export const encodePaddleQuery = (input: Record<string, unknown>) => encodeNested(input, "repeat")

export const makeBody = (encoding: ProviderRequestEncoding, body: unknown | undefined) => {
  if (body === undefined) {
    return undefined
  }

  return encoding === "form"
    ? HttpBody.urlParams(encodeStripeForm(body as Record<string, unknown>))
    : HttpBody.unsafeJson(body)
}

const encodeNested = (input: Record<string, unknown>, arrayStyle: "indexed" | "repeat") => {
  const entries: Array<readonly [string, string]> = []

  const visit = (path: ReadonlyArray<string>, value: unknown): void => {
    if (typeof value === "undefined") {
      return
    }

    if (value === null) {
      entries.push([formatPath(path), ""])
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(arrayStyle === "indexed" ? [...path, String(index)] : path, item))
      return
    }

    if (typeof value === "object") {
      const objectEntries = Object.entries(value)
      if (objectEntries.length === 0) {
        entries.push([formatPath(path), ""])
        return
      }

      objectEntries.forEach(([key, nested]) => visit([...path, key], nested))
      return
    }

    entries.push([formatPath(path), String(value)])
  }

  Object.entries(input).forEach(([key, value]) => visit([key], value))

  return entries
}

const formatPath = (path: ReadonlyArray<string>) => {
  const [head, ...tail] = path
  return `${head ?? ""}${tail.map((segment) => `[${segment}]`).join("")}`
}

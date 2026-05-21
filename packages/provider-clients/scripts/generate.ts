import { spawn } from "node:child_process"
import * as fs from "node:fs/promises"
import * as path from "node:path"
import { fileURLToPath } from "node:url"
import YAML from "yaml"

type ProviderName = "creem" | "dodo" | "lemon" | "paddle" | "polar" | "stripe"
type HttpMethod = "delete" | "get" | "patch" | "post" | "put"

interface OpenApiSpec {
  readonly openapi?: string
  readonly swagger?: string
  readonly paths?: Record<string, PathItem>
  readonly components?: {
    readonly schemas?: Record<string, SchemaObject>
    readonly parameters?: Record<string, ParameterObject>
    readonly requestBodies?: Record<string, RequestBodyObject>
    readonly responses?: Record<string, ResponseObject>
  }
  readonly definitions?: Record<string, SchemaObject>
  readonly parameters?: Record<string, ParameterObject>
  readonly responses?: Record<string, ResponseObject>
}

type PathItem = Partial<Record<HttpMethod, OperationObject>> & { readonly parameters?: ReadonlyArray<ParameterObject> }

interface OperationObject {
  readonly operationId?: string
  readonly summary?: string
  readonly description?: string
  readonly deprecated?: boolean
  readonly parameters?: ReadonlyArray<ParameterObject>
  readonly requestBody?: RequestBodyObject | RefObject
  readonly responses?: Record<string, ResponseObject>
  readonly tags?: ReadonlyArray<string>
}

interface ParameterObject {
  readonly name?: string
  readonly in?: "header" | "path" | "query"
  readonly required?: boolean
  readonly schema?: SchemaObject
  readonly $ref?: string
}

interface RefObject {
  readonly $ref: string
}

interface RequestBodyObject {
  readonly content?: Record<string, { readonly schema?: SchemaObject }>
}

interface ResponseObject {
  readonly content?: Record<string, { readonly schema?: SchemaObject }>
  readonly schema?: SchemaObject
}

interface SchemaObject {
  readonly type?: string | ReadonlyArray<string>
  readonly format?: string
  readonly $ref?: string
  readonly properties?: Record<string, SchemaObject>
  readonly items?: SchemaObject
  readonly required?: ReadonlyArray<string>
  readonly enum?: ReadonlyArray<string | number | boolean | null>
  readonly nullable?: boolean
  readonly anyOf?: ReadonlyArray<SchemaObject>
  readonly oneOf?: ReadonlyArray<SchemaObject>
  readonly allOf?: ReadonlyArray<SchemaObject>
  readonly additionalProperties?: boolean | SchemaObject
  readonly description?: string
}

interface ProviderConfig {
  readonly name: ProviderName
  readonly specUrl: string
  readonly specFile: string
  readonly outputDir: string
  readonly clientImport: string
  readonly coreImport: string
  readonly modelImport: string
  readonly modelFile: string
  readonly contentType: "form" | "json"
  readonly pathPrefix?: string
  readonly operationFilter?: (operation: OperationObject, path: string, method: HttpMethod) => boolean
}

interface OperationEntry {
  readonly apiPath: string
  readonly method: HttpMethod
  readonly operation: OperationObject
  readonly functionName: string
  readonly typeName: string
  readonly parameters: ReadonlyArray<ParameterObject>
  readonly bodySchema: SchemaObject | undefined
  readonly success: { readonly status: string; readonly schema: SchemaObject | undefined } | undefined
}

interface RenderOptions {
  readonly modelNames: ReadonlyMap<string, string>
  readonly useModelRefs: boolean
  readonly modelMode?: "imported" | "models-namespace" | "same-file"
}

interface ModelGraph {
  readonly dependencies: ReadonlyMap<string, ReadonlySet<string>>
  readonly circular: ReadonlySet<string>
}

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)))

const providers: Record<ProviderName, ProviderConfig> = {
  creem: {
    name: "creem",
    specUrl: "https://raw.githubusercontent.com/armitage-labs/creem/main/packages/creem-sdk/openapi.json",
    specFile: path.join(rootDir, "specs/creem/openapi.json"),
    outputDir: path.join(rootDir, "src/creem/operations/generated"),
    clientImport: "../../client.ts",
    coreImport: "../../../core/operation.ts",
    modelImport: "../../models.ts",
    modelFile: path.join(rootDir, "src/creem/models.ts"),
    contentType: "json",
    pathPrefix: "/v1",
    operationFilter: (_operation, apiPath) =>
      apiPath.startsWith("/v1/products") ||
      apiPath.startsWith("/v1/checkouts") ||
      apiPath.startsWith("/v1/subscriptions") ||
      apiPath.startsWith("/v1/customers") ||
      apiPath.startsWith("/v1/licenses") ||
      apiPath.startsWith("/v1/transactions")
  },
  dodo: {
    name: "dodo",
    specUrl: "local:minimal-dodo-openapi",
    specFile: path.join(rootDir, "specs/dodo/openapi.json"),
    outputDir: path.join(rootDir, "src/dodo/operations/generated"),
    clientImport: "../../client.ts",
    coreImport: "../../../core/operation.ts",
    modelImport: "../../models.ts",
    modelFile: path.join(rootDir, "src/dodo/models.ts"),
    contentType: "json",
    operationFilter: (_operation, apiPath) =>
      apiPath.startsWith("/products") ||
      apiPath.startsWith("/checkouts") ||
      apiPath.startsWith("/subscriptions") ||
      apiPath.startsWith("/customers") ||
      apiPath.startsWith("/payments") ||
      apiPath.startsWith("/events") ||
      apiPath.startsWith("/meters") ||
      apiPath.startsWith("/refunds") ||
      apiPath.startsWith("/discounts") ||
      apiPath.startsWith("/license_keys") ||
      apiPath.startsWith("/licenses") ||
      apiPath.startsWith("/credit-entitlements")
  },
  lemon: {
    name: "lemon",
    specUrl: "local:minimal-lemon-squeezy-openapi",
    specFile: path.join(rootDir, "specs/lemon/openapi.json"),
    outputDir: path.join(rootDir, "src/lemon/operations/generated"),
    clientImport: "../../client.ts",
    coreImport: "../../../core/operation.ts",
    modelImport: "../../models.ts",
    modelFile: path.join(rootDir, "src/lemon/models.ts"),
    contentType: "json",
    pathPrefix: "/v1",
    operationFilter: (_operation, apiPath) =>
      apiPath.startsWith("/v1/products") ||
      apiPath.startsWith("/v1/variants") ||
      apiPath.startsWith("/v1/prices") ||
      apiPath.startsWith("/v1/checkouts") ||
      apiPath.startsWith("/v1/customers") ||
      apiPath.startsWith("/v1/orders") ||
      apiPath.startsWith("/v1/subscriptions") ||
      apiPath.startsWith("/v1/license-keys") ||
      apiPath.startsWith("/v1/licenses")
  },
  stripe: {
    name: "stripe",
    specUrl: "https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.sdk.json",
    specFile: path.join(rootDir, "specs/stripe/openapi.json"),
    outputDir: path.join(rootDir, "src/stripe/operations/generated"),
    clientImport: "../../client.ts",
    coreImport: "../../../core/operation.ts",
    modelImport: "../../models.ts",
    modelFile: path.join(rootDir, "src/stripe/models.ts"),
    contentType: "form",
    operationFilter: (_operation, apiPath) =>
      apiPath.startsWith("/v1/customers") ||
      apiPath.startsWith("/v1/products") ||
      apiPath.startsWith("/v1/prices") ||
      apiPath.startsWith("/v1/subscriptions") ||
      apiPath.startsWith("/v1/checkout/sessions")
  },
  paddle: {
    name: "paddle",
    specUrl: "https://raw.githubusercontent.com/PaddleHQ/paddle-openapi/main/v1/openapi.yaml",
    specFile: path.join(rootDir, "specs/paddle/openapi.yaml"),
    outputDir: path.join(rootDir, "src/paddle/operations/generated"),
    clientImport: "../../client.ts",
    coreImport: "../../../core/operation.ts",
    modelImport: "../../models.ts",
    modelFile: path.join(rootDir, "src/paddle/models.ts"),
    contentType: "json",
    operationFilter: (_operation, apiPath) =>
      apiPath.startsWith("/customers") ||
      apiPath.startsWith("/products") ||
      apiPath.startsWith("/prices") ||
      apiPath.startsWith("/subscriptions") ||
      apiPath.startsWith("/transactions")
  },
  polar: {
    name: "polar",
    specUrl: "https://api.polar.sh/openapi.json",
    specFile: path.join(rootDir, "specs/polar/openapi.json"),
    outputDir: path.join(rootDir, "src/polar/operations/generated"),
    clientImport: "../../client.ts",
    coreImport: "../../../core/operation.ts",
    modelImport: "../../models.ts",
    modelFile: path.join(rootDir, "src/polar/models.ts"),
    contentType: "json",
    operationFilter: (_operation, apiPath) =>
      apiPath.startsWith("/v1/products/") ||
      apiPath.startsWith("/v1/checkouts/") ||
      apiPath.startsWith("/v1/checkout-links/") ||
      apiPath.startsWith("/v1/customers/") ||
      apiPath.startsWith("/v1/subscriptions/") ||
      apiPath.startsWith("/v1/orders/") ||
      apiPath.startsWith("/v1/benefits/") ||
      apiPath.startsWith("/v1/license-keys/")
  }
}

const providerNames = new Set<ProviderName>(["creem", "dodo", "lemon", "paddle", "polar", "stripe"])
const selected = process.argv
  .slice(2)
  .filter((value): value is ProviderName => providerNames.has(value as ProviderName))
const targets = selected.length > 0 ? selected : (["stripe", "paddle", "polar", "creem", "dodo", "lemon"] as const)

for (const provider of targets) {
  await generateProvider(providers[provider])
}

async function generateProvider(config: ProviderConfig) {
  await fs.mkdir(path.dirname(config.specFile), { recursive: true })
  await fs.mkdir(config.outputDir, { recursive: true })
  await fs.mkdir(path.dirname(config.modelFile), { recursive: true })

  if (!(await exists(config.specFile)) && !config.specUrl.startsWith("local:")) {
    await download(config.specUrl, config.specFile)
  }

  const spec = await readSpec(config.specFile)
  const paths = spec.paths ?? {}
  const operationEntries: Array<OperationEntry> = []
  const operationExports: Array<string> = []
  const seenNames = new Set<string>()

  for (const [apiPath, pathItem] of Object.entries(paths)) {
    for (const method of ["get", "post", "put", "patch", "delete"] as const) {
      const operation = pathItem[method]
      if (!operation?.operationId || operation.deprecated || !operation.responses) continue
      if (config.operationFilter && !config.operationFilter(operation, apiPath, method)) continue

      const functionName = uniqueName(toCamelCase(operation.operationId), seenNames)
      operationEntries.push({
        apiPath:
          config.pathPrefix && apiPath.startsWith(config.pathPrefix)
            ? apiPath.slice(config.pathPrefix.length) || "/"
            : apiPath,
        method,
        operation,
        functionName,
        typeName: toPascalCase(functionName),
        parameters: [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])].flatMap((parameter) => {
          const resolved = resolveParameter(spec, parameter)
          return resolved ? [resolved] : []
        }),
        bodySchema: getRequestBodySchema(spec, operation),
        success: getSuccessResponse(operation)
      })
    }
  }

  const modelNames = buildModelNameMap(spec)
  const usedRefs = collectUsedRefs(spec, operationEntries)
  const modelGraph = buildModelGraph(spec, usedRefs)
  await generateModels(config, spec, modelNames, usedRefs, modelGraph)
  await cleanGenerated(config.outputDir)

  const renderOptions: RenderOptions = { modelNames, useModelRefs: true }
  for (const entry of operationEntries) {
    const pathParams = entry.parameters.filter((parameter) => parameter.in === "path" && parameter.name)
    const queryParams = entry.parameters.filter((parameter) => parameter.in === "query" && parameter.name)
    const inputShape = renderInputSchema(entry.parameters, entry.bodySchema, spec, renderOptions)
    const outputSchema = renderSchema(entry.success?.schema, spec, renderOptions)
    const bodyParamNames = entry.bodySchema?.properties ? Object.keys(entry.bodySchema.properties) : []
    const status = entry.success?.status ? [Number.parseInt(entry.success.status, 10)] : [200]
    const fileName = `${entry.functionName}.ts`

    await fs.writeFile(
      path.join(config.outputDir, fileName),
      `${renderOperationFile({
        config,
        operation: entry.operation,
        operationName: entry.functionName,
        typeName: entry.typeName,
        method: entry.method,
        apiPath: entry.apiPath,
        inputShape,
        outputSchema,
        status,
        pathParams: pathParams.map((parameter) => parameter.name!),
        queryParams: queryParams.map((parameter) => parameter.name!),
        bodyParams: bodyParamNames
      })}\n`
    )
    operationExports.push(`export * from "./generated/${fileName}"`)
  }

  await fs.writeFile(path.join(config.outputDir, "../generated.ts"), `${operationExports.sort().join("\n")}\n`)
  await formatGenerated(config)
  console.log(
    `Generated ${operationExports.length} ${config.name} operations, ${usedRefs.size} shared models, ${modelGraph.circular.size} circular models`
  )
}

async function formatGenerated(config: ProviderConfig) {
  const generatedModelsDir = path.join(path.dirname(config.modelFile), "models/generated")
  await runOxfmt([
    config.modelFile,
    generatedModelsDir,
    path.join(config.outputDir, "../generated.ts"),
    config.outputDir
  ])
}

async function runOxfmt(paths: ReadonlyArray<string>) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn("oxfmt", [...paths], {
      cwd: rootDir,
      env: process.env,
      stdio: "inherit"
    })
    child.on("error", reject)
    child.on("exit", (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`oxfmt failed with exit code ${code ?? "unknown"}`))
      }
    })
  })
}

async function generateModels(
  config: ProviderConfig,
  spec: OpenApiSpec,
  modelNames: ReadonlyMap<string, string>,
  usedRefs: ReadonlySet<string>,
  modelGraph: ModelGraph
) {
  const schemas = spec.components?.schemas ?? spec.definitions ?? {}
  const generatedDir = path.join(path.dirname(config.modelFile), "models/generated")
  await cleanGenerated(generatedDir)

  const exports: Array<string> = []
  for (const [index, refName] of orderModels(usedRefs, modelGraph).entries()) {
    const schema = schemas[refName]
    const modelName = modelNames.get(refName)
    if (!schema || !modelName) continue
    const rendered = renderSchema(schema, spec, {
      modelNames,
      useModelRefs: true,
      modelMode: "models-namespace"
    })
    const fileName = `${String(index).padStart(4, "0")}-${toKebabCase(modelName)}.ts`
    const lines = [`import * as Schema from "effect/Schema"`, `import * as Models from "../../models.ts"`, ""]
    if (modelGraph.circular.has(refName)) {
      lines.push(`export type ${modelName} = ${renderType(schema, spec, { modelNames })}`)
      lines.push("")
    }
    lines.push(`export const ${modelName} = ${rendered}`)
    if (!modelGraph.circular.has(refName)) {
      lines.push(`export type ${modelName} = typeof ${modelName}.Type`)
    }
    await fs.writeFile(path.join(generatedDir, fileName), `${lines.join("\n").trimEnd()}\n`)
    exports.push(`export * from "./models/generated/${fileName}"`)
  }
  await fs.writeFile(config.modelFile, `${exports.sort().join("\n")}\n`)
}

function buildModelGraph(spec: OpenApiSpec, usedRefs: ReadonlySet<string>): ModelGraph {
  const schemas = spec.components?.schemas ?? spec.definitions ?? {}
  const dependencies = new Map<string, ReadonlySet<string>>()
  for (const refName of usedRefs) {
    dependencies.set(refName, collectSchemaRefs(schemas[refName], usedRefs, refName))
  }
  return {
    dependencies,
    circular: detectCircularModels(dependencies)
  }
}

function collectSchemaRefs(schema: SchemaObject | undefined, allowed: ReadonlySet<string>, self: string) {
  const refs = new Set<string>()
  const visit = (value: SchemaObject | undefined): void => {
    if (!value) return
    if (value.$ref) {
      const name = refSchemaName(value.$ref)
      if (name && allowed.has(name)) refs.add(name)
      return
    }
    value.allOf?.forEach(visit)
    value.oneOf?.forEach(visit)
    value.anyOf?.forEach(visit)
    visit(value.items)
    if (value.additionalProperties && typeof value.additionalProperties === "object") visit(value.additionalProperties)
    Object.values(value.properties ?? {}).forEach(visit)
  }
  visit(schema)
  return refs
}

function detectCircularModels(dependencies: ReadonlyMap<string, ReadonlySet<string>>) {
  const circular = new Set<string>()
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const stack: Array<string> = []

  const visit = (node: string) => {
    if (visited.has(node)) return
    if (visiting.has(node)) {
      const index = stack.indexOf(node)
      for (const item of stack.slice(Math.max(index, 0))) circular.add(item)
      circular.add(node)
      return
    }
    visiting.add(node)
    stack.push(node)
    for (const dependency of dependencies.get(node) ?? []) visit(dependency)
    stack.pop()
    visiting.delete(node)
    visited.add(node)
  }

  for (const node of dependencies.keys()) visit(node)
  return circular
}

function orderModels(usedRefs: ReadonlySet<string>, modelGraph: ModelGraph) {
  const ordered: Array<string> = []
  const emitted = new Set<string>()
  const visiting = new Set<string>()

  const visit = (node: string) => {
    if (emitted.has(node)) return
    if (visiting.has(node)) return
    visiting.add(node)
    for (const dependency of modelGraph.dependencies.get(node) ?? []) {
      if (!modelGraph.circular.has(node) && !modelGraph.circular.has(dependency)) visit(dependency)
    }
    visiting.delete(node)
    emitted.add(node)
    ordered.push(node)
  }

  for (const refName of [...usedRefs].sort()) visit(refName)
  return ordered
}

function renderOperationFile(args: {
  readonly config: ProviderConfig
  readonly operation: OperationObject
  readonly operationName: string
  readonly typeName: string
  readonly method: HttpMethod
  readonly apiPath: string
  readonly inputShape: string
  readonly outputSchema: string
  readonly status: ReadonlyArray<number>
  readonly pathParams: ReadonlyArray<string>
  readonly queryParams: ReadonlyArray<string>
  readonly bodyParams: ReadonlyArray<string>
}) {
  const doc = renderDoc(args.operation.summary ?? args.operation.description)
  return `import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "${args.config.coreImport}"
import * as Models from "${args.config.modelImport}"
import { ${toPascalCase(args.config.name)}Client } from "${args.config.clientImport}"

export const ${args.typeName}Input = ${args.inputShape}
export type ${args.typeName}Input = typeof ${args.typeName}Input.Type

export const ${args.typeName}Output = ${args.outputSchema}
export type ${args.typeName}Output = typeof ${args.typeName}Output.Type

export const ${args.operationName}Operation = defineOperation({
  id: "${args.config.name}.${args.operation.operationId}",
  method: "${args.method.toUpperCase()}",
  path: "${args.apiPath}",
  inputSchema: ${args.typeName}Input,
  outputSchema: ${args.typeName}Output,
  status: [${args.status.join(", ")}],
  contentType: "${args.config.contentType}"${renderArrayProperty("pathParams", args.pathParams)}${renderArrayProperty("queryParams", args.queryParams)}${renderArrayProperty("bodyParams", args.bodyParams)}
})

${doc}export const ${args.operationName} = (input: ${args.typeName}Input) =>
  ${toPascalCase(args.config.name)}Client.pipe(Effect.flatMap((client) => client.request(${args.operationName}Operation, input)))`
}

function renderArrayProperty(name: string, values: ReadonlyArray<string>) {
  return values.length > 0 ? `,\n  ${name}: [${values.map((value) => `"${value}"`).join(", ")}]` : ""
}

function renderInputSchema(
  parameters: ReadonlyArray<ParameterObject>,
  bodySchema: SchemaObject | undefined,
  spec: OpenApiSpec,
  options: RenderOptions
) {
  const fields: Array<string> = []
  for (const parameter of parameters) {
    if (!parameter.name || parameter.in === "header") continue
    const schema = renderSchema(parameter.schema, spec, options)
    fields.push(`  ${quoteKey(parameter.name)}: ${parameter.required ? schema : `Schema.optional(${schema})`},`)
  }
  if (bodySchema?.properties) {
    const required = new Set(bodySchema.required ?? [])
    for (const [key, schema] of Object.entries(bodySchema.properties)) {
      if (fields.some((field) => field.includes(`${quoteKey(key)}:`))) continue
      const rendered = renderSchema(schema, spec, options)
      fields.push(`  ${quoteKey(key)}: ${required.has(key) ? rendered : `Schema.optional(${rendered})`},`)
    }
  }
  return `Schema.Struct({\n${fields.join("\n")}\n})`
}

function renderSchema(
  schema: SchemaObject | undefined,
  spec: OpenApiSpec,
  options: RenderOptions,
  seen = new Set<string>()
): string {
  if (!schema) return "Schema.Unknown"
  if (schema.$ref) {
    const refName = refSchemaName(schema.$ref)
    const modelName = refName ? options.modelNames.get(refName) : undefined
    if (options.useModelRefs && modelName) {
      if (options.modelMode === "models-namespace")
        return `Schema.suspend((): Schema.Schema<Models.${modelName}, any, any> => Models.${modelName} as Schema.Schema<Models.${modelName}, any, any>)`
      return options.modelMode === "same-file"
        ? `Schema.suspend((): Schema.Schema<${modelName}> => ${modelName})`
        : `Models.${modelName}`
    }
    const ref = resolveRef(spec, schema.$ref)
    if (!ref || seen.has(schema.$ref)) return "Schema.Unknown"
    return renderSchema(ref, spec, options, new Set([...seen, schema.$ref]))
  }
  if (schema.allOf?.length) {
    if (schema.allOf.length === 1) return renderSchema(schema.allOf[0], spec, options, seen)
    const allObjects = schema.allOf.some((item) => {
      const resolved = item.$ref && !options.useModelRefs ? resolveRef(spec, item.$ref) : item
      return Boolean(resolved?.properties || resolved?.type === "object")
    })
    return allObjects
      ? mergeObjectSchemas(schema.allOf, spec, options, seen)
      : renderSchema(schema.allOf[0], spec, options, seen)
  }
  if (schema.oneOf?.length) return renderUnion(schema.oneOf, spec, options, seen, schema.nullable)
  if (schema.anyOf?.length) return renderUnion(schema.anyOf, spec, options, seen, schema.nullable)
  if (schema.enum?.length) {
    const values = schema.enum.filter((value) => value !== null)
    const rendered =
      values.length > 0
        ? `Schema.Literal(${values.map((value) => JSON.stringify(value)).join(", ")})`
        : "Schema.Unknown"
    return schema.enum.includes(null) || schema.nullable ? `Schema.NullOr(${rendered})` : rendered
  }

  const nullable = schema.nullable || (Array.isArray(schema.type) && schema.type.includes("null"))
  const type = Array.isArray(schema.type) ? schema.type.find((value) => value !== "null") : schema.type
  if (!type && !schema.properties && !schema.items && !schema.additionalProperties) {
    return nullable ? "Schema.NullOr(Schema.Unknown)" : "Schema.Unknown"
  }

  let rendered: string
  switch (type) {
    case "array":
      rendered = `Schema.Array(${renderSchema(schema.items, spec, options, seen)})`
      break
    case "boolean":
      rendered = "Schema.Boolean"
      break
    case "integer":
    case "number":
      rendered = "Schema.Number"
      break
    case "object":
      if (schema.properties) {
        const required = new Set(schema.required ?? [])
        const fields = Object.entries(schema.properties).map(([key, value]) => {
          const field = renderSchema(value, spec, options, seen)
          return `  ${quoteKey(key)}: ${required.has(key) ? field : `Schema.optional(${field})`},`
        })
        rendered = `Schema.Struct({\n${fields.join("\n")}\n})`
      } else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
        rendered = `Schema.Record({ key: Schema.String, value: ${renderSchema(schema.additionalProperties, spec, options, seen)} })`
      } else {
        rendered = "Schema.Record({ key: Schema.String, value: Schema.Unknown })"
      }
      break
    case "string":
      rendered = "Schema.String"
      break
    default:
      rendered = schema.properties ? renderSchema({ ...schema, type: "object" }, spec, options, seen) : "Schema.Unknown"
      break
  }
  return nullable ? `Schema.NullOr(${rendered})` : rendered
}

function mergeObjectSchemas(
  schemas: ReadonlyArray<SchemaObject>,
  spec: OpenApiSpec,
  options: RenderOptions,
  seen: Set<string>
) {
  const properties: Record<string, SchemaObject> = {}
  const required = new Set<string>()
  for (const schema of schemas) {
    const resolved = schema.$ref && !options.useModelRefs ? resolveRef(spec, schema.$ref) : schema
    if (!resolved) continue
    Object.assign(properties, resolved.properties ?? {})
    for (const key of resolved.required ?? []) required.add(key)
  }
  if (Object.keys(properties).length === 0) {
    return schemas.length > 0 ? renderSchema(schemas[0], spec, options, seen) : "Schema.Unknown"
  }
  return renderSchema({ type: "object", properties, required: [...required] }, spec, options, seen)
}

function renderUnion(
  schemas: ReadonlyArray<SchemaObject>,
  spec: OpenApiSpec,
  options: RenderOptions,
  seen: Set<string>,
  nullable?: boolean
) {
  const filtered = schemas.filter((schema) => schema.type !== "null")
  const rendered =
    filtered.length === 1
      ? renderSchema(filtered[0], spec, options, seen)
      : `Schema.Union(${filtered.map((schema) => renderSchema(schema, spec, options, seen)).join(", ")})`
  return nullable || filtered.length !== schemas.length ? `Schema.NullOr(${rendered})` : rendered
}

function renderType(
  schema: SchemaObject | undefined,
  spec: OpenApiSpec,
  options: Pick<RenderOptions, "modelNames">,
  seen = new Set<string>()
): string {
  if (!schema) return "unknown"
  if (schema.$ref) {
    const refName = refSchemaName(schema.$ref)
    const modelName = refName ? options.modelNames.get(refName) : undefined
    return modelName ? `Models.${modelName}` : "unknown"
  }
  if (schema.allOf?.length) {
    const rendered = schema.allOf
      .map((item) => renderType(item, spec, options, seen))
      .filter((type) => type !== "unknown")
    return rendered.length === 0 ? "unknown" : rendered.join(" & ")
  }
  if (schema.oneOf?.length) return renderTypeUnion(schema.oneOf, spec, options, seen, schema.nullable)
  if (schema.anyOf?.length) return renderTypeUnion(schema.anyOf, spec, options, seen, schema.nullable)
  if (schema.enum?.length) {
    const values = schema.enum
      .filter((value) => value !== null)
      .map((value) => JSON.stringify(value))
      .join(" | ")
    const rendered = values.length > 0 ? values : "unknown"
    return schema.enum.includes(null) || schema.nullable ? `${rendered} | null` : rendered
  }

  const nullable = schema.nullable || (Array.isArray(schema.type) && schema.type.includes("null"))
  const type = Array.isArray(schema.type) ? schema.type.find((value) => value !== "null") : schema.type
  let rendered: string
  switch (type) {
    case "array":
      rendered = `ReadonlyArray<${renderType(schema.items, spec, options, seen)}>`
      break
    case "boolean":
      rendered = "boolean"
      break
    case "integer":
    case "number":
      rendered = "number"
      break
    case "object":
      rendered = renderObjectType(schema, spec, options, seen)
      break
    case "string":
      rendered = "string"
      break
    default:
      rendered = schema.properties ? renderObjectType({ ...schema, type: "object" }, spec, options, seen) : "unknown"
      break
  }
  return nullable ? `${rendered} | null` : rendered
}

function renderTypeUnion(
  schemas: ReadonlyArray<SchemaObject>,
  spec: OpenApiSpec,
  options: Pick<RenderOptions, "modelNames">,
  seen: Set<string>,
  nullable?: boolean
) {
  const filtered = schemas.filter((schema) => schema.type !== "null")
  const rendered = filtered.map((schema) => renderType(schema, spec, options, seen)).join(" | ") || "unknown"
  return nullable || filtered.length !== schemas.length ? `${rendered} | null` : rendered
}

function renderObjectType(
  schema: SchemaObject,
  spec: OpenApiSpec,
  options: Pick<RenderOptions, "modelNames">,
  seen: Set<string>
) {
  if (schema.properties) {
    const required = new Set(schema.required ?? [])
    const fields = Object.entries(schema.properties).map(([key, value]) => {
      const optional = required.has(key) ? "" : "?"
      return `  readonly ${quoteKey(key)}${optional}: ${renderType(value, spec, options, seen)}`
    })
    return `{
${fields.join("\n")}
}`
  }
  if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
    return `Readonly<Record<string, ${renderType(schema.additionalProperties, spec, options, seen)}>>`
  }
  return "Readonly<Record<string, unknown>>"
}

function collectUsedRefs(spec: OpenApiSpec, operations: ReadonlyArray<OperationEntry>) {
  const used = new Set<string>()
  const visit = (schema: SchemaObject | undefined): void => {
    if (!schema) return
    if (schema.$ref) {
      const name = refSchemaName(schema.$ref)
      if (name && !used.has(name)) {
        used.add(name)
        visit(resolveRef(spec, schema.$ref))
      }
      return
    }
    schema.allOf?.forEach(visit)
    schema.oneOf?.forEach(visit)
    schema.anyOf?.forEach(visit)
    visit(schema.items)
    if (schema.additionalProperties && typeof schema.additionalProperties === "object")
      visit(schema.additionalProperties)
    Object.values(schema.properties ?? {}).forEach(visit)
  }
  for (const entry of operations) {
    entry.parameters.forEach((parameter) => visit(parameter.schema))
    visit(entry.bodySchema)
    visit(entry.success?.schema)
  }
  return used
}

function buildModelNameMap(spec: OpenApiSpec) {
  const names = new Map<string, string>()
  const used = new Set<string>()
  for (const name of Object.keys(spec.components?.schemas ?? spec.definitions ?? {})) {
    names.set(name, uniqueName(toPascalCase(name), used))
  }
  return names
}

function getRequestBodySchema(spec: OpenApiSpec, operation: OperationObject) {
  const requestBody = resolveRequestBody(spec, operation.requestBody)
  const content = requestBody?.content
  const schema = content?.["application/json"]?.schema ?? content?.["application/x-www-form-urlencoded"]?.schema
  return resolveSchemaObject(spec, schema)
}

function getSuccessResponse(operation: OperationObject) {
  for (const [status, response] of Object.entries(operation.responses ?? {})) {
    if (status.startsWith("2")) {
      const content = response.content
      return { status, schema: content?.["application/json"]?.schema ?? response.schema }
    }
  }
}

function resolveParameter(spec: OpenApiSpec, parameter: ParameterObject): ParameterObject | undefined {
  if (!parameter.$ref) return parameter
  return resolveParameterRef(spec, parameter.$ref)
}

function resolveRequestBody(
  spec: OpenApiSpec,
  requestBody: RequestBodyObject | RefObject | undefined
): RequestBodyObject | undefined {
  if (!requestBody) return undefined
  if ("$ref" in requestBody) return resolveRequestBodyRef(spec, requestBody.$ref)
  return requestBody
}

function resolveParameterRef(spec: OpenApiSpec, ref: string) {
  const name = refSchemaName(ref)
  return name ? (spec.components?.parameters?.[name] ?? spec.parameters?.[name]) : undefined
}

function resolveRequestBodyRef(spec: OpenApiSpec, ref: string) {
  const name = refSchemaName(ref)
  return name ? spec.components?.requestBodies?.[name] : undefined
}

function resolveRef(spec: OpenApiSpec, ref: string) {
  const name = refSchemaName(ref)
  return name ? (spec.components?.schemas?.[name] ?? spec.definitions?.[name]) : undefined
}

function resolveSchemaObject(spec: OpenApiSpec, schema: SchemaObject | undefined): SchemaObject | undefined {
  return schema?.$ref ? resolveRef(spec, schema.$ref) : schema
}

function refSchemaName(ref: string) {
  return ref.split("/").pop()
}

async function readSpec(file: string): Promise<OpenApiSpec> {
  const text = await fs.readFile(file, "utf8")
  return file.endsWith(".yaml") || file.endsWith(".yml") ? YAML.parse(text) : JSON.parse(text)
}

async function download(url: string, file: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status}`)
  await fs.writeFile(file, await response.text())
}

async function cleanGenerated(dir: string) {
  await fs.rm(dir, { force: true, recursive: true })
  await fs.mkdir(dir, { recursive: true })
}

async function exists(file: string) {
  try {
    await fs.stat(file)
    return true
  } catch {
    return false
  }
}

function renderDoc(text: string | undefined) {
  if (!text) return ""
  const summary = text.replace(/\*\//g, "").split("\n").slice(0, 8)
  return `/**\n${summary.map((line) => ` * ${line.trim()}`).join("\n")}\n */\n`
}

function quoteKey(key: string) {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)
}

function uniqueName(name: string, seen: Set<string>) {
  let next = name || "Model"
  let index = 2
  while (seen.has(next)) next = `${name}${index++}`
  seen.add(next)
  return next
}

function toCamelCase(value: string) {
  const pascal = toPascalCase(value)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

function toPascalCase(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")
}

function toKebabCase(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
}

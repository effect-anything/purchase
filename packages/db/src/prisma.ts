import type * as Schema from "effect/Schema"

import * as Option from "effect/Option"
import * as AST from "effect/SchemaAST"
import * as String from "effect/String"
// @ts-ignore
import * as path from "node:path"

import {
  type ColumnConfig,
  ColumnConfigTypeId,
  type IdConfig,
  IdConfigTypeId,
  type IdGenerate,
  type ModelConfig,
  ModelConfigTypeId,
  type RelationConfig
} from "./schema.ts"

export type Table = Schema.Schema.AnyNoContext

export type Tables = Record<string, Table>

type GeneratedFieldMetadata = {
  propertyToPrismaField: ReadonlyMap<string, string>
}

// ==========================================
// ANNOTATION CONFIGURATIONS
// ==========================================

const idGenDefaultMap: Record<IdGenerate, string> = {
  autoincrement: "@default(autoincrement())",
  "now()": "@default(now())"
}

// ==========================================
// TYPE MAPPINGS
// ==========================================

type PrismaType = "String" | "Int" | "Float" | "Boolean" | "DateTime" | "Json" | "BigInt" | "Decimal" | "Bytes"

const DatabaseTypeMap: Record<string, Record<PrismaType, string>> = {
  postgresql: {
    String: "VarChar",
    Int: "Integer",
    Float: "DoublePrecision",
    Boolean: "Boolean",
    DateTime: "Timestamptz",
    Json: "JsonB",
    BigInt: "BigInt",
    Decimal: "Decimal(65,30)",
    Bytes: "ByteA"
  },
  mysql: {
    String: "VarChar(191)",
    Int: "Int",
    Float: "Double",
    Boolean: "TinyInt",
    DateTime: "DateTime",
    Json: "Json",
    BigInt: "BigInt",
    Decimal: "Decimal(65,30)",
    Bytes: "LongBlob"
  },
  sqlite: {
    String: "Text",
    Int: "Integer",
    Float: "Real",
    Boolean: "Integer",
    DateTime: "DateTime",
    Json: "Text",
    BigInt: "Integer",
    Decimal: "Numeric",
    Bytes: "Blob"
  }
}

// ==========================================
// SCHEMA TO PRISMA CONVERSION
// ==========================================

// Add case formatting options

export interface PrismaGenerateOptions {
  provider: "sqlite" | "mysql" | "postgresql"
  format?: {
    modelCase?: CaseFormat // How to format model names
    fieldCase?: CaseFormat // How to format field names
    enumCase?: CaseFormat // How to format enum names and values
  }
  database?: {
    useNativeTypes?: boolean // Use @db.* type annotations
    typeMappings?: Partial<Record<PrismaType, string>> // Custom type mappings
  }
  relations?: {
    generateBackRelations?: boolean // Auto-generate reverse relations
    prefixStrategy?: string // Prefix for relation names (default: "")
  }
  generator?: {
    markdown?:
      | {
          root?: string // Root directory
          output?: string // Output directory
          title?: string // Title of the generated markdown file
        }
      | false
    client?:
      | {
          provider?: string // Default: "prisma-client-js"
          output?: string // Output directory
          previewFeatures?: Array<string> // Prisma preview features
          engineType?: string // Engine type
        }
      | false
  }
  schema?: {
    includeTimestamps?: boolean // Auto-add created/updated timestamps
    defaultPrimaryKeyType?: IdGenerate // Default primary key type
  }
}

export type CaseFormat = "camel" | "snake" | "pascal" | "constant"

const formatCase = {
  // helloWorld -> helloWorld
  camel: (s: string) => String.snakeToCamel(s),
  // helloWorld -> hello_world
  snake: (s: string) => String.camelToSnake(s),
  // HelloWorld -> HelloWorld
  pascal: (s: string) => String.snakeToPascal(s),
  // HELLO_WORLD -> HELLO_WORLD
  constant: (s: string) => String.camelToSnake(s).toUpperCase()
}

const formatModelName = (options: PrismaGenerateOptions, name: string) => {
  const formatter = options.format?.modelCase ? formatCase[options.format.modelCase] : formatCase.pascal
  return formatter(name)
}

// Validate and prepare options with defaults
function normalizeOptions(options?: Partial<PrismaGenerateOptions>): PrismaGenerateOptions {
  const defaultOptions: PrismaGenerateOptions = {
    provider: "postgresql",
    format: {
      modelCase: "pascal",
      fieldCase: "snake",
      enumCase: "pascal"
    },
    database: {
      useNativeTypes: false
    },
    relations: {
      generateBackRelations: true,
      prefixStrategy: ""
    },
    generator: {
      client: false
    },
    schema: {
      includeTimestamps: false,
      defaultPrimaryKeyType: "autoincrement"
    }
  }

  if (!options) return defaultOptions

  return {
    provider: options.provider ?? defaultOptions.provider,
    format: { ...defaultOptions.format, ...options.format },
    database: { ...defaultOptions.database, ...options.database },
    relations: { ...defaultOptions.relations, ...options.relations },
    generator: { ...defaultOptions.generator, ...options.generator },
    schema: { ...defaultOptions.schema, ...options.schema }
  }
}

// Expand type mappings
const EffectToPrismaType: Record<string, PrismaType> = {
  // Primitive types
  String: "String",
  NonEmptyString: "String",
  NonEmptyTrimmedString: "String",
  Number: "Int",
  Int: "Int",
  Float: "Float",
  Boolean: "Boolean",
  BigInt: "BigInt",
  Decimal: "Decimal",

  // Date types
  Date: "DateTime",
  DateTimeUtcFromSelf: "DateTime",
  DateFromString: "DateTime",
  DateFromSelf: "DateTime",
  DateTimeInsert: "DateTime",
  DateTimeUpdate: "DateTime",

  // Complex types
  Json: "Json",
  Array: "Json",
  Record: "Json",
  Object: "Json",
  Unknown: "Json",
  Any: "Json",

  // Binary types
  Uint8Array: "Bytes",
  Uint8ArrayFromSelf: "Bytes",
  Buffer: "Bytes",

  // Special types
  UUID: "String",
  CUID: "String",
  Email: "String",
  URL: "String",

  // Branded types (handle these specially)
  GroupId: "String",
  UserId: "String"
}

const getASTType = (ast: AST.AST): PrismaType | undefined => {
  let matchType: PrismaType | undefined

  switch (ast._tag) {
    case "TypeLiteral":
    case "SymbolKeyword":
    case "AnyKeyword":
    case "UndefinedKeyword":
    case "UnknownKeyword":
    case "VoidKeyword":
    case "NeverKeyword":
    case "Literal":
    case "UniqueSymbol":
    case "TemplateLiteral":
    case "TupleType":
    case "StringKeyword":
    case "Enums":
      matchType = "String"
      break
    case "ObjectKeyword":
      matchType = "Json"
      break
    case "BooleanKeyword":
      matchType = "Boolean"
      break
    case "BigIntKeyword":
      matchType = "BigInt"
      break
    case "NumberKeyword":
      matchType = "Int"
      break
    default:
      break
  }

  const idType = AST.getIdentifierAnnotation(ast).pipe(
    Option.flatMap((_) => Option.fromNullable(EffectToPrismaType[_]))
  )
  const brandType = AST.getBrandAnnotation(ast).pipe(
    Option.flatMap((_) => Option.fromNullable(EffectToPrismaType[_.toString()]))
  )

  return idType.pipe(
    Option.orElse(() => brandType),
    Option.getOrElse(() => matchType)
  )
}

// Improved type detection function with better type guards
const getEffectiveType = (ast: AST.AST): PrismaType => {
  // Get the base type name
  let prismaType: PrismaType | undefined // Default to String if we can't determine type

  try {
    if (AST.isSuspend(ast)) {
      prismaType = getASTType(ast.f())
    } else if (AST.isDeclaration(ast)) {
      prismaType = getASTType(ast)
    } else if (AST.isRefinement(ast)) {
      prismaType = getASTType(ast.from)
    } else if (AST.isTransformation(ast)) {
      // Check annotations for type hints
      prismaType = getASTType(ast.to) || getEffectiveType(ast.to)
    } else if (AST.isUnion(ast)) {
      prismaType = getASTType(ast) || getEffectiveType(ast.types[0])
    } else {
      const tagType = EffectToPrismaType[ast._tag.replace("Keyword", "")]
      const astType = getASTType(ast)
      prismaType = astType || tagType
    }

    if (!prismaType) {
      prismaType = getASTType(ast)
    }

    if (!prismaType) {
      throw new Error(`type not found for ast: ${ast._tag}`)
    }

    return prismaType
  } catch {
    return "String"
  }
}

const hasJsonIdentifier = (ast: AST.AST) =>
  AST.getIdentifierAnnotation(ast).pipe(Option.exists((identifier) => identifier === "Json"))

// Helper to safely check for and get elements from a transformation
const getElementsFromTransformation = (fieldType: AST.AST): { hasElements: boolean; elements?: AST.AST } => {
  if (
    fieldType._tag === "Transformation" &&
    fieldType.from &&
    typeof fieldType.from === "object" &&
    "elements" in fieldType.from
  ) {
    return {
      hasElements: true,
      elements: fieldType.from.elements as unknown as AST.AST
    }
  }
  return { hasElements: false }
}

const generateTableRelation = (
  config: PrismaGenerateOptions,
  relationConfig: Array<RelationConfig>,
  relationModelNames: ReadonlyMap<string, string>,
  optionalRelationFields: ReadonlySet<string>
): Array<string> => {
  const relations: Array<string> = []
  const formatRelationName = (name: string) => {
    const formatter = config?.format?.fieldCase ? formatCase[config.format.fieldCase] : formatCase.camel
    return formatter(name)
  }
  const formatRelationModel = (name: string) => relationModelNames.get(name) ?? formatModelName(config, name)

  const formatFields = (fields: Array<string>) => {
    return fields.map((field) => formatRelationName(field))
  }
  const formatReferenced = (fields: Array<string>) => {
    return fields.map((field) => formatRelationName(field))
  }

  for (const relation of relationConfig) {
    // Build relation attributes
    if (relation.description) {
      relations.push(`  /// ${relation.description}`)
    }

    switch (relation.type) {
      case "one-to-many": {
        const relationAttrs: Array<string> = []
        if (relation.relationName) relationAttrs.push(`name:"${relation.relationName}"`)

        // The "one" side gets the array field
        relations.push(
          `  ${relation.name || relation.referencedModel.toLowerCase()} ${formatRelationModel(
            relation.referencedModel
          )}[]${relationAttrs.length > 0 ? ` @relation(${relationAttrs.join(", ")})` : ""}`
        )
        break
      }

      case "many-to-one": {
        const relationAttrs: Array<string> = []
        const fields = relation.fields || []
        if (relation.relationName) relationAttrs.push(`name:"${relation.relationName}"`)
        if (relation.map) relationAttrs.push(`map: "${relation.map}"`)
        // The "many" side gets the scalar field and relation
        relationAttrs.push(`fields: [${formatFields(fields).join(", ")}]`)
        relationAttrs.push(`references: [${formatReferenced(relation.references).join(", ")}]`)

        if (relation.onDelete) relationAttrs.push(`onDelete: ${relation.onDelete}`)
        if (relation.onUpdate) relationAttrs.push(`onUpdate: ${relation.onUpdate}`)

        const isOptional =
          fields.length === 0 || fields.some((field) => optionalRelationFields.has(formatRelationName(field)))

        // Generate relation field
        relations.push(
          `  ${relation.name || relation.referencedModel.toLowerCase()} ${formatRelationModel(
            relation.referencedModel
          )}${isOptional ? "?" : ""} ${relationAttrs.length > 0 ? ` @relation(${relationAttrs.join(", ")})` : ""}`
        )
        break
      }

      case "one-to-one": {
        const relationAttrs: Array<string> = []
        const fields = relation.fields || []
        if (relation.relationName) relationAttrs.push(`name:"${relation.relationName}"`)
        if (relation.map) relationAttrs.push(`map: "${relation.map}"`)

        // This is the side that holds the foreign key
        if (fields.length > 0) relationAttrs.push(`fields: [${formatFields(fields).join(", ")}]`)
        if (relation.references) relationAttrs.push(`references: [${formatReferenced(relation.references).join(", ")}]`)

        if (relation.onDelete) relationAttrs.push(`onDelete: ${relation.onDelete}`)
        if (relation.onUpdate) relationAttrs.push(`onUpdate: ${relation.onUpdate}`)
        const isOptional =
          fields.length === 0 || fields.some((field) => optionalRelationFields.has(formatRelationName(field)))

        // Generate relation field with attributes
        relations.push(
          `  ${relation.name || relation.referencedModel.toLowerCase()} ${formatRelationModel(
            relation.referencedModel
          )}${isOptional ? "?" : ""} ${relationAttrs.length > 0 ? ` @relation(${relationAttrs.join(", ")})` : ""}`
        )

        break
      }
    }
  }

  return relations
}

const generateFields = (key: string, table: Table, options: PrismaGenerateOptions) => {
  const ast = table.ast

  const allowTypes = ["Transformation", "TypeLiteral"]
  if (!allowTypes.includes(ast._tag)) {
    throw new Error(`table must be a transformation, tag: ${ast._tag}`)
  }

  const mappedIndexes = new Map<string, Array<string>>()
  const mappedUniqueConstraints = new Map<string, Array<string>>()
  const optionalFields = new Set<string>()
  const propertyToPrismaField = new Map<string, string>()
  const enums: Array<string> = []
  const columns: Array<string> = []

  const from_ = table.ast
  let propertys: ReadonlyArray<AST.PropertySignature> = []

  if (AST.isTypeLiteral(from_)) {
    propertys = from_.propertySignatures
  } else if (AST.isTransformation(from_)) {
    if (AST.isTypeLiteral(from_.from)) {
      propertys = from_.from.propertySignatures
    } else if (AST.isTransformation(from_.from)) {
      if (AST.isTypeLiteral(from_.from.from)) {
        propertys = from_.from.from.propertySignatures
      }
    }
  }

  if (propertys.length === 0) {
    throw new Error("table must have at least one field")
  }

  const getTransformationAnnotations = (field: AST.AST) => {
    const annotations = field.annotations
    switch (field._tag) {
      case "Union": {
        const types = field.types.filter((_) => {
          if (AST.isUndefinedKeyword(_)) {
            return false
          }

          if (AST.isVoidKeyword(_)) {
            return false
          }

          if (AST.isNeverKeyword(_)) {
            return false
          }

          return true
        })
        types.forEach((type) => {
          Object.assign(annotations, type.annotations)
        })
      }
    }

    return annotations
  }

  const formatFieldName = (name: string) => {
    const formatter = options.format?.fieldCase ? formatCase[options.format.fieldCase] : formatCase.camel
    return formatter(name)
  }

  // Get database-specific type mapping
  const getDbType = (type: PrismaType): string | undefined => {
    // Use custom mapping if provided
    if (options.database?.typeMappings?.[type]) {
      return options.database.typeMappings[type]
    }

    // Use standard mapping based on provider
    const provider = options.provider

    return DatabaseTypeMap[provider][type]
  }

  for (const field of propertys) {
    const fieldName = formatFieldName(field.name.toString())

    let annotations = field.annotations
    let isPrimaryKey = false
    let idConfig: IdConfig | undefined
    let columnConfig: ColumnConfig | undefined = { description: "" }
    let columnType: string | undefined

    switch (field.type._tag) {
      case "Declaration": {
        annotations = { ...field.annotations, ...field.type.annotations }
        break
      }
      case "Refinement": {
        annotations = {
          ...field.annotations,
          ...field.type.annotations,
          ...field.type.from.annotations
        }
        const annotatedAst = AST.annotations(field.type.from, annotations)
        columnType = getEffectiveType(annotatedAst)
        columnConfig.description = AST.getDescriptionAnnotation(annotatedAst).pipe(Option.getOrElse(() => ""))
        break
      }
      case "Transformation": {
        annotations = {
          ...field.annotations,
          ...field.type.annotations,
          ...field.type.to.annotations,
          ...getTransformationAnnotations(field.type.from)
        }
        const annotatedAst = AST.annotations(field.type.from, annotations)
        columnType = getEffectiveType(annotatedAst)
        columnConfig.description = AST.getDescriptionAnnotation(annotatedAst).pipe(Option.getOrElse(() => ""))
        break
      }
      case "Union": {
        const types = field.type.types.filter((_) => {
          if (AST.isUndefinedKeyword(_)) {
            return false
          }

          if (AST.isVoidKeyword(_)) {
            return false
          }

          if (AST.isNeverKeyword(_)) {
            return false
          }

          return true
        })
        annotations = {
          ...field.annotations,
          ...field.type.annotations
        }
        types.forEach((type) => {
          Object.assign(annotations, type.annotations)
        })
        const annotatedAst = AST.annotations(types[0], annotations)
        columnType = getEffectiveType(annotatedAst)
        const description = AST.getDescriptionAnnotation(annotatedAst).pipe(Option.getOrElse(() => ""))
        columnConfig.description = description
        break
      }
      default: {
        annotations = { ...field.annotations, ...field.type.annotations }
        const annotatedAst = AST.annotations(field.type, annotations)
        columnType = getEffectiveType(annotatedAst)
        columnConfig.description = AST.getDescriptionAnnotation(annotatedAst).pipe(Option.getOrElse(() => ""))
        break
      }
    }

    if (annotations[IdConfigTypeId]) {
      const idAST = AST.annotations(field.type, annotations)
      columnType = getEffectiveType(idAST)
      isPrimaryKey = true
      idConfig = annotations[IdConfigTypeId]
      idConfig.description = AST.getDescriptionAnnotation(idAST).pipe(
        Option.map((description) => description ?? idConfig?.description),
        Option.getOrElse(() => idConfig?.description ?? "")
      )
    }

    if (annotations[ColumnConfigTypeId]) {
      columnConfig = {
        ...annotations[ColumnConfigTypeId],
        description: AST.getDescriptionAnnotation(field.type).pipe(
          Option.map((description) => description ?? columnConfig?.description ?? ""),
          Option.getOrElse(() => columnConfig?.description ?? "")
        )
      }
    }

    if (!columnType) {
      columnType = getEffectiveType(field.type)
      if (!columnType) {
        throw new Error(`column type not found for field: ${fieldName}`)
      }
    }

    const isJsonColumn =
      columnType === "Json" ||
      hasJsonIdentifier(field.type) ||
      hasJsonIdentifier(AST.annotations(field.type, annotations)) ||
      (AST.isTransformation(field.type) &&
        (hasJsonIdentifier(field.type.from) || hasJsonIdentifier(field.type.to) || hasJsonIdentifier(field.type)))

    // Handle nullable fields
    const isNullable = columnConfig.nullable === true
    const columnOptional = isNullable ? "?" : ""
    const fieldMap = columnConfig.map
    const propertyName = field.name.toString()

    propertyToPrismaField.set(propertyName, fieldName)
    if (isNullable) {
      optionalFields.add(fieldName)
    }

    let fieldDef = `${fieldName} ${columnType}${columnOptional}`

    // Primary key
    if (isPrimaryKey) {
      fieldDef += " @id"
      if (idConfig?.generate) {
        fieldDef += ` ${idGenDefaultMap[idConfig.generate]}`
      }
    }

    // Unique constraint
    if (columnConfig.unique === true) {
      fieldDef += " @unique"
    } else if (typeof columnConfig.unique === "string") {
      mappedUniqueConstraints.set(columnConfig.unique, [
        ...(mappedUniqueConstraints.get(columnConfig.unique) || []),
        fieldName
      ])
    }

    // Index
    if (columnConfig.index) {
      const indexName = columnConfig.index === true ? fieldName : columnConfig.index
      mappedIndexes.set(indexName, [...(mappedIndexes.get(indexName) || []), fieldName])
    }

    // Also check for actual array types
    const { hasElements, elements } = getElementsFromTransformation(field.type)
    if (hasElements) {
      let elementType = "String"
      if (elements) {
        elementType = getEffectiveType(elements)
      }
      fieldDef = `${fieldName} ${elementType}[]`
    }

    // Handle JSON fields
    if (isJsonColumn) {
      if (options.provider !== "sqlite") {
        fieldDef = `${fieldName} Json`
      }
    }

    // Handle enums with proper indentation and default values
    if (field.type._tag === "Union" && field.type.types.every((t) => t._tag === "Literal")) {
      const enumName = formatFieldName(`${key}_${fieldName}`)
      const enumValues = field.type.types.map((t) => {
        const value = (t as AST.Literal).literal
        return value?.toString()
      })

      // Add enum definition with consistent indentation
      enums.push(`enum ${enumName} {
  ${enumValues.join("\n  ")}
}`)

      // Update field definition to use the enum type
      fieldDef = `${fieldName} ${enumName}`

      // Add default value if present from constructor or annotations
      const defaultValue = columnConfig.default

      if (defaultValue) {
        fieldDef += ` @default(${defaultValue.toString()})`
      }
    }

    // Handle field mapping (custom database column names)
    if (fieldMap) {
      fieldDef += ` @map("${fieldMap}")`
    }

    // Handle database-specific types
    const dbType = columnConfig.db?.type

    if (options.database?.useNativeTypes || dbType) {
      const nativeColumnType = isJsonColumn ? "Json" : columnType
      const inferredDbType = getDbType(nativeColumnType as PrismaType)
      fieldDef += ` @db.${dbType || inferredDbType}`
    }

    // Handle custom default values
    const defaultValue = columnConfig.default
    if (!isPrimaryKey && defaultValue !== undefined) {
      // Format default value based on type
      let formattedDefault: string
      if (typeof defaultValue === "string") {
        formattedDefault = `"${defaultValue}"`
      } else if (defaultValue === null) {
        formattedDefault = "null"
      } else if (typeof defaultValue === "object") {
        const jsonDefault = JSON.stringify(defaultValue).replaceAll('"', '\\"')
        formattedDefault =
          isJsonColumn || columnType === "String" ? `"${jsonDefault}"` : `dbgenerated("${jsonDefault}")`
      } else {
        formattedDefault = defaultValue.toString()
      }
      fieldDef += ` @default(${formattedDefault})`
    }

    // Format field comments consistently with proper indentation
    const description = idConfig?.description ?? columnConfig.description
    if (description) {
      const lines = description.split("\n").map((line) => line.trim())
      if (lines.length > 1) {
        fieldDef = `  /// ${lines[0]}\n  ///\n${lines
          .slice(1)
          .map((l) => `  /// ${l}`)
          .join("\n")}\n  ${fieldDef}`
      } else {
        fieldDef = `  /// ${description}\n  ${fieldDef}`
      }
    } else {
      // Ensure consistent indentation even without comments
      fieldDef = `  ${fieldDef}`
    }

    // Group by type
    columns.push(fieldDef)
  }

  const indexes: Array<string> = []
  const uniqueConstraints: Array<string> = []

  // Then create the composite indexes from the collected fields
  for (const [name, fields] of mappedIndexes.entries()) {
    indexes.push(`@@index(fields: [${fields.join(", ")}], map: "${name}")`)
  }

  for (const [name, fields] of mappedUniqueConstraints.entries()) {
    uniqueConstraints.push(`@@unique(fields: [${fields.join(", ")}], map: "${name}")`)
  }

  return {
    indexes,
    uniqueConstraints,
    optionalFields,
    fieldMetadata: {
      propertyToPrismaField
    } satisfies GeneratedFieldMetadata,
    enums,
    columns
  }
}

function generateModel(
  key: string,
  table: Table,
  options: PrismaGenerateOptions,
  relationModelNames: ReadonlyMap<string, string>
) {
  const { indexes, uniqueConstraints, optionalFields, fieldMetadata, enums, columns } = generateFields(
    key,
    table,
    options
  )
  const modelName = formatModelName(options, key)

  let model = ""

  const tableAnnotations = AST.isTransformation(table.ast) ? table.ast.to.annotations : table.ast.annotations

  const newAST = AST.annotations(table.ast, tableAnnotations)
  const description = AST.getDescriptionAnnotation(newAST).pipe(Option.getOrUndefined)
  const documentation = AST.getDocumentationAnnotation(newAST).pipe(Option.getOrUndefined)
  const modelConfig: ModelConfig = tableAnnotations[ModelConfigTypeId] ?? {}
  const namespace = modelConfig.namespace ?? ""
  const author = modelConfig.author ?? ""
  const primaryKeyFields =
    modelConfig.primaryKey?.fields.map((field) => fieldMetadata.propertyToPrismaField.get(field) ?? field) ?? []

  // Add enums before the model definition
  if (enums.length > 0) {
    model += `//--------------------------------
// ENUMS
//--------------------------------

${enums.join("\n\n")}\n\n`
  }

  // Add model comment header
  if (description) {
    model += TextFormat.formatDescription(description)
  }
  if (documentation) {
    model += TextFormat.formatDocumentation(documentation)
  }

  if (namespace) {
    model += `/// @namespace ${namespace}\n`
  }
  if (author) {
    model += `/// @author ${author}\n`
  }
  model += `model ${modelName} {\n`

  // Add fields directly without additional indentation since they're already indented
  if (columns.length > 0) {
    model += `${columns.join("\n")}`
  }

  // Unique constraints
  if (uniqueConstraints.length > 0) {
    model += `\n\n
  //--------------------------------
  // UNIQUE CONSTRAINTS
  //--------------------------------
  ${uniqueConstraints.join("\n")}`
  }

  if (primaryKeyFields.length > 0) {
    // Prisma's SQLite provider does not support mapping primary key constraint names.
    const primaryKeyMap = options.provider === "sqlite" ? undefined : modelConfig.primaryKey?.map
    model += `

  @@id([${primaryKeyFields.join(", ")}]${primaryKeyMap ? `, map: "${primaryKeyMap}"` : ""})`
  }

  // Indexes
  if (indexes.length > 0) {
    model += `\n\n\n
  //--------------------------------
  // INDEXES
  //--------------------------------
  ${indexes.join("\n  ")}`
  }

  const relations = generateTableRelation(options, modelConfig.relations ?? [], relationModelNames, optionalFields)
  // Add relations section with consistent indentation using template literals
  if (relations.length > 0) {
    model += `\n\n
  //--------------------------------
  // RELATIONS
  //--------------------------------
${relations.join("\n")}`
  }

  if (modelName !== key) {
    model += `\n\n  @@map("${key}")`
  }

  model += "\n}"

  return model
}

function generateModels(tables: Tables, options: PrismaGenerateOptions) {
  const models: Array<string> = []
  const relationModelNames = new Map<string, string>()

  for (const key in tables) {
    const table = tables[key]
    const modelName = formatModelName(options, key)

    relationModelNames.set(key, modelName)

    if ("name" in table && typeof table.name === "string" && table.name.length > 0) {
      relationModelNames.set(table.name, modelName)
    }
  }

  for (const key in tables) {
    const model = generateModel(key, tables[key], options, relationModelNames)

    models.push(`\n//--------------------------------
// ${key}
//--------------------------------

${model}`)
  }

  return models.join("\n")
}

/**
 * Generates a Prisma schema from Effect schemas
 *
 * This function takes a set of Effect schemas and generates a Prisma schema
 * with appropriate models, relations, and types.
 *
 * @param options - Configuration options for the schema generator
 * @param tables - A record of Effect schemas to convert to Prisma models
 * @returns A string containing the complete Prisma schema
 *
 * @example
 * ```typescript
 * const schema = generate(
 *   {
 *     provider: "postgresql",
 *     url: "env('DATABASE_URL')"
 *   },
 *   { User, Organization }
 * )
 * ```
 */
export function generate(options: PrismaGenerateOptions, tables: Tables): string {
  try {
    // Process schema generation as before
    const normalizedOptions = normalizeOptions(options)
    const prismaSchema = generateModels(tables, normalizedOptions)

    const generatorOptions = normalizedOptions.generator || {}
    let generatorBlock = ""
    if (generatorOptions.client) {
      const clientConfig = []
      clientConfig.push(`provider = "${generatorOptions.client.provider || "prisma-client-js"}"`)

      if (generatorOptions.client.output) {
        clientConfig.push(`output = "${generatorOptions.client.output}"`)
      }

      if (generatorOptions.client.previewFeatures?.length) {
        clientConfig.push(
          `previewFeatures = [${generatorOptions.client.previewFeatures.map((f) => `"${f}"`).join(", ")}]`
        )
      }

      if (generatorOptions.client.engineType) {
        clientConfig.push(`engineType = "${generatorOptions.client.engineType}"`)
      }

      generatorBlock = `generator client {
  ${clientConfig.join("\n  ")}
}`
    }

    if (generatorOptions.markdown) {
      const markdownConfig = []
      markdownConfig.push(
        `provider = "node --import tsx ${path.join(
          // @ts-ignore
          generatorOptions.markdown.root || process.cwd(),
          "packages/db/src/markdown/generate.ts"
        )}"`
      )
      markdownConfig.push(`output   = "${generatorOptions.markdown.output}"`)
      markdownConfig.push(`title    = "${generatorOptions.markdown.title}"`)

      generatorBlock += `generator markdown {
  ${markdownConfig.join("\n  ")}
}`
    }

    // Build the full schema with proper spacing between sections
    const fullSchema = `// This file is automatically generated. Do not edit manually.${
      options.schema?.includeTimestamps ? `\n// Generated at ${new Date().toISOString()}` : ""
    }

datasource db {
  provider = "${normalizedOptions.provider}"
}

${generatorBlock}

//-----------------------------------------------------------
// MODELS
//-----------------------------------------------------------
${prismaSchema}`

    return fullSchema
  } catch (error) {
    return `// Schema generation failed with error: ${error instanceof Error ? error.message : JSON.stringify(error)}`
  }
}

const TextFormat = {
  /**
   * Formats a description block with proper indentation and line breaks
   * @param text The description text to format
   * @param indent Number of spaces to indent (default: 0)
   * @returns Formatted description string
   */
  formatDescription(text?: string, indent = 0): string {
    if (!text) return ""

    const spaces = " ".repeat(indent)
    return `${spaces}/// ${text}\n///\n`
  },

  /**
   * Formats documentation block with proper indentation
   * @param text The documentation text
   * @param indent Number of spaces to indent (default: 0)
   */
  formatDocumentation(text?: string, indent = 0): string {
    if (!text) return ""

    const spaces = " ".repeat(indent)
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

    return `${lines.map((line) => `${spaces}/// ${line}`).join("\n")}\n///\n`
  },

  /**
   * Formats a model header with description, documentation and metadata
   */
  formatModelHeader(options: {
    description?: string
    documentation?: string
    namespace?: string
    author?: string
  }): string {
    const blocks: Array<string> = []

    if (options.description) {
      blocks.push(TextFormat.formatDescription(options.description))
    }

    if (options.documentation) {
      blocks.push(TextFormat.formatDocumentation(options.documentation))
    }

    // Add metadata annotations
    if (options.namespace) {
      blocks.push(`/// @namespace ${options.namespace}\n`)
    }

    if (options.author) {
      blocks.push(`/// @author ${options.author}\n`)
    }

    return blocks.join("")
  }
}

// ==========================================
// TEST MODELS
// ==========================================

// Represents a tenant/organization

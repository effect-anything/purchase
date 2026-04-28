import * as Array from "effect/Array"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import * as AST from "effect/SchemaAST"

const FormTypeId = Symbol.for("@form:form-type-id")

export type HTMLInputTypeAttribute =
  | "color"
  | "date"
  | "email"
  | "file"
  | "hidden"
  | "number"
  | "password"
  | "text"
  | (string & {})

export type FormWidget = "input" | "textarea" | "switch" | "checkbox" | "select" | "radio" | "custom"

export interface FormFieldConfig {
  label?: string
  title?: string
  description?: string
  help?: string
  widget?: FormWidget | undefined
  componentType?: FormWidget | undefined
  htmlType?: HTMLInputTypeAttribute | undefined
  options?: Record<string, string | number>
  placeholder?: string
  autoComplete?: string
  inputMode?: string
  rows?: number | undefined
  disabled?: boolean | undefined
  readOnly?: boolean | undefined
  component: string
}

export interface FormLayoutConfig {
  orientation?: "horizontal" | "vertical"
  order?: number | undefined
  group?: string | undefined
  width?: "full" | "half" | undefined
}

export interface FormVisibilityConfig {
  hidden?: boolean | undefined
  dependsOn?: ReadonlyArray<string> | undefined
  when?: FormVisibilityRule | ReadonlyArray<FormVisibilityRule> | undefined
  clearWhenHidden?: boolean | undefined
}

export interface FormArrayConfig {
  addLabel?: string | undefined
  removeLabel?: string | undefined
  emptyLabel?: string | undefined
  minItems?: number | undefined
  maxItems?: number | undefined
}

export type FormConfig = Partial<FormFieldConfig & FormLayoutConfig & FormVisibilityConfig & FormArrayConfig>

export interface FormVisibilityRule {
  path: string
  equals?: unknown
  notEquals?: unknown
  in?: ReadonlyArray<unknown> | undefined
  truthy?: boolean | undefined
  falsy?: boolean | undefined
}

type FormConfigNormalized = Omit<FormConfig, "label" | "widget" | "when" | "dependsOn"> & {
  title?: string
  componentType?: FormWidget
  order?: number
  group: string
  dependsOn?: ReadonlyArray<string>
  when?: ReadonlyArray<FormVisibilityRule>
}

const getExistingConfig = (self: unknown): Partial<FormConfigNormalized> => {
  const annotations = (self as { ast?: { annotations?: Record<PropertyKey, unknown> } })?.ast?.annotations
  const formConfig = annotations?.[FormTypeId]

  return formConfig && typeof formConfig === "object" ? (formConfig as Partial<FormConfigNormalized>) : {}
}

const omitUndefined = <T extends Record<string, unknown>>(value: T): T => {
  const entries = Object.entries(value).filter(([, item]) => item !== undefined)
  return Object.fromEntries(entries) as T
}

const normalizeVisibilityRules = (
  when: FormVisibilityConfig["when"]
): ReadonlyArray<FormVisibilityRule> | undefined => {
  if (!when) {
    return undefined
  }

  return globalThis.Array.isArray(when) ? when : [when as FormVisibilityRule]
}

const pathToSegments = (path: string) => path.split(".").filter(Boolean)

const sortByOrder = <T extends { order?: number }>(left: T, right: T) => {
  const leftOrder = left.order ?? Number.NEGATIVE_INFINITY
  const rightOrder = right.order ?? Number.NEGATIVE_INFINITY
  if (leftOrder === rightOrder) {
    return 0
  }

  // order 越大，越靠前
  return rightOrder - leftOrder > 0 ? 1 : -1
}

const normalizeConfig = (formConfig: FormConfig, base: Partial<FormConfigNormalized> = {}): FormConfigNormalized => {
  const componentType = formConfig.componentType ?? formConfig.widget ?? base.componentType
  const when = normalizeVisibilityRules(formConfig.when) ?? base.when
  const dependsOn = globalThis.Array.from(
    new Set([...(base.dependsOn ?? []), ...(formConfig.dependsOn ?? []), ...(when?.map((rule) => rule.path) ?? [])])
  )

  return omitUndefined({
    ...base,
    ...formConfig,
    componentType,
    title: formConfig.title ?? formConfig.label ?? base.title,
    order: formConfig.order ?? base.order,
    group: formConfig.group ?? base.group ?? "",
    when,
    dependsOn: dependsOn.length > 0 ? dependsOn : undefined
  }) as FormConfigNormalized
}

const cloneWithPrototype = <T extends object>(value: T, overrides: Partial<T>): T => {
  const clone = Object.create(Object.getPrototypeOf(value))
  Object.defineProperties(clone, Object.getOwnPropertyDescriptors(value))

  for (const key of Reflect.ownKeys(overrides) as Array<keyof T>) {
    Object.defineProperty(clone, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: overrides[key]
    })
  }

  return clone
}

const annotateValue = (self: unknown, formConfig: FormConfig): unknown => {
  if (
    self &&
    (typeof self === "object" || typeof self === "function") &&
    "annotations" in self &&
    typeof (self as { annotations?: unknown }).annotations === "function"
  ) {
    return (self as Schema.Annotable.All).annotations({
      [FormTypeId]: normalizeConfig(formConfig, getExistingConfig(self))
    })
  }

  if (
    self &&
    typeof self === "object" &&
    "schemas" in self &&
    (self as { schemas?: unknown }).schemas &&
    typeof (self as { schemas?: unknown }).schemas === "object"
  ) {
    const schemas = (self as { schemas: Record<string, unknown> }).schemas

    return cloneWithPrototype(self, {
      schemas: cloneWithPrototype(
        schemas,
        Object.fromEntries(Object.entries(schemas).map(([key, value]) => [key, annotateValue(value, formConfig)]))
      )
    })
  }

  return self
}

const annotate =
  (formConfig: FormConfig) =>
  <S>(self: S): S =>
    annotateValue(self, formConfig) as S

export const config = (formConfig: FormConfig) => annotate(formConfig)

export const field = (fieldConfig: Partial<FormFieldConfig & FormArrayConfig>) => annotate(fieldConfig)

export const layout = (layoutConfig: FormLayoutConfig) => annotate(layoutConfig)

export const visibility = (visibilityConfig: FormVisibilityConfig) => annotate(visibilityConfig)

interface Restriction {
  minLength?: number | undefined
  maxLength?: number | undefined
  pattern?: string | undefined
}

const getRestriction = (astType: AST.AST): Restriction => {
  const baseRestriction: {
    minLength?: number
    maxLength?: number
    pattern?: string
  } = {}

  if (astType._tag === "Refinement") {
    const nestedRestriction = getRestriction(astType.from)
    const jsonSchemaAnnotation = AST.getJSONSchemaAnnotation(astType).pipe(Option.getOrUndefined)

    return {
      ...nestedRestriction,
      ...jsonSchemaAnnotation
    }
  }

  return baseRestriction
}

const getFieldType = (formConfig: FormConfigNormalized | undefined, defaultType: FormWidget = "input") => {
  const t = formConfig?.componentType || defaultType

  return t || defaultType
}

const makeSwitchField = (_type: AST.AST, fieldConfig: FormConfigNormalized | undefined) => {
  return {
    ...fieldConfig,
    componentType: getFieldType(fieldConfig, "switch")
  }
}

const makeSingleField = (astType: AST.AST, fieldConfig: FormConfigNormalized | undefined) => {
  const getOptions = (currentType: AST.AST) => {
    let options: Array<{ label: string; value: string | number }> = []

    if (currentType._tag === "Enums") {
      options = Object.entries(currentType.enums).map(([_, [label, value]]) => {
        return {
          label,
          value
        }
      })
    }

    if (currentType._tag === "Union") {
      if (currentType.types.find((memberType) => memberType._tag === "UndefinedKeyword")) {
        const firstType = currentType.types[0]
        const annotatedConfig = currentType.annotations[FormTypeId] as any

        const fieldOptions: any = getOptions(firstType)

        const inheritedConfig = annotatedConfig || firstType.annotations[FormTypeId]

        return {
          options: fieldOptions.options,
          ...inheritedConfig
        }
      }

      options = currentType.types.map((memberType) => {
        switch (memberType._tag) {
          case "Literal":
            return {
              label: memberType.literal?.toString() || "",
              value: memberType.literal?.toString() || ""
            }
          default:
            throw new Error(`Unsupported type: ${memberType._tag}`)
        }
      })
    }

    if (fieldConfig?.options) {
      options = Object.entries(fieldConfig.options).map(([label, value]) => ({
        label,
        value
      }))
    }

    return { ...fieldConfig, options: options || [] }
  }

  const ret = {
    ...getOptions(astType),
    componentType: getFieldType(fieldConfig, "select")
  }

  return ret
}

const makeMultipleField = (astType: AST.AST, fieldConfig: FormConfigNormalized | undefined) => {
  const getOptions = (currentType: AST.AST) => {
    let options: Array<{ label: string; value: string | number }> = []

    if (currentType._tag === "TupleType") {
      const itemType = currentType.rest[0].type
      if (itemType._tag === "Enums") {
        options = Object.entries(itemType.enums).map(([_, [label, value]]) => {
          return {
            label,
            value
          }
        })
      } else if (itemType._tag === "Union") {
        options = fieldConfig?.options
          ? Object.entries(fieldConfig.options).map(([label, value]) => {
              return {
                label,
                value
              }
            })
          : itemType.types.map((literalType: any) => {
              return {
                label: literalType.literal,
                value: literalType.literal
              }
            })
      } else {
        throw new Error(`Unsupported type: ${itemType._tag}`)
      }
    }

    return { ...fieldConfig, options }
  }
  return {
    ...fieldConfig,
    ...getOptions(astType),
    componentType: getFieldType(fieldConfig, "checkbox")
  }
}

const makeDefaultField = (astType: AST.AST, fieldConfig: FormConfigNormalized | undefined) => {
  return {
    ...fieldConfig,
    componentType: getFieldType(fieldConfig, "input"),
    htmlType: fieldConfig?.htmlType || "text",
    restriction: getRestriction(astType)
  }
}

/**
 * @deprecated
 */
export const Options = <A extends Schema.EnumsDefinition>(data: A) => {
  return Schema.Enums(data)
}

const generateFormField = (type: AST.AST, fieldConfig: FormConfigNormalized | undefined = undefined) => {
  const formTypeConfig = normalizeConfig((type.annotations[FormTypeId] as FormConfig | undefined) ?? {}, fieldConfig)

  if (formTypeConfig?.componentType === "select" && formTypeConfig?.options) {
    return makeSingleField(type, formTypeConfig)
  }

  switch (type._tag) {
    case "Suspend":
      throw new Error(`${type._tag} is not supported`)
    case "Declaration":
      return makeDefaultField(type, formTypeConfig)
    case "BooleanKeyword":
      return makeSwitchField(type, formTypeConfig)
    case "TupleType":
      return makeMultipleField(type, formTypeConfig)
    case "Enums":
    case "Union":
      return makeSingleField(type, formTypeConfig)
    case "AnyKeyword":
    case "UndefinedKeyword":
    case "NeverKeyword":
    case "StringKeyword":
    case "NumberKeyword":
    case "BigIntKeyword":
    case "SymbolKeyword":
    case "ObjectKeyword":
    case "Literal":
    case "UniqueSymbol":
    case "VoidKeyword":
    case "UnknownKeyword":
    case "TemplateLiteral":
    case "TypeLiteral":
    case "Refinement":
    case "Transformation":
      return makeDefaultField(type, formTypeConfig)
  }
}

type ChildField =
  | {
      id: string
      name: string
      title?: string
      description?: string
      help?: string
      componentType: "input" | "textarea"
      htmlType: HTMLInputTypeAttribute
      orientation: FormConfig["orientation"]
      order?: number
      group: string
      width?: FormLayoutConfig["width"]
      hidden?: boolean
      dependsOn?: ReadonlyArray<string>
      when?: ReadonlyArray<FormVisibilityRule>
      clearWhenHidden?: boolean
      placeholder?: string
      autoComplete?: string
      inputMode?: string
      rows?: number
      disabled?: boolean
      readOnly?: boolean
      defaultValue: unknown
      restriction: Restriction
    }
  | {
      id: string
      name: string
      title?: string
      description?: string
      help?: string
      componentType: "select" | "checkbox" | "radio"
      orientation: FormConfig["orientation"]
      options: Array<{ label: string; value: any }>
      order?: number
      group: string
      width?: FormLayoutConfig["width"]
      hidden?: boolean
      dependsOn?: ReadonlyArray<string>
      when?: ReadonlyArray<FormVisibilityRule>
      clearWhenHidden?: boolean
      placeholder?: string
      autoComplete?: string
      inputMode?: string
      rows?: number
      disabled?: boolean
      readOnly?: boolean
      defaultValue: unknown
    }
  | {
      id: string
      name: string
      title?: string
      description?: string
      help?: string
      componentType: "switch"
      orientation: FormConfig["orientation"]
      order?: number
      group: string
      width?: FormLayoutConfig["width"]
      hidden?: boolean
      dependsOn?: ReadonlyArray<string>
      when?: ReadonlyArray<FormVisibilityRule>
      clearWhenHidden?: boolean
      placeholder?: string
      autoComplete?: string
      inputMode?: string
      rows?: number
      disabled?: boolean
      readOnly?: boolean
      defaultValue: unknown
    }
  | {
      id: string
      name: string
      title?: string
      description?: string
      help?: string
      componentType: "custom"
      orientation: FormConfig["orientation"]
      order?: number
      group: string
      width?: FormLayoutConfig["width"]
      hidden?: boolean
      dependsOn?: ReadonlyArray<string>
      when?: ReadonlyArray<FormVisibilityRule>
      clearWhenHidden?: boolean
      placeholder?: string
      autoComplete?: string
      inputMode?: string
      rows?: number
      disabled?: boolean
      readOnly?: boolean
      defaultValue: unknown
      component: string
    }

export type FormSchemaJson = Array<{
  id: string
  children: Array<ChildField>
}>

export type FormFieldDefinition = {
  id: string
  path: string
  title?: string
  label?: string
  description?: string
  help?: string
  componentType: FormWidget
  widget: FormWidget
  defaultValue: unknown
  options?: Array<{ label: string; value: string | number }>
  component?: string
  validation?: Restriction
  layout: {
    group: string
    order: number
    orientation?: FormLayoutConfig["orientation"]
    width?: FormLayoutConfig["width"]
  }
  visibility: {
    hidden?: boolean
    dependsOn?: ReadonlyArray<string>
    when?: ReadonlyArray<FormVisibilityRule>
    clearWhenHidden?: boolean
  }
  input: {
    htmlType?: HTMLInputTypeAttribute
    placeholder?: string
    autoComplete?: string
    inputMode?: string
    rows?: number
    disabled?: boolean
    readOnly?: boolean
  }
}

export type FormArrayDefinition = {
  id: string
  path: string
  title?: string
  label?: string
  description?: string
  help?: string
  widget: "array"
  defaultValue: Array<unknown>
  layout: {
    group: string
    order: number
    orientation?: FormLayoutConfig["orientation"]
    width?: FormLayoutConfig["width"]
  }
  visibility: {
    hidden?: boolean
    dependsOn?: ReadonlyArray<string>
    when?: ReadonlyArray<FormVisibilityRule>
    clearWhenHidden?: boolean
  }
  controls: {
    addLabel: string
    removeLabel: string
    emptyLabel?: string
    minItems?: number
    maxItems?: number
  }
  item: {
    defaultValue: Record<string, unknown>
    fields: Array<FormFieldDefinition>
  }
}

export type FormDefinition = {
  fields: Array<FormFieldDefinition>
  arrays: Array<FormArrayDefinition>
  groups: Array<{
    id: string
    key: string
    fields: Array<string>
  }>
}

const mapConfiguredOptions = (options: FormFieldConfig["options"]) =>
  options ? Object.entries(options).map(([label, value]) => ({ label, value })) : undefined

const applyFieldConfig = (fieldProps: ChildField, fieldConfig: FormConfigNormalized): ChildField =>
  omitUndefined({
    ...fieldProps,
    title: fieldConfig.title ?? fieldProps.title,
    description: fieldConfig.description ?? fieldProps.description,
    help: fieldConfig.help ?? fieldProps.help,
    componentType: fieldConfig.componentType ?? fieldProps.componentType,
    order: fieldConfig.order ?? fieldProps.order,
    group: fieldConfig.group ?? fieldProps.group,
    orientation: fieldConfig.orientation ?? fieldProps.orientation,
    width: fieldConfig.width ?? fieldProps.width,
    hidden: fieldConfig.hidden ?? fieldProps.hidden,
    dependsOn: fieldConfig.dependsOn ?? fieldProps.dependsOn,
    when: fieldConfig.when ?? fieldProps.when,
    clearWhenHidden: fieldConfig.clearWhenHidden ?? fieldProps.clearWhenHidden,
    placeholder: fieldConfig.placeholder ?? fieldProps.placeholder,
    autoComplete: fieldConfig.autoComplete ?? fieldProps.autoComplete,
    inputMode: fieldConfig.inputMode ?? fieldProps.inputMode,
    rows: fieldConfig.rows ?? fieldProps.rows,
    disabled: fieldConfig.disabled ?? fieldProps.disabled,
    readOnly: fieldConfig.readOnly ?? fieldProps.readOnly,
    htmlType: "htmlType" in fieldProps ? (fieldConfig.htmlType ?? fieldProps.htmlType) : undefined,
    options: "options" in fieldProps ? (fieldProps.options ?? mapConfiguredOptions(fieldConfig.options)) : undefined,
    component: "component" in fieldProps ? (fieldConfig.component ?? fieldProps.component) : undefined
  }) as ChildField

const makeFieldDefinition = (formField: ChildField): FormFieldDefinition =>
  omitUndefined({
    id: formField.id,
    path: formField.name,
    title: formField.title,
    label: formField.title,
    description: formField.description,
    help: formField.help,
    componentType: formField.componentType,
    widget: formField.componentType,
    defaultValue: "defaultValue" in formField ? formField.defaultValue : undefined,
    options: "options" in formField ? formField.options : undefined,
    component: "component" in formField ? formField.component : undefined,
    validation: "restriction" in formField ? formField.restriction : undefined,
    layout: omitUndefined({
      group: formField.group,
      order: formField.order ?? 0,
      orientation: formField.orientation,
      width: formField.width
    }),
    visibility: omitUndefined({
      hidden: formField.hidden,
      dependsOn: formField.dependsOn,
      when: formField.when,
      clearWhenHidden: formField.clearWhenHidden
    }),
    input: omitUndefined({
      htmlType: "htmlType" in formField ? formField.htmlType : undefined,
      placeholder: formField.placeholder,
      autoComplete: formField.autoComplete,
      inputMode: formField.inputMode,
      rows: formField.rows,
      disabled: formField.disabled,
      readOnly: formField.readOnly
    })
  }) as FormFieldDefinition

const toSchemaJson = (fields: Array<ChildField>): FormSchemaJson => {
  const groupedEntries = Object.entries(
    Array.groupBy(fields, (item) => item.group) as Record<string, Array<ChildField>>
  ).sort(([leftGroup], [rightGroup]) => leftGroup.localeCompare(rightGroup))

  return groupedEntries.map(([groupKey, items]) => ({
    id: groupKey || "default",
    children: items
  }))
}

export const toJson = <A, I>(
  schema: Schema.Schema<A, I>,
  values: Partial<A> = {}
): { schemaJSON: FormSchemaJson; defaultValues: Partial<A>; definition: FormDefinition } => {
  // for each ast.property , collect all field and field type, description, value, ...
  const ast = schema.ast
  let fields: Array<ChildField> = []
  const arrays: Array<FormArrayDefinition> = []
  const defaultValues: Partial<A> = {}

  const getPathValue = (input: unknown, path: string): unknown =>
    pathToSegments(path).reduce<unknown>((current, segment) => {
      if (current && typeof current === "object" && segment in (current as Record<string, unknown>)) {
        return (current as Record<string, unknown>)[segment]
      }

      return undefined
    }, input)

  const setPathValue = (target: Record<string, unknown>, path: string, value: unknown) => {
    const segments = pathToSegments(path)
    let current: Record<string, unknown> = target

    for (let index = 0; index < segments.length; index++) {
      const segment = segments[index]
      if (!segment) {
        continue
      }

      if (index === segments.length - 1) {
        current[segment] = value
        return
      }

      const next = current[segment]
      if (!next || typeof next !== "object" || Array.isArray(next)) {
        current[segment] = {}
      }

      current = current[segment] as Record<string, unknown>
    }
  }

  const getPropertyContainer = (
    currentAst: AST.AST
  ): { properties: ReadonlyArray<AST.PropertySignature>; getDefaultValue: (name: string) => unknown } | undefined => {
    switch (currentAst._tag) {
      case "TypeLiteral":
        return {
          properties: currentAst.propertySignatures,
          getDefaultValue: () => undefined
        }
      case "Transformation": {
        const from = currentAst.from
        const transformation = currentAst.transformation as AST.TypeLiteralTransformation
        const transforms = transformation.propertySignatureTransformations

        if (from._tag !== "TypeLiteral") {
          return undefined
        }

        return {
          properties: from.propertySignatures,
          getDefaultValue: (name: string) => {
            const item = transforms.find((transform) => transform.from === name)

            if (item) {
              return item.decode(Option.none()).pipe(Option.getOrUndefined)
            }

            return undefined
          }
        }
      }
      case "Refinement":
        return getPropertyContainer(currentAst.from)
      default:
        return undefined
    }
  }

  const getArrayItemContainer = (
    currentAst: AST.AST
  ): { properties: ReadonlyArray<AST.PropertySignature>; getDefaultValue: (name: string) => unknown } | undefined => {
    switch (currentAst._tag) {
      case "TupleType": {
        const itemType = currentAst.rest[0]?.type
        return itemType ? getPropertyContainer(itemType) : undefined
      }
      case "Refinement":
        return getArrayItemContainer(currentAst.from)
      default:
        return undefined
    }
  }

  const getPropertyFormConfig = (property: AST.PropertySignature) =>
    normalizeConfig(
      (property.annotations[FormTypeId] as FormConfig | undefined) ?? {},
      normalizeConfig((property.type.annotations[FormTypeId] as FormConfig | undefined) ?? {})
    )

  const go = (
    properties: ReadonlyArray<AST.PropertySignature>,
    options: {
      prefix?: string | undefined
      getDefaultValue: (name: string) => unknown
      getProvidedValue: (name: string) => unknown
    }
  ) => {
    const res = properties
      .flatMap((property) => {
        const name = property.name.toString()
        const path = options.prefix ? `${options.prefix}.${name}` : name
        const fieldConfig = getPropertyFormConfig(property)
        const nestedContainer = !fieldConfig.componentType ? getPropertyContainer(property.type) : undefined
        const arrayContainer = !fieldConfig.componentType ? getArrayItemContainer(property.type) : undefined

        if (nestedContainer) {
          go(nestedContainer.properties, {
            prefix: path,
            getDefaultValue: (childName) => {
              const nestedDefault = options.getDefaultValue(name)
              const transformedDefault = nestedContainer.getDefaultValue(childName)
              return getPathValue(nestedDefault, childName) ?? transformedDefault
            },
            getProvidedValue: (childName) => {
              const providedValue = options.getProvidedValue(name)
              return getPathValue(providedValue, childName)
            }
          })

          return []
        }

        if (arrayContainer) {
          const itemDefaultValues: Record<string, unknown> = {}
          let itemFields: Array<ChildField> = []

          const goArrayItemFields = (
            itemProperties: ReadonlyArray<AST.PropertySignature>,
            itemOptions: {
              prefix?: string | undefined
              getDefaultValue: (name: string) => unknown
            }
          ) => {
            const itemResults = itemProperties
              .flatMap((itemProperty) => {
                const itemName = itemProperty.name.toString()
                const itemPath = itemOptions.prefix ? `${itemOptions.prefix}.${itemName}` : itemName
                const itemFieldConfig = getPropertyFormConfig(itemProperty)
                const nestedItemContainer = !itemFieldConfig.componentType
                  ? getPropertyContainer(itemProperty.type)
                  : undefined

                if (nestedItemContainer) {
                  goArrayItemFields(nestedItemContainer.properties, {
                    prefix: itemPath,
                    getDefaultValue: (childName) => {
                      const nestedDefault = itemOptions.getDefaultValue(itemName)
                      const transformedDefault = nestedItemContainer.getDefaultValue(childName)
                      return getPathValue(nestedDefault, childName) ?? transformedDefault
                    }
                  })

                  return []
                }

                const fieldProps = generateFormField(itemProperty.type, itemFieldConfig)
                const defaultValue = itemOptions.getDefaultValue(itemName)
                const { id: _itemFieldId, ...configuredFieldProps } = applyFieldConfig(fieldProps, itemFieldConfig)

                const item = omitUndefined({
                  id: `${path}.*.${itemPath}`,
                  ...configuredFieldProps,
                  name: itemPath,
                  defaultValue
                }) as ChildField

                setPathValue(itemDefaultValues, itemPath, defaultValue)

                return [item]
              })
              .sort(sortByOrder)

            itemFields = [...itemFields, ...itemResults]
          }

          goArrayItemFields(arrayContainer.properties, {
            prefix: undefined,
            getDefaultValue: (childName) => arrayContainer.getDefaultValue(childName)
          })

          const providedValue = options.getProvidedValue(name)
          const configuredDefaultValue = options.getDefaultValue(name)
          const defaultValue = Array.isArray(providedValue)
            ? providedValue
            : Array.isArray(configuredDefaultValue)
              ? configuredDefaultValue
              : []

          setPathValue(defaultValues as Record<string, unknown>, path, defaultValue)

          arrays.push(
            omitUndefined({
              id: path,
              path,
              title: fieldConfig.title,
              label: fieldConfig.title,
              description: fieldConfig.description,
              help: fieldConfig.help,
              widget: "array" as const,
              defaultValue,
              layout: omitUndefined({
                group: fieldConfig.group,
                order: fieldConfig.order ?? 0,
                orientation: fieldConfig.orientation,
                width: fieldConfig.width
              }),
              visibility: omitUndefined({
                hidden: fieldConfig.hidden,
                dependsOn: fieldConfig.dependsOn,
                when: fieldConfig.when,
                clearWhenHidden: fieldConfig.clearWhenHidden
              }) as FormArrayDefinition["visibility"],
              controls: omitUndefined({
                addLabel: fieldConfig.addLabel ?? "Add item",
                removeLabel: fieldConfig.removeLabel ?? "Remove",
                emptyLabel: fieldConfig.emptyLabel,
                minItems: fieldConfig.minItems,
                maxItems: fieldConfig.maxItems
              }) as FormArrayDefinition["controls"],
              item: {
                defaultValue: itemDefaultValues,
                fields: itemFields.map(makeFieldDefinition)
              }
            }) as FormArrayDefinition
          )

          return []
        }

        const fieldProps = generateFormField(property.type, fieldConfig)
        const id = path
        const defaultValue = options.getProvidedValue(name) ?? options.getDefaultValue(name)
        const { id: _fieldId, ...configuredFieldProps } = applyFieldConfig(fieldProps, fieldConfig)

        const item = omitUndefined({
          id,
          ...configuredFieldProps,
          name: path,
          defaultValue
        }) as ChildField

        setPathValue(defaultValues as Record<string, unknown>, path, defaultValue)

        return [item]
      })
      .sort(sortByOrder)

    fields = [...fields, ...res]
  }

  const makeDefinition = () => {
    const schemaJSON = toSchemaJson(fields)
    const groupedEntries = Object.entries(
      Array.groupBy(
        [
          ...fields.map((formField) => ({
            group: formField.group,
            order: formField.order,
            path: formField.name
          })),
          ...arrays.map((array) => ({
            group: array.layout.group,
            order: array.layout.order,
            path: array.path
          }))
        ],
        (item) => item.group
      ) as Record<string, Array<{ group: string; order?: number; path: string }>>
    ).sort(([leftGroup], [rightGroup]) => leftGroup.localeCompare(rightGroup))

    return {
      schemaJSON,
      defaultValues,
      definition: {
        fields: fields.map(makeFieldDefinition),
        arrays,
        groups: groupedEntries.map(([groupKey, items]) => ({
          id: groupKey || "default",
          key: groupKey,
          fields: items.sort(sortByOrder).map((item) => item.path)
        }))
      }
    }
  }

  if (ast._tag === "TypeLiteral") {
    go(ast.propertySignatures, {
      prefix: undefined,
      getDefaultValue: () => undefined,
      getProvidedValue: (name) => values[name as keyof Partial<A>]
    })

    return makeDefinition()
  }

  if (ast._tag === "Transformation") {
    const container = getPropertyContainer(ast)

    if (container) {
      go(container.properties, {
        prefix: undefined,
        getDefaultValue: container.getDefaultValue,
        getProvidedValue: (name) => values[name as keyof Partial<A>]
      })
    }

    return makeDefinition()
  }

  throw new Error(`Unexpected AST, ast: ${ast._tag}`)
}

export const LiteralToOptionsRecord = <A extends readonly [string, ...string[]]>(
  prefix: string,
  schema: Schema.Literal<A>
) => Object.fromEntries(schema.literals.map((literal) => [`${prefix}.${literal}`, literal]))

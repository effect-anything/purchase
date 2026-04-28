import type * as Schema from "effect/Schema"
import type { Simplify } from "effect/Types"

import * as React from "react"
import { type ComponentType, type ReactNode, useMemo } from "react"
import {
  type Control,
  type ControllerFieldState,
  type FieldError,
  type FieldErrors,
  type FieldValues,
  FormProvider,
  type Resolver,
  type ResolverOptions,
  type ResolverResult,
  useFieldArray,
  useFormContext,
  type UseFormRegister,
  type UseFormReturn,
  useFormState,
  useWatch
} from "react-hook-form"

import { applyFormSubmitIssues, isFormSubmitError } from "./errors.ts"
import * as FG from "./generate.ts"
import { AutosaveForm, ChangesForm, type RenderChangesFormActions } from "./wrapper.tsx"

type SchemaFormFieldValues<TFieldValues extends FieldValues> = TFieldValues

export type SchemaFormResolver<A extends FieldValues, TFieldValues extends FieldValues, TContext = unknown> = Resolver<
  SchemaFormFieldValues<TFieldValues>,
  TContext,
  A
>

export type SchemaFormReturn<
  A extends FieldValues,
  TFieldValues extends FieldValues,
  TContext = unknown
> = UseFormReturn<SchemaFormFieldValues<TFieldValues>, TContext, A>

const hasResolverErrors = <TFieldValues extends FieldValues, TTransformedValues>(
  result: ResolverResult<TFieldValues, TTransformedValues>
): result is Extract<ResolverResult<TFieldValues, TTransformedValues>, { errors: FieldErrors<TFieldValues> }> =>
  Object.keys(result.errors).length > 0

const hasResolverValues = <TFieldValues extends FieldValues, TTransformedValues>(
  result: ResolverResult<TFieldValues, TTransformedValues>
): result is Extract<ResolverResult<TFieldValues, TTransformedValues>, { values: TTransformedValues }> =>
  !hasResolverErrors(result)

export type SchemaFormProps<
  A extends FieldValues,
  I extends FieldValues = A,
  TFieldValues extends FieldValues = I,
  TContext = unknown
> = {
  schema: Schema.Schema<A, I>
  form: SchemaFormReturn<A, TFieldValues, TContext>
  autoSave?: boolean | undefined
  autoSaveWait?: number | undefined
  resolver: SchemaFormResolver<A, TFieldValues, TContext>
  values?: Partial<A> | undefined
  renderActions?: RenderChangesFormActions | undefined
  // TODO: refactor to exit data type
  onSubmit: (values: A) => Promise<void> | void
  children?: ReactNode
}

export function SchemaForm<
  A extends FieldValues,
  I extends FieldValues = A,
  TFieldValues extends FieldValues = I,
  TContext = unknown
>({
  schema: _schema,
  onSubmit,
  autoSave,
  autoSaveWait,
  form,
  resolver,
  renderActions,
  children
}: Simplify<SchemaFormProps<A, I, TFieldValues, TContext>>) {
  const handleSubmitFailure = (error: unknown) => {
    if (!isFormSubmitError(error)) {
      throw error
    }

    form.clearErrors()
    applyFormSubmitIssues(form, error.issues)
  }

  const runSubmit = async (values: A) => {
    form.clearErrors()

    try {
      await onSubmit(values)
    } catch (error) {
      handleSubmitFailure(error)
    }
  }

  if (autoSave) {
    /**
     * Copy from react-hook-form
     * @link https://github.com/react-hook-form/react-hook-form/blob/b5863b46346416972c025f4b621cb624ffc4a955/src/logic/createFormControl.ts#L1154
     */
    const onAutoSave = async (data: TFieldValues) => {
      form.control._subjects.state.next({
        isSubmitting: true
      })

      let errors: FieldErrors<TFieldValues> = {}
      let hasError = false

      const result = await resolver(data, undefined, {
        fields: form.control._fields as unknown as ResolverOptions<TFieldValues>["fields"],
        shouldUseNativeValidation: false
      })

      if (hasResolverErrors(result)) {
        errors = result.errors
        hasError = true
      }

      let onSubmitError: Error | undefined
      if (!hasError) {
        form.control._subjects.state.next({
          errors: {}
        })
        try {
          if (hasResolverValues(result)) {
            await runSubmit(result.values)
          }
        } catch (error) {
          onSubmitError = error as Error
        }
      }

      form.control._subjects.state.next({
        isSubmitting: false,
        isSubmitted: true,
        isSubmitSuccessful: !hasError && !onSubmitError,
        submitCount: form.formState.submitCount + 1,
        errors
      })

      if (onSubmitError) {
        throw onSubmitError
      }
    }

    return (
      <FormProvider {...form}>
        <AutosaveForm<TFieldValues> onSubmit={onAutoSave} wait={autoSaveWait}>
          {children}
        </AutosaveForm>
      </FormProvider>
    )
  }

  return (
    <FormProvider {...form}>
      <ChangesForm<A> onSubmit={runSubmit} renderActions={renderActions}>
        {children}
      </ChangesForm>
    </FormProvider>
  )
}

export interface SchemaFormGroup {
  title?: ReactNode | undefined
  description?: ReactNode | undefined
  separator?: boolean | undefined
  prefix?: ReactNode | undefined
  suffix?: ReactNode | undefined
}

export type RenderFormFields = {
  definition: FG.FormDefinition
  schemaJSON: FG.FormSchemaJson
  groups: Array<SchemaFormGroup>
  skipFirstGroup?: boolean | undefined
  register: UseFormRegister<any>
  components?: Record<string, ComponentType<any>> | undefined
  control: Control<any>
}

export type FormRendererWidgetProps = {
  field: FG.FormFieldDefinition
  control: Control<any>
  register: UseFormRegister<any>
  components?: Record<string, ComponentType<any>> | undefined
  fieldState: FormRendererFieldState
  error?: string | undefined
  renderError: () => ReactNode
}

export type FormRendererWidget = (props: FormRendererWidgetProps) => ReactNode

export type FormRendererFieldProps = FormRendererWidgetProps & {
  renderedField: ReactNode
  fieldIndex: number
  groupIndex: number
  group: FG.FormDefinition["groups"][number]
  groupProps?: SchemaFormGroup | undefined
}

export type FormRendererFieldState = Pick<ControllerFieldState, "invalid" | "isDirty" | "isTouched"> & {
  error?: string | undefined
}

export type FormRendererErrorProps = {
  field: FG.FormFieldDefinition
  fieldState: FormRendererFieldState
  error?: string | undefined
  fieldIndex: number
  groupIndex: number
  group: FG.FormDefinition["groups"][number]
  groupProps?: SchemaFormGroup | undefined
}

export type FormRendererArrayRow = {
  id: string
  index: number
  fields: Array<ReactNode>
  remove: () => void
  canRemove: boolean
}

export type FormRendererArrayErrorProps = {
  array: FG.FormArrayDefinition
  error?: string | undefined
  fieldIndex: number
  groupIndex: number
  group: FG.FormDefinition["groups"][number]
  groupProps?: SchemaFormGroup | undefined
}

export type FormRendererArrayProps = {
  array: FG.FormArrayDefinition
  control: Control<any>
  register: UseFormRegister<any>
  components?: Record<string, ComponentType<any>> | undefined
  rows: Array<FormRendererArrayRow>
  append: () => void
  canAdd: boolean
  rowCount: number
  error?: string | undefined
  renderError: () => ReactNode
  fieldIndex: number
  groupIndex: number
  group: FG.FormDefinition["groups"][number]
  groupProps?: SchemaFormGroup | undefined
}

export type FormRendererGroupProps = {
  groupIndex: number
  group: FG.FormDefinition["groups"][number]
  groupProps?: SchemaFormGroup | undefined
  fields: Array<ReactNode>
}

export type FormRendererRootProps = {
  error?: string | undefined
}

export interface FormRenderer {
  render: (params: RenderFormFields) => ReactNode
}

export interface FormRendererConfig {
  widgets: Partial<Record<FG.FormWidget, FormRendererWidget>>
  renderField?: (props: FormRendererFieldProps) => ReactNode
  renderArray?: (props: FormRendererArrayProps) => ReactNode
  renderGroup?: (props: FormRendererGroupProps) => ReactNode
  renderError?: (props: FormRendererErrorProps) => ReactNode
  renderArrayError?: (props: FormRendererArrayErrorProps) => ReactNode
  renderRootError?: (props: FormRendererRootProps) => ReactNode
}

const defaultRenderError = ({ field, error }: FormRendererErrorProps) => {
  if (!error) {
    return null
  }

  return (
    <span aria-live="polite" data-schema-form-error={field.path} role="alert">
      {error}
    </span>
  )
}

const defaultRenderField = ({ renderedField, error, renderError }: FormRendererFieldProps) => (
  <>
    {renderedField}
    {error ? renderError() : null}
  </>
)

const defaultRenderArrayError = ({ array, error }: FormRendererArrayErrorProps) => {
  if (!error) {
    return null
  }

  return (
    <span aria-live="polite" data-schema-form-array-error={array.path} role="alert">
      {error}
    </span>
  )
}

const defaultRenderArray = ({ array, rows, append, canAdd, error, renderError }: FormRendererArrayProps) => (
  <section data-schema-form-array={array.path}>
    {array.title ? <h3>{array.title}</h3> : null}
    {array.description ? <p>{array.description}</p> : null}
    {rows.length === 0 && array.controls.emptyLabel ? <p>{array.controls.emptyLabel}</p> : null}
    {rows.map((row) => (
      <div key={row.id} data-schema-form-array-row={`${array.path}.${row.index}`}>
        {row.fields}
        {row.canRemove ? (
          <button type="button" onClick={row.remove}>
            {array.controls.removeLabel}
          </button>
        ) : null}
      </div>
    ))}
    {canAdd ? (
      <button type="button" onClick={append}>
        {array.controls.addLabel}
      </button>
    ) : null}
    {error ? renderError() : null}
  </section>
)

const defaultRenderGroup = ({ group, fields }: FormRendererGroupProps) => (
  <React.Fragment key={group.id}>{fields}</React.Fragment>
)

const defaultRenderRootError = ({ error }: FormRendererRootProps) => {
  if (!error) {
    return null
  }

  return (
    <div aria-live="polite" data-schema-form-root-error role="alert">
      {error}
    </div>
  )
}

export const createFormRenderer = ({
  widgets,
  renderField = defaultRenderField,
  renderArray = defaultRenderArray,
  renderGroup = defaultRenderGroup,
  renderError = defaultRenderError,
  renderArrayError = defaultRenderArrayError,
  renderRootError = defaultRenderRootError
}: FormRendererConfig): FormRenderer => ({
  render: ({ definition, groups, skipFirstGroup, register, components, control }) => {
    const definitionByPath = new Map(definition.fields.map((field) => [field.path, field]))
    const arraysByPath = new Map(definition.arrays.map((array) => [array.path, array]))

    const renderedGroups = definition.groups.map((group, groupIndex) => {
      const groupProps = groupIndex === 0 && skipFirstGroup ? undefined : groups[groupIndex]
      const renderedFields = group.fields.map((path, fieldIndex) => {
        const field = definitionByPath.get(path)

        if (field) {
          const widget = widgets[field.widget]
          if (!widget) {
            return null
          }

          return (
            <RendererFieldSlot
              key={field.path}
              components={components}
              control={control}
              field={field}
              fieldIndex={fieldIndex}
              group={group}
              groupIndex={groupIndex}
              groupProps={groupProps}
              register={register}
              renderError={renderError}
              renderField={renderField}
              widget={widget}
            />
          )
        }

        const array = arraysByPath.get(path)
        if (!array) {
          return null
        }

        return (
          <RendererArraySlot
            key={array.path}
            array={array}
            components={components}
            control={control}
            fieldIndex={fieldIndex}
            group={group}
            groupIndex={groupIndex}
            groupProps={groupProps}
            register={register}
            renderArray={renderArray}
            renderArrayError={renderArrayError}
            widgets={widgets}
            renderField={renderField}
            renderError={renderError}
          />
        )
      })

      return renderGroup({
        group,
        groupIndex,
        groupProps,
        fields: renderedFields
      })
    })

    return (
      <>
        <RendererRootErrorSlot control={control} renderRootError={renderRootError} />
        {renderedGroups}
      </>
    )
  }
})

const toRendererFieldState = (fieldState: ControllerFieldState): FormRendererFieldState => ({
  error: fieldState.error?.message ? String(fieldState.error.message) : undefined,
  invalid: fieldState.invalid,
  isDirty: fieldState.isDirty,
  isTouched: fieldState.isTouched
})

const getPathValue = (input: unknown, path: string): unknown =>
  path
    .split(".")
    .filter(Boolean)
    .reduce<unknown>((current, segment) => {
      if (current && typeof current === "object" && segment in (current as Record<string, unknown>)) {
        return (current as Record<string, unknown>)[segment]
      }

      return undefined
    }, input)

const setPathValue = (target: Record<string, unknown>, path: string, value: unknown) => {
  const segments = path.split(".").filter(Boolean)
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

const evaluateVisibilityRule = (rule: FG.FormVisibilityRule, values: Record<string, unknown>) => {
  const value = getPathValue(values, rule.path)

  if (rule.in) {
    return rule.in.some((candidate) => Object.is(candidate, value))
  }

  if (rule.equals !== undefined) {
    return Object.is(rule.equals, value)
  }

  if (rule.notEquals !== undefined) {
    return !Object.is(rule.notEquals, value)
  }

  if (rule.falsy) {
    return !value
  }

  if (rule.truthy) {
    return Boolean(value)
  }

  return Boolean(value)
}

const isDefinitionVisible = (
  definition: Pick<FG.FormFieldDefinition | FG.FormArrayDefinition, "visibility">,
  values: Record<string, unknown>
) => {
  if (definition.visibility.hidden) {
    return false
  }

  if (definition.visibility.when && definition.visibility.when.length > 0) {
    return definition.visibility.when.every((rule) => evaluateVisibilityRule(rule, values))
  }

  if (definition.visibility.dependsOn && definition.visibility.dependsOn.length > 0) {
    return definition.visibility.dependsOn.every((path) => Boolean(getPathValue(values, path)))
  }

  return true
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as T
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, cloneValue(item)])
    ) as T
  }

  return value
}

const resolveArrayItemPath = (arrayPath: string, index: number, path: string) =>
  path.startsWith("$root.") ? path.slice("$root.".length) : `${arrayPath}.${index}.${path}`

const materializeArrayField = (
  array: FG.FormArrayDefinition,
  index: number,
  field: FG.FormFieldDefinition
): FG.FormFieldDefinition => ({
  ...field,
  id: `${array.path}.${index}.${field.path}`,
  path: `${array.path}.${index}.${field.path}`,
  visibility: {
    ...field.visibility,
    dependsOn: field.visibility.dependsOn?.map((path) => resolveArrayItemPath(array.path, index, path)),
    when: field.visibility.when?.map((rule) => ({
      ...rule,
      path: resolveArrayItemPath(array.path, index, rule.path)
    }))
  } as FG.FormFieldDefinition["visibility"]
})

const extractRootError = (rootError: FieldError | Record<string, unknown> | undefined): string | undefined => {
  if (!rootError) {
    return undefined
  }

  if ("message" in rootError && typeof rootError.message === "string") {
    return rootError.message
  }

  for (const value of Object.values(rootError)) {
    if (value && typeof value === "object") {
      const nestedMessage = extractRootError(value as FieldError | Record<string, unknown>)
      if (nestedMessage) {
        return nestedMessage
      }
    }
  }

  return undefined
}

const extractArrayError = (arrayError: FieldError | Record<string, unknown> | undefined): string | undefined => {
  if (!arrayError) {
    return undefined
  }

  if ("message" in arrayError && typeof arrayError.message === "string") {
    return arrayError.message
  }

  if ("root" in arrayError && arrayError.root && typeof arrayError.root === "object") {
    return extractRootError(arrayError.root as FieldError | Record<string, unknown>)
  }

  return undefined
}

function RendererRootErrorSlot({
  control,
  renderRootError
}: {
  control: Control<any>
  renderRootError: (props: FormRendererRootProps) => ReactNode
}) {
  const { errors } = useFormState({ control })
  const error = extractRootError(errors.root as FieldError | Record<string, unknown> | undefined)

  return <>{renderRootError({ error })}</>
}

function RendererArraySlot({
  array,
  control,
  register,
  components,
  widgets,
  renderField,
  renderError,
  renderArray,
  renderArrayError,
  fieldIndex,
  groupIndex,
  group,
  groupProps
}: {
  array: FG.FormArrayDefinition
  control: Control<any>
  register: UseFormRegister<any>
  components?: Record<string, ComponentType<any>> | undefined
  widgets: Partial<Record<FG.FormWidget, FormRendererWidget>>
  renderField: (props: FormRendererFieldProps) => ReactNode
  renderError: (props: FormRendererErrorProps) => ReactNode
  renderArray: (props: FormRendererArrayProps) => ReactNode
  renderArrayError: (props: FormRendererArrayErrorProps) => ReactNode
  fieldIndex: number
  groupIndex: number
  group: FG.FormDefinition["groups"][number]
  groupProps?: SchemaFormGroup | undefined
}) {
  const form = useFormContext()
  const dependencies = array.visibility.dependsOn ?? []
  const dependencyValues = useWatch({
    control,
    name: dependencies
  })
  const visibilityValues = React.useMemo(() => {
    const values: Record<string, unknown> = {}

    dependencies.forEach((path, index) => {
      setPathValue(values, path, Array.isArray(dependencyValues) ? dependencyValues[index] : dependencyValues)
    })

    return values
  }, [dependencies, dependencyValues])
  const visible = isDefinitionVisible(array, visibilityValues)
  const wasVisibleRef = React.useRef(visible)
  const fieldArray = useFieldArray({
    control,
    name: array.path as never
  })
  const { errors } = useFormState({
    control,
    name: array.path
  })
  const error = extractArrayError(getPathValue(errors, array.path) as FieldError | Record<string, unknown> | undefined)

  React.useEffect(() => {
    if (visible) {
      wasVisibleRef.current = true
      return
    }

    if (!array.visibility.clearWhenHidden || !wasVisibleRef.current) {
      return
    }

    wasVisibleRef.current = false
    form.unregister(array.path, {
      keepDefaultValue: true
    })
    form.clearErrors(array.path)
  }, [array.path, array.visibility.clearWhenHidden, form, visible])

  const minItems = array.controls.minItems ?? 0
  const maxItems = array.controls.maxItems ?? Number.POSITIVE_INFINITY
  const canAdd = fieldArray.fields.length < maxItems
  const canRemove = fieldArray.fields.length > minItems

  if (!visible) {
    return null
  }

  const renderArrayFieldError = () =>
    renderArrayError({
      array,
      error,
      fieldIndex,
      groupIndex,
      group,
      groupProps
    })

  const rows = fieldArray.fields.map((row, index) => ({
    id: row.id,
    index,
    canRemove,
    remove: () => {
      fieldArray.remove(index)
      form.clearErrors(array.path)
    },
    fields: array.item.fields.map((itemField, itemFieldIndex) => {
      const materializedField = materializeArrayField(array, index, itemField)
      const widget = widgets[materializedField.widget]

      if (!widget) {
        return null
      }

      return (
        <RendererFieldSlot
          key={materializedField.path}
          components={components}
          control={control}
          field={materializedField}
          fieldIndex={itemFieldIndex}
          group={group}
          groupIndex={groupIndex}
          groupProps={groupProps}
          register={register}
          renderError={renderError}
          renderField={renderField}
          widget={widget}
        />
      )
    })
  }))

  return (
    <>
      {renderArray({
        array,
        control,
        register,
        components,
        rows,
        append: () => fieldArray.append(cloneValue(array.item.defaultValue) as never),
        canAdd,
        rowCount: fieldArray.fields.length,
        error,
        renderError: renderArrayFieldError,
        fieldIndex,
        groupIndex,
        group,
        groupProps
      })}
    </>
  )
}

function RendererFieldSlot({
  field,
  control,
  register,
  components,
  widget,
  renderField,
  renderError,
  fieldIndex,
  groupIndex,
  group,
  groupProps
}: {
  field: FG.FormFieldDefinition
  control: Control<any>
  register: UseFormRegister<any>
  components?: Record<string, ComponentType<any>> | undefined
  widget: FormRendererWidget
  renderField: (props: FormRendererFieldProps) => ReactNode
  renderError: (props: FormRendererErrorProps) => ReactNode
  fieldIndex: number
  groupIndex: number
  group: FG.FormDefinition["groups"][number]
  groupProps?: SchemaFormGroup | undefined
}) {
  const form = useFormContext()
  const dependencies = field.visibility.dependsOn ?? []
  const dependencyValues = useWatch({
    control,
    name: dependencies
  })
  const formState = useFormState({
    control,
    name: field.path
  })
  const fieldState = toRendererFieldState(form.getFieldState(field.path, formState))
  const error = fieldState.error
  const visibilityValues = React.useMemo(() => {
    const values: Record<string, unknown> = {}

    dependencies.forEach((path, index) => {
      setPathValue(values, path, Array.isArray(dependencyValues) ? dependencyValues[index] : dependencyValues)
    })

    return values
  }, [dependencies, dependencyValues])
  const visible = isDefinitionVisible(field, visibilityValues)
  const wasVisibleRef = React.useRef(visible)

  React.useEffect(() => {
    if (visible) {
      wasVisibleRef.current = true
      return
    }

    if (!field.visibility.clearWhenHidden || !wasVisibleRef.current) {
      return
    }

    wasVisibleRef.current = false
    form.unregister(field.path, {
      keepDefaultValue: true
    })
    form.clearErrors(field.path)
  }, [field.path, field.visibility.clearWhenHidden, form, visible])

  if (!visible) {
    return null
  }

  const renderFieldError = () =>
    renderError({
      field,
      fieldState,
      error,
      fieldIndex,
      groupIndex,
      group,
      groupProps
    })

  const renderedField = widget({
    field,
    control,
    register,
    components,
    fieldState,
    error,
    renderError: renderFieldError
  })

  return (
    <>
      {renderField({
        field,
        control,
        register,
        components,
        renderedField,
        fieldIndex,
        groupIndex,
        group,
        groupProps,
        fieldState,
        error,
        renderError: renderFieldError
      })}
    </>
  )
}

export type CustomSchemaFormProps<
  A extends FieldValues,
  I extends FieldValues = A,
  TFieldValues extends FieldValues = I,
  TContext = unknown
> = {
  schema: Schema.Schema<A, I>
  form: SchemaFormReturn<A, TFieldValues, TContext>
  autoSave?: boolean | undefined
  autoSaveWait?: number | undefined
  resolver: SchemaFormResolver<A, TFieldValues, TContext>
  values?: Partial<A> | undefined
  // TODO: refactor to exit data type
  onSubmit: (values: A) => Promise<void> | void
  components?: Record<string, ComponentType<any>> | undefined
  groups?: Array<SchemaFormGroup>
  skipFirstGroup?: boolean | undefined
  render?: (params: RenderFormFields) => ReactNode
}

const isFormRenderer = (renderer: ((params: RenderFormFields) => ReactNode) | FormRenderer): renderer is FormRenderer =>
  typeof renderer === "object" && renderer !== null && "render" in renderer

export function makeSchemaForm(
  render: (params: RenderFormFields) => ReactNode
): <A extends FieldValues, I extends FieldValues = A, TFieldValues extends FieldValues = I, TContext = unknown>(
  props: Simplify<CustomSchemaFormProps<A, I, TFieldValues, TContext>>
) => React.ReactNode

export function makeSchemaForm(
  renderer: FormRenderer
): <A extends FieldValues, I extends FieldValues = A, TFieldValues extends FieldValues = I, TContext = unknown>(
  props: Simplify<CustomSchemaFormProps<A, I, TFieldValues, TContext>>
) => React.ReactNode

export function makeSchemaForm(renderer: ((params: RenderFormFields) => ReactNode) | FormRenderer) {
  const render = isFormRenderer(renderer) ? renderer.render : renderer

  function CustomSchemaForm<
    A extends FieldValues,
    I extends FieldValues = A,
    TFieldValues extends FieldValues = I,
    TContext = unknown
  >({ schema, components, groups = [], ...rest }: Simplify<CustomSchemaFormProps<A, I, TFieldValues, TContext>>) {
    const { control, register } = rest.form

    const { schemaJSON, definition } = useMemo(() => FG.toJson(schema, control._defaultValues as any), [schema])

    const fields = useMemo(
      () =>
        render({
          definition,
          schemaJSON,
          groups,
          register,
          components,
          control: control as Control<any>,
          skipFirstGroup: rest.skipFirstGroup
        }),
      [definition, schemaJSON, groups, register, components, control, rest.skipFirstGroup]
    )

    return (
      <SchemaForm schema={schema} {...rest}>
        {fields}
      </SchemaForm>
    )
  }
  return CustomSchemaForm
}

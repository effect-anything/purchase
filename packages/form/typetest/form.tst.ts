import type { ComponentType, ReactNode } from "react"
import type { Resolver, UseFormReturn } from "react-hook-form"

import type { Atom, Result } from "@effect-x/atom-react"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import { describe, expect, test } from "tstyche"

import type {
  CustomSchemaFormProps,
  FormRendererArrayProps,
  FormRendererErrorProps,
  FormRendererFieldState,
  FormRendererWidgetProps,
  RenderFormFields,
  SchemaFormProps,
  SchemaFormResolver as ExportedSchemaFormResolver,
  SchemaFormReturn as ExportedSchemaFormReturn
} from "../src/schema-form.tsx"
import type {
  ReactiveServiceBinding,
  ReadOrWriteAtomFn,
  ReadOrWriteAtomParams,
  ReadOrWriteEffect,
  ReadOrWritePromise,
  SchemaForm as HookSchemaForm,
  StreamingSchemaForm
} from "../src/use-schema-form.ts"
import type { RenderChangesFormActions } from "../src/wrapper.tsx"

import { formSubmitError } from "../src/errors.ts"
import { effectTsResolver, standardSchemaResolver } from "../src/resolver.ts"
import { createFormRenderer, makeSchemaForm } from "../src/schema-form.tsx"
import { useSchemaForm, useStreamingSchemaForm } from "../src/use-schema-form.ts"

const schema = Schema.Struct({
  age: Schema.NumberFromString,
  name: Schema.String
})

const strictDateSchema = Schema.Struct({
  startsOn: Schema.DateFromSelf,
  title: Schema.String
})

const nestedOptionalSchema = Schema.Struct({
  contacts: Schema.Array(
    Schema.Struct({
      channel: Schema.Literal("email", "sms").pipe(Schema.optionalWith({ exact: true, default: () => "email" })),
      label: Schema.String
    })
  ).pipe(Schema.optionalWith({ exact: true, default: () => [] }))
})

const accountSchema = Schema.Struct({
  profile: Schema.Struct({
    birthday: Schema.DateFromSelf,
    displayName: Schema.String
  }),
  members: Schema.Array(
    Schema.Struct({
      active: Schema.Boolean.pipe(Schema.optionalWith({ exact: true, default: () => true })),
      email: Schema.String,
      role: Schema.Literal("owner", "editor", "viewer").pipe(
        Schema.optionalWith({ exact: true, default: () => "viewer" })
      )
    })
  ).pipe(Schema.optionalWith({ exact: true, default: () => [] }))
})

type Values = Schema.Schema.Type<typeof schema>
type Input = Schema.Schema.Encoded<typeof schema>
type StrictDateValues = Schema.Schema.Type<typeof strictDateSchema>
type StrictDateInput = Schema.Schema.Encoded<typeof strictDateSchema>
type StrictDateFormValues = {
  startsOn: string
  title: string
}
type NestedOptionalValues = Schema.Schema.Type<typeof nestedOptionalSchema>
type NestedOptionalInput = Schema.Schema.Encoded<typeof nestedOptionalSchema>
type AccountValues = Schema.Schema.Type<typeof accountSchema>
type AccountInput = Schema.Schema.Encoded<typeof accountSchema>
type AccountFormValues = {
  members: Array<{
    active: boolean
    email: string
    role: "owner" | "editor" | "viewer"
  }>
  profile: {
    birthday: string
    displayName: string
  }
}
type FormContext = {
  locale: string
}

declare const form: UseFormReturn<Input, unknown, Values>
declare const resolver: Resolver<Input, unknown, Values>
declare const rawResolver: Resolver<Input, unknown, Input>
declare const strictDateForm: UseFormReturn<StrictDateFormValues, FormContext, StrictDateValues>
declare const strictDateResolver: Resolver<StrictDateFormValues, FormContext, StrictDateValues>
declare const accountForm: UseFormReturn<AccountFormValues, FormContext, AccountValues>
declare const accountResolver: Resolver<AccountFormValues, FormContext, AccountValues>
declare const strictDateBinding: ReactiveServiceBinding<StrictDateValues, StrictDateInput, Error>
declare const atomReadOrWrite: ReadOrWriteAtomFn<Values, Input, Error>
declare const reactiveBinding: ReactiveServiceBinding<Values, Input, Error>

const invalidStrictDateLoader = async (
  _input: ReadOrWriteAtomParams<StrictDateValues>,
  _schema: Schema.Schema<StrictDateValues, StrictDateInput>
) => ({
  startsOn: new Date("2026-03-30T00:00:00.000Z").toISOString().slice(0, 10),
  title: "Wrong layer"
})

const renderFields: (params: RenderFormFields) => ReactNode = ({
  definition,
  schemaJSON,
  groups,
  register,
  components,
  control,
  skipFirstGroup
}) => {
  void definition
  void schemaJSON
  void groups
  void register
  void components
  void control
  void skipFirstGroup
  return null
}

const renderer = createFormRenderer({
  widgets: {
    input: ({ field }: FormRendererWidgetProps) => {
      void field
      return null
    }
  }
})

describe("@effect-x/form type coverage", () => {
  test("effectTsResolver returns parsed output types by default", () => {
    const effectResolver = effectTsResolver(schema)

    expect<typeof effectResolver>().type.toBe<Resolver<Input, unknown, Values>>()
  })

  test("effectTsResolver keeps raw input when requested", () => {
    const rawEffectResolver = effectTsResolver(schema, undefined, { raw: true })

    expect<typeof rawEffectResolver>().type.toBe<Resolver<Input, unknown, Input>>()
  })

  test("standardSchemaResolver infers schema output types", () => {
    const standardResolver = standardSchemaResolver(Schema.standardSchemaV1(schema))

    expect<typeof standardResolver>().type.toBe<Resolver<Input, unknown, Values>>()
  })

  test("standardSchemaResolver keeps raw input values when requested", () => {
    const rawStandardResolver = standardSchemaResolver(Schema.standardSchemaV1(schema), { raw: true })

    expect<typeof rawStandardResolver>().type.toBe<Resolver<Input, unknown, Input>>()
    expect<typeof rawStandardResolver>().type.not.toBeAssignableTo<Resolver<Input, unknown, Values>>()
  })

  test("standardSchemaResolver can infer nested optional encoded inputs", () => {
    const nestedResolver = standardSchemaResolver(Schema.standardSchemaV1(nestedOptionalSchema))

    expect<typeof nestedResolver>().type.toBe<Resolver<NestedOptionalInput, unknown, NestedOptionalValues>>()
  })

  test("standardSchemaResolver can be overridden with browser-friendly field values", () => {
    const standardSchema = Schema.standardSchemaV1(strictDateSchema)
    const browserResolver = standardSchemaResolver<StrictDateFormValues, typeof standardSchema>(standardSchema)

    expect<typeof browserResolver>().type.toBe<Resolver<StrictDateFormValues, unknown, StrictDateValues>>()
  })

  test("standardSchemaResolver supports raw mode with custom browser-friendly field values", () => {
    const standardSchema = Schema.standardSchemaV1(strictDateSchema)
    const rawBrowserResolver = standardSchemaResolver<StrictDateFormValues, typeof standardSchema, unknown, true>(
      standardSchema,
      {
        raw: true
      }
    )

    expect<typeof rawBrowserResolver>().type.toBe<Resolver<StrictDateFormValues, unknown, StrictDateFormValues>>()
    expect<typeof rawBrowserResolver>().type.not.toBeAssignableTo<
      Resolver<StrictDateFormValues, unknown, StrictDateValues>
    >()
  })

  test("standardSchemaResolver preserves complex nested encoded inputs", () => {
    const inferredAccountResolver = standardSchemaResolver(Schema.standardSchemaV1(accountSchema))

    expect<typeof inferredAccountResolver>().type.toBe<Resolver<AccountInput, unknown, AccountValues>>()
  })

  test("ReadOrWriteEffect receives optional changed-field payloads", () => {
    const readOrWrite: ReadOrWriteEffect<Values, Input> = (input: ReadOrWriteAtomParams<Values>, _schema) => {
      if (Option.isSome(input)) {
        return Effect.succeed(input.value.values)
      }

      return Effect.succeed({
        age: 1,
        name: "Initial"
      })
    }

    expect<typeof readOrWrite>().type.toBe<
      (
        input: ReadOrWriteAtomParams<Values>,
        schema: Schema.Schema<Values, Input>
      ) => Effect.Effect<Values, never, never>
    >()
  })

  test("formSubmitError preserves root and field issue shapes", () => {
    const error = formSubmitError({
      root: "Unable to save",
      fields: {
        name: {
          message: "Already taken",
          shouldFocus: true
        }
      }
    })

    expect<typeof error.issues>().type.toBeAssignableTo<{
      root?: string | { message: string; shouldFocus?: boolean | undefined; type?: string | undefined } | undefined
      fields?:
        | Record<string, string | { message: string; shouldFocus?: boolean | undefined; type?: string | undefined }>
        | undefined
    }>()
  })
})

describe("schema-form prop typing", () => {
  test("SchemaFormProps keeps schema, resolver, form, and submit payloads aligned", () => {
    type Props = SchemaFormProps<Values, Input>

    expect<Props>().type.toBe<{
      schema: Schema.Schema<Values, Input>
      form: UseFormReturn<Input, unknown, Values>
      autoSave?: boolean | undefined
      autoSaveWait?: number | undefined
      resolver: Resolver<Input, unknown, Values>
      values?: Partial<Values> | undefined
      renderActions?: RenderChangesFormActions | undefined
      onSubmit: (values: Values) => Promise<void> | void
      children?: ReactNode
    }>()
  })

  test("CustomSchemaFormProps preserves custom render metadata and value typing", () => {
    type Props = CustomSchemaFormProps<Values, Input>

    expect<Props>().type.toBeAssignableTo<{
      schema: Schema.Schema<Values, Input>
      form: UseFormReturn<Input, unknown, Values>
      resolver: Resolver<Input, unknown, Values>
      onSubmit: (values: Values) => Promise<void> | void
      components?: Record<string, ComponentType<any>> | undefined
      groups?:
        | Array<{
            title?: ReactNode
            description?: ReactNode
            separator?: boolean | undefined
            prefix?: ReactNode
            suffix?: ReactNode
          }>
        | undefined
      skipFirstGroup?: boolean | undefined
      render?: ((params: RenderFormFields) => ReactNode) | undefined
    }>()
  })

  test("SchemaFormProps supports custom field values and context types", () => {
    type Props = SchemaFormProps<StrictDateValues, StrictDateInput, StrictDateFormValues, FormContext>

    expect<Props>().type.toBe<{
      schema: Schema.Schema<StrictDateValues, StrictDateInput>
      form: UseFormReturn<StrictDateFormValues, FormContext, StrictDateValues>
      autoSave?: boolean | undefined
      autoSaveWait?: number | undefined
      resolver: Resolver<StrictDateFormValues, FormContext, StrictDateValues>
      values?: Partial<StrictDateValues> | undefined
      renderActions?: RenderChangesFormActions | undefined
      onSubmit: (values: StrictDateValues) => Promise<void> | void
      children?: ReactNode
    }>()
  })

  test("exported SchemaFormResolver and SchemaFormReturn aliases stay aligned with RHF transformed values", () => {
    expect<ExportedSchemaFormResolver<StrictDateValues, StrictDateFormValues, FormContext>>().type.toBe<
      Resolver<StrictDateFormValues, FormContext, StrictDateValues>
    >()

    expect<ExportedSchemaFormReturn<StrictDateValues, StrictDateFormValues, FormContext>>().type.toBe<
      UseFormReturn<StrictDateFormValues, FormContext, StrictDateValues>
    >()
  })

  test("makeSchemaForm render callback receives the generated schema metadata", () => {
    const CustomForm = makeSchemaForm(renderFields)

    expect<typeof renderFields>().type.toBeAssignableTo<(params: RenderFormFields) => ReactNode>()
    expect(CustomForm).type.toBeCallableWith({
      form,
      onSubmit: (_values: Values) => undefined,
      resolver,
      schema
    })
    expect(CustomForm).type.not.toBeCallableWith({
      form,
      onSubmit: (_values: Values) => undefined,
      resolver: rawResolver,
      schema
    })
  })

  test("makeSchemaForm accepts renderer presets created with createFormRenderer", () => {
    const CustomForm = makeSchemaForm(renderer)

    expect(CustomForm).type.toBeCallableWith({
      form,
      onSubmit: (_values: Values) => undefined,
      resolver,
      schema
    })
  })

  test("makeSchemaForm accepts custom field values when schema output differs from UI values", () => {
    const CustomForm = makeSchemaForm(renderFields)

    expect(CustomForm).type.toBeCallableWith({
      form: strictDateForm,
      onSubmit: (_values: StrictDateValues) => undefined,
      resolver: strictDateResolver,
      schema: strictDateSchema
    })
  })

  test("makeSchemaForm accepts nested browser-friendly field values for transformed schemas", () => {
    const CustomForm = makeSchemaForm(renderFields)

    expect(CustomForm).type.toBeCallableWith({
      form: accountForm,
      onSubmit: (_values: AccountValues) => undefined,
      resolver: accountResolver,
      schema: accountSchema
    })
  })

  test("renderer widget props expose field state and default error rendering hooks", () => {
    expect<FormRendererWidgetProps>().type.toBeAssignableTo<{
      fieldState: FormRendererFieldState
      error?: string | undefined
      renderError: () => ReactNode
    }>()

    expect<FormRendererErrorProps>().type.toBeAssignableTo<{
      fieldState: FormRendererFieldState
      error?: string | undefined
      fieldIndex: number
      groupIndex: number
    }>()

    expect<FormRendererArrayProps>().type.toBeAssignableTo<{
      rows: Array<{
        id: string
        index: number
        canRemove: boolean
        remove: () => void
      }>
      append: () => void
      canAdd: boolean
      rowCount: number
      error?: string | undefined
      renderError: () => ReactNode
    }>()
  })
})

describe("useSchemaForm overload inference", () => {
  test("promise overload returns a schema-aware form contract", () => {
    const readOrWrite: ReadOrWritePromise<Values, Input> = async (input, _schema) => {
      if (Option.isSome(input)) {
        return input.value.values
      }

      return {
        age: 1,
        name: "Initial"
      }
    }

    const createForm = () => useSchemaForm(schema, readOrWrite)

    expect<typeof createForm>().type.toBe<() => HookSchemaForm<Values, Input>>()
  })

  test("effect overload returns the same schema-aware form contract", () => {
    const readOrWrite: ReadOrWriteEffect<Values, Input, Error> = (input, _schema) => {
      if (Option.isSome(input)) {
        return Effect.succeed(input.value.values)
      }

      return Effect.succeed({
        age: 1,
        name: "Initial"
      })
    }

    const createForm = () => useSchemaForm(schema, readOrWrite)

    expect<typeof createForm>().type.toBe<() => HookSchemaForm<Values, Input>>()
  })

  test("atom overload accepts atom-backed read/write definitions", () => {
    const createForm = () => useSchemaForm(schema, atomReadOrWrite)

    expect<typeof createForm>().type.toBe<() => HookSchemaForm<Values, Input>>()
  })

  test("useSchemaForm preserves schemas whose encoded values differ from submit values", () => {
    const readOrWrite: ReadOrWritePromise<StrictDateValues, StrictDateInput> = async (input, _schema) => {
      if (Option.isSome(input)) {
        return input.value.values
      }

      return {
        startsOn: new Date("2026-03-30T00:00:00.000Z"),
        title: "Launch day"
      }
    }

    const createForm = () => useSchemaForm(strictDateSchema, readOrWrite)

    expect<typeof createForm>().type.toBe<() => HookSchemaForm<StrictDateValues, StrictDateInput>>()
  })

  test("useSchemaForm preserves complex nested encoded values for transformed schemas", () => {
    const readOrWrite: ReadOrWritePromise<AccountValues, AccountInput> = async (input, _schema) => {
      if (Option.isSome(input)) {
        return input.value.values
      }

      return {
        members: [],
        profile: {
          birthday: new Date("2026-03-30T00:00:00.000Z"),
          displayName: "Ada"
        }
      }
    }

    const createForm = () => useSchemaForm(accountSchema, readOrWrite)

    expect<typeof createForm>().type.toBe<() => HookSchemaForm<AccountValues, AccountInput>>()
  })

  test("useSchemaForm rejects promise loaders that return encoded input instead of parsed values", () => {
    expect<typeof useSchemaForm>().type.not.toBeCallableWith(strictDateSchema, invalidStrictDateLoader)
  })

  test("ReadOrWriteAtomFn carries the expected command and success channels", () => {
    expect<typeof atomReadOrWrite>().type.toBe<Atom.AtomResultFn<ReadOrWriteAtomParams<Values>, Values, Error>>()
  })

  test("ReadOrWriteAtomFn preserves AtomResultFn control inputs from atom.ts", () => {
    expect<typeof atomReadOrWrite>().type.toBeAssignableTo<
      Atom.Writable<
        Result.Result<Values, Error>,
        ReadOrWriteAtomParams<Values> | typeof Atom.Reset | typeof Atom.Interrupt
      >
    >()
  })
})

describe("streaming schema form inference", () => {
  test("ReactiveServiceBinding keeps read, write, and stream value types in sync", () => {
    expect<typeof reactiveBinding>().type.toBe<{
      read: Atom.Atom<Result.Result<Values, Error>>
      write: Atom.Writable<any, any>
      stream: (predicate: (value: Values) => boolean) => Atom.Atom<void>
    }>()
  })

  test("useStreamingSchemaForm returns the streaming form contract", () => {
    const createForm = () => useStreamingSchemaForm(schema, reactiveBinding)

    expect<typeof createForm>().type.toBe<() => StreamingSchemaForm<Values, Input>>()
  })

  test("useStreamingSchemaForm preserves encoded field values for transformed schemas", () => {
    const createForm = () => useStreamingSchemaForm(strictDateSchema, strictDateBinding)

    expect<typeof createForm>().type.toBe<() => StreamingSchemaForm<StrictDateValues, StrictDateInput>>()
  })
})

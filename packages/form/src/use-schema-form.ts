import type { Simplify } from "effect/Types"

import { Atom, defaultRegistry, type Result, useAtomMount, useAtomSet, useAtomSuspense } from "@effect-x/atom-react"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
import * as Equal from "effect/Equal"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import * as React from "react"
import { type DefaultValues, type FieldValues, type Resolver, useForm, type UseFormReturn } from "react-hook-form"

import { standardSchemaResolver } from "./resolver/standard-schema.ts"
import { deepEqual } from "./utils.ts"

/**
 * Represents form submission data with values and changed fields
 */
export interface FormSubmitData<A> {
  values: A
  changed: Partial<A>
}

export type ReadOrWriteAtomParams<A> = Option.Option<Simplify<FormSubmitData<A>>>

export type ReadOrWriteAtomFn<A, _I = A, E = never> = Atom.AtomResultFn<ReadOrWriteAtomParams<A>, A, E>

export type ReadOrWriteEffect<A, I = A, E = never, R = never> = (
  input: ReadOrWriteAtomParams<A>,
  schema: Schema.Schema<A, I>
) => Effect.Effect<A, E, R>

export type ReadOrWritePromise<A, I = A> = (input: ReadOrWriteAtomParams<A>, schema: Schema.Schema<A, I>) => Promise<A>

export type ReadOrWrite<A, I = A, E = never, R = never> =
  | ReadOrWriteEffect<A, I, E, R>
  | ReadOrWriteAtomFn<A, I, E>
  | ReadOrWritePromise<A, I>

type SchemaFormFieldValues<I extends FieldValues> = I

type SchemaFormResolver<A extends FieldValues, I extends FieldValues, TContext = unknown> = Resolver<
  SchemaFormFieldValues<I>,
  TContext,
  A
>

type SchemaFormReturn<A extends FieldValues, I extends FieldValues, TContext = unknown> = UseFormReturn<
  SchemaFormFieldValues<I>,
  TContext,
  A
>

const createSchemaFormResolver = <A extends FieldValues, I extends FieldValues>(
  schema: Schema.Schema<A, I>
): SchemaFormResolver<A, I> => {
  const standardSchema = Schema.standardSchemaV1(schema)

  return standardSchemaResolver<I, typeof standardSchema>(standardSchema) as unknown as SchemaFormResolver<A, I>
}

// Create a writable Atom for form data with schema validation
const makeWriteableAtom: {
  /**
   * effect writeable
   */
  <A, I, E = never>(
    schema: Schema.Schema<A, I>,
    readOrWriteFn: ReadOrWriteEffect<A, I, E>
  ): Atom.Writable<Result.Result<A, E>, typeof Atom.Reset | ReadOrWriteAtomParams<A>>
  /**
   * rx writable
   */
  <A, I, E = never>(
    schema: Schema.Schema<A, I>,
    rx: ReadOrWriteAtomFn<A, I, E>
  ): Atom.Writable<Result.Result<A, E>, typeof Atom.Reset | ReadOrWriteAtomParams<A>>
  /**
   * promise writable
   */
  <A, I, E = never>(
    schema: Schema.Schema<A, I>,
    readOrWriteFn: ReadOrWritePromise<A, I>
  ): Atom.Writable<Result.Result<A, E>, typeof Atom.Reset | ReadOrWriteAtomParams<A>>
} = <A, I, E = never>(
  schema: Schema.Schema<A, I>,
  readOrWriteFn: any
): Atom.Writable<Result.Result<A, E>, typeof Atom.Reset | ReadOrWriteAtomParams<A>> => {
  // Convert the provided function to an Atom function
  const atomSource = Atom.isWritable(readOrWriteFn)
    ? (readOrWriteFn as ReadOrWriteAtomFn<A, I, E>)
    : Atom.fn((input: ReadOrWriteAtomParams<A>) => {
        const fn = (readOrWriteFn as ReadOrWritePromise<A, I> | ReadOrWriteEffect<A, I, E>)(input, schema)

        if (Effect.isEffect(fn)) {
          return fn
        }

        return Effect.promise(() => fn)
      })

  const writeableAtom = pipe(
    atomSource,
    Atom.map((result) => result)
  )

  // Register each hook instance with its own initial state so multiple forms
  // that share the same schema object do not share cached results.
  defaultRegistry.set(writeableAtom, Option.none())

  return writeableAtom
}

export interface SchemaForm<A extends FieldValues, I extends FieldValues = A, TContext = unknown> {
  schema: Schema.Schema<A, I, never>
  form: SchemaFormReturn<A, I, TContext>
  resolver: SchemaFormResolver<A, I, TContext>
  values: A
  onSubmit: (values: A) => Promise<void> | void
}

/**
 * Basic hook that creates form props with schema validation
 *
 * @param schema - The schema to validate against
 * @param readOrWrite - Function to read or write data
 * @returns Form props with schema, values, and onSubmit handler
 */
export const useSchemaForm: {
  /**
   * form schema (effect)
   */
  <A extends FieldValues, I extends FieldValues = A, E = never>(
    schema: Schema.Schema<A, I>,
    readOrWrite: ReadOrWriteEffect<A, I, E>
  ): Simplify<SchemaForm<A, I>>
  /**
   * form schema (rx)
   */
  <A extends FieldValues, I extends FieldValues = A, E = never>(
    schema: Schema.Schema<A, I>,
    readOrWrite: ReadOrWriteAtomFn<A, I, E>
  ): Simplify<SchemaForm<A, I>>
  /**
   * form schema (promise)
   */
  <A extends FieldValues, I extends FieldValues = A, _E = never>(
    schema: Schema.Schema<A, I>,
    readOrWrite: ReadOrWritePromise<A, I>
  ): Simplify<SchemaForm<A, I>>
} = <A extends FieldValues, I extends FieldValues = A, _E = never>(
  schema: Schema.Schema<A, I>,
  readOrWrite: any
): Simplify<SchemaForm<A, I>> => {
  const writeableAtom = React.useMemo(() => makeWriteableAtom(schema, readOrWrite), [schema, readOrWrite])
  const { value: currentValues } = useAtomSuspense(writeableAtom)
  const setValues = useAtomSet(writeableAtom)
  const valueRef = React.useRef(currentValues)
  const encodeValues = React.useMemo(() => Schema.encodeEither(schema), [schema])
  const formValues = React.useMemo(
    () => Either.getOrElse(encodeValues(currentValues), () => currentValues as unknown as I),
    [currentValues, encodeValues]
  )

  const resolver = React.useMemo(() => createSchemaFormResolver(schema), [schema])

  const form = useForm<SchemaFormFieldValues<I>, unknown, A>({
    resolver,
    defaultValues: formValues as DefaultValues<I>,
    values: formValues,
    shouldUseNativeValidation: false
  })

  React.useEffect(() => {
    valueRef.current = currentValues
  }, [currentValues])

  return React.useMemo(
    () => ({
      schema,
      form,
      resolver,
      values: currentValues,
      onSubmit: (nextValues: A) => {
        const prevValues = valueRef.current as Record<string, any>
        const newValuesRecord = nextValues as Record<string, any>

        setValues(() => {
          const changed = {} as Record<string, any>

          // Detect changed fields by comparing old and new values
          Object.keys(newValuesRecord).forEach((key) => {
            if (!Equal.equals(prevValues[key], newValuesRecord[key])) {
              changed[key] = newValuesRecord[key]
            }
          })

          return Option.some({
            values: nextValues,
            changed: changed as Partial<A>
          })
        })

        // Update reference to current values
        valueRef.current = nextValues
      }
    }),
    [schema, form, resolver, currentValues, setValues]
  )
}

// ----- Streaming Schema Form -----

/**
 * Interface for extended form props with react-hook-form integration
 */
export interface StreamingSchemaForm<A extends FieldValues, I extends FieldValues = A, TContext = unknown> {
  schema: Schema.Schema<A, I, never>
  form: SchemaFormReturn<A, I, TContext>
  resolver: SchemaFormResolver<A, I, TContext>
  values: A
  onSubmit: (values: A) => Promise<void> | void
}

/**
 * Interface for read/write operations with streaming
 */
export interface ReactiveServiceBinding<A, _I = A, E = never> {
  /** Reactive read operation that returns the current value */
  read: Atom.Atom<Result.Result<A, E>>
  /** Reactive write operation that updates the value */
  write: Atom.Writable<any, any>
  /** Creates a stream that emits when values change based on a predicate */
  stream: (predicate: (value: A) => boolean) => Atom.Atom<void>
}

/**
 * Enhanced hook for schema form with react-hook-form integration and streaming updates
 * Connects a service-provided reactive binding to a form with streaming updates
 *
 * @param schema - The schema to validate against
 * @param serviceBinding - Object with read, write, and stream functions from a service
 * @returns Extended form props with react-hook-form integration
 */
export function useStreamingSchemaForm<A extends FieldValues, I extends FieldValues = A, E = never>(
  schema: Schema.Schema<A, I>,
  serviceBinding: ReactiveServiceBinding<A, I, E>
): Simplify<StreamingSchemaForm<A, I>> {
  const { value: currentValues } = useAtomSuspense(serviceBinding.read)
  const valueRef = React.useRef(currentValues)
  const setValues = useAtomSet(serviceBinding.write)
  const encodeValues = React.useMemo(() => Schema.encodeEither(schema), [schema])
  const formValues = React.useMemo(
    () => Either.getOrElse(encodeValues(currentValues), () => currentValues as unknown as I),
    [currentValues, encodeValues]
  )

  const resolver = React.useMemo(() => createSchemaFormResolver(schema), [schema])

  const form = useForm<SchemaFormFieldValues<I>, unknown, A>({
    resolver,
    defaultValues: formValues as DefaultValues<I>,
    values: formValues,
    shouldUseNativeValidation: false
  })

  React.useEffect(() => {
    valueRef.current = currentValues
  }, [currentValues])

  const changesStream = React.useMemo(
    () =>
      serviceBinding.stream((results) => {
        if (deepEqual(valueRef.current, results)) {
          return false
        }

        valueRef.current = results
        return true
      }),
    [serviceBinding.stream]
  )

  // Mount the changes stream
  useAtomMount(changesStream)

  return React.useMemo(
    () => ({
      schema,
      form,
      resolver,
      values: currentValues,
      onSubmit: (nextValues: A) => {
        const prevValuesRecord = valueRef.current as Record<string, any>
        const newValuesRecord = nextValues as Record<string, any>

        // Skip if no changes
        if (deepEqual(prevValuesRecord, newValuesRecord)) {
          return
        }

        setValues(() => {
          const changed = {} as Record<string, any>

          // Detect changed fields by comparing old and new values
          Object.keys(newValuesRecord).forEach((key) => {
            if (!Equal.equals(prevValuesRecord[key], newValuesRecord[key])) {
              changed[key] = newValuesRecord[key]
            }
          })

          return {
            values: nextValues,
            changed: changed as Partial<A>
          }
        })

        // Update reference to current values
        valueRef.current = nextValues
      }
    }),
    [schema, form, resolver, currentValues, setValues]
  )
}

import type { StandardSchemaV1 } from "@standard-schema/spec"
import type { FieldError, FieldValues, Resolver } from "react-hook-form"

import { getDotPath } from "@standard-schema/utils"

import { toNestErrors, validateFieldsNatively } from "../utils.ts"

export function parseIssues(issues: ReadonlyArray<StandardSchemaV1.Issue>, validateAllFieldCriteria: boolean) {
  const errors: Record<string, FieldError> = {}

  for (let i = 0; i < issues.length; i++) {
    const error = issues[i]
    const path = getDotPath(error)

    if (path) {
      if (!errors[path]) {
        errors[path] = { message: error.message, type: (error as any)._tag || "" }
      }

      if (validateAllFieldCriteria) {
        const types = errors[path].types || {}

        errors[path].types = {
          ...types,
          [Object.keys(types).length]: error.message
        }
      }
    }
  }

  return errors
}

type InferredStandardSchemaFieldValues<TSchema extends StandardSchemaV1<any, any>> =
  StandardSchemaV1.InferInput<TSchema> extends FieldValues ? StandardSchemaV1.InferInput<TSchema> : FieldValues

type ResolvedStandardSchemaFieldValues<
  TFieldValues extends FieldValues | never,
  TSchema extends StandardSchemaV1<any, any>
> = [TFieldValues] extends [never] ? InferredStandardSchemaFieldValues<TSchema> : Extract<TFieldValues, FieldValues>

type StandardSchemaResolverOutput<TFieldValues extends FieldValues, TOutput, TRaw extends boolean> = TRaw extends true
  ? TFieldValues
  : TOutput

export function standardSchemaResolver<
  TSchema extends StandardSchemaV1<any, any>,
  TContext = unknown,
  TRaw extends boolean = false
>(
  schema: TSchema,
  resolverOptions?: {
    raw?: TRaw
  }
): Resolver<
  InferredStandardSchemaFieldValues<TSchema>,
  TContext,
  StandardSchemaResolverOutput<InferredStandardSchemaFieldValues<TSchema>, StandardSchemaV1.InferOutput<TSchema>, TRaw>
>

export function standardSchemaResolver<
  TFieldValues extends FieldValues,
  TSchema extends StandardSchemaV1<any, any>,
  TContext = unknown,
  TRaw extends boolean = false
>(
  schema: TSchema,
  resolverOptions?: {
    raw?: TRaw
  }
): Resolver<
  TFieldValues,
  TContext,
  StandardSchemaResolverOutput<TFieldValues, StandardSchemaV1.InferOutput<TSchema>, TRaw>
>

/**
 * Creates a resolver for react-hook-form that validates data using a Standard Schema.
 *
 * @param {Schema} schema - The Standard Schema to validate against
 * @param {Object} resolverOptions - Options for the resolver
 * @param {boolean} [resolverOptions.raw=false] - Whether to return raw input values instead of parsed values
 * @returns {Resolver} A resolver function compatible with react-hook-form
 *
 * @example
 * ```ts
 * const schema = z.object({
 *   name: z.string().min(2),
 *   age: z.number().min(18)
 * });
 *
 * useForm({
 *   resolver: standardSchemaResolver(schema)
 * });
 * ```
 */
export function standardSchemaResolver<
  TFieldValues extends FieldValues | never,
  TSchema extends StandardSchemaV1<any, any>,
  TContext = unknown,
  TRaw extends boolean = false
>(
  schema: TSchema,
  resolverOptions: {
    raw?: TRaw
  } = {}
): Resolver<
  ResolvedStandardSchemaFieldValues<TFieldValues, TSchema>,
  TContext,
  StandardSchemaResolverOutput<
    ResolvedStandardSchemaFieldValues<TFieldValues, TSchema>,
    StandardSchemaV1.InferOutput<TSchema>,
    TRaw
  >
> {
  return async (values, _, options) => {
    let result = schema["~standard"].validate(values)
    if (result instanceof Promise) {
      result = await result
    }

    if (result.issues) {
      const errors = parseIssues(result.issues, !options.shouldUseNativeValidation && options.criteriaMode === "all")

      return {
        values: {},
        errors: toNestErrors(errors, options)
      }
    }

    if (options.shouldUseNativeValidation) {
      validateFieldsNatively({}, options)
    }

    return {
      values: (resolverOptions.raw ? Object.assign({}, values) : result.value) as StandardSchemaResolverOutput<
        ResolvedStandardSchemaFieldValues<TFieldValues, TSchema>,
        StandardSchemaV1.InferOutput<TSchema>,
        TRaw
      >,
      errors: {}
    }
  }
}

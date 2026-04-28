import {
  type Field,
  type FieldError,
  type FieldErrors,
  type FieldValues,
  get,
  type InternalFieldName,
  type Ref,
  type ResolverOptions,
  set
} from "react-hook-form"

export const toNestErrors = <TFieldValues extends FieldValues>(
  errors: FieldErrors,
  options: ResolverOptions<TFieldValues>
): FieldErrors<TFieldValues> => {
  if (options.shouldUseNativeValidation) {
    validateFieldsNatively(errors, options)
  }

  const fieldErrors = {} as FieldErrors<TFieldValues>
  for (const path in errors) {
    const field = get(options.fields, path) as Field["_f"] | undefined
    const error = Object.assign(errors[path] || {}, {
      ref: field?.ref
    })

    if (isNameInFieldArray(options.names || Object.keys(errors), path)) {
      const fieldArrayErrors = Object.assign({}, get(fieldErrors, path))

      set(fieldArrayErrors, "root", error)
      set(fieldErrors, path, fieldArrayErrors)
    } else {
      set(fieldErrors, path, error)
    }
  }

  return fieldErrors
}

const isNameInFieldArray = (names: Array<InternalFieldName>, name: InternalFieldName) =>
  names.some((n) => n.match(`^${name}\\.\\d+`))

const setCustomValidity = (ref: Ref, fieldPath: string, errors: FieldErrors) => {
  if (ref && "reportValidity" in ref) {
    const error = get(errors, fieldPath) as FieldError | undefined
    ref.setCustomValidity(error?.message || "")

    ref.reportValidity()
  }
}

// Native validation (web only)
export const validateFieldsNatively = <TFieldValues extends FieldValues>(
  errors: FieldErrors,
  options: ResolverOptions<TFieldValues>
): void => {
  for (const fieldPath in options.fields) {
    const field = options.fields[fieldPath]
    if (field?.ref && "reportValidity" in field.ref) {
      setCustomValidity(field.ref, fieldPath, errors)
    } else if (field?.refs) {
      field.refs.forEach((ref: HTMLInputElement) => setCustomValidity(ref, fieldPath, errors))
    }
  }
}

export function deepEqual(left: unknown, right: unknown): boolean {
  if (left === right || Object.is(left, right)) {
    return true
  }

  if (
    typeof left !== "object" ||
    typeof right !== "object" ||
    left === null ||
    right === null ||
    Object.getPrototypeOf(left) !== Object.getPrototypeOf(right)
  ) {
    return false
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return false
    }

    return left.every((item, index) => deepEqual(item, right[index]))
  }

  if (left instanceof Map && right instanceof Map) {
    if (left.size !== right.size) {
      return false
    }

    for (const [key, value] of left.entries()) {
      if (!right.has(key) || !deepEqual(value, right.get(key))) {
        return false
      }
    }

    return true
  }

  if (left instanceof Set && right instanceof Set) {
    if (left.size !== right.size) {
      return false
    }

    const remaining = [...right]

    for (const candidate of left) {
      const matchIndex = remaining.findIndex((item) => deepEqual(candidate, item))
      if (matchIndex === -1) {
        return false
      }

      remaining.splice(matchIndex, 1)
    }

    return true
  }

  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime()
  }

  if (left instanceof RegExp && right instanceof RegExp) {
    return left.toString() === right.toString()
  }

  const leftEntries = Object.entries(left)
  const rightEntries = Object.entries(right)

  if (leftEntries.length !== rightEntries.length) {
    return false
  }

  return leftEntries.every(([key, value]) => key in right && deepEqual(value, (right as Record<string, unknown>)[key]))
}

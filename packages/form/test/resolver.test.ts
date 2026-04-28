import type { StandardSchemaV1 } from "@standard-schema/spec"

import { describe, expect, it, vi } from "@effect/vitest"
import * as ParseResult from "effect/ParseResult"
import * as Schema from "effect/Schema"

import { applyFormSubmitIssues, formSubmitError, isFormSubmitError, makeFormErrors } from "../src/errors.ts"
import { effectTsResolver } from "../src/resolver/effect.ts"
import { parseIssues, standardSchemaResolver } from "../src/resolver/standard-schema.ts"
import { toNestErrors, validateFieldsNatively } from "../src/utils.ts"

const makeResolverOptions = (overrides: Record<string, unknown> = {}) =>
  ({
    criteriaMode: "firstError",
    fields: {},
    names: [],
    shouldUseNativeValidation: false,
    ...overrides
  }) as any

const makeSchema = <TInput, TOutput>(
  validate: StandardSchemaV1.Props<TInput, TOutput>["validate"]
): StandardSchemaV1<TInput, TOutput> => ({
  "~standard": {
    validate,
    vendor: "tests",
    version: 1
  }
})

describe("parseIssues", () => {
  it("collects all issues for the same field when criteriaMode is all", () => {
    const issues = [
      {
        _tag: "required",
        message: "Required",
        path: ["profile", "email"]
      },
      {
        _tag: "pattern",
        message: "Invalid email address",
        path: ["profile", "email"]
      },
      {
        _tag: "form",
        message: "Ignored root issue"
      }
    ] as const

    expect(parseIssues(issues as any, true)).toEqual({
      "profile.email": {
        message: "Required",
        type: "required",
        types: {
          0: "Required",
          1: "Invalid email address"
        }
      }
    })
  })
})

describe("standardSchemaResolver", () => {
  it("supports async schemas and preserves raw values when requested", async () => {
    const schema = makeSchema<Record<string, string>, { name: string }>(async (value) => ({
      value: {
        name: (value as Record<string, string>).name.trim()
      }
    }))

    const input = { name: "  Kee  " }

    await expect(standardSchemaResolver(schema)(input, {}, makeResolverOptions())).resolves.toEqual({
      errors: {},
      values: { name: "Kee" }
    })

    await expect(standardSchemaResolver(schema, { raw: true })(input, {}, makeResolverOptions())).resolves.toEqual({
      errors: {},
      values: input
    })
  })

  it("nests validation errors returned by the schema", async () => {
    const schema = makeSchema<Record<string, unknown>, Record<string, unknown>>(() => ({
      issues: [
        {
          _tag: "required",
          message: "Required",
          path: ["profile", "email"]
        },
        {
          _tag: "pattern",
          message: "Invalid email address",
          path: ["profile", "email"]
        }
      ]
    }))

    const result = await standardSchemaResolver(schema)(
      { profile: { email: "" } },
      {},
      makeResolverOptions({ criteriaMode: "all" })
    )

    expect(result.values).toEqual({})
    expect(result.errors).toMatchObject({
      profile: {
        email: {
          message: "Required",
          type: "required",
          types: {
            0: "Required",
            1: "Invalid email address"
          }
        }
      }
    })
  })
})

describe("effectTsResolver", () => {
  const schema = Schema.Struct({
    age: Schema.NumberFromString
  })

  it("supports sync mode and returns transformed values", () => {
    const resolver = effectTsResolver(schema, undefined, { mode: "sync" })

    expect(resolver({ age: "42" }, {}, makeResolverOptions())).toEqual({
      errors: {},
      values: { age: 42 }
    })
  })

  it("returns raw values when requested", () => {
    const resolver = effectTsResolver(schema, undefined, { mode: "sync", raw: true })

    expect(resolver({ age: "42" }, {}, makeResolverOptions())).toEqual({
      errors: {},
      values: { age: "42" }
    })
  })
})

describe("form error helpers", () => {
  it("nests field array root errors under root", () => {
    const result = toNestErrors(
      {
        items: {
          message: "Select at least one item",
          type: "required"
        }
      },
      makeResolverOptions({ names: ["items.0"] })
    )

    expect(result.items?.root).toMatchObject({
      message: "Select at least one item",
      type: "required"
    })
  })

  it("writes native validation messages for refs and ref arrays", () => {
    const singleRef = {
      reportValidity: vi.fn(),
      setCustomValidity: vi.fn()
    }
    const groupedRef = {
      reportValidity: vi.fn(),
      setCustomValidity: vi.fn()
    }

    validateFieldsNatively(
      {
        email: {
          message: "Email is required",
          type: "required"
        }
      },
      makeResolverOptions({
        fields: {
          email: { ref: singleRef },
          notifications: { refs: [groupedRef] }
        },
        shouldUseNativeValidation: true
      })
    )

    expect(singleRef.setCustomValidity).toHaveBeenCalledWith("Email is required")
    expect(singleRef.reportValidity).toHaveBeenCalledTimes(1)
    expect(groupedRef.setCustomValidity).toHaveBeenCalledWith("")
    expect(groupedRef.reportValidity).toHaveBeenCalledTimes(1)
  })

  it("formats ParseResult issues into nested react-hook-form errors", () => {
    const result = makeFormErrors({
      "profile.age": new ParseResult.Type(Schema.Number.ast, "oops", "Expected a number"),
      email: new ParseResult.Type(Schema.String.ast, 123, "Expected a string")
    })

    expect(result).toMatchObject({
      email: {
        message: "Expected a string"
      },
      profile: {
        age: {
          message: "Expected a number"
        }
      }
    })
  })

  it("normalizes submit errors for root and field-level server failures", () => {
    const setError = vi.fn()
    const error = formSubmitError({
      root: "Unable to save settings",
      fields: {
        email: {
          message: "Email already exists",
          shouldFocus: true
        }
      }
    })

    expect(isFormSubmitError(error)).toBe(true)

    applyFormSubmitIssues(
      {
        setError
      } as any,
      error.issues
    )

    expect(setError).toHaveBeenNthCalledWith(1, "root.server", {
      message: "Unable to save settings",
      type: "server"
    })
    expect(setError).toHaveBeenNthCalledWith(
      2,
      "email",
      {
        message: "Email already exists",
        type: "server"
      },
      {
        shouldFocus: true
      }
    )
  })
})

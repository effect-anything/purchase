import type { FieldValues, UseFormReturn } from "react-hook-form"

import * as Effect from "effect/Effect"
import * as ParseResult from "effect/ParseResult"

import { parseIssues } from "./resolver/standard-schema.ts"
import { toNestErrors } from "./utils.ts"

export const makeFormErrors = <T extends Record<string, ParseResult.ParseIssue>>(errors: T) => {
  const issues: Array<ParseResult.ParseIssue> = Object.entries(errors).map(([key, value]) => {
    return new ParseResult.Pointer(key, value.actual, value)
  })

  const arrayIssues = Effect.runSync(Effect.all(issues.map((_) => ParseResult.ArrayFormatter.formatIssue(_)))).flat(1)

  const fieldErrors = parseIssues(arrayIssues, false)

  return toNestErrors<{ [key in keyof T]: string }>(fieldErrors, {} as any)
}

export interface FormSubmitIssue {
  message: string
  shouldFocus?: boolean | undefined
  type?: string | undefined
}

export interface FormSubmitIssues {
  root?: string | FormSubmitIssue | undefined
  fields?: Record<string, string | FormSubmitIssue> | undefined
}

export class FormSubmitError extends Error {
  readonly issues: FormSubmitIssues

  constructor(issues: FormSubmitIssues, message = "Form submission failed") {
    super(message)
    this.name = "FormSubmitError"
    this.issues = issues
  }
}

const normalizeSubmitIssue = (
  issue: string | FormSubmitIssue
): {
  message: string
  type: string
  shouldFocus?: boolean | undefined
} =>
  typeof issue === "string"
    ? {
        message: issue,
        type: "server"
      }
    : {
        message: issue.message,
        shouldFocus: issue.shouldFocus,
        type: issue.type ?? "server"
      }

export const formSubmitError = (issues: FormSubmitIssues) => new FormSubmitError(issues)

export const isFormSubmitError = (error: unknown): error is FormSubmitError => error instanceof FormSubmitError

export const applyFormSubmitIssues = <TFieldValues extends FieldValues>(
  form: Pick<UseFormReturn<TFieldValues>, "setError">,
  issues: FormSubmitIssues
) => {
  if (issues.root) {
    const rootIssue = normalizeSubmitIssue(issues.root)
    form.setError("root.server" as any, {
      message: rootIssue.message,
      type: rootIssue.type
    })
  }

  if (!issues.fields) {
    return
  }

  for (const [path, issue] of Object.entries(issues.fields)) {
    const normalizedIssue = normalizeSubmitIssue(issue)
    form.setError(
      path as any,
      {
        message: normalizedIssue.message,
        type: normalizedIssue.type
      },
      normalizedIssue.shouldFocus === undefined
        ? undefined
        : {
            shouldFocus: normalizedIssue.shouldFocus
          }
    )
  }
}

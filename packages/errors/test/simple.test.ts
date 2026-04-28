import { afterEach, describe, expect, it } from "vitest"

import { decodeError } from "../src/decoder.ts"
import { encode } from "../src/encoder.ts"
import { NotFoundError } from "../src/server.ts"

// @ts-ignore
const originalStage = process.env.STAGE

afterEach(() => {
  // @ts-ignore
  process.env.STAGE = originalStage
})

describe("errors encoding", () => {
  it("passes through standard errors unchanged", () => {
    const standardError = {
      _tag: "StandardError",
      message: "already normalized",
      metadata: {},
      status: 418
    }

    expect(encode(standardError)).toBe(standardError)
  })

  it("uses schema annotations for tagged errors", () => {
    const error = encode(
      new NotFoundError({
        message: "missing route",
        path: "/users/1"
      })
    )

    expect(error).toMatchObject({
      _tag: "NotFoundError",
      message: "missing route",
      path: "/users/1",
      issues: [],
      status: 404
    })
  })

  it("normalizes plain errors and hides debug details in production", () => {
    // @ts-ignore
    process.env.STAGE = "production"

    const cause = new Error("root cause")
    const error = new Error("boom", { cause })

    expect(encode(error)).toEqual({
      _tag: "InternalServerError",
      message: "boom",
      cause: {},
      issues: [],
      path: [],
      stack: undefined
    })
  })
})

describe("errors decoding", () => {
  it("keeps normalized errors as-is", () => {
    const standardError = {
      _tag: "KnownError",
      message: "known",
      metadata: {},
      status: 400
    }

    expect(decodeError(standardError)).toBe(standardError)
  })

  it("maps arbitrary thrown objects into the standard shape", () => {
    expect(
      decodeError({
        _tag: "CustomError",
        message: "invalid input",
        cause: { detail: "bad" },
        code: 422,
        issues: [{ _tag: "Issue", message: "wrong", path: ["email"] }],
        path: ["profile"],
        stack: "stack-trace"
      })
    ).toEqual({
      _tag: "CustomError",
      message: "invalid input",
      cause: { detail: "bad" },
      status: 422,
      issues: [{ _tag: "Issue", message: "wrong", path: ["email"] }],
      path: ["profile"],
      stack: "stack-trace"
    })
  })
})

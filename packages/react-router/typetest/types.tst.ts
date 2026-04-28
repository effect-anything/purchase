import { describe, expect, test } from "tstyche"

import type { ReactRouterData, ReactRouterResult } from "../src/response.ts"

describe("@effect-x/react-router type coverage", () => {
  test("ReactRouterData keeps success and failure shapes aligned", () => {
    type Data = ReactRouterData<{ id: string }, { _tag: "AppError" }>
    type Success = Extract<Data, { success: true }>
    type Failure = Extract<Data, { success: false }>

    expect<Success["result"]>().type.toBe<{ id: string }>()
    expect<Failure["error"]>().type.toBe<{ _tag: "AppError" }>()
  })

  test("ReactRouterResult keeps headers on both success and failure branches", () => {
    type Result = ReactRouterResult<{ ok: true }, { _tag: "Problem" }>
    type Success = Extract<Result, { _tag: "ReactRouterResultSuccess" }>
    type Failure = Extract<Result, { _tag: "ReactRouterResultFailure" }>

    expect<Success["result"]>().type.toBe<{ ok: true }>()
    expect<Failure["error"]>().type.toBe<{ _tag: "Problem" }>()
    expect<Success["headers"]>().type.toBe<HeadersInit>()
    expect<Failure["headers"]>().type.toBe<HeadersInit>()
  })
})

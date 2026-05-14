import { Context } from "effect"

export class TestConfig extends Context.Tag("TestConfig")<
  TestConfig,
  {
    readonly baseURL: string
  }
>() {}

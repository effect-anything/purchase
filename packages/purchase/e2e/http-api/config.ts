import { Context } from "effect"

export class TestConfig extends Context.Tag("TestConfig")<
  TestConfig,
  {
    readonly baseURL: string
    readonly localBaseURL: string
    readonly publicBaseURL: string
    readonly checkoutURL?: string | undefined
    readonly webhookURL: string
    readonly brokerBaseURL?: string | undefined
    readonly runId?: string | undefined
  }
>() {}

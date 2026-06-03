import { Context } from "effect"

import type { BrokerEndpoint } from "../internal/types.ts"

export class TestConfig extends Context.Tag("@E2E/TestConfig")<
  TestConfig,
  {
    readonly runId: string
    readonly broker: BrokerEndpoint
    readonly baseURL: string
  }
>() {}

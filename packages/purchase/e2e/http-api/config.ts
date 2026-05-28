import { Context } from "effect"

import type { BrokerEndpoint } from "../utils/types.ts"

export class TestConfig extends Context.Tag("TestConfig")<
  TestConfig,
  {
    readonly runId: string
    readonly broker: BrokerEndpoint
    readonly baseURL: string
  }
>() {}

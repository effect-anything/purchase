import { it } from "@effect/vitest"
import { Effect } from "effect"

import { ApiClient, HttpApiTesting } from "./api-utils.ts"

it.layer(HttpApiTesting)("http api", (it) => {
  it.scoped("pass", () =>
    Effect.gen(function* () {
      const client = yield* ApiClient
      let res = yield* client.auth.get({})
      let res2 = yield* client.auth.get({})
      console.log(res2)
    })
  )
})

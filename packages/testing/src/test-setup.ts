import * as it from "@effect/vitest"
import { faker } from "@faker-js/faker"

import { setFaker } from "./faker.ts"

const bigintPrototype = BigInt.prototype as bigint & {
  toJSON?: (() => string) | undefined
}

if (typeof bigintPrototype.toJSON !== "function") {
  // This test-only shim keeps JSON snapshots stable for bigint values.
  // eslint-disable-next-line eslint/no-extend-native
  Object.defineProperty(BigInt.prototype, "toJSON", {
    configurable: true,
    writable: true,
    value() {
      return this.toString()
    }
  })
}

setFaker(faker)

it.addEqualityTesters()

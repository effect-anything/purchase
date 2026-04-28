const bigintPrototype = BigInt.prototype as bigint & {
  toJSON?: (() => string) | undefined
}

if (typeof bigintPrototype.toJSON !== "function") {
  // oxlint-disable-next-line no-extend-native
  Object.defineProperty(BigInt.prototype, "toJSON", {
    configurable: true,
    writable: true,
    value() {
      return this.toString()
    }
  })
}

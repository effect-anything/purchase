import { beforeEach, describe, expect, it, vi } from "vitest"

const mockFn: typeof vi.fn = vi.fn

describe("expo-bip39 module wrapper", () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it("converts native string arrays into Uint8Array values", async () => {
    const mnemonicToSeed = mockFn(async () => ["0", "15", "255"])

    vi.doMock("expo-modules-core", () => ({
      // eslint-disable-next-line typescript/no-extraneous-class
      NativeModule: class NativeModule {},
      requireNativeModule: mockFn(() => ({
        mnemonicToSeed
      }))
    }))

    const module = await import("../src/index")
    const seed = await module.default.mnemonicToSeed("legal winner thank year wave sausage")

    expect(seed).toBeInstanceOf(Uint8Array)
    expect([...seed]).toEqual([0, 15, 255])
    expect(mnemonicToSeed).toHaveBeenCalledWith("legal winner thank year wave sausage", "")
  })

  it("forwards custom passwords to the native module", async () => {
    const mnemonicToSeed = mockFn(async () => ["1", "2"])

    vi.doMock("expo-modules-core", () => ({
      // eslint-disable-next-line typescript/no-extraneous-class
      NativeModule: class NativeModule {},
      requireNativeModule: mockFn(() => ({
        mnemonicToSeed
      }))
    }))

    const module = await import("../src/index")
    const seed = await module.default.mnemonicToSeed("seed words", "secret")

    expect([...seed]).toEqual([1, 2])
    expect(mnemonicToSeed).toHaveBeenCalledWith("seed words", "secret")
  })
})

/** @vitest-environment node */

import { Layer, Exit } from "effect"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Atom, defineFeature } from "../../src/index.ts"

import { ensureAtomMounted, flattenExit, setWritableValue, withTimeout } from "../../src/atom-internals.ts"

const mockFn: typeof vi.fn = vi.fn

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe("atom internals", () => {
  it("flattenExit returns success values and rethrows squashed failures", () => {
    expect(flattenExit(Exit.succeed("ready"))).toBe("ready")
    // @effect-diagnostics-next-line globalErrorInEffectFailure:off
    expect(() => flattenExit(Exit.fail(new Error("boom")))).toThrowError("boom")
  })

  it("withTimeout clears the timeout when the promise resolves", async () => {
    vi.useFakeTimers()

    const wrapped = withTimeout(Promise.resolve("done"), 20, "timeout")

    await expect(wrapped).resolves.toBe("done")
    expect(vi.getTimerCount()).toBe(0)
  })

  it("withTimeout preserves source rejections and clears the timeout", async () => {
    vi.useFakeTimers()

    const sourceError = new Error("source failure")
    const wrapped = withTimeout(Promise.reject(sourceError), 20, "timeout")
    const rejection = expect(wrapped).rejects.toBe(sourceError)

    await rejection
    expect(vi.getTimerCount()).toBe(0)
  })

  it("withTimeout rejects when the source promise does not settle in time", async () => {
    vi.useFakeTimers()

    const wrapped = withTimeout(new Promise<never>(() => undefined), 20, "timeout")
    const rejection = expect(wrapped).rejects.toThrowError("timeout")

    await vi.advanceTimersByTimeAsync(20)
    await rejection
  })

  it("ensureAtomMounted reference-counts mounts per atom and registry", () => {
    const atom = Atom.make(0)
    const unmount = mockFn()
    const registry = { mount: mockFn(() => unmount) } as any

    const cleanup1 = ensureAtomMounted(registry, atom)
    const cleanup2 = ensureAtomMounted(registry, atom)

    expect(registry.mount).toHaveBeenCalledTimes(1)

    cleanup1()
    expect(unmount).not.toHaveBeenCalled()

    cleanup2()
    cleanup2()
    expect(unmount).toHaveBeenCalledTimes(1)
  })

  it("setWritableValue dispatches direct values with set() and updater functions with update()", () => {
    const atom = Atom.make(0) as Atom.Writable<number, number>
    const registry = {
      set: mockFn(),
      update: mockFn()
    } as any

    setWritableValue(registry, atom, 1)
    expect(registry.set).toHaveBeenCalledWith(atom, 1)
    expect(registry.update).not.toHaveBeenCalled()

    //
    const updater = (current: number) => current + 1
    setWritableValue(registry, atom, updater)
    expect(registry.update).toHaveBeenCalledWith(atom, updater)
  })

  it("reuses hook wrappers for the same feature instance", () => {
    const feature = defineFeature({
      tags: {},
      provide: Layer.empty,
      make: (runtime) => ({
        count: Atom.make(0),
        countFamily: runtime.family((id: string) => Atom.make(() => id)),
        helper: () => "ignored"
      })
    })

    const hooks1 = feature.useHooks()
    const hooks2 = feature.useHooks()

    expect(hooks2).toBe(hooks1)
    expect(hooks2.count).toBe(hooks1.count)
    expect(hooks2.countFamily).toBe(hooks1.countFamily)
  })

  it("rebuilds hook wrappers after destroy invalidates the cached atoms", () => {
    const feature = defineFeature({
      tags: {},
      provide: Layer.empty,
      make: (runtime) => ({
        count: Atom.make(0),
        countFamily: runtime.family((id: string) => Atom.make(() => id))
      })
    })

    const hooksBeforeDestroy = feature.useHooks()
    const atomBeforeDestroy = feature.atoms.count

    feature.destroy()

    const hooksAfterDestroy = feature.useHooks()

    expect(feature.atoms.count).not.toBe(atomBeforeDestroy)
    expect(hooksAfterDestroy).not.toBe(hooksBeforeDestroy)
    expect(hooksAfterDestroy.count).not.toBe(hooksBeforeDestroy.count)
    expect(hooksAfterDestroy.countFamily).not.toBe(hooksBeforeDestroy.countFamily)
  })
})

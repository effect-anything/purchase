import type * as Atom from "@effect-atom/atom/Atom"
import type * as Registry from "@effect-atom/atom/Registry"
import * as Cause from "effect/Cause"
import * as Exit from "effect/Exit"

const mountedAtoms = new WeakMap<Atom.Atom<any>, WeakMap<Registry.Registry, { count: number; unmount: () => void }>>()

export const ensureAtomMounted = (registry: Registry.Registry, atom: Atom.Atom<any>): (() => void) => {
  let registryMap = mountedAtoms.get(atom)
  if (!registryMap) {
    registryMap = new WeakMap()
    mountedAtoms.set(atom, registryMap)
  }

  const mountInfo = registryMap.get(registry)
  if (!mountInfo) {
    const unmount = registry.mount(atom)
    registryMap.set(registry, { count: 1, unmount })

    return () => {
      const info = registryMap!.get(registry)
      if (info) {
        info.count--
        if (info.count <= 0) {
          info.unmount()
          registryMap!.delete(registry)
        }
      }
    }
  }

  mountInfo.count++
  return () => {
    const info = registryMap!.get(registry)
    if (info) {
      info.count--
      if (info.count <= 0) {
        info.unmount()
        registryMap!.delete(registry)
      }
    }
  }
}

export const withTimeout = <A>(promise: Promise<A>, ms: number, message: string): Promise<A> =>
  new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error(message)), ms)
    promise.then(
      (value) => {
        clearTimeout(timeoutId)
        resolve(value)
      },
      (error) => {
        clearTimeout(timeoutId)
        reject(error)
      }
    )
  })

export const flattenExit = <A, E>(exit: Exit.Exit<A, E>): A => {
  if (Exit.isSuccess(exit)) return exit.value
  throw Cause.squash(exit.cause)
}

const isWriteUpdater = <R, W>(value: W | ((_: R) => W)): value is (_: R) => W => typeof value === "function"

export const setWritableValue = <R, W>(
  registry: Registry.Registry,
  atom: Atom.Writable<R, W>,
  value: W | ((_: R) => W)
) => {
  if (isWriteUpdater<R, W>(value)) {
    registry.update(atom, value)
    return
  }

  registry.set(atom, value)
}

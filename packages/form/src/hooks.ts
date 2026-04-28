import { type DependencyList, type EffectCallback, useEffect, useMemo, useRef } from "react"

import { deepEqual } from "./utils.ts"

type DebounceOptions = {
  wait?: number | undefined
  leading?: boolean | undefined
  trailing?: boolean | undefined
}

type DebouncedFn<T extends (...args: Array<any>) => any> = {
  run: (...args: Parameters<T>) => void
  cancel: () => void
  flush: () => ReturnType<T> | undefined
}

export function useDebounceFn<T extends (...args: Array<any>) => any>(
  fn: T,
  { wait = 1000, leading = false, trailing = true }: DebounceOptions = {}
): DebouncedFn<T> {
  const fnRef = useRef(fn)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const argsRef = useRef<Parameters<T> | undefined>(undefined)
  const resultRef = useRef<ReturnType<T> | undefined>(undefined)

  fnRef.current = fn

  const debounced = useMemo<DebouncedFn<T>>(
    () => ({
      run: (...args) => {
        argsRef.current = args

        if (timerRef.current !== undefined) {
          clearTimeout(timerRef.current)
        } else if (leading) {
          resultRef.current = fnRef.current(...args)
        }

        timerRef.current = setTimeout(() => {
          timerRef.current = undefined

          if (trailing && argsRef.current !== undefined) {
            resultRef.current = fnRef.current(...argsRef.current)
          }

          argsRef.current = undefined
        }, wait)
      },
      cancel: () => {
        if (timerRef.current !== undefined) {
          clearTimeout(timerRef.current)
        }

        timerRef.current = undefined
        argsRef.current = undefined
      },
      flush: () => {
        if (timerRef.current === undefined) {
          return resultRef.current
        }

        clearTimeout(timerRef.current)
        timerRef.current = undefined

        if (trailing && argsRef.current !== undefined) {
          resultRef.current = fnRef.current(...argsRef.current)
        }

        argsRef.current = undefined
        return resultRef.current
      }
    }),
    [leading, trailing, wait]
  )

  useEffect(() => debounced.cancel, [debounced])

  return debounced
}

export function useDeepCompareEffect(effect: EffectCallback, deps: DependencyList) {
  const signalRef = useRef(0)
  const depsRef = useRef<DependencyList | undefined>(undefined)

  if (!deepEqual(depsRef.current, deps)) {
    depsRef.current = deps
    signalRef.current += 1
  }

  useEffect(effect, [signalRef.current])
}

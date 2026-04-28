import type * as Data from "effect/Data"

type FilterKeyByType<A, T> = {
  [K in keyof A as A[K] extends T ? never : K]: A[K]
}

type ExtractTag<T> = T extends Data.Case.Constructor<infer U> ? U : never

export type UnionTaggedEnum<T extends Record<any, any>> = ExtractTag<
  FilterKeyByType<T, Data.Case.Constructor<any>>[keyof FilterKeyByType<T, Data.Case.Constructor<any>>]
>

export type CastArray<T> = [T] extends [never]
  ? Array<never>
  : [unknown] extends [T]
    ? Array<unknown>
    :
        | (T extends any ? (T extends ReadonlyArray<infer U> ? Array<U> : never) : never)
        | (Exclude<T, ReadonlyArray<any>> extends never ? never : Array<Exclude<T, ReadonlyArray<any>>>)

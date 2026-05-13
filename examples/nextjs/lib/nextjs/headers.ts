/**
 * @since 0.30.0
 */
import { Effect } from "effect"
import { cookies, headers } from "next/headers"

/**
 * Access request cookies.
 *
 * @since 0.30.0
 * @category request
 */
export const Cookies: Effect.Effect<Awaited<ReturnType<typeof cookies>>> = Effect.promise(() => cookies())

/**
 * Access request headers.
 *
 * @since 0.30.0
 * @category request
 */
export const Headers: Effect.Effect<Awaited<ReturnType<typeof headers>>> = Effect.promise(() => headers())

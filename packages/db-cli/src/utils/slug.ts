import * as Effect from "effect/Effect"
import * as Random from "effect/Random"
import slugify from "@sindresorhus/slugify"

export function formatMigrationName(name: string): string {
  // Truncate if longer
  const maxMigrationNameLength = 200

  return slugify(name, { separator: "_" }).substring(0, maxMigrationNameLength)
}

const readableAdjectives = [
  "brisk",
  "calm",
  "clear",
  "fresh",
  "gentle",
  "lively",
  "quick",
  "steady",
  "tidy",
  "vivid"
] as const

const readableNouns = [
  "branch",
  "field",
  "harbor",
  "ledger",
  "meadow",
  "path",
  "record",
  "signal",
  "stream",
  "table"
] as const

const pick = <A>(items: ReadonlyArray<A>) =>
  Random.nextIntBetween(0, items.length, { halfOpen: true }).pipe(Effect.map((index) => items[index]!))

export const randomReadableSlug = Effect.fnUntraced(function* () {
  const adjective = yield* pick(readableAdjectives)
  const noun = yield* pick(readableNouns)

  return `${adjective}_${noun}`
})

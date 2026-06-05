import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Ref from "effect/Ref"
import * as Schedule from "effect/Schedule"

import { PaymentTestError } from "./types.ts"

export const waitUntil = Effect.fn("Harness.waitUntil")(function* <A>(input: {
  readonly poll: Effect.Effect<A, PaymentTestError>
  readonly isDone: (value: A) => boolean
  readonly timeout?: Duration.DurationInput | undefined
  readonly interval?: Duration.DurationInput | undefined
  readonly timeoutMessage: string
}) {
  const timeout = Duration.decode(input.timeout ?? "90 seconds")
  const interval = Duration.decode(input.interval ?? "3 seconds")
  const attempts = yield* Ref.make(0)

  const pollWithSpan = Ref.updateAndGet(attempts, (n) => n + 1).pipe(
    Effect.flatMap((n) => input.poll.pipe(Effect.withSpan("waitUntil.poll", { attributes: { "wait.attempt": n } })))
  )

  const result = yield* Effect.repeat(
    pollWithSpan,
    Schedule.recurUntil(input.isDone).pipe(
      Schedule.addDelay(() => interval),
      Schedule.upTo(timeout)
    )
  )

  const matched = input.isDone(result)
  const totalAttempts = yield* Ref.get(attempts)
  yield* Effect.annotateCurrentSpan({
    "wait.attempts": totalAttempts,
    "wait.matched": matched
  })

  return matched ? result : yield* new PaymentTestError({ message: input.timeoutMessage, cause: result })
})

export const optionOrPaymentTestError = <A>(option: Option.Option<A>, message: string) =>
  Option.match(option, {
    onNone: () => Effect.fail(new PaymentTestError({ message })),
    onSome: Effect.succeed
  })

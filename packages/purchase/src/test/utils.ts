import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"

import { PaymentTestError } from "./types.ts"

export const waitUntil = <A>(input: {
  readonly poll: Effect.Effect<A, PaymentTestError>
  readonly isDone: (value: A) => boolean
  readonly timeout?: Duration.DurationInput | undefined
  readonly interval?: Duration.DurationInput | undefined
  readonly timeoutMessage: string
}) =>
  Effect.gen(function* () {
    const timeout = Duration.toMillis(Duration.decode(input.timeout ?? "90 seconds"))
    const interval = Duration.toMillis(Duration.decode(input.interval ?? "3 seconds"))
    const startedAt = Date.now()
    let latest = yield* input.poll

    while (!input.isDone(latest) && Date.now() - startedAt < timeout) {
      yield* Effect.sleep(Duration.millis(interval))
      latest = yield* input.poll
    }

    return input.isDone(latest) ? latest : yield* new PaymentTestError({ message: input.timeoutMessage, cause: latest })
  })

export const optionOrPaymentTestError = <A>(option: Option.Option<A>, message: string) =>
  Option.match(option, {
    onNone: () => Effect.fail(new PaymentTestError({ message })),
    onSome: Effect.succeed
  })

/// <reference lib="webworker" />

import type { ResourcePlan } from "./handle.ts"
import type * as SchedulerSchema from "./schema.ts"

import * as WorkerRunner from "../runner.ts"
import { SchedulerManager } from "./manager.ts"
import * as Effect from "effect/Effect"
import * as Scope from "effect/Scope"

export const workerHandles = (
  plans: Array<ResourcePlan<Effect.Effect<void, never, never>, Effect.Effect<void, never, never>>>
) =>
  WorkerRunner.handler<SchedulerSchema.WorkerMessage>((scope) => ({
    InitScheduler: () =>
      Effect.gen(function* () {
        const manager = yield* SchedulerManager

        yield* Effect.forEach(plans, (plan) => manager.register(plan), { concurrency: "unbounded" })

        yield* manager.run
      }).pipe(Effect.provideService(Scope.Scope, scope)) as Effect.Effect<void>,

    SchedulerCommand: (request) =>
      Effect.gen(function* () {
        const manager = yield* SchedulerManager
        return yield* manager.invoke(request.command)
      }).pipe(Effect.provideService(Scope.Scope, scope)),

    SchedulerEvent: (request) =>
      Effect.gen(function* () {
        const manager = yield* SchedulerManager
        return yield* manager.emit(request.event)
      }).pipe(Effect.provideService(Scope.Scope, scope))
  }))

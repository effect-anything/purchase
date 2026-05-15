import type { ProvidedContext } from "vitest"

import { Effect, Exit, Scope, ManagedRuntime } from "effect"
import { existsSync, readFileSync } from "node:fs"

import { Live } from "../infra/runtime.ts"
import { run } from "../infra/webhook-broker.ts"

const repoRoot = new URL("../../../../", import.meta.url).pathname

const parseDotEnvLine = (line: string): readonly [string, string] | undefined => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) {
    return undefined
  }

  const equalsIndex = trimmed.indexOf("=")
  if (equalsIndex <= 0) {
    return undefined
  }

  const key = trimmed.slice(0, equalsIndex).trim()
  let value = trimmed.slice(equalsIndex + 1).trim()
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1)
  }

  return [key, value]
}

export const loadE2eEnv = (paths: ReadonlyArray<string> = [`${repoRoot}.env.local`, `${repoRoot}.env`]) => {
  console.log(paths)
  for (const path of paths) {
    if (!existsSync(path)) {
      continue
    }

    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const entry = parseDotEnvLine(line)
      if (!entry) {
        continue
      }

      const [key, value] = entry
      process.env[key] ??= value
    }
  }
}

export default async function setup(project: {
  readonly provide: (key: "purchaseProviderE2E", value: ProvidedContext["purchaseProviderE2E"]) => void
}) {
  // TODO: dot env
  loadE2eEnv()

  const runtimes: Map<string, ManagedRuntime.ManagedRuntime<any, never>> = new Map()

  project.provide("initProvider", (provider) => {
    if (runtimes.has(provider)) {
      let rt = runtimes.get(provider)
      return rt!.runPromise(run(provider))
    }

    const rt = ManagedRuntime.make(Live)
    runtimes.set(provider, rt)
    return rt!.runPromise(run(provider))
  })

  return async () => {
    runtimes.forEach((rt) => {
      rt.dispose()
    })
  }
}

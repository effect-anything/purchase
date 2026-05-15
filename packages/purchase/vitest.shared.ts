import { defineProject, mergeConfig } from "vitest/config"

import shared from "../../vitest.shared.ts"

export const definePurchaseProject = (config: Parameters<typeof defineProject>[0]) =>
  mergeConfig(
    shared,
    defineProject({
      root: import.meta.dirname,
      ...config
    })
  )

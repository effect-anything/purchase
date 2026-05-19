import type { ViteUserConfig } from "vitest/config"

const config: ViteUserConfig = {
  build: {
    target: "es2020"
  },
  resolve: { tsconfigPaths: true },
  plugins: [],
  server: {
    watch: {
      ignored: ["**/.context/**", "**/.direnv/**", "**/.lalph/**", "**/.references/**"]
    }
  },
  test: {
    exclude: ["**/.context/**", "**/.direnv/**", "**/.lalph/**", "**/.references/**", "**/node_modules/**"],
    fakeTimers: {
      toFake: undefined
    },
    sequence: {
      concurrent: true
    },
    include: ["test/**/!(*.browser).test.{ts,tsx}", "e2e/**/!(*.browser).test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["html"],
      reportsDirectory: "coverage",
      exclude: [
        "node_modules/",
        "dist/",
        "benchmark/",
        "typetest/",
        "build/",
        "coverage/",
        "test/utils/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/vitest.setup.*",
        "**/vitest.shared.*"
      ]
    }
  }
}

export default config

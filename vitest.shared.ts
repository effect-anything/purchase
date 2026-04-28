import path from "node:path"
import type { ViteUserConfig } from "vitest/config"

const config: ViteUserConfig = {
  build: {
    target: "es2020"
  },
  resolve: { tsconfigPaths: true },
  optimizeDeps: {
    exclude: ["bun:sqlite"]
  },
  plugins: [],
  server: {
    watch: {
      ignored: ["**/.context/**", "**/.direnv/**", "**/.lalph/**", "**/.repos/**"]
    }
  },
  test: {
    exclude: ["**/.context/**", "**/.direnv/**", "**/.lalph/**", "**/.repos/**", "**/node_modules/**"],
    setupFiles: [path.join(__dirname, "vitest.setup.ts")],
    fakeTimers: {
      toFake: undefined
    },
    sequence: {
      concurrent: true
    },
    include: ["test/**/*.test.{ts,tsx}"],
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

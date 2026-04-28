import { mergeConfig } from "vitest/config"
import shared from "../../vitest.shared.ts"

export default mergeConfig(shared, {
  resolve: {
    alias: [
      { find: /^@effect-x\/cloudflare\/(.+)$/, replacement: new URL("./src/$1.ts", import.meta.url).pathname },
      { find: /^@effect-x\/errors\/(.+)$/, replacement: new URL("../errors/src/$1.ts", import.meta.url).pathname },
      {
        find: /^@effect-x\/event-log\/(.+)$/,
        replacement: new URL("../event-log/src/$1.ts", import.meta.url).pathname
      },
      {
        find: /^@effect-x\/event-log-server\/(.+)$/,
        replacement: new URL("../event-log-server/src/$1.ts", import.meta.url).pathname
      },
      { find: /^@effect-x\/i18n\/(.+)$/, replacement: new URL("../i18n/src/$1.ts", import.meta.url).pathname },
      { find: /^@effect-x\/otel\/(.+)$/, replacement: new URL("../otel/src/$1.ts", import.meta.url).pathname },
      {
        find: /^@effect-x\/react-router\/(.+)$/,
        replacement: new URL("../react-router/src/$1.ts", import.meta.url).pathname
      },
      { find: /^@effect-x\/server\/(.+)$/, replacement: new URL("../server/src/$1.ts", import.meta.url).pathname },
      {
        find: /^@effect-x\/server-testing\/(.+)$/,
        replacement: new URL("../server-testing/src/$1.ts", import.meta.url).pathname
      },
      { find: /^@effect-x\/testing\/(.+)$/, replacement: new URL("../testing/src/$1.ts", import.meta.url).pathname },
      { find: /^@effect-x\/toaster\/(.+)$/, replacement: new URL("../toaster/src/$1.ts", import.meta.url).pathname },
      { find: "@effect-x/server", replacement: new URL("../server/src/index.ts", import.meta.url).pathname }
    ]
  },
  test: {
    environment: "node"
  }
})

import { definePurchaseProject } from "./vitest.shared.ts"

export default definePurchaseProject({
  test: {
    name: "@effect-x/purchase-e2e",
    environment: "node",
    include: ["e2e/**/!(*.browser).test.{ts,tsx}"],
    exclude: ["test/**"],
    fileParallelism: false,
    globalSetup: ["e2e/e2e-setup.ts"],
    hookTimeout: 60_000,
    testTimeout: 60_000
  }
})

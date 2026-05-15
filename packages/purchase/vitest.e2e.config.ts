import { definePurchaseProject } from "./vitest.shared.ts"

export default definePurchaseProject({
  test: {
    name: "@effect-x/purchase-e2e",
    environment: "node",
    include: ["e2e/**/!(*.browser).test.{ts,tsx}"],
    exclude: ["test/**"],
    fileParallelism: false,
    globalSetup: ["e2e/setup/provider-e2e.ts"]
  }
})

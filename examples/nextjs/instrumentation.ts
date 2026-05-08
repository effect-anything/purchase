import { make } from "./runtime.ts"

const runtime = make()

process.on("SIGTERM", () => {
  console.log("dispose")

  runtime.dispose()
})

process.on("SIGINT", () => {
  console.log("dispose")
  runtime.dispose()
})

export function register() {
  console.log("instrumentation registered")
}

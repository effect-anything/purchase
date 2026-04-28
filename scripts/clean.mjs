import * as Fs from "node:fs"

const collectDirectories = (directory) =>
  Fs.existsSync(directory)
    ? Fs.readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => `${directory}/${entry.name}`)
    : []

const dirs = [
  ".",
  ...collectDirectories("packages"),
  ...collectDirectories("packages/sql"),
  ...collectDirectories("packages/tools"),
  ...collectDirectories("packages/ai")
]
dirs.forEach((pkg) => {
  const files = [".tsbuildinfo", "tsconfig.tsbuildinfo", "docs", "build", "dist", "coverage"]

  files.forEach((file) => {
    if (pkg === "." && file === "docs") {
      return
    }

    Fs.rmSync(`${pkg}/${file}`, { recursive: true, force: true }, () => {})
  })
})

collectDirectories("docs").forEach((dir) => {
  Fs.rmSync(dir, { recursive: true, force: true }, () => {})
})

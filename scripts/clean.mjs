import * as Fs from "node:fs"

const collectDirectories = (directory) =>
  Fs.existsSync(directory)
    ? Fs.readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => `${directory}/${entry.name}`)
    : []

const dirs = [
  ".",
  ...collectDirectories("examples"),
  ...collectDirectories("packages"),
  ...collectDirectories("packages/tools")
]
dirs.forEach((pkg) => {
  const files = [
    ".tsbuildinfo",
    "tsconfig.tsbuildinfo",
    "build",
    "dist",
    "coverage",
    "node_modules/.vite",
    "node_modules/.vite-temp"
  ]

  files.forEach((file) => {
    if (pkg === ".") {
      return
    }

    Fs.rmSync(`${pkg}/${file}`, { recursive: true, force: true }, () => {})
  })
})

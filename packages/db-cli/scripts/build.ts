/// <reference types="bun" />

import fs from "node:fs"
import { builtinModules } from "node:module"
import path from "node:path"

const repoRoot = path.resolve(import.meta.dirname, "..")
const distDir = path.join(repoRoot, "dist")
const bundlePath = path.join(distDir, "bin.js")
const externalPackages = ["miniflare", "wrangler"] as const
const builtinImports = new Set([...builtinModules, ...builtinModules.map((module) => `node:${module}`)])
const keptDistRootEntries = new Set(["bin.js", "vendor"])
const prunableVendorDirectories = new Set([
  "node_modules/@prisma/get-platform/dist/test-utils",
  "node_modules/effect/dist/esm",
  "node_modules/fast-check/lib/esm",
  "node_modules/seq-queue/test"
])
const prunableVendorExtensions = new Set([".map", ".ts", ".tsx", ".mts", ".cts"])
const prunableVendorFilenames = new Set([
  ".DS_Store",
  ".jshintrc",
  ".npmignore",
  ".travis.yml",
  "AUTHORS",
  "bun.lock",
  "bun.lockb",
  "info.txt",
  "Makefile",
  "package-lock.json",
  "pnpm-lock.yaml",
  "tsconfig.json",
  "yarn.lock"
])
const prunableVendorRelativeFiles = new Set([
  "node_modules/prisma/build/studio.css",
  "node_modules/prisma/build/studio.js",
  "node_modules/prisma/build/xdg-open"
])
const supportedPrismaProviders = new Set(["mysql", "postgresql", "sqlite"])
const executablePrelude = [
  "#!/usr/bin/env node",
  'import { dirname as __effectDbCliDirname } from "node:path"',
  'import { fileURLToPath as __effectDbCliFileURLToPath } from "node:url"',
  "const __filename = __effectDbCliFileURLToPath(import.meta.url)",
  "const __dirname = __effectDbCliDirname(__filename)",
  ""
].join("\n")

const isDeclarationFile = (filename: string) =>
  filename.endsWith(".d.ts") || filename.endsWith(".d.mts") || filename.endsWith(".d.cts")

const isLegalFile = (filename: string) => {
  const normalized = filename.toLowerCase()

  return (
    normalized.startsWith("copying") ||
    normalized.startsWith("licence") ||
    normalized.startsWith("license") ||
    normalized.startsWith("notice")
  )
}

const isPrunableVendorFile = (filename: string) => {
  const normalized = filename.toLowerCase()

  if (prunableVendorFilenames.has(filename) || prunableVendorFilenames.has(normalized)) {
    return true
  }

  if (isLegalFile(filename)) {
    return false
  }

  if (normalized.endsWith(".md") || normalized.endsWith(".markdown")) {
    return true
  }

  if (isDeclarationFile(normalized)) {
    return true
  }

  return prunableVendorExtensions.has(path.extname(normalized))
}

const relativeVendorPath = (vendorDir: string, entryPath: string) =>
  path.relative(vendorDir, entryPath).split(path.sep).join("/")

const isPrunableQueryCompiler = (relativePath: string) => {
  const match = /^node_modules\/prisma\/build\/query_compiler_(fast|small)_bg\.([^.]+)\./.exec(relativePath)

  if (!match) {
    return false
  }

  const [, build, provider] = match

  return build === "small" || !supportedPrismaProviders.has(provider)
}

const pruneEmptyDirectories = (directory: string): number => {
  if (!fs.existsSync(directory)) {
    return 0
  }

  let removed = 0

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue
    }

    const entryPath = path.join(directory, entry.name)

    removed += pruneEmptyDirectories(entryPath)

    if (fs.readdirSync(entryPath).length === 0) {
      fs.rmSync(entryPath, { recursive: true })
      removed++
    }
  }

  return removed
}

const pruneVendorRuntime = (vendorDir: string) => {
  if (!fs.existsSync(vendorDir)) {
    return { directories: 0, files: 0 }
  }

  let directories = 0
  let files = 0
  const visit = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name)
      const relativePath = relativeVendorPath(vendorDir, entryPath)

      if (entry.isDirectory()) {
        if (prunableVendorDirectories.has(relativePath)) {
          fs.rmSync(entryPath, { force: true, recursive: true })
          directories++
          continue
        }

        visit(entryPath)
        continue
      }

      if (
        !entry.isFile() ||
        (!isPrunableVendorFile(entry.name) &&
          !prunableVendorRelativeFiles.has(relativePath) &&
          !isPrunableQueryCompiler(relativePath))
      ) {
        continue
      }

      fs.rmSync(entryPath, { force: true })
      files++
    }
  }

  visit(vendorDir)

  return {
    directories: directories + pruneEmptyDirectories(vendorDir),
    files
  }
}

const pruneBuildOutput = () => {
  if (!fs.existsSync(distDir)) {
    return { directories: 0, files: 0 }
  }

  let directories = 0
  let files = 0

  for (const entry of fs.readdirSync(distDir, { withFileTypes: true })) {
    if (keptDistRootEntries.has(entry.name)) {
      continue
    }

    fs.rmSync(path.join(distDir, entry.name), { force: true, recursive: entry.isDirectory() })

    if (entry.isDirectory()) {
      directories++
    } else {
      files++
    }
  }

  const vendorResult = pruneVendorRuntime(path.join(distDir, "vendor"))

  return {
    directories: directories + vendorResult.directories,
    files: files + vendorResult.files
  }
}

if (process.argv.includes("--prune")) {
  const pruned = pruneBuildOutput()

  console.log(`pruned build output: ${pruned.files} files, ${pruned.directories} directories`)
  process.exit(0)
}

process.chdir(repoRoot)
process.env.NODE_ENV = "production"

console.log(`bundling cli to ${bundlePath}...`)

fs.mkdirSync(distDir, { recursive: true })
fs.rmSync(bundlePath, { force: true })

const result = await Bun.build({
  entrypoints: ["./src/bin.ts"],
  target: "node",
  format: "esm",
  minify: true,
  tsconfig: "tsconfig.json",
  sourcemap: "none",
  external: [...externalPackages]
})

const buildErrors = result.logs.filter((log) => log.level === "error")

if (!result.success || buildErrors.length > 0 || result.outputs.length !== 1) {
  console.error("Build failed:")

  for (const log of result.logs) {
    console.error(log)
  }

  console.error(`outputs=${result.outputs.length}`)
  process.exit(1)
}

const bundled = await result.outputs[0].text()
const bundledWithoutShebang = bundled.replace(/^#!.*\n/, "")
const imports = new Bun.Transpiler({ loader: "js" }).scanImports(bundledWithoutShebang)
const staticRuntimeImports = [...new Set(imports.map((item) => item.path))].sort()
const unexpectedImports = [
  ...new Set(
    imports
      .map((item) => item.path)
      .filter((specifier) => {
        if (specifier.startsWith(".") || specifier.startsWith("/")) {
          return false
        }

        if (
          builtinImports.has(specifier) ||
          externalPackages.some(
            (externalPackage) => specifier === externalPackage || specifier.startsWith(`${externalPackage}/`)
          )
        ) {
          return false
        }

        return true
      })
  )
].sort()

if (unexpectedImports.length > 0) {
  console.error("Build produced unexpected runtime imports:")

  for (const specifier of unexpectedImports) {
    console.error(`- ${specifier}`)
  }

  process.exit(1)
}

const executable = `${executablePrelude}${bundledWithoutShebang}`

fs.writeFileSync(bundlePath, executable)
fs.chmodSync(bundlePath, 0o755)

const pruned = pruneBuildOutput()
const stat = fs.statSync(bundlePath)

console.log(`bundle complete: ${(stat.size / 1024 / 1024).toFixed(2)} MB`)
console.log(`external runtime packages: ${externalPackages.join(", ")}`)
console.log(`static runtime imports: ${staticRuntimeImports.join(", ")}`)
console.log(`pruned build output: ${pruned.files} files, ${pruned.directories} directories`)
console.log(`bundle: ${bundlePath}`)

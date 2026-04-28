/// <reference types="bun" />

import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"

const repoRoot = path.resolve(import.meta.dirname, "..")
const distDir = path.join(repoRoot, "dist")
const vendorNodeModulesDir = path.join(distDir, "vendor", "node_modules")
const requireFromPackage = createRequire(path.join(repoRoot, "package.json"))
const skippedPackages = new Set(["@prisma/dev", "@prisma/studio-core"])

const copiedPackages = new Map<string, string>()
const vendoredTargets = new Set<string>()

type PackageJson = {
  readonly name: string
  readonly dependencies?: Record<string, string>
  readonly optionalDependencies?: Record<string, string>
  readonly peerDependencies?: Record<string, string>
  readonly peerDependenciesMeta?: Record<string, { readonly optional?: boolean }>
}

const readPackageJson = (packageDir: string): PackageJson =>
  JSON.parse(fs.readFileSync(path.join(packageDir, "package.json"), "utf8")) as PackageJson

const dependencyNames = (packageJson: PackageJson) =>
  [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.optionalDependencies ?? {}),
    ...Object.entries(packageJson.peerDependencies ?? {})
      .filter(([name]) => packageJson.peerDependenciesMeta?.[name]?.optional !== true)
      .map(([name]) => name)
  ].sort()

const packageTargetDir = (nodeModulesDir: string, packageName: string) => {
  if (packageName.startsWith("@")) {
    const [scope, name] = packageName.split("/")
    return path.join(nodeModulesDir, scope, name)
  }

  return path.join(nodeModulesDir, packageName)
}

const copyPackageDir = (sourceDir: string, targetDir: string) => {
  fs.rmSync(targetDir, { force: true, recursive: true })
  fs.mkdirSync(path.dirname(targetDir), { recursive: true })
  fs.cpSync(sourceDir, targetDir, {
    dereference: true,
    filter: (source) => path.basename(source) !== "node_modules",
    recursive: true
  })
}

const writeStubPackage = (nodeModulesDir: string, packageName: string, files: Record<string, string>) => {
  const packageDir = packageTargetDir(nodeModulesDir, packageName)

  fs.rmSync(packageDir, { force: true, recursive: true })
  fs.mkdirSync(packageDir, { recursive: true })
  fs.writeFileSync(
    path.join(packageDir, "package.json"),
    JSON.stringify(
      {
        name: packageName,
        version: "0.0.0",
        main: "index.js"
      },
      null,
      2
    )
  )

  for (const [filename, content] of Object.entries(files)) {
    const filepath = path.join(packageDir, filename)
    fs.mkdirSync(path.dirname(filepath), { recursive: true })
    fs.writeFileSync(filepath, content)
  }
}

const writeSkippedPackage = (nodeModulesDir: string, packageName: string) => {
  if (packageName === "@prisma/studio-core") {
    writeStubPackage(nodeModulesDir, packageName, {
      "data/bff.js": "module.exports = {}\n",
      "data/mysql2.js": "module.exports = {}\n",
      "data/node-sqlite.js": "module.exports = {}\n",
      "data/postgresjs.js": "module.exports = {}\n",
      "index.js": [
        "module.exports = new Proxy({}, {",
        "  get() {",
        "    throw new Error('prisma studio is not bundled in @effect-x/db-cli')",
        "  }",
        "})",
        ""
      ].join("\n")
    })
    return
  }

  if (packageName === "@prisma/dev") {
    writeStubPackage(nodeModulesDir, packageName, {
      "index.js": [
        "exports.startPrismaDevServer = async () => {",
        "  throw new Error('prisma dev is not bundled in @effect-x/db-cli')",
        "}",
        ""
      ].join("\n"),
      "internal/state.js": [
        "exports.ServerState = {",
        "  scan: async () => [],",
        "  fromServerDump: async () => null,",
        "  createExclusively: async () => ({",
        "    close: async () => {},",
        "    databasePort: -1,",
        "    name: 'default',",
        "    port: -1,",
        "    shadowDatabasePort: -1",
        "  })",
        "}",
        ""
      ].join("\n")
    })
  }
}

const vendorPackage = (packageName: string, fromRequire: NodeJS.Require, nodeModulesDir: string) => {
  if (skippedPackages.has(packageName)) {
    writeSkippedPackage(nodeModulesDir, packageName)
    return
  }

  const packageDir = fs.realpathSync(path.dirname(fromRequire.resolve(`${packageName}/package.json`)))
  const targetDir =
    copiedPackages.has(packageName) && copiedPackages.get(packageName) !== packageDir
      ? packageTargetDir(nodeModulesDir, packageName)
      : packageTargetDir(vendorNodeModulesDir, packageName)
  const targetKey = `${packageName}\0${targetDir}`

  if (vendoredTargets.has(targetKey)) {
    return
  }

  vendoredTargets.add(targetKey)
  copiedPackages.set(packageName, packageDir)
  copyPackageDir(packageDir, targetDir)

  const packageJson = readPackageJson(packageDir)
  const packageRequire = createRequire(path.join(packageDir, "package.json"))

  for (const dependencyName of dependencyNames(packageJson)) {
    try {
      vendorPackage(dependencyName, packageRequire, path.join(targetDir, "node_modules"))
    } catch (error) {
      if (!packageJson.optionalDependencies?.[dependencyName]) {
        throw error
      }

      console.log(`optional dependency not vendored: ${packageJson.name} -> ${dependencyName}`)
    }
  }
}

console.log("vendoring Prisma runtime...")

fs.rmSync(path.join(distDir, "vendor"), { force: true, recursive: true })
fs.mkdirSync(vendorNodeModulesDir, { recursive: true })

vendorPackage("prisma", requireFromPackage, vendorNodeModulesDir)

fs.writeFileSync(
  path.join(distDir, "vendor", "prisma.cjs"),
  [
    "#!/usr/bin/env node",
    'const { spawnSync } = require("node:child_process")',
    'const path = require("node:path")',
    'const prismaBin = path.join(__dirname, "node_modules/prisma/build/index.js")',
    'const result = spawnSync(process.execPath, [prismaBin, ...process.argv.slice(2)], { stdio: "inherit" })',
    "if (result.error) throw result.error",
    "if (result.signal) process.kill(process.pid, result.signal)",
    "process.exit(result.status ?? 1)",
    ""
  ].join("\n")
)

fs.chmodSync(path.join(vendorNodeModulesDir, "prisma", "build", "index.js"), 0o755)
fs.chmodSync(path.join(distDir, "vendor", "prisma.cjs"), 0o755)

console.log(`Prisma runtime vendor complete: ${vendoredTargets.size} packages`)
console.log(`Prisma runtime: ${vendorNodeModulesDir}`)

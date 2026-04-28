import * as Fs from "node:fs"
import * as Path from "node:path"

const ignoredDirectories = new Set([".git", ".turbo", ".vite", "build", "coverage", "dist", "node_modules"])
const runtimeDependencyFields = ["dependencies", "optionalDependencies", "peerDependencies"]

const escapeRegExp = (value) => value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&")

const collectPackageDirectories = (directory) => {
  const entries = Fs.readdirSync(directory, { withFileTypes: true })
  const directories = []

  for (const entry of entries) {
    if (!entry.isDirectory() || ignoredDirectories.has(entry.name)) {
      continue
    }

    const fullPath = Path.join(directory, entry.name)
    if (Fs.existsSync(Path.join(fullPath, "package.json"))) {
      directories.push(fullPath)
      continue
    }

    directories.push(...collectPackageDirectories(fullPath))
  }

  return directories
}

const collectFiles = (directory, prefix = ".") => {
  const entries = Fs.readdirSync(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const relative = Path.posix.join(prefix, entry.name)
    const absolute = Path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...collectFiles(absolute, relative))
      continue
    }

    files.push(relative)
  }

  return files
}

const collectExportEntries = (exportsField) => {
  if (exportsField === null || exportsField === undefined) {
    return []
  }

  if (typeof exportsField === "string") {
    return [{ key: ".", target: exportsField }]
  }

  if (Array.isArray(exportsField)) {
    return exportsField.flatMap(collectExportEntries)
  }

  const entries = []
  const keys = Object.keys(exportsField)
  const isSpecifierMap = keys.some((key) => key.startsWith("."))

  if (isSpecifierMap) {
    for (const [key, value] of Object.entries(exportsField)) {
      if (!key.startsWith(".")) {
        continue
      }

      entries.push(...collectExportEntriesForKey(key, value))
    }

    return entries
  }

  return Object.values(exportsField).flatMap((value) => collectExportEntriesForKey(".", value))
}

const collectExportEntriesForKey = (key, value) => {
  if (value === null || typeof value === "string") {
    return [{ key, target: value }]
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectExportEntriesForKey(key, item))
  }

  return Object.values(value).flatMap((item) => collectExportEntriesForKey(key, item))
}

const patternToRegExp = (pattern) => new RegExp(`^${escapeRegExp(pattern).replaceAll("*", "(.+?)")}$`)

const replaceStars = (pattern, captures) => {
  let index = 0
  return pattern.replaceAll("*", () => captures[index++] ?? "")
}

export const collectWorkspacePackages = (rootDirectory) => {
  const packagesDirectory = Path.join(rootDirectory, "packages")
  const packageDirectories = collectPackageDirectories(packagesDirectory)
  const manifests = packageDirectories
    .map((directory) => ({
      directory,
      manifest: JSON.parse(Fs.readFileSync(Path.join(directory, "package.json"), "utf8"))
    }))
    .filter(({ manifest }) => manifest.private !== true)

  const workspaceNames = new Set(manifests.map(({ manifest }) => manifest.name))

  return manifests.map(({ directory, manifest }) => ({
    directory,
    manifest,
    name: manifest.name,
    version: manifest.version,
    internalDependencies: runtimeDependencyFields
      .flatMap((field) => Object.keys(manifest[field] ?? {}))
      .filter((dependency) => workspaceNames.has(dependency))
      .sort()
  }))
}

export const topologicallySortPackages = (packages) => {
  const packageMap = new Map(packages.map((pkg) => [pkg.name, pkg]))
  const indegree = new Map(packages.map((pkg) => [pkg.name, 0]))
  const dependents = new Map(packages.map((pkg) => [pkg.name, []]))

  for (const pkg of packages) {
    for (const dependency of pkg.internalDependencies) {
      if (!packageMap.has(dependency)) {
        continue
      }

      indegree.set(pkg.name, indegree.get(pkg.name) + 1)
      dependents.get(dependency).push(pkg.name)
    }
  }

  const available = [...packages]
    .filter((pkg) => indegree.get(pkg.name) === 0)
    .map((pkg) => pkg.name)
    .sort()
  const ordered = []

  while (available.length > 0) {
    const name = available.shift()
    ordered.push(packageMap.get(name))

    for (const dependent of dependents.get(name).sort()) {
      indegree.set(dependent, indegree.get(dependent) - 1)
      if (indegree.get(dependent) === 0) {
        available.push(dependent)
        available.sort()
      }
    }
  }

  if (ordered.length !== packages.length) {
    const remaining = [...indegree.entries()]
      .filter(([, value]) => value > 0)
      .map(([name]) => name)
      .sort()
    throw new Error(`Detected a publish cycle across workspace packages: ${remaining.join(", ")}`)
  }

  return ordered
}

export const selectPackages = (packages, filter) => {
  const packageMap = new Map(packages.map((pkg) => [pkg.name, pkg]))
  const topLevelPackages = filter
    ? packages
        .filter((pkg) => pkg.name.includes(filter) || pkg.directory.includes(filter))
        .sort((a, b) => a.name.localeCompare(b.name))
    : [...packages].sort((a, b) => a.name.localeCompare(b.name))

  if (topLevelPackages.length === 0) {
    throw new Error(`No packages matched filter "${filter}"`)
  }

  const publishNames = new Set()
  const visit = (name) => {
    if (publishNames.has(name)) {
      return
    }

    publishNames.add(name)
    for (const dependency of packageMap.get(name).internalDependencies) {
      visit(dependency)
    }
  }

  for (const pkg of topLevelPackages) {
    visit(pkg.name)
  }

  return {
    topLevelPackages,
    publishPackages: topologicallySortPackages([...publishNames].map((name) => packageMap.get(name)))
  }
}

export const assertNoWorkspaceProtocolReferences = (packageName, manifest) => {
  for (const field of runtimeDependencyFields) {
    for (const [dependency, version] of Object.entries(manifest[field] ?? {})) {
      if (typeof version === "string" && version.startsWith("workspace:")) {
        throw new Error(`${packageName} still contains a workspace protocol in ${field}.${dependency}`)
      }
    }
  }
}

export const collectResolvedExportSpecifiers = (packageDirectory, exportsField) => {
  const files = collectFiles(packageDirectory)
    .map((file) => (file.startsWith("./") ? file : `./${file}`))
    .sort()
  const specifiers = new Set()

  for (const entry of collectExportEntries(exportsField)) {
    if (entry.target === null) {
      continue
    }

    if (!entry.key.includes("*") && !entry.target.includes("*")) {
      const targetPath = entry.target.startsWith("./") ? entry.target.slice(2) : entry.target
      if (!Fs.existsSync(Path.join(packageDirectory, targetPath))) {
        throw new Error(`Export target ${entry.key} -> ${entry.target} does not exist in ${packageDirectory}`)
      }
      specifiers.add(entry.key)
      continue
    }

    const matcher = patternToRegExp(entry.target)
    const matches = files
      .map((file) => ({
        captures: matcher.exec(file),
        file
      }))
      .filter(({ captures }) => captures !== null)

    if (matches.length === 0) {
      throw new Error(`Export pattern ${entry.key} -> ${entry.target} did not match any files in ${packageDirectory}`)
    }

    for (const match of matches) {
      specifiers.add(replaceStars(entry.key, match.captures.slice(1)))
    }
  }

  return [...specifiers].sort()
}

export const assertPackageHasDist = (pkg) => {
  const distDirectory = Path.join(pkg.directory, "dist")
  if (!Fs.existsSync(distDirectory)) {
    throw new Error(`${pkg.name} is missing a dist directory at ${distDirectory}`)
  }

  const distFiles = collectFiles(distDirectory)
  if (distFiles.length === 0) {
    throw new Error(`${pkg.name} has an empty dist directory at ${distDirectory}`)
  }
}

export const assertPublishConfigExportsResolve = (pkg) => {
  const exportsField = pkg.manifest.publishConfig?.exports
  if (pkg.manifest.exports && exportsField === undefined) {
    throw new Error(`${pkg.name} is missing publishConfig.exports`)
  }

  if (exportsField !== undefined) {
    collectResolvedExportSpecifiers(pkg.directory, exportsField)
  }
}

export const toPackageSpecifier = (packageName, exportKey) =>
  exportKey === "." ? packageName : `${packageName}/${exportKey.slice(2)}`

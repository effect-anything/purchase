import * as ChildProcess from "node:child_process"
import * as Fs from "node:fs"
import * as Os from "node:os"
import * as Path from "node:path"
import { createRequire } from "node:module"
import process from "node:process"
const {
  assertNoWorkspaceProtocolReferences,
  assertPackageHasDist,
  assertPublishConfigExportsResolve,
  collectResolvedExportSpecifiers,
  collectWorkspacePackages,
  selectPackages,
  toPackageSpecifier
} = await import("./local-registry-lib.mjs")

const rootDirectory = Path.resolve(import.meta.dirname, "..")
const localRegistryDirectory = Path.join(rootDirectory, "tmp", "local-registry")

const parseArgs = (argv) => {
  const positionals = []
  const options = {}

  for (let index = 0; index < argv.length; index++) {
    const value = argv[index]

    if (!value.startsWith("--")) {
      positionals.push(value)
      continue
    }

    const key = value.slice(2)
    const next = argv[index + 1]
    if (next === undefined || next.startsWith("--")) {
      options[key] = true
      continue
    }

    options[key] = next
    index++
  }

  return { options, positionals }
}

const args = parseArgs(process.argv.slice(2))
const command = args.positionals[0] ?? "check"
const registryPort = Number(args.options.port ?? 4873)
const registryHost = args.options.host ?? "127.0.0.1"
const registryUrl = args.options.registry ?? `http://${registryHost}:${registryPort}`
const filter = typeof args.options.filter === "string" ? args.options.filter : undefined
const keepState = args.options["keep-state"] === true

const run = (command, commandArgs, options = {}) => {
  const result = ChildProcess.spawnSync(command, commandArgs, {
    cwd: rootDirectory,
    encoding: "utf8",
    stdio: "inherit",
    ...options
  })

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${commandArgs.join(" ")}`)
  }
}

const registryEnv = {
  ...process.env,
  NPM_CONFIG_PROVENANCE: "false",
  npm_config_provenance: "false",
  NPM_CONFIG_REGISTRY: registryUrl,
  npm_config_registry: registryUrl,
  npm_config_strict_peer_dependencies: "false"
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const waitForRegistry = async (child) => {
  const deadline = Date.now() + 30_000
  const url = new URL("/-/ping", registryUrl)

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Verdaccio exited before it became ready (exit code ${child.exitCode})`)
    }

    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // Keep polling until Verdaccio is ready.
    }

    await sleep(500)
  }

  throw new Error(`Timed out waiting for the local registry at ${registryUrl}`)
}

const startRegistry = async () => {
  const listenAddress = `${registryHost}:${registryPort}`
  const child = ChildProcess.spawn(
    "pnpm",
    ["exec", "verdaccio", "--config", "./scripts/verdaccio.yaml", "--listen", listenAddress],
    {
      cwd: rootDirectory,
      env: process.env,
      stdio: "inherit"
    }
  )

  await waitForRegistry(child)
  return child
}

const stopRegistry = async (child) => {
  if (child.exitCode !== null) {
    return
  }

  child.kill("SIGTERM")
  await new Promise((resolve) => child.once("exit", resolve))
}

const resetLocalRegistryState = () => {
  Fs.rmSync(localRegistryDirectory, { force: true, recursive: true })
}

const buildPackages = (packages) => {
  for (const pkg of packages) {
    console.log(`[build] ${pkg.name}`)
    run("pnpm", ["--filter", pkg.name, "run", "build"])
  }
}

const validateWorkspaceDistributions = (packages) => {
  for (const pkg of packages) {
    console.log(`[dist] ${pkg.name}`)
    assertPackageHasDist(pkg)
    assertPublishConfigExportsResolve(pkg)
  }
}

const publishPackages = (packages) => {
  for (const pkg of packages) {
    console.log(`[publish] ${pkg.name}@${pkg.version}`)
    run("pnpm", ["publish", pkg.directory, "--no-git-checks", "--no-provenance", "--tag", "local"], {
      env: registryEnv
    })
  }
}

const installInConsumer = (packages) => {
  const consumerDirectory = Fs.mkdtempSync(Path.join(Os.tmpdir(), "effect-x-local-registry-"))
  const cacheDirectory = Path.join(consumerDirectory, ".npm-cache")
  const storeDirectory = Path.join(consumerDirectory, ".pnpm-store")
  Fs.writeFileSync(
    Path.join(consumerDirectory, "package.json"),
    JSON.stringify(
      {
        name: "effect-x-local-registry-smoke",
        private: true,
        type: "module"
      },
      null,
      2
    )
  )

  const specs = packages.map((pkg) => `${pkg.name}@${pkg.version}`)
  console.log(`[smoke] installing ${specs.length} package(s) in ${consumerDirectory}`)
  run("pnpm", ["add", "--prefer-online", "--store-dir", storeDirectory, ...specs], {
    cwd: consumerDirectory,
    env: {
      ...registryEnv,
      NPM_CONFIG_CACHE: cacheDirectory,
      npm_config_cache: cacheDirectory
    }
  })

  return consumerDirectory
}

const findInstalledPackageDirectory = (consumerDirectory, packageName) => {
  const packageSegments = packageName.split("/")
  const topLevelDirectory = Path.join(consumerDirectory, "node_modules", ...packageSegments)

  if (Fs.existsSync(Path.join(topLevelDirectory, "package.json"))) {
    return topLevelDirectory
  }

  const pnpmDirectory = Path.join(consumerDirectory, "node_modules", ".pnpm")
  if (!Fs.existsSync(pnpmDirectory)) {
    return undefined
  }

  for (const entry of Fs.readdirSync(pnpmDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue
    }

    const candidate = Path.join(pnpmDirectory, entry.name, "node_modules", ...packageSegments)
    if (Fs.existsSync(Path.join(candidate, "package.json"))) {
      return candidate
    }
  }

  return undefined
}

const validateInstalledPackages = (packages, consumerDirectory) => {
  for (const pkg of packages) {
    const packageDirectory = findInstalledPackageDirectory(consumerDirectory, pkg.name)
    const packageJsonPath = packageDirectory ? Path.join(packageDirectory, "package.json") : undefined

    if (!packageJsonPath || !Fs.existsSync(packageJsonPath)) {
      throw new Error(`Expected ${pkg.name} to be installed in ${consumerDirectory}`)
    }

    const installedManifest = JSON.parse(Fs.readFileSync(packageJsonPath, "utf8"))
    if (installedManifest.version !== pkg.version) {
      throw new Error(`Expected ${pkg.name} to resolve to ${pkg.version}, got ${installedManifest.version}`)
    }

    assertNoWorkspaceProtocolReferences(pkg.name, installedManifest)
    const requireFromPackage = createRequire(packageJsonPath)

    for (const specifier of collectResolvedExportSpecifiers(packageDirectory, installedManifest.exports)) {
      requireFromPackage.resolve(toPackageSpecifier(pkg.name, specifier))
    }
  }
}

const workspacePackages = collectWorkspacePackages(rootDirectory)
const selection = selectPackages(workspacePackages, filter)

let registryProcess
let consumerDirectory

try {
  if (command === "check") {
    resetLocalRegistryState()
    if (filter) {
      buildPackages(selection.publishPackages)
    } else {
      console.log("[build] building workspace packages")
      run("pnpm", ["build"])
    }
    validateWorkspaceDistributions(selection.publishPackages)
    registryProcess = await startRegistry()
    publishPackages(selection.publishPackages)
    consumerDirectory = installInConsumer(selection.topLevelPackages)
    validateInstalledPackages(selection.publishPackages, consumerDirectory)
    console.log(`[done] published ${selection.publishPackages.length} package(s) to ${registryUrl}`)
  } else if (command === "publish") {
    publishPackages(selection.publishPackages)
    console.log(`[done] published ${selection.publishPackages.length} package(s) to ${registryUrl}`)
  } else if (command === "smoke") {
    consumerDirectory = installInConsumer(selection.topLevelPackages)
    validateInstalledPackages(selection.publishPackages, consumerDirectory)
    console.log(`[done] validated ${selection.publishPackages.length} package(s) from ${registryUrl}`)
  } else {
    throw new Error(`Unknown command "${command}"`)
  }
} catch (error) {
  if (consumerDirectory) {
    console.error(`[debug] consumer directory preserved at ${consumerDirectory}`)
  }

  throw error
} finally {
  if (registryProcess) {
    await stopRegistry(registryProcess)
  }

  if (consumerDirectory && !keepState) {
    Fs.rmSync(consumerDirectory, { force: true, recursive: true })
  }
}

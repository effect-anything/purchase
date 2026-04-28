import * as Fs from "node:fs"
import * as Os from "node:os"
import * as Path from "node:path"
import { afterEach, describe, expect, it } from "vitest"
const {
  assertNoWorkspaceProtocolReferences,
  assertPackageHasDist,
  assertPublishConfigExportsResolve,
  collectResolvedExportSpecifiers,
  selectPackages,
  topologicallySortPackages
} = await import("../local-registry-lib.mjs")

const temporaryDirectories: Array<string> = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    Fs.rmSync(directory, { force: true, recursive: true })
  }
})

describe("topologicallySortPackages", () => {
  it("orders dependencies before dependents", () => {
    const ordered = topologicallySortPackages([
      {
        directory: "/workspace/packages/form",
        internalDependencies: ["@effect-x/db", "@effect-x/atom-react"],
        manifest: {},
        name: "@effect-x/form",
        version: "0.0.1"
      },
      {
        directory: "/workspace/packages/atom-react",
        internalDependencies: [],
        manifest: {},
        name: "@effect-x/atom-react",
        version: "0.0.1"
      },
      {
        directory: "/workspace/packages/db",
        internalDependencies: [],
        manifest: {},
        name: "@effect-x/db",
        version: "0.1.0"
      }
    ])

    expect(ordered.map((pkg) => pkg.name)).toEqual(["@effect-x/atom-react", "@effect-x/db", "@effect-x/form"])
  })
})

describe("selectPackages", () => {
  it("includes the full internal dependency closure for a filter", () => {
    const selection = selectPackages(
      [
        {
          directory: "/workspace/packages/form",
          internalDependencies: ["@effect-x/db"],
          manifest: {},
          name: "@effect-x/form",
          version: "0.0.1"
        },
        {
          directory: "/workspace/packages/db",
          internalDependencies: ["@effect-x/sql-kysely"],
          manifest: {},
          name: "@effect-x/db",
          version: "0.1.0"
        },
        {
          directory: "/workspace/packages/sql/sql-kysely",
          internalDependencies: [],
          manifest: {},
          name: "@effect-x/sql-kysely",
          version: "0.1.0"
        }
      ],
      "@effect-x/form"
    )

    expect(selection.topLevelPackages.map((pkg) => pkg.name)).toEqual(["@effect-x/form"])
    expect(selection.publishPackages.map((pkg) => pkg.name)).toEqual([
      "@effect-x/sql-kysely",
      "@effect-x/db",
      "@effect-x/form"
    ])
  })
})

describe("assertNoWorkspaceProtocolReferences", () => {
  it("rejects published manifests that still contain workspace protocols", () => {
    expect(() =>
      assertNoWorkspaceProtocolReferences("@effect-x/form", {
        dependencies: {
          "@effect-x/db": "workspace:^"
        }
      })
    ).toThrow("@effect-x/form still contains a workspace protocol in dependencies.@effect-x/db")
  })
})

describe("collectResolvedExportSpecifiers", () => {
  it("expands wildcard exports against built files", () => {
    const directory = Fs.mkdtempSync(Path.join(Os.tmpdir(), "effect-x-local-registry-test-"))
    temporaryDirectories.push(directory)
    Fs.mkdirSync(Path.join(directory, "dist", "nested"), { recursive: true })
    Fs.writeFileSync(Path.join(directory, "dist", "index.js"), "")
    Fs.writeFileSync(Path.join(directory, "dist", "client.js"), "")
    Fs.writeFileSync(Path.join(directory, "dist", "nested", "leaf.js"), "")

    expect(
      collectResolvedExportSpecifiers(directory, {
        ".": "./dist/index.js",
        "./*": "./dist/*.js",
        "./nested/*": "./dist/nested/*.js",
        "./internal/*": null
      })
    ).toEqual([".", "./client", "./index", "./nested/leaf"])
  })
})

describe("dist validation", () => {
  it("requires dist to exist and contain files", () => {
    const directory = Fs.mkdtempSync(Path.join(Os.tmpdir(), "effect-x-local-registry-test-"))
    temporaryDirectories.push(directory)
    const pkg = {
      directory,
      internalDependencies: [],
      manifest: {},
      name: "@effect-x/example",
      version: "0.0.1"
    }

    expect(() => assertPackageHasDist(pkg)).toThrow(
      `@effect-x/example is missing a dist directory at ${directory}/dist`
    )

    Fs.mkdirSync(Path.join(directory, "dist"))
    expect(() => assertPackageHasDist(pkg)).toThrow(
      `@effect-x/example has an empty dist directory at ${directory}/dist`
    )

    Fs.writeFileSync(Path.join(directory, "dist", "index.js"), "")
    expect(() => assertPackageHasDist(pkg)).not.toThrow()
  })

  it("requires publishConfig.exports when source exports exist and validates patterns against dist", () => {
    const directory = Fs.mkdtempSync(Path.join(Os.tmpdir(), "effect-x-local-registry-test-"))
    temporaryDirectories.push(directory)
    Fs.mkdirSync(Path.join(directory, "dist"), { recursive: true })
    Fs.writeFileSync(Path.join(directory, "dist", "index.js"), "")

    expect(() =>
      assertPublishConfigExportsResolve({
        directory,
        internalDependencies: [],
        manifest: {
          exports: {
            ".": "./src/index.ts"
          }
        },
        name: "@effect-x/example",
        version: "0.0.1"
      })
    ).toThrow("@effect-x/example is missing publishConfig.exports")

    expect(() =>
      assertPublishConfigExportsResolve({
        directory,
        internalDependencies: [],
        manifest: {
          publishConfig: {
            exports: {
              ".": "./dist/missing.js"
            }
          }
        },
        name: "@effect-x/example",
        version: "0.0.1"
      })
    ).toThrow(`Export target . -> ./dist/missing.js does not exist in ${directory}`)

    expect(() =>
      assertPublishConfigExportsResolve({
        directory,
        internalDependencies: [],
        manifest: {
          publishConfig: {
            exports: {
              "./*": "./dist/*.mjs"
            }
          }
        },
        name: "@effect-x/example",
        version: "0.0.1"
      })
    ).toThrow("Export pattern ./* -> ./dist/*.mjs did not match any files")
  })
})

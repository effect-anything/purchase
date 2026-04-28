import { spawnSync } from "node:child_process"
import * as Fs from "node:fs"
import * as Os from "node:os"
import * as Path from "node:path"
import { fileURLToPath } from "node:url"
import { afterEach, describe, expect, it } from "vitest"

const scriptPath = fileURLToPath(new URL("../../../../scripts/fix-self-package-imports.mjs", import.meta.url))
const tempDirs = new Set<string>()

afterEach(() => {
  for (const tempDir of tempDirs) {
    Fs.rmSync(tempDir, { recursive: true, force: true })
  }
  tempDirs.clear()
})

describe("fix-self-package-imports script", () => {
  it("reports self-package imports in check mode and leaves external package imports untouched", () => {
    const tempDir = createFixturePackage()

    const result = runScript(["--check", tempDir])

    expect(result.status).toBe(1)
    expect(result.stdout).toContain("@effect-x/server/emailer/schema -> ./schema.ts")
    expect(result.stdout).toContain("@effect-x/server -> ../index.ts")
    expect(result.stdout).not.toContain("@effect-x/otel/session/session")
  })

  it("rewrites imports and re-exports in write mode", () => {
    const tempDir = createFixturePackage()

    const result = runScript(["--write", tempDir])

    expect(result.status).toBe(0)
    expect(result.stdout).toContain("Rewrote 3 self-package imports")

    const providerFile = Path.join(tempDir, "packages/server/src/emailer/provider.ts")
    const reexportFile = Path.join(tempDir, "packages/server/src/reexports.ts")

    expect(Fs.readFileSync(providerFile, "utf8")).toBe(
      [
        'import * as Schema from "./schema.ts"',
        'import * as Server from "../index.ts"',
        'import * as Session from "@effect-x/otel/session/session"',
        ""
      ].join("\n")
    )
    expect(Fs.readFileSync(reexportFile, "utf8")).toBe('export * from "./emailer/schema.ts"\n')
  })
})

function createFixturePackage() {
  const tempDir = Fs.mkdtempSync(Path.join(Os.tmpdir(), "effect-self-imports-"))
  tempDirs.add(tempDir)

  writeFile(
    tempDir,
    "packages/server/package.json",
    JSON.stringify({ name: "@effect-x/server", type: "module" }, null, 2) + "\n"
  )
  writeFile(tempDir, "packages/server/src/index.ts", "export const server = true\n")
  writeFile(tempDir, "packages/server/src/emailer/schema.ts", "export const schema = true\n")
  writeFile(
    tempDir,
    "packages/server/src/emailer/provider.ts",
    [
      'import * as Schema from "@effect-x/server/emailer/schema"',
      'import * as Server from "@effect-x/server"',
      'import * as Session from "@effect-x/otel/session/session"',
      ""
    ].join("\n")
  )
  writeFile(tempDir, "packages/server/src/reexports.ts", 'export * from "@effect-x/server/emailer/schema"\n')

  return tempDir
}

function writeFile(rootDir: string, relativePath: string, contents: string) {
  const filePath = Path.join(rootDir, relativePath)
  Fs.mkdirSync(Path.dirname(filePath), { recursive: true })
  Fs.writeFileSync(filePath, contents)
}

function runScript(args: Array<string>) {
  return spawnSync("node", [scriptPath, ...args], {
    encoding: "utf8"
  })
}

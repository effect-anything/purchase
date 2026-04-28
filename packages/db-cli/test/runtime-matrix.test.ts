import { NodeServices } from "@effect/platform-node"
import * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Path from "effect/Path"
import { describe, expect, it } from "vitest"

import type { DatabaseConfig } from "../src/shared.ts"
import * as Shared from "../src/shared.ts"
import * as Workspace from "../src/workspace.ts"

const matrix: Array<{
  readonly name: string
  readonly config: DatabaseConfig
}> = [
  {
    name: "browser sqlite",
    config: {
      runtime: "browser",
      provider: "sqlite"
    }
  },
  {
    name: "d1 sqlite",
    config: {
      runtime: "d1",
      provider: "sqlite"
    }
  },
  {
    name: "server sqlite",
    config: {
      runtime: "server",
      provider: "sqlite",
      url: "file:./dev.db"
    }
  },
  {
    name: "server postgresql",
    config: {
      runtime: "server",
      provider: "postgresql",
      url: "postgresql://user:pass@localhost:5432/app"
    }
  },
  {
    name: "server mysql",
    config: {
      runtime: "server",
      provider: "mysql",
      url: "mysql://user:pass@localhost:3306/app"
    }
  }
]

const makeWorkspaceFixture = Effect.fnUntraced(function* (config: DatabaseConfig) {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path
  const cwd = yield* fs.makeTempDirectory()
  const project = "apps/web"
  const projectPath = path.join(cwd, project)
  const dbDir = path.join(projectPath, "db")

  yield* fs.makeDirectory(dbDir, { recursive: true })
  yield* fs.writeFileString(
    path.join(projectPath, "tsconfig.app.json"),
    JSON.stringify({
      compilerOptions: {
        module: "NodeNext",
        moduleResolution: "NodeNext",
        target: "ES2022",
        strict: true
      }
    })
  )
  yield* fs.writeFileString(
    path.join(dbDir, "tables.ts"),
    [`export const tables = {}`, `export const config = ${JSON.stringify(config)}`, ""].join("\n")
  )

  return yield* Workspace.make({ cwd, project })
})

describe("runtime/provider matrix", () => {
  for (const entry of matrix) {
    it(`detects ${entry.name}`, () =>
      Effect.runPromise(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem
          const workspace = yield* makeWorkspaceFixture(entry.config)
          const detected = yield* Shared.detectDatabase(workspace)

          expect(detected.config).toEqual(entry.config)
          expect(detected.dbDir).toBe(`${workspace.projectPath}/db`)
          expect(yield* fs.exists(detected.migrationsDir)).toBe(true)
        }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
      ))
  }

  it("fails clearly when the project has no database tables module", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem
        const path = yield* Path.Path
        const cwd = yield* fs.makeTempDirectory()
        const project = "apps/workers"
        const projectPath = path.join(cwd, project)

        yield* fs.makeDirectory(projectPath, { recursive: true })
        yield* fs.writeFileString(
          path.join(projectPath, "tsconfig.app.json"),
          JSON.stringify({
            compilerOptions: {
              module: "NodeNext",
              moduleResolution: "NodeNext",
              target: "ES2022",
              strict: true
            }
          })
        )

        const workspace = yield* Workspace.make({ cwd, project })
        const exit = yield* Shared.detectDatabase(workspace).pipe(Effect.exit)

        expect(exit._tag).toBe("Failure")
        if (exit._tag === "Failure") {
          expect(String(Cause.squash(exit.cause))).toContain("No database configured for workers")
        }
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer))
    ))
})

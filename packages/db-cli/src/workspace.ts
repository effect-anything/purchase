import * as Path from "effect/Path"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as nodePath from "node:path"

const projectPath = (workspace: Workspace) =>
  nodePath.isAbsolute(workspace.project) ? workspace.project : nodePath.resolve(workspace.cwd, workspace.project)

const projectName = (workspace: Workspace) => nodePath.basename(projectPath(workspace))

export class Workspace extends Data.TaggedClass("Workspace")<{
  readonly cwd: string
  readonly project: string
}> {
  get projectPath() {
    return projectPath(this)
  }

  get projectName() {
    return projectName(this)
  }
}

export const make = Effect.fn("workspace.make")(function* (options: {
  readonly cwd: string
  readonly project: string
}) {
  const path = yield* Path.Path
  const cwd = path.isAbsolute(options.cwd) ? options.cwd : path.resolve(process.cwd(), options.cwd)

  return new Workspace({
    cwd,
    project: options.project
  })
})

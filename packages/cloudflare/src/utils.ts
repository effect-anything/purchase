import * as fs from "node:fs"
import * as path from "node:path"

const isWorkspaceRoot = (dir: string) =>
  fs.existsSync(path.join(dir, "pnpm-workspace.yaml")) || fs.existsSync(path.join(dir, "nx.json"))

export const findWorkspaceRoot = (cwd: string): { dir: string } | null => {
  let current = path.resolve(cwd)

  while (true) {
    if (isWorkspaceRoot(current)) {
      return { dir: current }
    }

    const parent = path.dirname(current)

    if (parent === current) {
      return null
    }

    current = parent
  }
}

export const resolveWorkspaceRoot = (cwd: string) => {
  const resolved = findWorkspaceRoot(cwd)

  if (!resolved) {
    throw new Error(`Could not find workspace root from ${cwd}`)
  }

  return resolved.dir
}

export const workspaceRoot = resolveWorkspaceRoot(process.cwd())

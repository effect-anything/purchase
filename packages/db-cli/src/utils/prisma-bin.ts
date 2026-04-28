import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const moduleDir = path.dirname(fileURLToPath(import.meta.url))

export const resolvePrismaCommand = (): ReadonlyArray<string> => {
  if (process.env.XDEV_DB_CLI_PRISMA_BIN) {
    return [process.env.XDEV_DB_CLI_PRISMA_BIN]
  }

  const vendoredPrismaCandidates = [
    path.resolve(moduleDir, "vendor/node_modules/prisma/build/index.js"),
    path.resolve(moduleDir, "../vendor/node_modules/prisma/build/index.js")
  ]
  const vendoredPrisma = vendoredPrismaCandidates.find((candidate) => fs.existsSync(candidate))

  if (vendoredPrisma) {
    return [process.execPath, vendoredPrisma]
  }

  return [path.resolve(moduleDir, "../../node_modules/.bin/prisma")]
}

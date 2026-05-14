import { existsSync, readFileSync } from "node:fs"

const parseDotEnvLine = (line: string): readonly [string, string] | undefined => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) {
    return undefined
  }

  const equalsIndex = trimmed.indexOf("=")
  if (equalsIndex <= 0) {
    return undefined
  }

  const key = trimmed.slice(0, equalsIndex).trim()
  let value = trimmed.slice(equalsIndex + 1).trim()
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1)
  }

  return [key, value]
}

export const loadE2eEnv = (paths: ReadonlyArray<string> = [".env.local", ".env"]) => {
  for (const path of paths) {
    if (!existsSync(path)) {
      continue
    }

    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const entry = parseDotEnvLine(line)
      if (!entry) {
        continue
      }

      const [key, value] = entry
      process.env[key] ??= value
    }
  }
}

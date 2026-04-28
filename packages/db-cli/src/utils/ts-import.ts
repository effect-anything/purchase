import nodePath from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import { opaqueImport } from "./opaque-import.ts"

// oxlint-disable-next-line typescript/consistent-type-imports
type TsImport = typeof import("tsx/esm/api").tsImport
type TsImportOptions = Parameters<TsImport>[1]

const nativeImportExtensions = new Set([".js", ".mjs", ".cjs"])
let tsImportPromise: Promise<TsImport> | undefined

const formatErrorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error))

const loadTsImport = () =>
  // oxlint-disable-next-line typescript/consistent-type-imports
  (tsImportPromise ??= opaqueImport<typeof import("tsx/esm/api")>("tsx/esm/api")
    .catch(() => import("tsx/esm/api"))
    .then((module) => module.tsImport))

const resolveParentPath = (options?: TsImportOptions) => {
  const parentURL = typeof options === "string" ? options : options?.parentURL

  if (!parentURL || !parentURL.startsWith("file:")) {
    return undefined
  }

  return fileURLToPath(parentURL)
}

const resolveModulePath = (modulePath: string, options?: TsImportOptions) => {
  if (nodePath.isAbsolute(modulePath)) {
    return modulePath
  }

  const parentPath = resolveParentPath(options)
  return parentPath ? nodePath.resolve(nodePath.dirname(parentPath), modulePath) : nodePath.resolve(modulePath)
}

export const importLocalModule = async <T>(modulePath: string, options?: TsImportOptions): Promise<T> => {
  const resolvedModulePath = resolveModulePath(modulePath, options)
  const extension = nodePath.extname(resolvedModulePath)
  const moduleUrl = pathToFileURL(resolvedModulePath).href

  if (nativeImportExtensions.has(extension)) {
    return (await import(moduleUrl)) as T
  }

  let nativeImportError: unknown

  const bunRuntime = (globalThis as { Bun?: unknown }).Bun

  if (bunRuntime) {
    try {
      return (await import(moduleUrl)) as T
    } catch (error) {
      nativeImportError = error
      // Bun cannot resolve some workspace-local TS imports that rely on tsconfig paths.
    }
  }

  const tsImport = await loadTsImport()

  try {
    return (await tsImport(resolvedModulePath, options ?? moduleUrl)) as T
  } catch (error) {
    if (nativeImportError) {
      throw new Error(
        `Failed to import local module ${resolvedModulePath}. Native import also failed: ${formatErrorMessage(nativeImportError)}`,
        {
          cause: error
        }
      )
    }

    throw error
  }
}

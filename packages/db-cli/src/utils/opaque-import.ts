// Keep runtime-discovered module specifiers opaque to bundlers.
const importOpaque = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<unknown>

export const opaqueImport = <T>(specifier: string) => importOpaque(specifier) as Promise<T>

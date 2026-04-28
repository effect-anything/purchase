import type { ToasterMethods } from "./toaster.ts"

import { useToasterContext } from "./provider.tsx"

export interface UseToasterReturn extends ToasterMethods {}

export const useToaster = (): UseToasterReturn => {
  const toaster = useToasterContext()

  return toaster
}

import { DestroyVaultWorkflow } from "./destroy-vault.ts"

export const workflows = {
  DestroyVaultWorkflow
}

declare global {
  type WorkflowsBinding = typeof workflows
}

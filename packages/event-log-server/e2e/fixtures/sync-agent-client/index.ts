import * as SyncAgentClient from "../../../src/cloudflare/SyncAgentClient.ts"

import { Config } from "../config.ts"

const SyncAgentClientDurableObjectBase = SyncAgentClient.makeDurableObject({
  syncProxyStorageBinding: Config.syncStorageProxyBinding,
  syncServerBinding: Config.syncServerBinding,
  events: []
}) as new (ctx: DurableObjectState, env: any) => DurableObject

export class SyncAgentClientDurableObject extends SyncAgentClientDurableObjectBase {
  async onInitialize(): Promise<void> {}
}

export default SyncAgentClient.makeWorker({
  rpcPath: Config.rpcPath,
  durableObjectBinding: Config.syncAgentClientDurableObject
})

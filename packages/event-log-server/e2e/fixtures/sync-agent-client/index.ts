import * as SyncAgentClient from "../../../src/cloudflare/SyncAgentClient.ts"

import { Config } from "../config.ts"

export class SyncAgentClientDurableObject extends SyncAgentClient.makeDurableObject({
  syncProxyStorageBinding: Config.syncStorageProxyBinding,
  syncServerBinding: Config.syncServerBinding,
  events: []
}) {
  async onInitialize(): Promise<void> {}
}

export default SyncAgentClient.makeWorker({
  rpcPath: Config.rpcPath,
  durableObjectBinding: Config.syncAgentClientDurableObject
})

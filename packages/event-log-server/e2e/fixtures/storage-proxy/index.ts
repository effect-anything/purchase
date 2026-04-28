import * as SyncStorageProxy from "../../../src/cloudflare/SyncStorageProxy.ts"

import { Config } from "../config.ts"

const SyncStorageProxyDurableObjectBase = SyncStorageProxy.makeDurableObject({}) as new (
  ctx: DurableObjectState,
  env: any
) => DurableObject

export class SyncStorageProxyDurableObject extends SyncStorageProxyDurableObjectBase {
  async onInitialize(): Promise<void> {}
}

export default SyncStorageProxy.makeWorker({
  rpcPath: Config.rpcPath,
  durableObjectBinding: Config.syncStorageProxyDurableObject
})

import * as SyncStorageProxy from "../../../src/cloudflare/SyncStorageProxy.ts"

import { Config } from "../config.ts"

export class SyncStorageProxyDurableObject extends SyncStorageProxy.makeDurableObject({}) {
  async onInitialize(): Promise<void> {}
}

export default SyncStorageProxy.makeWorker({
  rpcPath: Config.rpcPath,
  durableObjectBinding: Config.syncStorageProxyDurableObject
})

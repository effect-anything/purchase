import type * as EventLogEncryption from "./EventLogEncryption.ts"
import type * as Effect from "effect/Effect"
import type * as Mailbox from "effect/Mailbox"
import type * as Scope from "effect/Scope"

/**
 * @since 1.0.0
 */
import { EncryptedDEK } from "./Crypto.ts"
import * as EventJournal from "./EventJournal.ts"
import * as MsgPack from "./MsgPack.ts"
import * as Context from "effect/Context"
import * as Schema from "effect/Schema"
import * as Uuid from "uuid"

/**
 * @since 1.0.0
 * @category storage
 */
export class PersistedEntry extends Schema.Class<PersistedEntry>("@effect-x/event-log/EventLogServer/PersistedEntry")({
  entryId: EventJournal.EntryId,
  iv: Schema.Uint8ArrayFromSelf,
  encryptedEntry: Schema.Uint8ArrayFromSelf,
  encryptedDEK: EncryptedDEK
}) {
  /**
   * @since 1.0.0
   */
  static fromMsgPack = MsgPack.schema(PersistedEntry)

  /**
   * @since 1.0.0
   */
  static encode = Schema.encodeSync(this.fromMsgPack)

  /**
   * @since 1.0.0
   */
  get entryIdString(): string {
    return Uuid.stringify(this.entryId)
  }
}

/**
 * @since 1.0.0
 * @category storage
 */
export class Storage extends Context.Tag("@effect-x/event-log/EventLogServer/Storage")<
  Storage,
  {
    readonly getId: Effect.Effect<EventJournal.RemoteId>
    readonly write: (
      entries: ReadonlyArray<PersistedEntry>
    ) => Effect.Effect<ReadonlyArray<EventLogEncryption.EncryptedRemoteEntry>>
    readonly entries: (startSequence: number) => Effect.Effect<ReadonlyArray<EventLogEncryption.EncryptedRemoteEntry>>
    readonly changes: (
      startSequence: number
    ) => Effect.Effect<Mailbox.ReadonlyMailbox<EventLogEncryption.EncryptedRemoteEntry>, never, Scope.Scope>
  }
>() {}

type ILogRecord = {
  /** LogRecord traceId */
  traceId?: string | Uint8Array
  /** LogRecord spanId */
  spanId?: string | Uint8Array
}

export type ResourceLogsInput = Array<{
  scopeLogs: Array<{ logRecords: Array<ILogRecord> }>
}>

type ISpanLink = {
  traceId?: string | Uint8Array
  spanId?: string | Uint8Array
  attributes?: Array<any>
  droppedAttributesCount?: number
}

type ISpan = {
  traceId?: string | Uint8Array
  spanId?: string | Uint8Array
  links?: Array<ISpanLink>
  [key: string]: any
}

export type ResourceSpansInput = Array<{
  scopeSpans: Array<{ spans: Array<ISpan> }>
}>

/**
 * Fixes OpenTelemetry logs by removing "noop" or invalid trace/span IDs.
 */
export function removeInvalidOtelIds(logsInput: ResourceLogsInput): ResourceLogsInput {
  logsInput.forEach((resourceLog) => {
    resourceLog.scopeLogs.forEach((scopeLog) => {
      scopeLog.logRecords.forEach((logRecord) => {
        // Check if traceId is invalid ("noop" or potentially other invalid forms)
        const isTraceIdInvalid =
          logRecord.traceId === "noop" ||
          (typeof logRecord.traceId === "string" && logRecord.traceId.length > 0 && logRecord.traceId.length !== 32) ||
          (logRecord.traceId instanceof Uint8Array && logRecord.traceId.length !== 16)

        if (isTraceIdInvalid) {
          // Set to undefined or delete the property
          delete logRecord.traceId
        }

        // Check if spanId is invalid ("noop" or potentially other invalid forms)
        const isSpanIdInvalid =
          logRecord.spanId === "noop" ||
          (typeof logRecord.spanId === "string" && logRecord.spanId.length > 0 && logRecord.spanId.length !== 16) ||
          (logRecord.spanId instanceof Uint8Array && logRecord.spanId.length !== 8)

        if (isSpanIdInvalid) {
          // Set to undefined or delete the property
          delete logRecord.spanId
        }
      })
    })
  })

  return logsInput
}

/**
 * Fixes OpenTelemetry traces by removing invalid trace/span IDs from links.
 */
export function removeInvalidOtelIdsFromTraces(tracesInput: ResourceSpansInput): ResourceSpansInput {
  tracesInput.forEach((resourceSpan) => {
    resourceSpan.scopeSpans.forEach((scopeSpan) => {
      scopeSpan.spans.forEach((span) => {
        if (span.links && Array.isArray(span.links)) {
          // Filter out links with invalid traceId or spanId
          span.links = span.links.filter((link) => {
            const isTraceIdValid =
              link.traceId !== "noop" &&
              (typeof link.traceId === "string" ? link.traceId.length === 32 : true) &&
              (link.traceId instanceof Uint8Array ? link.traceId.length === 16 : true)

            const isSpanIdValid =
              link.spanId !== "noop" &&
              (typeof link.spanId === "string" ? link.spanId.length === 16 : true) &&
              (link.spanId instanceof Uint8Array ? link.spanId.length === 8 : true)

            return isTraceIdValid && isSpanIdValid
          })
        }
      })
    })
  })

  return tracesInput
}

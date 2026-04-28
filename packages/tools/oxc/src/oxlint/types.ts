export interface CreateRule {
  readonly meta?: {
    readonly type?: string
    readonly docs?: {
      readonly description?: string
    }
    readonly fixable?: string
    readonly schema?: unknown
  }
  readonly create: (context: RuleContext) => Visitor
}

export interface RuleContext {
  readonly filename: string
  readonly options: ReadonlyArray<unknown>
  readonly report: (report: {
    readonly node: unknown
    readonly message: string
    readonly fix?: (fixer: Fixer) => unknown
  }) => void
}

export interface Fixer {
  readonly replaceText: (node: unknown, text: string) => unknown
  readonly replaceTextRange: (range: unknown, text: string) => unknown
}

export type Visitor = Record<string, ((node: any) => void) | undefined>

export namespace ESTree {
  export type Class = any
  export type ExportAllDeclaration = any
  export type ExportNamedDeclaration = any
  export type Expression = any
  export type ImportDeclaration = any
  export type ImportNamespaceSpecifier = any
  export type ImportSpecifier = any
  export type StringLiteral = any
}

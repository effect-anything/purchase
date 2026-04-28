import * as PrismaInternal from "@prisma/internals"

const { formatSchema } = ((PrismaInternal as any).default as typeof PrismaInternal) ?? PrismaInternal

export { formatSchema }

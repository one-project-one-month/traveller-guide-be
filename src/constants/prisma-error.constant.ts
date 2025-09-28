export const PrismaError = {
    UniqueConstraintViolation: 'P2002',
    ForeignKeyViolation: 'P2003',
    RecordDoesNotExist: 'P2025',
    // ... add the rest from the Prisma docs
} as const;

export type PrismaErrorCode = (typeof PrismaError)[keyof typeof PrismaError];

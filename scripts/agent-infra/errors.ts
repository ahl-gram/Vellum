export class GenerationError extends Error {}

export const messageOf = (error: unknown): string => (error instanceof Error ? error.message : String(error));

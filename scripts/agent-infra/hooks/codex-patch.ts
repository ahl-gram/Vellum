import type { FileChange } from "./request.ts";

export type DecodedPatch = { readonly files: readonly FileChange[] } | { readonly error: string };

export const decodePatch = (_patch: string): DecodedPatch => ({ files: [] });

export interface Signature {
  readonly stamp: Readonly<Record<string, string>>;
  readonly label: string | null;
  readonly layers: readonly string[];
}
export interface PictureEntry {
  readonly file: string;
  readonly signature: Signature;
}
export type PictureManifest = Readonly<Record<string, PictureEntry>>;

export function chartSignature(_svg: string): Signature {
  return { stamp: {}, label: null, layers: [] };
}

export function signatureFaults(_want: Signature, _got: Signature | null): readonly string[] {
  return [];
}

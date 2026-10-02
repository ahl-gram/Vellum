export type ShotClip = { readonly x: number; readonly y: number; readonly width: number; readonly height: number; readonly scale?: number };

export type Shot = {
  readonly url: string;
  readonly width: number;
  readonly height: number;
  readonly mobile: boolean;
  readonly out: string;
  readonly waitMs?: number;
  readonly script?: string;
  readonly scriptWaitMs?: number;
  readonly probe?: string;
  readonly full?: boolean;
  readonly clip?: ShotClip;
};

export type ShotResult = {
  readonly out: string;
  readonly url: string;
  readonly viewport: { readonly innerWidth: number; readonly innerHeight: number };
  readonly probe: string | null;
  readonly http4xx: readonly string[];
  readonly consoleErrors: readonly string[];
};

export type CaptureParams = {
  readonly format: "png";
  readonly captureBeyondViewport: boolean;
  readonly clip: { readonly x: number; readonly y: number; readonly width: number; readonly height: number; readonly scale: number };
};

export const FULL_PAGE_CAP = 16000;

export function captureParams(shot: Shot, documentHeight: number): CaptureParams {
  return { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: shot.width, height: documentHeight, scale: 1 } };
}

export function parseShots(json: unknown): Shot[] {
  return json as Shot[];
}

export function readProbe(value: unknown, _out: string): string {
  return String(value);
}

export const servedUrl = (url: string, _port: number): string => url;

export function shootAll(_shots: readonly Shot[], _options: { readonly site?: string; readonly reducedMotion?: boolean } = {}): Promise<ShotResult[]> {
  return Promise.resolve([]);
}

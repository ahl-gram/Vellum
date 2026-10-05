export const DESK_NOTICE_KEY = "vellum.desk-notice.v1";
const FLOOR = 1024;

type Listens = { addEventListener(type: string, fn: () => void): void };
export type NoticeHost = {
  readonly classList: { add(name: string): void; remove(name: string): void };
  readonly style: { setProperty(name: string, value: string): void };
  readonly button: Listens | null;
};
export type NoticeView = Listens & { readonly scale: number };

export function noticeDue(scale: number, innerHeight: number): boolean {
  return scale < 1 && Math.round(innerHeight * scale) < FLOOR;
}

export function dismissed(getStorage: () => Storage): boolean {
  try {
    return getStorage().getItem(DESK_NOTICE_KEY) !== null;
  } catch {
    return false;
  }
}

export function dismiss(getStorage: () => Storage): void {
  try {
    getStorage().setItem(DESK_NOTICE_KEY, "1");
  } catch {
    /* unwritable storage: shown again next time */
  }
}

export function bindNotice(notice: NoticeHost, view: NoticeView, innerHeight: number, getStorage: () => Storage): void {
  if (dismissed(getStorage) || !noticeDue(view.scale, innerHeight)) return;
  const fit = (): void => notice.style.setProperty("--fit", String(1 / view.scale));
  fit();
  view.addEventListener("resize", fit);
  notice.classList.add("on");
  notice.button?.addEventListener("click", () => {
    notice.classList.remove("on");
    dismiss(getStorage);
  });
}

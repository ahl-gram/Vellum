// The hold (Issue #751): one press with two moments; while it is lit the Glass drafts no finer survey and takes nothing away.
export const HELD_MARK = "held";
const SEPARATOR = " · ";

export function markCaption(text: string, held: boolean): string {
  const marked = text === HELD_MARK || text.endsWith(SEPARATOR + HELD_MARK);
  if (held) {
    if (marked) return text;
    return text === "" ? HELD_MARK : text + SEPARATOR + HELD_MARK;
  }
  if (text === HELD_MARK) return "";
  return marked ? text.slice(0, text.length - (SEPARATOR + HELD_MARK).length) : text;
}

export interface HoldPress {
  setAttribute(name: string, value: string): void;
  addEventListener(type: "click", fn: () => void): void;
}

export interface HoldDeps {
  readonly press: HoldPress;
  readonly readCaption: () => string;
  readonly setCaption: (text: string) => void;
  readonly onHold: () => void;
  readonly onLetGo: () => void;
  readonly onRelease: () => void;
}

export interface Hold {
  readonly held: () => boolean;
  readonly release: () => void;
}

export function createHold(deps: HoldDeps): Hold {
  let held = false;
  const settle = (next: boolean): void => {
    held = next;
    deps.press.setAttribute("aria-pressed", String(next));
  };
  const unmark = (): void => deps.setCaption(markCaption(deps.readCaption(), false));
  deps.press.setAttribute("aria-pressed", "false");
  deps.press.addEventListener("click", () => {
    if (!held) {
      settle(true);
      deps.onHold();
      deps.setCaption(markCaption(deps.readCaption(), true));
      return;
    }
    settle(false);
    unmark();
    deps.onLetGo();
  });
  return {
    held: () => held,
    release() {
      if (!held) return;
      settle(false);
      unmark();
      deps.onRelease();
    },
  };
}

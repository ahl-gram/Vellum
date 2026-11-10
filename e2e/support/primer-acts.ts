// The Primer check does what a step has the reader do (Issue #1250): a press at the control's own point, a key and a typed box with real input, and a slider's or a list's value set in the page.
import type { Act } from "../../src/site/shared/primer/shape.ts";
import { sendClick, sendKey } from "./input.ts";
import { keyOf, pressPoint } from "./primer-judge.ts";
import { AIM, CHOSEN, FIELD, FIRST_ENTRY, FOCUS, PICK_OPTION, PRESENT, SET_VALUE } from "./primer-reads.ts";
import type { PrimerKit } from "./primer-walk.ts";

const press = async (k: PrimerKit, act: Extract<Act, { kind: "click" }>): Promise<void> => {
  const aim = await k.evaluate(AIM(act.css, act.nth ?? 0));
  if (aim === null || aim.box.w === 0 || aim.box.h === 0) throw new Error(`${act.css} has no box to press`);
  const p = pressPoint(aim.box, aim.clip, act.at);
  await sendClick(k.send, Math.round(p.x), Math.round(p.y));
};

const reachable = async (k: PrimerKit, css: string, label: string): Promise<void> => {
  const state = await k.reachOf(css);
  if (state !== "reachable") throw new Error(`${label}: ${css} is ${state}, so no reader could set it`);
};

const set = async (k: PrimerKit, act: Extract<Act, { kind: "set" }>, label: string): Promise<void> => {
  const f = await k.evaluate(FIELD(act.css));
  if (f === null) throw new Error(`${label}: no ${act.css} to set`);
  if (f.type === "range") {
    if (f.value !== act.value) {
      await reachable(k, act.css, label);
      const before = await k.evaluate(k.room().rest);
      await k.evaluate(SET_VALUE(act.css, act.value, act.release !== false));
      await k.rest(before, label);
    }
  } else {
    // A box is focused in the page and its own words selected, so the typed words replace them, as `pickTexas` in `e2e/suites/broadside/grow.ts` types.
    if (!(await k.evaluate(FOCUS(act.css, true)))) throw new Error(`${label}: ${act.css} takes no focus`);
    await k.send("Input.insertText", { text: act.value });
  }
  const landed = (await k.evaluate(FIELD(act.css)))?.value;
  if (landed !== act.value)
    throw new Error(`${label}: ${act.css} landed at ${String(landed)}, not the ${act.value} the act names`);
};

const choose = async (k: PrimerKit, act: Extract<Act, { kind: "choose" }>, label: string): Promise<void> => {
  if ((await k.evaluate(CHOSEN(act.css))).text !== act.option) {
    await reachable(k, act.css, label);
    const before = await k.evaluate(k.room().rest);
    if (!(await k.evaluate(PICK_OPTION(act.css, act.option))))
      throw new Error(`${label}: ${act.css} offers no ${act.option}`);
    await k.rest(before, label);
  }
  const chosen = (await k.evaluate(CHOSEN(act.css))).text;
  if (chosen !== act.option)
    throw new Error(`${label}: ${act.css} shows ${chosen}, not the ${act.option} the act names`);
};

const until = (k: PrimerKit, css: string, label: string): Promise<unknown> =>
  k.settle(PRESENT(css), (d) => d.here, `${label}: ${css} comes`, k.waitTries);

export async function perform(k: PrimerKit, act: Act, label: string): Promise<void> {
  const at = `${label} ${act.kind} ${act.css}`;
  switch (act.kind) {
    case "click": {
      const before = await k.evaluate(k.room().rest);
      await press(k, act);
      await k.rest(before, at);
      return;
    }
    case "set":
      return set(k, act, at);
    case "choose":
      return choose(k, act, at);
    case "key": {
      const before = await k.evaluate(k.room().rest);
      if (!(await k.evaluate(FOCUS(act.css, false)))) throw new Error(`${at}: ${act.css} takes no focus`);
      const c = keyOf(act.key);
      await sendKey(k.send, c.key, c.code, c.vk, c.text === "" ? {} : { text: c.text });
      await k.rest(before, at);
      return;
    }
    case "pick": {
      const first = k.room().pickFirst;
      if (first === null) throw new Error(`${at}: this room names no search list to pick from`);
      const before = await k.evaluate(k.room().rest);
      if (!(await k.evaluate(FOCUS(act.css, true)))) throw new Error(`${at}: ${act.css} takes no focus`);
      await k.send("Input.insertText", { text: act.text });
      await k.settle(FIRST_ENTRY(first), (d) => d.name === act.name, `${at}: the list offers ${act.name}`);
      const enter = keyOf("Enter");
      await sendKey(k.send, enter.key, enter.code, enter.vk);
      await k.rest(before, at);
      return;
    }
    case "repeat": {
      for (let i = 0; i < k.room().repeatCap && !(await k.evaluate(PRESENT(act.until))).here; i++) {
        const before = await k.evaluate(k.room().rest);
        await press(k, { kind: "click", css: act.css });
        await k.rest(before, `${at} press ${i + 1}`);
      }
      await until(k, act.until, at);
      await k.rest(null, at);
      return;
    }
    case "wait":
      await until(k, act.css, at);
      await k.rest(null, at);
      return;
  }
}

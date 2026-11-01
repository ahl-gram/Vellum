import { chartNumberLine, QUIET_LINE, type Account } from "./account.ts";

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function item(text: string, word?: string): HTMLLIElement {
  const li = document.createElement("li");
  if (word === undefined) li.textContent = text;
  else li.append(element("span", "wr-word", word), document.createTextNode(` ${text}`));
  return li;
}

export function renderAccount(box: HTMLElement, account: Account): void {
  const parts: HTMLElement[] = [];
  if (account.quiet) parts.push(element("p", "wr-quiet", QUIET_LINE));
  else {
    const steered = element("ul", "wr-steered");
    steered.append(...account.steered.map((line) => item(`set ${line.set}`, line.phrase)));
    parts.push(element("p", "wr-head", "The words that steered"), steered);
  }
  if (account.contested.length > 0) {
    const contested = element("ul", "wr-contested");
    contested.append(
      item(`${account.contested.join(", ")}: each cancelled the other, so they count toward the chart number`),
    );
    parts.push(element("p", "wr-head", "The words that disagreed"), contested);
  }
  parts.push(element("p", "wr-head", "The chart number"), element("p", "wr-residual", chartNumberLine(account)));
  box.replaceChildren(...parts);
}

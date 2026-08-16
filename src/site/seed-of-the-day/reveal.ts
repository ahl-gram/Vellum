import { revealFormerLine, type Reveal } from "../../world/daily-hunt.ts";

export function renderReveal(host: HTMLElement, r: Reveal): void {
  host.replaceChildren();
  const head = document.createElement("strong");
  head.textContent = `${r.name}, founded in the year ${r.founded}.`;
  host.append(head);
  const formerLine = revealFormerLine(r);
  if (formerLine) {
    const former = document.createElement("p");
    former.className = "reveal-former";
    former.textContent = formerLine;
    host.append(former);
  }
  const body = document.createElement("p");
  body.textContent = r.line;
  host.append(body);
}

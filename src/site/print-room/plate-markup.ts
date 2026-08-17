// The Print Room's bound-atlas plate markup (#379): the string-in/string-out half of
// bound-atlas.ts, split out so a Node with no DOM can import it and a one-second unit test
// can pin it. The host mints the blob URL and tracks it for revocation, then hands the href
// in; nothing here touches the DOM, and that is the whole point of the file.
import { escapeXml } from "../../render/svg.ts";

export function plateFigure(href: string, caption: string, cls = ""): string {
  const c = escapeXml(caption);
  const classAttr = cls ? ` class="${cls}"` : "";
  return (
    `<figure${classAttr}><a href="${href}" target="_blank" rel="noopener">` +
    `<img src="${href}" alt="${c}"></a><figcaption>${c}</figcaption></figure>`
  );
}

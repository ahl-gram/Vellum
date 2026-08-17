// The Print Room's bound-atlas plate markup (#379): the string-in/string-out half of
// bound-atlas.ts, split out so a Node with no DOM can import it and a one-second unit test
// can pin it. The host mints the blob URL and holds it for revocation, then hands the href in.
import { escapeXml } from "../../render/svg.ts";

export function plateFigure(href: string, caption: string, cls = ""): string {
  const h = escapeXml(href);
  const c = escapeXml(caption);
  const classAttr = cls ? ` class="${escapeXml(cls)}"` : "";
  return (
    `<figure${classAttr}><a href="${h}" target="_blank" rel="noopener">` +
    `<img src="${h}" alt="${c}"></a><figcaption>${c}</figcaption></figure>`
  );
}

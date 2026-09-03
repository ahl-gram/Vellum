// The Print Room's bound-atlas plate markup (#379): the string-in/string-out half of bound-atlas.ts; the host mints the blob URL and holds it for revocation, then hands the href in. No link on the plate since #465 ruling 1: seat d put the copy off screen, and the download links its own plates.
import { escapeXml } from "../../render/svg.ts";

export function plateFigure(href: string, caption: string, cls = ""): string {
  const h = escapeXml(href);
  const c = escapeXml(caption);
  const classAttr = cls ? ` class="${escapeXml(cls)}"` : "";
  return `<figure${classAttr}><img src="${h}" alt="${c}"><figcaption>${c}</figcaption></figure>`;
}

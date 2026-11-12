import { faults, same, text } from "../built-dom.ts";

export interface StepWant {
  readonly id: string;
  readonly at: string;
}

export function datelineFaults(doc: Document, want: string): string[] {
  const got = text(doc.querySelector(".folio-room .dateline"));
  return faults([got === want || `the count line reads ${JSON.stringify(got)}, the data's tally is ${JSON.stringify(want)}`]);
}

export function stepFaults(doc: Document, want: readonly StepWant[]): string[] {
  const rows = [...doc.querySelectorAll(".primer li.step")];
  const out: (true | string)[] = [
    same(
      rows.map((li) => li.id),
      want.map((s) => s.id),
    ) || "the steps on the page are not the data's steps, in the data's order",
  ];
  for (const [i, s] of want.entries()) {
    const href = rows[i]?.querySelector(".try a")?.getAttribute("href") ?? null;
    if (href === null) {
      out.push(`${s.id} has no Try it`);
      continue;
    }
    const got = new URL(href, "https://example.test/primer/");
    const cut = s.at.indexOf("#");
    const path = cut === -1 ? s.at : s.at.slice(0, cut);
    const hash = cut === -1 ? "" : s.at.slice(cut);
    const [pathname, query = ""] = path.split("?");
    const wantQuery = new URLSearchParams(query);
    wantQuery.set("step", s.id);
    out.push(
      (got.pathname === pathname && got.hash === hash && got.searchParams.get("step") === s.id && got.search === `?${wantQuery}`) ||
        `${s.id}'s Try it is ${href}, not its own address ${s.at} with step=${s.id}`,
    );
  }
  return faults(out);
}

export function anchorFaults(doc: Document): string[] {
  const ids = [...doc.querySelectorAll("[id]")].map((e) => e.id);
  const twice = ids.filter((id, i) => ids.indexOf(id) !== i);
  const links = [...doc.querySelectorAll(".sheet a[href^='#'], #index a[href^='#']")]
    .filter((a) => a.closest(".try") === null)
    .map((a) =>
    (a.getAttribute("href") ?? "").slice(1),
  );
  const stray = links.filter((id) => doc.getElementById(id) === null);
  const heads = [...doc.querySelectorAll(".sheet h2[id]")].map((h) => h.id);
  const rows = [...doc.querySelectorAll("#index .index > li[data-sec]")].map((li) => li.getAttribute("data-sec"));
  return faults([
    twice.length === 0 || `ids used twice: ${[...new Set(twice)].join(", ")}`,
    links.length > 0 || "the page has no in-page links to read",
    stray.length === 0 || `links to an id the page does not carry: ${stray.join(", ")}`,
    same(rows, heads) || "the index's rows are not the sheet's headings in order",
  ]);
}

export function openFaults(doc: Document): string[] {
  const presses = [...doc.querySelectorAll(".primer .unfold")];
  return faults([
    presses.length > 0 || "the page has no fold press to read",
    doc.querySelector(".primer .room-body[hidden]") === null || "a room is folded before any script runs",
    presses.every((p) => p.hasAttribute("hidden")) || "a fold press shows before any script runs",
    doc.querySelector(".primer li.step.sealed") === null || "a step is sealed before any script runs",
  ]);
}

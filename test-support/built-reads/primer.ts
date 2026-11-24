import { pictureFile, type Frame } from "../../src/site/primer/pictures.ts";
import { faults, same, text } from "../built-dom.ts";

export interface StepWant {
  readonly id: string;
  readonly at: string;
}

export function datelineFaults(doc: Document, want: string): string[] {
  const got = text(doc.querySelector(".folio-room .dateline"));
  return faults([
    got === want || `the count line reads ${JSON.stringify(got)}, the data's tally is ${JSON.stringify(want)}`,
  ]);
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
      (got.pathname === pathname &&
        got.hash === hash &&
        got.searchParams.get("step") === s.id &&
        got.search === `?${wantQuery}`) ||
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
    .map((a) => (a.getAttribute("href") ?? "").slice(1));
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

const countOf = (row: Element): string | null => text(row.querySelector(".count"));

export function indexCountFaults(doc: Document, steps: ReadonlyMap<string, number>, closing: string): string[] {
  const rows = new Map(
    [...doc.querySelectorAll("#index .index > li[data-sec]")].map((li) => [li.getAttribute("data-sec")!, li]),
  );
  const out: (true | string)[] = [rows.size > 0 || "the index has no rows to read"];
  for (const [id, n] of steps) {
    const got = rows.get(id) ? countOf(rows.get(id)!) : undefined;
    out.push(got === String(n) || `the index row ${id} counts ${JSON.stringify(got)}, the room holds ${n} steps`);
  }
  const last = rows.get(closing);
  out.push(
    (last !== undefined && last.querySelector(".count") === null) || `the closing row ${closing} carries a count`,
  );
  return faults(out);
}

export function entryCountFaults(doc: Document): string[] {
  const rows = [...doc.querySelectorAll("#index .index > li[data-sec]")];
  return faults([
    rows.length > 0 || "the index has no rows to read",
    ...rows.map(
      (li) =>
        countOf(li) === String(li.querySelectorAll("[data-for]").length) ||
        `the row ${li.getAttribute("data-sec")} counts ${JSON.stringify(countOf(li))}, it lists ${li.querySelectorAll("[data-for]").length}`,
    ),
  ]);
}

export function openFaults(doc: Document): string[] {
  const presses = [...doc.querySelectorAll(".primer .unfold")];
  return faults([
    presses.length > 0 || "the page has no fold press to read",
    doc.querySelector(".primer .room-body[hidden]") === null || "a room is folded before any script runs",
    presses.every((p) => p.hasAttribute("hidden")) || "a fold press shows before any script runs",
    doc.querySelector(".primer li.step.sealed") === null || "a step is sealed before any script runs",
    doc.querySelector("#index .entries") !== null || "the index lists no lessons to read",
    doc.querySelector("#index .entries[hidden]") === null ||
      "a room's lessons are hidden in the index before any script runs",
  ]);
}

export function pressFaults(pages: ReadonlyMap<string, Document>, taught: readonly string[], words: string): string[] {
  const out: (true | string)[] = [pages.has("/primer/") || "the build wrote no Primer"];
  const missing = taught.filter((r) => !pages.has(r));
  out.push(missing.length === 0 || `the build wrote no page for ${missing.join(", ")}`);
  const untaught = [...pages].filter(([route]) => !taught.includes(route));
  out.push(
    untaught.some(([, doc]) => doc.querySelector("header.chrome .where") !== null) ||
      "no untaught page has a trail, so the absence is read nowhere",
  );
  for (const [route, doc] of untaught)
    out.push(doc.querySelector(".primer-press") === null || `${route} carries a Primer press`);
  const primer = pages.get("/primer/");
  for (const route of taught) {
    const doc = pages.get(route);
    if (doc === undefined) continue;
    const presses = [...doc.querySelectorAll(".primer-press")];
    out.push(presses.length === 1 || `${route} carries ${presses.length} Primer presses`);
    const press = presses[0];
    if (press === undefined) continue;
    out.push(
      press.parentElement?.matches("header.chrome") === true || `${route}'s press stands outside the head cluster`,
    );
    out.push(
      press.previousElementSibling?.matches(".where") === true ||
        `${route}'s press does not stand straight after the trail`,
    );
    const links = [...press.querySelectorAll("a[href]")];
    out.push(links.length === 1 || `${route}'s press holds ${links.length} links`);
    const id = primer?.querySelector(`section.room[data-route="${route}"] h2[id]`)?.id;
    out.push(id !== undefined || `the Primer has no room for ${route}`);
    const link = links[0];
    if (link === undefined || id === undefined) continue;
    const href = link.getAttribute("href");
    out.push(href === `/primer/#${id}` || `${route}'s press opens ${href}, not its room on the Primer`);
    const got = text(link);
    out.push(got === words || `${route}'s press reads ${JSON.stringify(got)}`);
  }
  return faults(out);
}

export function pictureFaults(
  doc: Document,
  steps: readonly { readonly id: string; readonly picture?: string }[],
  frame: Frame,
): string[] {
  const out: (true | string)[] = [steps.some((s) => s.picture !== undefined) || "the guide names no picture"];
  for (const s of steps) {
    const pic = doc.querySelector(`.primer li.step[id="${s.id}"]`)?.querySelector(".pic") ?? null;
    if (pic === null) {
      out.push(`${s.id} has no row`);
      continue;
    }
    const img = pic.querySelector("img");
    const none = pic.classList.contains("none");
    if (s.picture === undefined) {
      out.push((none && img === null) || `${s.id} has no picture and its frame is not the empty one`);
      continue;
    }
    if (img === null || none) {
      out.push(`${s.id} carries no picture beside it`);
      continue;
    }
    const got = {
      src: img.getAttribute("src"),
      width: img.getAttribute("width"),
      height: img.getAttribute("height"),
      alt: img.getAttribute("alt"),
      decoding: img.getAttribute("decoding"),
      fetchpriority: img.getAttribute("fetchpriority"),
      loading: img.getAttribute("loading"),
    };
    const want = {
      src: pictureFile(s.id),
      width: String(frame.width),
      height: String(frame.height),
      alt: "",
      decoding: "async",
      fetchpriority: "low",
      loading: null,
    };
    out.push(same(got, want) || `${s.id}'s picture reads ${JSON.stringify(got)}, wanted ${JSON.stringify(want)}`);
  }
  return faults(out);
}

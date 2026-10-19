import type { DocRoomsKit } from "../document-rooms.ts";

type AxNode = { role?: { value?: string }; name?: { value?: string }; ignored?: boolean };
const LANDMARKS = new Set(["main", "banner", "navigation", "complementary", "contentinfo", "region", "form", "search"]);

async function roomName({ evaluate, send, sleep, PORT }: DocRoomsKit, page: string): Promise<string> {
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}${page}` });
  for (let i = 0; i < 200; i++) {
    const name = await evaluate<string>(
      `document.readyState === "complete" && location.pathname === ${JSON.stringify(page)} ? (document.querySelector("h1.room-name") || {}).textContent || "" : ""`,
    ).catch(() => "");
    if (name) return name;
    await sleep(25);
  }
  throw new Error(`IX8: ${page} never named its room`);
}

// The accessibility tree itself, read over the debug port: the landmark a reader jumping by landmarks meets the room's name in; the Print Room's, inside <main>, is the same-run control.
export async function ix8Landmark(k: DocRoomsKit): Promise<void> {
  const rows: string[] = [];
  let ok = true;
  for (const [page, want] of [
    ["/faq/", "region"],
    ["/glossary/", "region"],
    ["/gallery/", "region"],
    ["/print-room/", "main"],
  ] as const) {
    const name = await roomName(k, page);
    const h1 = await k.send<{ result: { objectId?: string } }>("Runtime.evaluate", {
      expression: `document.querySelector("h1.room-name")`,
    });
    const node = await k.send<{ node: { backendNodeId: number } }>("DOM.describeNode", {
      objectId: h1.result.objectId,
    });
    const ax = await k.send<{ nodes: AxNode[] }>("Accessibility.getAXNodeAndAncestors", {
      backendNodeId: node.node.backendNodeId,
    });
    const landmark = ax.nodes.find((n) => !n.ignored && LANDMARKS.has(n.role?.value ?? ""));
    ok &&= landmark?.role?.value === want && (want !== "region" || landmark.name?.value === name);
    rows.push(
      `${page} "${name}" in ${landmark ? `${landmark.role!.value}${landmark.name?.value ? ` "${landmark.name.value}"` : ""}` : "no landmark"}`,
    );
  }
  k.check(
    "IX8 the Q & A's, the Glossary's and the Gallery's name, standing in the desk layer ahead of <main>, sits in a region landmark named for the room, read from the accessibility tree, where the Print Room's sits in <main> (Alex, 2026-10-06, Issue #762 issuecomment-6019508051)",
    ok,
    rows.join(" | "),
  );
}

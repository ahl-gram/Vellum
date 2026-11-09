// Issue #1155 round: for each step, what the reader does (`act`) and what shows once it is done (`then`), keyed by the step's route and id. In a build these two fields sit on the step itself; they are apart here only so the ladders above stay readable at the sitting. A road out (a link to another room) has no `do`: its landing is the next room's own first step.
import type { Act } from "../drive.ts";
import type { Words } from "./shape.ts";
import { ICELAND } from "./explorer.ts";
import { SENTENCE } from "./rooms.ts";

export interface Done {
  readonly do: readonly Act[];
  readonly then?: readonly Words[];
}

const attr = (name: string, says: string): Words => ({ css: "#map > svg[data-vellum-style], #wr-chart svg, #pr-preview svg", says, read: "attr", attr: name, from: "script" });
const title = (says: string, css = "#folio-title"): Words => ({ css, says, read: "text", from: "script", match: "starts" });
const text = (css: string, says: string, match?: "starts" | "contains"): Words => ({ css, says, read: "text", from: "script", ...(match ? { match } : {}) });
const set = (css: string, value: string): Act => ({ kind: "set", css, value });
const click = (css: string): Act => ({ kind: "click", css });
const write = (sentence: string): Act => ({
  kind: "eval",
  js: `{const t=document.getElementById("wr-line");t.value=${JSON.stringify(sentence)};t.dispatchEvent(new Event("input",{bubbles:true}));document.querySelector("#wr-form button[type=submit]").click();for(let j=0;j<10;j++)await tick();await until("founded",settled);for(let j=0;j<6;j++)await tick();}`,
});
const cardOpen: Act = { kind: "eval", js: `{const h=document.querySelector('.place-hit[data-idx="0"]');h.focus();h.click();for(let j=0;j<8;j++)await tick();}` };

export const DONE: Readonly<Record<string, Done>> = {
  "/explorer/#dice": { do: [click("#random")] },
  "/explorer/#draw": { do: [set("#seed", "42"), click("#draw")], then: [title("The Isle of Rahai")] },
  "/explorer/#enter": { do: [{ kind: "eval", js: `{const s=document.getElementById("seed");s.value="1155";s.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true}));for(let j=0;j<6;j++)await tick();await until("settled",settled);}` }], then: [attr("data-vellum-seed", "1155")] },
  "/explorer/#archipelago": { do: [set("#type", "archipelago")], then: [title("The Rahai Archipelago"), attr("data-vellum-map-type", "archipelago")] },
  "/explorer/#islands": { do: [set("#islands", "20")], then: [text("#islands-readout", "about 20"), attr("data-vellum-islands", "20")] },
  "/explorer/#sizes": { do: [click("#isle-varied")], then: [attr("data-vellum-isle-size", "varied")] },
  "/explorer/#climate": { do: [set("#band", "polar")], then: [attr("data-vellum-band", "polar")] },
  "/explorer/#shape": { do: [{ kind: "pick", text: "Iceland", name: "Iceland" }], then: [attr("data-vellum-outline", ICELAND)] },
  "/explorer/#held": { do: [], then: [text("#land-held-note", "the outline holds the count; clear the place to free the islands")] },
  "/explorer/#sea-level": { do: [set("#land", "30")], then: [text("#land-readout", "% land", "contains")] },
  "/explorer/#coast": { do: [set("#coast", "95")], then: [text("#coast-readout", "warp 0.95")] },
  "/explorer/#ragged": { do: [set("#ragged", "70")], then: [text("#ragged-readout", "ragged 0.70"), attr("data-vellum-raggedness", "0.7")] },
  "/explorer/#looseness": { do: [set("#looseness", "70")], then: [text("#looseness-readout", "looser"), { css: "label[for=coast]", says: "coast", read: "text", from: "markup" }] },
  "/explorer/#style": { do: [set("#style", "ink")], then: [attr("data-vellum-style", "ink")] },
  "/explorer/#theme": { do: [set("#theme", "moisture")] },
  "/explorer/#arms": { do: [click("#arms")] },
  "/explorer/#beasts": { do: [click("#beasts")], then: [text("#map > svg[data-vellum-style]", "Rauhoahai", "contains")] },
  "/explorer/#survey": { do: [click("#ages"), { kind: "wait", css: "#map .voyage-track" }] },
  "/explorer/#legend": { do: [click("#legend")] },
  "/explorer/#nearer": { do: [click("#zoom-in"), { kind: "ticks", n: 10 }] },
  "/explorer/#look-about": { do: [click("#zoom-in"), { kind: "ticks", n: 8 }, { kind: "eval", js: `{const v=document.getElementById("map-viewport");v.focus();for(let i=0;i<4;i++){v.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true}));for(let j=0;j<3;j++)await tick();}for(let j=0;j<6;j++)await tick();}` }] },
  "/explorer/#anew": { do: [{ kind: "nearer", until: "region" }], then: [{ css: "#map .region-inset .dog-ear", says: "lay this survey on the table", read: "aria", from: "script" }] },
  "/explorer/#hold": { do: [{ kind: "wait", css: "#map .region-inset" }, click("#zoom-hold")], then: [{ css: "#zoom-hold", says: "true", read: "attr", attr: "aria-pressed", from: "markup" }, { css: "#caption", says: "held", read: "text", from: "script", match: "contains" }] },
  "/explorer/#loupe": { do: [{ kind: "wait", css: "#map .region-inset" }, click("#zoom-loupe"), { kind: "ticks", n: 4 }, { kind: "eval", js: `{const v=document.getElementById("map-viewport");const r=v.getBoundingClientRect();const at={clientX:r.left+r.width*0.42,clientY:r.top+r.height*0.4,pointerType:"mouse",bubbles:true};v.dispatchEvent(new PointerEvent("pointerenter",at));v.dispatchEvent(new PointerEvent("pointermove",at));for(let j=0;j<8;j++)await tick();}` }], then: [{ css: "#zoom-loupe", says: "true", read: "attr", attr: "aria-pressed", from: "markup" }] },
  "/explorer/#stand-off": { do: [click("#zoom-reset"), { kind: "ticks", n: 10 }] },
  "/explorer/#card": { do: [cardOpen], then: [text("#place-card .pc-name", "Laukuwelua")] },
  "/explorer/#verso": { do: [click("#verso-turn"), { kind: "ticks", n: 10 }] },
  "/explorer/#dog-ear": { do: [{ kind: "wait", css: "#map .region-inset .dog-ear" }, click("#map .region-inset .dog-ear")], then: [text("#chart-drawer-tab", "The Drawer · one sheet", "starts")] },
  "/explorer/#drawer": { do: [click("#chart-drawer-tab"), { kind: "ticks", n: 8 }], then: [text("#chart-drawer-count", "one sheet laid", "starts")] },
  "/explorer/#commission": { do: [], then: [attr("data-vellum-map-type", "archipelago"), attr("data-vellum-band", "polar"), attr("data-vellum-style", "nautical"), attr("data-vellum-islands", "40")] },
  "/writing-room/#write": { do: [write(SENTENCE)], then: [attr("data-vellum-band", "polar"), attr("data-vellum-map-type", "archipelago"), attr("data-vellum-islands", "20")] },
  "/writing-room/#your-word": { do: [write(`${SENTENCE} alex`)], then: [attr("data-vellum-band", "polar"), attr("data-vellum-islands", "20")] },
  "/writing-room/#shape-of": { do: [write("an island in the shape of Japan")], then: [attr("data-vellum-outline", "ne-1159320937")] },
  "/writing-room/#plate": { do: [click("#wr-plate"), { kind: "ticks", n: 10 }], then: [text("#wr-plate-verb", "Lift")] },
  "/reading-room/#play": { do: [click(".rf-play"), { kind: "ticks", n: 10 }] },
  "/reading-room/#ages": { do: [{ kind: "eval", js: `{const r=document.querySelector(".rf-range");r.value=String(Math.round((Number(r.min)+Number(r.max))*0.62));r.dispatchEvent(new Event("input",{bubbles:true}));r.dispatchEvent(new Event("change",{bubbles:true}));for(let j=0;j<14;j++)await tick();}` }] },
  "/reading-room/#read": { do: [{ kind: "eval", js: `{const s=document.querySelector(".rr-colophon input");s.value="1155";document.querySelector(".rr-read").click();for(let j=0;j<10;j++)await tick();await until("settled",settled);}` }] },
  "/print-room/#pull": { do: [set("#pr-seed", "42"), click("#pr-draw"), { kind: "ticks", n: 10 }], then: [attr("data-vellum-seed", "42")] },
  "/print-room/#style": { do: [set("#pr-style", "ink"), click("#pr-draw"), { kind: "ticks", n: 10 }], then: [attr("data-vellum-style", "ink")] },
  "/print-room/#bind": { do: [click("#pr-bind"), { kind: "wait", css: "#pr-contents .thumb" }], then: [text("#pr-bind", "Bind it again")] },
  "/print-room/#turn": { do: [{ kind: "eval", js: `{const t=[...document.querySelectorAll("#pr-contents .thumb")][1];t.click();for(let j=0;j<14;j++)await tick();}` }] },
  "/print-room/#impression": { do: [set("#pr-format", "png1")] },
  "/print-room/#road-plate": { do: [set("#pr-pressing", "road")] },
  "/prospect/#year": { do: [{ kind: "eval", js: `{const y=document.getElementById("pp-year");y.value="300";document.getElementById("pp-engrave").click();for(let j=0;j<10;j++)await tick();await until("settled",settled);for(let j=0;j<4;j++)await tick();}` }] },
  "/prospect/#lay": { do: [click("#pp-lay")], then: [text("#pp-lay-count", "laid", "contains")] },
  "/ribbon/#bound-for": { do: [{ kind: "eval", js: `{const s=document.getElementById("rb-to");const o=[...s.options].find((o)=>o.textContent.trim()==="Toatauhe");s.value=o.value;s.dispatchEvent(new Event("change",{bubbles:true}));for(let j=0;j<10;j++)await tick();await until("settled",settled);}` }], then: [title("Laukuwelua to Toatauhe")] },
  "/ribbon/#turn-about": { do: [click("#rb-swap"), { kind: "ticks", n: 10 }], then: [title("Homaitani to Laukuwelua")] },
  "/ribbon/#lean": { do: [{ kind: "eval", js: `{const b=[...document.querySelectorAll("#rb-itinerary .lean")][3];b.click();for(let j=0;j<14;j++)await tick();}` }] },
  "/explorer/portfolio/#next": { do: [click("#pf-next"), { kind: "ticks", n: 10 }] },
  "/seed-of-the-day/#sound": { do: [{ kind: "eval", js: `{const svg=document.querySelector("#sheet svg");const r=svg.getBoundingClientRect();svg.dispatchEvent(new MouseEvent("click",{clientX:r.left+0.12*r.width,clientY:r.top+0.15*r.height,bubbles:true}));for(let j=0;j<8;j++)await tick();}` }], then: [text("#hunt-status", ".", "contains")] },
};

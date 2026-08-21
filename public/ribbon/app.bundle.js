import { n as seedForDate } from "../explorer/chunks/seed-of-the-day.js";
import { c as plateDressFor, i as usesWorker, r as runJob, t as initWorker } from "../explorer/chunks/worker-client.js";
//#region src/site/ribbon/address.ts
var STYLES = [
	"antique",
	"topographic",
	"ink",
	"nautical"
];
var TYPES = [
	"island",
	"archipelago",
	"continent",
	"citystate"
];
var BANDS = [
	"temperate",
	"tropical",
	"polar"
];
function parseRibbonAddress(hash) {
	const p = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
	const nat = (key) => {
		const raw = p.get(key);
		const n = Number(raw);
		return raw !== null && Number.isInteger(n) && n >= 0 ? n : null;
	};
	const allowed = (key, list) => {
		const raw = p.get(key);
		return raw !== null && list.includes(raw) ? raw : null;
	};
	const scaled = (key, divisor, lo, hi) => {
		const raw = p.get(key);
		if (raw === null) return null;
		const f = Number(raw) / divisor;
		return Number.isFinite(f) ? Math.min(hi, Math.max(lo, f)) : null;
	};
	return {
		seed: nat("seed"),
		style: allowed("style", STYLES),
		type: allowed("type", TYPES),
		band: allowed("band", BANDS),
		land: scaled("land", 1e3, .1, .7),
		coast: scaled("coast", 100, 0, 1),
		from: nat("a"),
		to: nat("b")
	};
}
function chartTarget(hash) {
	const kept = (hash.startsWith("#") ? hash.slice(1) : hash).split("&").filter((kv) => kv !== "" && !/^(a|b)(=|$)/.test(kv));
	return "/explorer/" + (kept.length ? "#" + kept.join("&") : "");
}
function journeyHash(hash, from, to) {
	return "#" + [
		...(hash.startsWith("#") ? hash.slice(1) : hash).split("&").filter((kv) => kv !== "" && !/^(a|b)(=|$)/.test(kv)),
		`a=${from}`,
		`b=${to}`
	].join("&");
}
//#endregion
//#region src/site/ribbon/app.ts
var $ = (id) => document.getElementById(id);
var status = $("rb-status");
var plate = $("rb-plate");
var caption = $("rb-caption");
var chartLink = $("rb-chart-link");
var warning = $("rb-warning");
var fromSel = $("rb-from");
var toSel = $("rb-to");
var swap = $("rb-swap");
var addr = parseRibbonAddress(location.hash);
var seed = (addr.seed ?? seedForDate(/* @__PURE__ */ new Date())) >>> 0;
var dress = plateDressFor(addr.style ?? "antique");
var overrides = {
	...addr.type ? { mapType: addr.type } : {},
	...addr.band ? { band: addr.band } : {},
	...addr.land != null ? { landFraction: addr.land } : {},
	...addr.coast != null ? { coastWarp: addr.coast } : {}
};
chartLink.href = chartTarget(location.hash);
var last = null;
var lastUrl = null;
window.__vellumRibbonUsesWorker = usesWorker;
window.__vellumRibbonState = () => last;
function fillSelect(sel, res, toOnly) {
	sel.replaceChildren(...res.options.filter((o) => toOnly ? o.i === res.toIdx || res.reachable.includes(o.i) : true).map((o) => {
		const opt = document.createElement("option");
		opt.value = String(o.i);
		opt.textContent = o.name;
		return opt;
	}));
}
function draw(from, to) {
	status.textContent = "The surveyor unrolls the scroll…";
	runJob({
		kind: "ribbon",
		seed,
		overrides,
		from,
		to,
		dress
	}).then((res) => {
		if (lastUrl !== null) URL.revokeObjectURL(lastUrl);
		lastUrl = URL.createObjectURL(new Blob([res.svg], { type: "image/svg+xml" }));
		plate.src = lastUrl;
		plate.alt = `The road from ${res.fromName} to ${res.toName}, chart ${seed}`;
		plate.hidden = false;
		caption.textContent = `The road from ${res.fromName} to ${res.toName} · ${Math.round(res.leagues)} leagues · ${res.title} · seed ${seed}`;
		status.textContent = "";
		fillSelect(fromSel, res, false);
		fillSelect(toSel, res, true);
		fromSel.value = String(res.fromIdx);
		toSel.value = String(res.toIdx);
		history.replaceState(null, "", journeyHash(location.hash, res.fromIdx, res.toIdx));
		chartLink.href = chartTarget(location.hash);
		last = {
			seed,
			from: res.fromIdx,
			to: res.toIdx,
			leagues: res.leagues,
			dress,
			svgLength: res.svg.length
		};
	}).catch((err) => {
		status.textContent = "The surveyor turned back: " + err.message;
	});
}
fromSel.addEventListener("change", () => draw(Number(fromSel.value), null));
toSel.addEventListener("change", () => draw(Number(fromSel.value), Number(toSel.value)));
swap.addEventListener("click", () => {
	if (last === null) return;
	draw(last.to, last.from);
});
status.textContent = "The surveyor unrolls the scroll…";
await initWorker();
if (!usesWorker()) warning.hidden = false;
draw(addr.from, addr.to);
//#endregion

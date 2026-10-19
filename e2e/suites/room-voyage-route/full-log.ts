import type { SuiteContext } from "../../types.ts";

export async function rv7FullLog({ evaluate, check }: SuiteContext): Promise<void> {
  const rv7 = await evaluate<{
    visible: boolean;
    entries: number;
    logged: number;
    rows: number;
    ports: number;
    legs: number;
    sig: string;
    attribution: string;
    opensDeparture: boolean;
    closesHome: boolean;
    homeIdx: number;
    capitalIdx: number;
  }>(`(()=>{
    window.__vellumVoyageStepTo(999);
    const plan=window.__vellumVoyagePlan();
    const log=window.__vellumVoyageLog();
    const sig=document.querySelector(".rf-log-sig").textContent;
    const rows=document.querySelector(".rf-log-strip").querySelectorAll("li.prologue").length;
    const last=log&&log.entries.length?log.entries[log.entries.length-1]:null;
    return{
      visible:!!(log&&log.visible), entries:log?log.entries.length:0, logged:log?log.logged:-1,
      rows, ports:plan?plan.ports.length:0, legs:plan?plan.legs.length:0, sig,
      attribution:log?log.attribution:"",
      opensDeparture:!!(log&&log.entries[0]&&log.entries[0].text.includes("set out")),
      closesHome:!!(last&&last.text.includes("whence we set out")),
      homeIdx:last?last.idx:-1, capitalIdx:plan&&plan.ports[0]?plan.ports[0].idx:-2,
    };
  })()`);
  check(
    "RV7 the full sweep logs every port plus the homecoming, opens with the attribution + a departure, all persisting",
    rv7.visible &&
      rv7.entries === rv7.ports + 1 &&
      rv7.rows === rv7.entries &&
      rv7.logged === rv7.entries &&
      rv7.legs === rv7.ports &&
      rv7.opensDeparture &&
      rv7.closesHome &&
      rv7.homeIdx === rv7.capitalIdx &&
      rv7.sig === rv7.attribution &&
      rv7.attribution.startsWith("Being a true"),
    JSON.stringify({ ...rv7, attribution: rv7.attribution.slice(0, 24) }),
  );
}

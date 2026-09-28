import type { SuiteContext } from "../types.ts";
import type { Manifest } from "./overlay.ts";

export async function p16Glass({ evaluate, check }: SuiteContext, pm: Manifest): Promise<void> {
  // #124 the philologist's glass: seed 42 speaks oromi (the seed-42 covenant pins that), so the tongue line is checkable by name and not merely by shape.
  const p16 = await evaluate<{ tongue: string | undefined; roots: string | undefined; former: string | undefined; order: string; acts: string }>(`(()=>{
    if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
    const hit=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');
    hit.focus();
    const c=document.getElementById("place-card");
    return{
      tongue:(c.querySelector(".pc-tongue")||{}).textContent,
      roots:(c.querySelector(".pc-roots")||{}).textContent,
      former:(c.querySelector(".pc-former")||{}).textContent,
      order:[...c.querySelectorAll(".pc-inner > *")].map((e)=>e.className).join(","),
      // Since #522 the card's actions sit in ONE row, so the order string names the ROW and the row's own members are read beside it: without this the re-pin would drop what the old string proved, that the actions stand between the founding and the tale.
      acts:[...c.querySelectorAll(".pc-acts > *")].map((e)=>e.className).join(","),
    };
  })()`);
  check("P16 the glass reads the capital's name: tongue, syllabified word, glossed roots (#124), and the card's ACTION ROW stands between the founding and the note with both actions inside it (#522)",
    typeof p16.tongue === "string" && p16.tongue.startsWith("A word of the Oromi speech: ") && p16.tongue.includes("·") &&
    typeof p16.roots === "string" && p16.roots.includes(", ") && !p16.roots.startsWith("Of uncertain") &&
    p16.order.split(",").filter((c)=>c!=="pc-former").join(",") === "pc-name,pc-rank,pc-founded,pc-acts,pc-tongue,pc-roots" &&
    p16.acts === "pc-prospect,pc-lay",
    JSON.stringify(p16));
}

export async function p18Renamed({ evaluate, check }: SuiteContext, pm: Manifest): Promise<void> {
  if (pm.formerIdx >= 0) {
    const p18 = await evaluate<{ former: string | undefined; order: string }>(`(()=>{
      if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
      document.querySelector('.place-hit[data-idx="'+${pm.formerIdx}+'"]').focus();
      const c=document.getElementById("place-card");
      return{former:(c.querySelector(".pc-former")||{}).textContent,order:[...c.querySelectorAll(".pc-inner > *")].map((e)=>e.className).join(",")};
    })()`);
    check("P18 a renamed place states its former name plainly, between the founding and the slip (#49)",
      p18.former === `Once called ${pm.formerName}.` &&
      p18.order === "pc-name,pc-rank,pc-founded,pc-former,pc-acts,pc-tongue,pc-roots",
      JSON.stringify(p18));
  } else {
    check("P18 seed 42 has a renamed place to read", false, "none in manifest");
  }
}

export async function p18bNeverRenamed({ evaluate, check }: SuiteContext, pm: Manifest): Promise<void> {
  if (pm.plainIdx >= 0) {
    const p18b = await evaluate<{ former: boolean; order: string }>(`(()=>{
      if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
      document.querySelector('.place-hit[data-idx="'+${pm.plainIdx}+'"]').focus();
      const c=document.getElementById("place-card");
      return{former:!!c.querySelector(".pc-former"),order:[...c.querySelectorAll(".pc-inner > *")].map((e)=>e.className).join(",")};
    })()`);
    check("P18b a place that was never renamed shows no former line at all (#49)",
      p18b.former === false && p18b.order === "pc-name,pc-rank,pc-founded,pc-acts,pc-tongue,pc-roots",
      JSON.stringify(p18b));
  } else {
    check("P18b seed 42 has an unrenamed living place to read", false, "none in manifest");
  }
}

export async function p17RuinNote({ evaluate, check, axDescription }: SuiteContext, pm: Manifest): Promise<void> {
  if (pm.ruinIdx >= 0) {
    const p17 = await evaluate<{ order: string; tale: string | undefined; roots: string | undefined }>(`(()=>{
      const hit=document.querySelector('.place-hit[data-idx="'+${pm.ruinIdx}+'"]');
      hit.focus();
      const c=document.getElementById("place-card");
      return{
        order:[...c.querySelectorAll(".pc-inner > *")].map((e)=>e.className).join(","),
        tale:(c.querySelector(".pc-tale")||{}).textContent,
        roots:(c.querySelector(".pc-roots")||{}).textContent,
      };
    })()`);
    check("P17 a ruin keeps its tale and gains the note beneath it, in that order (#124)",
      p17.order === "pc-name,pc-rank,pc-founded,pc-acts,pc-tale,pc-tongue,pc-roots" &&
      p17.tale === pm.tale && typeof p17.roots === "string" && p17.roots.length > 0,
      JSON.stringify(p17));
    const axDesc16 = await axDescription(`.place-hit[data-idx="${pm.ruinIdx}"]`);
    check("P17b the derivation is spoken too, not only drawn", !!axDesc16 && axDesc16.includes("A word of the Oromi speech"), JSON.stringify(axDesc16));
  } else {
    check("P17 seed 42 has a ruin to read", false, "no ruin in manifest");
  }
}

export async function pCardShot({ evaluate, shoot, sleep }: SuiteContext, pm: Manifest): Promise<void> {
  await evaluate(`(()=>{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelector('.place-hit[data-idx="'+${pm.ruinIdx >= 0 ? pm.ruinIdx : pm.cap}+'"]').focus();})()`);
  await sleep(500);
  await shoot("explorer-place-card.png");
  await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))`);
}

import { HELD_NOTES, islandsWord, looseWord, raggedWord } from "../../explorer/land-rows.ts";
import { AT, chart, SHEET_LESSONS } from "./explorer-sheet.ts";
import { aria, choose, click, labelled, option, set, text, wait, type Ladder, type Words } from "./shape.ts";

const ICELAND = "ne-1159320917";
const ISLANDS = 20;
const RAGGED = 70;
const LOOSENESS = 70;

const label = (id: string, says: string): Words => text(`label[for=${id}]`, says);
const end = (row: string, side: "min" | "max", says: string): Words =>
  text(`[data-row=${row}] .land-end-${side}`, says);
const title = (says: string): Words => text("#folio-title", says, "starts");

export const EXPLORER: Ladder = {
  route: "/explorer/",
  what: "The Explorer draws a whole world from a number, and every control on it reshapes or redresses that world.",
  lessons: [
    {
      id: "number",
      title: "A world from a number",
      gloss: "the seed box, the dice and Draw, at the top right",
      steps: [
        {
          id: "explorer-dice",
          act: "Press {⚄}, the dice beside the seed box.",
          see: "A whole new world is drawn, and its number fills the seed box.",
          at: AT,
          words: [text("#random", "⚄")],
          do: [click("#random")],
          kind: "play",
        },
        {
          id: "explorer-draw",
          act: "Type 42 in the seed box and press {Draw}.",
          see: "The Isle of Rahai comes back, line for line. Every chart is reproducible from the number in its margin.",
          at: "/explorer/#seed=7",
          words: [text("#draw", "Draw")],
          do: [set("#seed", "42"), click("#draw")],
          then: [title("The Isle of Rahai")],
        },
        {
          id: "explorer-enter",
          act: "Type any number you like in the {seed} box and press Enter.",
          see: "Every number is a world, and the same number is the same world for anyone who types it.",
          at: AT,
          words: [aria("#seed", "seed")],
          do: [
            { kind: "set", css: "#seed", value: "1155", release: false },
            { kind: "key", css: "#seed", key: "Enter" },
          ],
          then: [chart("data-vellum-seed", "1155")],
          kind: "play",
        },
      ],
    },
    {
      id: "land",
      title: "The Land",
      gloss: "these shape the world itself",
      aside: "Choose seed's choice again on any row to give it back to the seed.",
      steps: [
        {
          id: "explorer-archipelago",
          act: "On the Broadside, open {type} and choose {archipelago}.",
          see: "The isle breaks into a scatter of isles, and the chart is renamed The Rahai Archipelago.",
          at: AT,
          words: [label("type", "type"), option("#type", "archipelago")],
          do: [choose("#type", "archipelago")],
          then: [title("The Rahai Archipelago"), chart("data-vellum-map-type", "archipelago")],
        },
        {
          id: "explorer-islands",
          act: "A new row has come: drag {islands} from {few} toward {many}, then let go.",
          see: "The sea fills with isles, and the readout says about how many. A few may touch or sink, so the count is never exact.",
          at: "/explorer/#seed=42&type=archipelago",
          words: [label("islands", "islands"), end("islands", "min", "few"), end("islands", "max", "many")],
          do: [set("#islands", String(ISLANDS))],
          then: [text("#islands-readout", islandsWord(ISLANDS)), chart("data-vellum-islands", String(ISLANDS))],
        },
        {
          id: "explorer-sizes",
          act: "Now {sizes} has come too: choose {of every size}.",
          see: "Some isles swell and others stay small.",
          at: "/explorer/#seed=42&type=archipelago&islands=20",
          words: [text("#sizes-label", "sizes"), labelled("#isle-varied", "of every size")],
          do: [click("#isle-varied")],
          then: [chart("data-vellum-isle-size", "varied")],
        },
        {
          id: "explorer-climate",
          act: "Open {climate} and choose {polar}.",
          see: "Pine woods and open tundra, and the snow line comes down the hills. The coast stays exactly where it was.",
          at: AT,
          words: [label("band", "climate"), option("#band", "polar")],
          do: [choose("#band", "polar")],
          then: [chart("data-vellum-band", "polar")],
        },
        {
          id: "explorer-shape",
          act: "Type Iceland in the {shape} box, and choose it from the list.",
          see: "The land is drawn inside Iceland's outline, north up, nearly edge to edge.",
          at: AT,
          words: [label("place", "shape")],
          relies: [{ css: "#place", says: "seed's choice", read: "placeholder" }],
          do: [{ kind: "pick", css: "#place", text: "Iceland", name: "Iceland" }],
          then: [chart("data-vellum-outline", ICELAND)],
        },
        {
          id: "explorer-held",
          act: "With Iceland still in the box, choose {archipelago} from {type}.",
          see: `The islands row steps into the held box at the foot of the Land, which says why: ${HELD_NOTES.count}.`,
          at: `/explorer/#seed=42&outline=${ICELAND}`,
          words: [option("#type", "archipelago"), label("type", "type")],
          do: [choose("#type", "archipelago")],
          then: [
            { ...label("islands", "islands"), state: "held" },
            { ...text("#land-held-note", HELD_NOTES.count), state: "held" },
          ],
        },
      ],
    },
    {
      id: "strand",
      title: "The Strand",
      gloss: "these set the water's edge",
      aside: "A row that cannot change this world waits behind a dashed rule; the note under it says why.",
      steps: [
        {
          id: "explorer-sea-level",
          act: "Drag {sea level} slowly toward {more sea}.",
          see: "The sea rises as you drag, and the readout says how much of the sheet is land.",
          at: AT,
          words: [label("land", "sea level"), end("land", "min", "more sea")],
          do: [set("#land", "300")],
          then: [text("#land-readout", "% land", "contains")],
        },
        {
          id: "explorer-coast",
          act: "Drag the {coast} from {calm} toward {lobed}, then let go.",
          see: "Nothing moves until you let go; then a new coast is drawn. Each step of the coast is a different world.",
          at: AT,
          words: [label("coast", "coast"), end("coast", "min", "calm"), end("coast", "max", "lobed")],
          do: [set("#coast", "95")],
          then: [text("#coast-readout", "warp 0.95")],
        },
        {
          id: "explorer-ragged",
          act: "On a counted archipelago the coast row runs {round} to {ragged}: drag it toward {ragged}, and let go.",
          see: "Every island's shore frays.",
          at: "/explorer/#seed=42&type=archipelago&islands=20",
          words: [end("ragged", "min", "round"), end("ragged", "max", "ragged")],
          relies: [label("ragged", "coast")],
          do: [set("#ragged", String(RAGGED))],
          then: [
            text("#ragged-readout", raggedWord(RAGGED / 100)),
            chart("data-vellum-raggedness", String(RAGGED / 100)),
          ],
        },
        {
          id: "explorer-looseness",
          act: "With Iceland's shape on the chart, drag {looseness} from {exact} toward {loose}.",
          see: "The land slips its outline toward the seed's own island, and the coast row comes free.",
          at: `/explorer/#seed=42&outline=${ICELAND}`,
          words: [label("looseness", "looseness"), end("looseness", "min", "exact"), end("looseness", "max", "loose")],
          do: [set("#looseness", String(LOOSENESS))],
          then: [text("#looseness-readout", looseWord(LOOSENESS / 100)), label("coast", "coast")],
        },
      ],
    },
    {
      id: "hand",
      title: "The Hand",
      gloss: "these dress the same world",
      aside: "The Hand only dresses: the land stays exactly as it was.",
      steps: [
        {
          id: "explorer-style",
          act: "Open {style} and choose {ink}.",
          see: "The same world, drawn again in pen and ink.",
          at: AT,
          words: [label("style", "style"), option("#style", "ink")],
          do: [choose("#style", "ink")],
          then: [chart("data-vellum-style", "ink")],
        },
        {
          id: "explorer-theme",
          act: "Open {theme} and choose {rainfall}.",
          see: "The land is washed with how much rain falls where.",
          at: AT,
          words: [label("theme", "theme"), option("#theme", "rainfall")],
          do: [choose("#theme", "rainfall")],
        },
        {
          id: "explorer-arms",
          act: "Tick {arms}.",
          see: "Each realm's coat of arms is set on the chart.",
          at: AT,
          words: [labelled("#arms", "arms")],
          do: [click("#arms")],
        },
        {
          id: "explorer-beasts",
          act: "Tick {beasts}.",
          see: "A sea beast is drawn in the deep water with its name beside it: on this chart, Rauhoahai.",
          at: AT,
          words: [labelled("#beasts", "beasts")],
          do: [click("#beasts")],
          then: [text("#map > svg[data-vellum-style]", "Rauhoahai", "contains")],
        },
        {
          id: "explorer-survey",
          act: "Tick {survey}.",
          see: "The expedition's track is inked onto the sheet, with the ship's daily stations.",
          at: AT,
          words: [labelled("#ages", "survey")],
          do: [click("#ages"), wait("#map .voyage-track")],
        },
        {
          id: "explorer-legend",
          act: "Untick {legend}, then tick it again.",
          see: "The key in the corner is taken off, and put back.",
          at: AT,
          words: [labelled("#legend", "legend")],
          do: [click("#legend")],
        },
      ],
    },
    ...SHEET_LESSONS,
  ],
};

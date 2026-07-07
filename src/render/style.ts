export type StyleName = "antique" | "topographic" | "ink" | "nautical";

export type HypsoStop = { readonly t: number; readonly color: string };

export type MapStyle = {
  readonly name: StyleName;
  readonly paper: string;
  readonly ink: string;
  readonly inkSoft: string;
  readonly ocean: string;
  readonly oceanDeep: string | null;
  readonly waterline: string;
  readonly coastStroke: string;
  readonly land: string;
  readonly hypsometric: ReadonlyArray<HypsoStop> | null;
  readonly contourStroke: string | null;
  readonly river: string;
  readonly road: string;
  /**
   * #158 political boundary treatment, kept distinct from the road so a border
   * never reads as a track. antique/ink/nautical use a dark-ink dash-DOT line;
   * topographic keeps its already-distinct dashed ink. `borderWidth` and the
   * `borderDash` values are k-multipliers (k = widthPx/1500), matching the road.
   */
  readonly borderStroke: string;
  readonly borderWidth: number;
  readonly borderDash: ReadonlyArray<number>;
  readonly borderOpacity: number;
  readonly labelColor: string;
  readonly labelHalo: string;
  readonly fontFamily: string;
  readonly fontFamilyTitle: string;
  readonly glyphs: boolean;
  readonly parchmentTexture: boolean;
  readonly seaDecorations: boolean;
  readonly rhumbLines: boolean;
  readonly politicalTints: boolean;
  /** Shallow-water tint painted out to the danger line (nautical). */
  readonly shoalTint: string | null;
  /** Depth soundings scattered over open water (nautical). */
  readonly soundings: boolean;
  /** Prevailing-wind arrows over open water (nautical). */
  readonly winds: boolean;
  /** Ocean-current streamlines over open water (nautical). */
  readonly currents: boolean;
  readonly realmTints: ReadonlyArray<string>;
};

const ANTIQUE: MapStyle = {
  name: "antique",
  paper: "#f2e8cf",
  ink: "#4a3826",
  inkSoft: "#857257",
  ocean: "#d9e2d2",
  oceanDeep: null,
  waterline: "#a3b8a3",
  coastStroke: "#5b4a33",
  land: "#f2e8cf",
  hypsometric: null,
  contourStroke: null,
  river: "#637f9b",
  road: "#8a6a4a",
  borderStroke: "#4a3826",
  borderWidth: 1.5,
  borderDash: [6, 3, 0.6, 3],
  borderOpacity: 0.85,
  labelColor: "#3d2f1f",
  labelHalo: "#f2e8cf",
  fontFamily: "'Iowan Old Style', 'Palatino', 'Georgia', serif",
  fontFamilyTitle: "'Iowan Old Style', 'Palatino', 'Georgia', serif",
  glyphs: true,
  parchmentTexture: true,
  seaDecorations: true,
  rhumbLines: true,
  politicalTints: true,
  shoalTint: null,
  soundings: false,
  winds: false,
  currents: false,
  // Frozen base 5 + #78 additions (teal, deep olive). Deep olive is deliberately
  // dark: it dodges the deuteranopia collision the lighter olive had with ochre.
  realmTints: ["#c46d5e", "#7d9a6a", "#bf9b4f", "#7a8aa6", "#a97ba6", "#5f9e91", "#5f6b2e"],
};

const TOPOGRAPHIC: MapStyle = {
  name: "topographic",
  paper: "#f7f4ee",
  ink: "#3a3a3a",
  inkSoft: "#6e6a60",
  ocean: "#cfe3f0",
  oceanDeep: "#90bcd9",
  waterline: "#a5c8de",
  coastStroke: "#5e7c96",
  land: "#e9e6d8",
  hypsometric: [
    { t: 0.0, color: "#aac99a" },
    { t: 0.14, color: "#c3d5a1" },
    { t: 0.28, color: "#e0dcaa" },
    { t: 0.42, color: "#dfc395" },
    { t: 0.56, color: "#cfa67d" },
    { t: 0.7, color: "#bb9484" },
    { t: 0.82, color: "#d3cdc7" },
    { t: 0.92, color: "#f2f0ee" },
  ],
  contourStroke: "#8d7d62",
  river: "#3f88c5",
  road: "#c0392b",
  // Preserved from the pre-#158 border (dashed dark ink): topographic already
  // reads distinctly from its cased red roads, so its treatment does not move.
  borderStroke: "#3a3a3a",
  borderWidth: 1.1,
  borderDash: [1.2, 3.2],
  borderOpacity: 0.65,
  labelColor: "#2a2a2a",
  labelHalo: "#f7f4ee",
  fontFamily: "'Avenir Next', 'Helvetica Neue', 'Arial', sans-serif",
  fontFamilyTitle: "'Avenir Next', 'Helvetica Neue', 'Arial', sans-serif",
  glyphs: false,
  parchmentTexture: false,
  seaDecorations: false,
  rhumbLines: false,
  politicalTints: true,
  shoalTint: null,
  soundings: false,
  winds: false,
  currents: false,
  // Frozen base 5 + #78 additions (turquoise, lime, magenta); the brights leave
  // real hue room, so all three land and topographic reaches 8.
  realmTints: ["#e74c3c", "#27ae60", "#f39c12", "#2980b9", "#8e44ad", "#1abc9c", "#9bc53d", "#e84393"],
};

const INK: MapStyle = {
  name: "ink",
  paper: "#faf7ef",
  ink: "#241c10",
  inkSoft: "#5a5246",
  ocean: "#faf7ef",
  oceanDeep: null,
  waterline: "#241c10",
  coastStroke: "#241c10",
  land: "#faf7ef",
  hypsometric: null,
  contourStroke: "#8a8275",
  river: "#241c10",
  road: "#241c10",
  borderStroke: "#241c10",
  borderWidth: 1.5,
  borderDash: [6, 3, 0.6, 3],
  borderOpacity: 0.85,
  labelColor: "#241c10",
  labelHalo: "#faf7ef",
  fontFamily: "'Iowan Old Style', 'Palatino', 'Georgia', serif",
  fontFamilyTitle: "'Iowan Old Style', 'Palatino', 'Georgia', serif",
  glyphs: true,
  parchmentTexture: false,
  seaDecorations: true,
  rhumbLines: false,
  politicalTints: false,
  shoalTint: null,
  soundings: false,
  winds: false,
  currents: false,
  realmTints: ["#888", "#aaa", "#777", "#999", "#666"],
};

const NAUTICAL: MapStyle = {
  name: "nautical",
  paper: "#f6f2e6",
  ink: "#27415e",
  inkSoft: "#5d7389",
  ocean: "#f7f9f7",
  oceanDeep: null,
  waterline: "#8fb3c7",
  coastStroke: "#27415e",
  land: "#efe7cf",
  hypsometric: null,
  contourStroke: "#a8a695",
  river: "#4a7ba6",
  road: "#8a6a4a",
  borderStroke: "#27415e",
  borderWidth: 1.5,
  borderDash: [6, 3, 0.6, 3],
  borderOpacity: 0.85,
  labelColor: "#27415e",
  labelHalo: "#f6f2e6",
  fontFamily: "'Iowan Old Style', 'Palatino', 'Georgia', serif",
  fontFamilyTitle: "'Iowan Old Style', 'Palatino', 'Georgia', serif",
  glyphs: false,
  parchmentTexture: false,
  seaDecorations: true,
  rhumbLines: true,
  politicalTints: false,
  shoalTint: "#d9eaf2",
  soundings: true,
  winds: true,
  currents: true,
  realmTints: ["#c46d5e", "#7d9a6a", "#bf9b4f", "#7a8aa6", "#a97ba6"],
};

export const STYLES: Record<StyleName, MapStyle> = {
  antique: ANTIQUE,
  topographic: TOPOGRAPHIC,
  ink: INK,
  nautical: NAUTICAL,
};

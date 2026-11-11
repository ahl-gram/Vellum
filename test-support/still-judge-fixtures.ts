export const pngHeader = (width: number, height: number): Buffer => {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12, "latin1");
  b.writeUInt32BE(width, 16);
  b.writeUInt32BE(height, 20);
  return b;
};

export const svgOf = (layers: Readonly<Record<string, string>>): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1158" viewBox="0 0 1500 1158">${Object.entries(layers)
    .map(([id, body]) => `<g id="${id}">${body}</g>`)
    .join("")}</svg>`;

export const SHEET: string = svgOf({
  "layer-feature-labels":
    '<text font-weight="700">THE REALM</text><rect class="range-casing" transform="rotate(32.0 586.4 686.1)"/><text>MOUNT X</text>',
  "layer-cartouche": '<text font-size="27.0">The Isle</text>',
  "layer-legend": "",
});

export const RAIN: string = svgOf({
  "layer-wind-streams": '<path d="M0 0" stroke="#4a3826"/>',
  "layer-iso": '<path d="M0 0" stroke="#78765f"/>',
  "layer-rivers": "",
});

import { useEffect, useState } from "react";

const workSansUrl =
  "https://cdn.jsdelivr.net/npm/@fontsource/work-sans/files/work-sans-latin-400-normal.woff";

export type GlyphData = {
  char: string;
  pathData: string;
  lsb: number;
  rsb: number;
  aw: number;
  capHeight: number;
  descender: number;
};

export function GlyphDiagram() {
  const [glyphs, setGlyphs] = useState<{ data: GlyphData[]; upm: number } | null>(null);

  useEffect(() => {
    (async () => {
      const opentype = await import("opentype.js");
      const res = await fetch(workSansUrl);
      const buf = await res.arrayBuffer();
      const font = opentype.parse(buf);
      const upm = font.unitsPerEm;

      const data: GlyphData[] = ["W", "T", "j"].map((char) => {
        const g = font.charToGlyph(char);
        const aw = g.advanceWidth ?? 0;
        const lsb = g.leftSideBearing ?? 0;
        const bbox = g.getBoundingBox();
        const rsb = aw - bbox.x2;
        const capHeight = bbox.y2;
        const descender = Math.abs(Math.min(0, bbox.y1));
        const p = g.getPath(0, capHeight, upm);
        return { char, pathData: p.toPathData(1), lsb, rsb, aw, capHeight, descender };
      });

      setGlyphs({ data, upm });
    })();
  }, []);

  if (!glyphs) return null;
  const { data, upm } = glyphs;

  const DIM_GAP   = Math.round(upm * 0.07);
  const TICK      = Math.round(upm * 0.025);
  const BAR       = Math.round(upm * 0.018);
  const FS        = Math.round(upm * 0.055);
  const SW        = Math.round(upm * 0.006);
  const GLYPH_PAD = Math.round(upm * 0.08);
  const BLOCK_GAP = Math.round(upm * 0.14);
  const DIM_ROWS_H = DIM_GAP * 4;
  const minLsb    = Math.min(...data.map(g => g.lsb));
  const PAD_X     = Math.max(Math.round(upm * 0.16), Math.round(Math.abs(Math.min(0, minLsb)) + FS * 2.5));

  const INK   = "#1C1812";
  const MUTED = "#6B5F52";
  const RULE  = "#DDD5C4";
  const AMBER = "#E8A020";
  const TEAL  = "#1D9E8C";
  const RED   = "#D93F2A";
  const DASH  = `${SW * 5} ${SW * 4}`;

  const offsets: number[] = [];
  let cursor = 0;
  for (let i = 0; i < data.length; i++) {
    offsets.push(cursor);
    const g = data[i];
    cursor += GLYPH_PAD + g.capHeight + g.descender + DIM_ROWS_H + BLOCK_GAP;
  }

  const upmRowY = cursor;
  const totalH  = upmRowY + DIM_GAP * 2.2;
  const svgW    = Math.max(...data.map(g => g.aw), upm) + PAD_X * 2;

  return (
    <svg
      viewBox={`${-PAD_X} 0 ${svgW} ${totalH}`}
      style={{ width: "100%", maxWidth: 260, display: "block", margin: "0 auto" }}
      aria-hidden="true"
    >
      {/* Red alignment guide — x=0, the shared left origin of every glyph */}
      <line x1={0} y1={0} x2={0} y2={upmRowY}
        stroke={RED} strokeWidth={SW * 0.5} strokeDasharray={DASH} />

      {data.map((gd, idx) => {
        const yOff   = offsets[idx];
        const { pathData, lsb, rsb, aw, capHeight, descender } = gd;
        const inkX1  = lsb;
        const inkX2  = aw - rsb;
        const inkW   = inkX2 - inkX1;
        const baseline = yOff + GLYPH_PAD + capHeight;
        const row1y  = baseline + descender + DIM_GAP;

        return (
          <g key={gd.char}>
            <path d={pathData} transform={`translate(0, ${yOff})`} fill={INK} />

            {([
              [0,     RULE],
              [inkX1, AMBER],
              [inkX2, AMBER],
              [aw,    RULE],
            ] as [number, string][]).map(([x, col], i) => (
              <line key={i}
                x1={x} y1={yOff + GLYPH_PAD}
                x2={x} y2={row1y + TICK}
                stroke={col} strokeWidth={SW * 0.5} strokeDasharray={DASH} />
            ))}

            <rect x={Math.min(0, lsb)} y={row1y - BAR / 2} width={Math.abs(lsb)}      height={BAR} fill={AMBER} />
            <rect x={inkX1}            y={row1y - BAR / 2} width={Math.max(0, inkW)}   height={BAR} fill={MUTED} opacity={0.25} />
            <rect x={inkX2}            y={row1y - BAR / 2} width={Math.max(0, rsb)}    height={BAR} fill={AMBER} />

            <line x1={0}  y1={row1y} x2={aw} y2={row1y} stroke={MUTED} strokeWidth={SW} />
            <line x1={0}  y1={row1y - TICK} x2={0}  y2={row1y + TICK} stroke={MUTED} strokeWidth={SW} />
            <line x1={aw} y1={row1y - TICK} x2={aw} y2={row1y + TICK} stroke={MUTED} strokeWidth={SW} />

            <text x={inkX1 / 2}       y={row1y - TICK - FS * 0.2} textAnchor="middle" fill={AMBER} fontSize={FS} fontFamily="JetBrains Mono, monospace">LSB {lsb}</text>
            <text x={inkX2 + rsb / 2} y={row1y - TICK - FS * 0.2} textAnchor="middle" fill={AMBER} fontSize={FS} fontFamily="JetBrains Mono, monospace">RSB {Math.round(rsb)}</text>
            <text x={aw / 2}          y={row1y + TICK + FS * 1.3}  textAnchor="middle" fill={MUTED} fontSize={FS} fontFamily="JetBrains Mono, monospace">width {aw}</text>
          </g>
        );
      })}

      <line x1={0}   y1={upmRowY} x2={upm} y2={upmRowY} stroke={TEAL} strokeWidth={SW} />
      <line x1={0}   y1={upmRowY - TICK} x2={0}   y2={upmRowY + TICK} stroke={TEAL} strokeWidth={SW} />
      <line x1={upm} y1={upmRowY - TICK} x2={upm} y2={upmRowY + TICK} stroke={TEAL} strokeWidth={SW} />
      <text x={upm / 2} y={upmRowY + TICK + FS * 1.3} textAnchor="middle" fill={TEAL} fontSize={FS} fontFamily="JetBrains Mono, monospace">unitsPerEm {upm}</text>
    </svg>
  );
}

import type { Font } from "opentype.js";
import { computeTrimEm } from "../core/metrics";
import { DEFAULT_OVERLAY_VARIABLE, getTrimStyleValue } from "../core/style";
import { normalizeTokens } from "../internal/text";
import { detectLineStarts } from "./lineStarts";

export type ApplySidebearingTrimOptions = {
  elements: ArrayLike<HTMLElement | null>;
  text: string | readonly string[];
  font: Font;
  trimEnabled?: boolean;
  lineStartIndexes?: Set<number>;
  overlayVariable?: string;
  applyOverlayVariable?: boolean;
};

export type AppliedSidebearingResult = {
  lineStartIndexes: Set<number>;
  trimmedIndexes: Set<number>;
};

export function applySidebearingTrim(
  options: ApplySidebearingTrimOptions,
): AppliedSidebearingResult {
  const {
    elements,
    text,
    font,
    trimEnabled = true,
    lineStartIndexes = detectLineStarts({ elements, text }),
    overlayVariable = DEFAULT_OVERLAY_VARIABLE,
    applyOverlayVariable = true,
  } = options;
  const tokens = normalizeTokens(text);

  const trimmedIndexes = new Set<number>();

  // Track the trim amount for the current line so all characters on the same
  // line shift by the same amount
  let currentLineTrimLeft = "";
  let currentLineOverlayWidth = "";
  let currentLineHasTrim = false;

  for (let index = 0; index < tokens.length; index += 1) {
    const char = tokens[index];
    const element = elements[index];
    if (!element) {
      continue;
    }

    if (lineStartIndexes.has(index)) {
      const glyph = font.charToGlyph(char);
      const trimEm = computeTrimEm({
        leftSideBearing: glyph.leftSideBearing,
        unitsPerEm: font.unitsPerEm,
      });
      const styleValues = getTrimStyleValue(trimEm);
      currentLineTrimLeft = styleValues.trimLeft;
      currentLineOverlayWidth = styleValues.overlayWidth;
      currentLineHasTrim = trimEnabled && trimEm !== 0;
      if (currentLineHasTrim) {
        trimmedIndexes.add(index);
      }
    }

    // Always keep position:relative so `left` can transition smoothly.
    // Animate left between the trim offset and 0 rather than removing it.
    element.style.position = "relative";
    element.style.left = currentLineHasTrim ? currentLineTrimLeft : "0em";

    if (applyOverlayVariable) {
      if (lineStartIndexes.has(index) && currentLineHasTrim) {
        element.style.setProperty(overlayVariable, currentLineOverlayWidth);
      } else {
        element.style.removeProperty(overlayVariable);
      }
    }
  }

  return { lineStartIndexes, trimmedIndexes };
}

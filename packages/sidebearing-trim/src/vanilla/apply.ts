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

  for (let index = 0; index < tokens.length; index += 1) {
    const char = tokens[index];
    const element = elements[index];
    if (!element) {
      continue;
    }

    if (!lineStartIndexes.has(index)) {
      // Reset styles from any previous recompute — a token that was a line-start
      // on the last run may no longer be one after a layout change (e.g. resize).
      element.style.marginInlineStart = "";
      if (applyOverlayVariable) {
        element.style.removeProperty(overlayVariable);
      }
      continue;
    }

    const glyph = font.charToGlyph(char);
    const trimEm = computeTrimEm({
      leftSideBearing: glyph.leftSideBearing,
      unitsPerEm: font.unitsPerEm,
    });
    const styleValues = getTrimStyleValue(trimEm);

    if (trimEnabled) {
      element.style.marginInlineStart = styleValues.trimMarginInlineStart;
      trimmedIndexes.add(index);
    } else {
      // Trim is disabled — clear any previously applied margin.
      element.style.marginInlineStart = "";
    }

    if (applyOverlayVariable) {
      element.style.setProperty(overlayVariable, styleValues.overlayWidth);
    }
  }

  return { lineStartIndexes, trimmedIndexes };
}

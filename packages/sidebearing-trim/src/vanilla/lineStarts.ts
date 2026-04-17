import { normalizeTokens } from "../internal/text";

export type DetectLineStartOptions = {
  elements: ArrayLike<HTMLElement | null>;
  text: string | readonly string[];
  isVisibleGlyph?: (char: string) => boolean;
  topTolerancePx?: number;
};

export function detectLineStarts(options: DetectLineStartOptions): Set<number> {
  const {
    elements,
    text,
    isVisibleGlyph = (char) => char !== "\n",
    topTolerancePx = 0.5,
  } = options;
  const tokens = normalizeTokens(text);
  const starts = new Set<number>();
  let lastTop: number | null = null;

  for (let index = 0; index < tokens.length; index += 1) {
    const char = tokens[index];
    const element = elements[index];
    if (!element || !isVisibleGlyph(char)) {
      continue;
    }

    const currentTop = element.offsetTop;
    if (lastTop === null || currentTop - lastTop > topTolerancePx) {
      starts.add(index);
      lastTop = currentTop;
    }
  }

  return starts;
}

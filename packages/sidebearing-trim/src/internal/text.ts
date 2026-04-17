export function splitGraphemes(text: string): string[] {
  const IntlWithSegmenter = Intl as typeof Intl & {
    Segmenter?: new (
      locales?: string | string[],
      options?: { granularity: "grapheme" | "word" | "sentence" },
    ) => {
      segment(input: string): Iterable<{ segment: string }>;
    };
  };
  if (typeof IntlWithSegmenter.Segmenter === "function") {
    const segmenter = new IntlWithSegmenter.Segmenter(undefined, {
      granularity: "grapheme",
    });
    return Array.from(segmenter.segment(text), (segment) => segment.segment);
  }
  return Array.from(text);
}

export function normalizeTokens(text: string | readonly string[]): string[] {
  if (typeof text !== "string") {
    return Array.from(text);
  }
  return splitGraphemes(text);
}

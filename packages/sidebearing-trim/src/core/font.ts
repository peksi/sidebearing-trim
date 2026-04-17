import * as opentype from "opentype.js";

function isWoff2(bytes: Uint8Array): boolean {
  return (
    bytes.byteLength >= 4 &&
    String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === "wOF2"
  );
}

export async function loadFont(source: string | ArrayBuffer): Promise<opentype.Font> {
  if (typeof source === "string") {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Failed to fetch font (${response.status})`);
    }
    const buffer = await response.arrayBuffer();
    if (isWoff2(new Uint8Array(buffer))) {
      throw new Error(
        `[sidebearing-trim] WOFF2 fonts are not supported. Please provide a WOFF file instead.\n` +
          `  fontSource: "${source}"`,
      );
    }
    return opentype.parse(buffer);
  }

  if (isWoff2(new Uint8Array(source))) {
    throw new Error(
      `[sidebearing-trim] WOFF2 fonts are not supported. Please provide a WOFF file instead.`,
    );
  }
  return opentype.parse(source);
}

/**
 * Dev-only: warns when the font parsed from `fontSource` doesn't match the
 * font the browser is actually rendering on `element`.
 *
 * Reads nameID 1 (fontFamily) from the OpenType name table and compares it
 * against the computed `font-family` of the element. A mismatch means the
 * sidebearing metrics are being read from the wrong font file.
 */
export async function warnFontMismatch(font: opentype.Font, element: Element): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getEnglishName = (font as any).getEnglishName as
      | ((name: "fontFamily" | "preferredFamily") => string | undefined)
      | undefined;
    if (typeof getEnglishName !== "function") return;

    const parsedFamily: string | undefined =
      getEnglishName("fontFamily") ?? getEnglishName("preferredFamily") ?? undefined;
    if (!parsedFamily) return;

    const computedRaw = getComputedStyle(element).fontFamily;
    // getComputedStyle returns a comma-separated list; take the first entry and strip quotes.
    const computedFamily = computedRaw.split(",")[0].trim().replace(/['"]/g, "");

    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

    // Check 1 (name table): does the WOFF file match the element's CSS font-family declaration?
    if (
      !normalize(computedFamily).includes(normalize(parsedFamily)) &&
      !normalize(parsedFamily).includes(normalize(computedFamily))
    ) {
      console.warn(
        `[sidebearing-trim] Font mismatch detected.\n` +
          `  fontSource resolved to: "${parsedFamily}"\n` +
          `  Element renders:        "${computedFamily}"\n` +
          `  Sidebearing metrics may be inaccurate. Make sure fontSource points to the same font the element uses.`,
      );
      return;
    }

    const computedStyle = getComputedStyle(element);
    const fontSize = computedStyle.fontSize;
    if (typeof document !== "undefined" && "fonts" in document) {
      // Check 2 (CSS Font Loading API): is the declared font actually loaded in the browser?
      // If not, the browser is silently rendering a fallback while metrics were read from the WOFF.
      await document.fonts.ready;
      if (!document.fonts.check(`${fontSize} "${computedFamily}"`)) {
        console.warn(
          `[sidebearing-trim] Font not loaded in browser: "${computedFamily}" is declared on the element but not available via document.fonts.\n` +
            `  The element may be rendering a fallback font, making sidebearing metrics inaccurate.\n` +
            `  Ensure the font is fully loaded before calling trimSidebearings.`,
        );
      }
    }

    // Check 3 (OS/2 table): does the WOFF weight class match the element's rendered font-weight?
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsedWeight: number | undefined = (font as any).tables?.os2?.usWeightClass;
    if (parsedWeight !== undefined) {
      const computedWeight = parseFloat(computedStyle.fontWeight);
      if (Number.isFinite(computedWeight) && Math.abs(computedWeight - parsedWeight) >= 100) {
        console.warn(
          `[sidebearing-trim] Font weight mismatch detected.\n` +
            `  fontSource weight: ${parsedWeight}\n` +
            `  Element renders:   ${computedWeight}\n` +
            `  Sidebearing metrics may be inaccurate. Make sure fontSource points to the same weight the element uses.`,
        );
      }
    }
  } catch {
    // Dev diagnostics should never break initialization or test execution.
    return;
  }
}

import { describe, expect, it } from "vitest";
import { applySidebearingTrim } from "../src/vanilla/apply";
import { detectLineStarts } from "../src/vanilla/lineStarts";

function createElement(top: number): HTMLElement {
  const element = document.createElement("span");
  Object.defineProperty(element, "offsetTop", {
    configurable: true,
    get: () => top,
  });
  return element;
}

describe("detectLineStarts", () => {
  it("detects first character index for each visual row", () => {
    const text = "ABCDE";
    const elements = [
      createElement(0),
      createElement(0),
      createElement(20),
      createElement(20),
      createElement(40),
    ];
    const starts = detectLineStarts({ text, elements });
    expect([...starts]).toEqual([0, 2, 4]);
  });
});

describe("applySidebearingTrim", () => {
  it("applies negative margin to line starts and sets overlay variable", () => {
    const text = "AB";
    const elements = [createElement(0), createElement(20)];
    const font = {
      unitsPerEm: 1000,
      charToGlyph: () =>
        ({
          leftSideBearing: 50,
        }) as never,
    } as never;

    const result = applySidebearingTrim({ text, elements, font });

    expect([...result.lineStartIndexes]).toEqual([0, 1]);
    expect(elements[0].style.marginInlineStart).toBe("-0.05em");
    expect(elements[0].style.getPropertyValue("--lsb-em")).toBe("0.05em");
  });
});

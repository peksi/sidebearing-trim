import { describe, expect, it } from "vitest";
import { trimSidebearings } from "../src/vanilla/trimSidebearings";

describe("trimSidebearings", () => {
  it("wraps text and can restore original content", async () => {
    const element = document.createElement("p");
    element.style.whiteSpace = "pre-wrap";
    element.textContent = "Ab\nCd";
    document.body.append(element);

    const font = {
      unitsPerEm: 1000,
      charToGlyph: () =>
        ({
          leftSideBearing: 40,
        }) as never,
    } as never;

    const controller = await trimSidebearings(element, font, {
      trimEnabled: true,
      applyOverlayVariable: true,
      observeResize: false,
    });

    const wrapped = element.querySelectorAll<HTMLSpanElement>("span[data-sb-glyph='1']");
    expect(wrapped.length).toBeGreaterThan(0);
    expect(wrapped[0]?.style.position).toBe("relative");
    expect(wrapped[0]?.style.left).toBe("-0.04em");

    controller.destroy();
    expect(element.textContent).toBe("Ab\nCd");
  });
});

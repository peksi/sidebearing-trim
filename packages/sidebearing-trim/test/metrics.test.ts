import { describe, expect, it } from "vitest";
import { computeTrimEm } from "../src/core/metrics";

describe("computeTrimEm", () => {
  it("converts lsb units to em", () => {
    expect(computeTrimEm({ leftSideBearing: 32, unitsPerEm: 1000 })).toBe(0.032);
  });

  it("guards invalid values", () => {
    expect(computeTrimEm({ leftSideBearing: null, unitsPerEm: 1000 })).toBe(0);
    expect(computeTrimEm({ leftSideBearing: 20, unitsPerEm: 0 })).toBe(0);
  });
});

export function computeTrimEm(input: {
  leftSideBearing: number | null | undefined;
  unitsPerEm: number;
}): number {
  const { leftSideBearing, unitsPerEm } = input;
  if (!Number.isFinite(unitsPerEm) || unitsPerEm <= 0) {
    return 0;
  }
  const lsb = typeof leftSideBearing === "number" ? leftSideBearing : 0;
  return lsb / unitsPerEm;
}

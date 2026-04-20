export const DEFAULT_OVERLAY_VARIABLE = "--lsb-em";

export function getTrimStyleValue(trimEm: number): {
  trimLeft: string;
  overlayWidth: string;
} {
  return {
    trimLeft: `${-trimEm}em`,
    overlayWidth: `${trimEm}em`,
  };
}

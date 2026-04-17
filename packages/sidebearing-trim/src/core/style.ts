export const DEFAULT_OVERLAY_VARIABLE = "--lsb-em";

export function getTrimStyleValue(trimEm: number): {
  trimMarginInlineStart: string;
  overlayWidth: string;
} {
  return {
    trimMarginInlineStart: `${-trimEm}em`,
    overlayWidth: `${trimEm}em`,
  };
}

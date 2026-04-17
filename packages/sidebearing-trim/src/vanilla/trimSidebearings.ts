import type { Font } from "opentype.js";
import { loadFont, warnFontMismatch } from "../core/font";
import { DEFAULT_OVERLAY_VARIABLE } from "../core/style";
import { splitGraphemes } from "../internal/text";
import { applySidebearingTrim } from "./apply";

type FontSource = string | ArrayBuffer | Font;

type WrappedTextNode = {
  anchor: Comment;
  original: Text;
  wrappers: HTMLSpanElement[];
};

type ManagedTarget = {
  target: HTMLElement;
  textTokens: string[];
  tokenElements: HTMLSpanElement[];
  wrappedNodes: WrappedTextNode[];
};

export type TrimSidebearingsOptions = {
  trimEnabled?: boolean;
  applyOverlayVariable?: boolean;
  overlayVariable?: string;
  observeResize?: boolean;
  spanClassName?: string;
};

export type SidebearingController = {
  recompute: () => void;
  destroy: () => void;
  getState: () => {
    targetCount: number;
    lineStartCount: number;
    trimmedCount: number;
  };
};

function normalizeTargets(
  targets: HTMLElement | Iterable<HTMLElement> | ArrayLike<HTMLElement>,
): HTMLElement[] {
  if (targets instanceof HTMLElement) {
    return [targets];
  }
  return Array.from(targets);
}

function wrapTextNodes(target: HTMLElement, spanClassName: string): ManagedTarget {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (node.nodeValue && node.nodeValue.length > 0) {
      textNodes.push(node);
    }
  }

  const wrappedNodes: WrappedTextNode[] = [];
  const textTokens: string[] = [];
  const tokenElements: HTMLSpanElement[] = [];

  for (const textNode of textNodes) {
    const parent = textNode.parentNode;
    if (!parent) {
      continue;
    }
    const content = textNode.nodeValue ?? "";
    const tokens = splitGraphemes(content);
    if (tokens.length === 0) {
      continue;
    }

    const anchor = document.createComment("sb-anchor");
    const fragment = document.createDocumentFragment();
    const wrappers: HTMLSpanElement[] = [];

    for (const token of tokens) {
      const span = document.createElement("span");
      span.className = spanClassName;
      span.setAttribute("data-sb-glyph", "1");
      if (token === "\n") {
        span.setAttribute("data-sb-break", "1");
      }
      span.textContent = token;
      wrappers.push(span);
      tokenElements.push(span);
      textTokens.push(token);
      fragment.appendChild(span);
    }

    parent.insertBefore(anchor, textNode);
    parent.insertBefore(fragment, anchor);
    textNode.remove();
    wrappedNodes.push({
      anchor,
      original: textNode,
      wrappers,
    });
  }

  return { target, textTokens, tokenElements, wrappedNodes };
}

function resolveFont(source: FontSource): Promise<Font> {
  if (typeof source === "string" || source instanceof ArrayBuffer) {
    return loadFont(source);
  }
  return Promise.resolve(source);
}

export async function trimSidebearings(
  targetsInput: HTMLElement | Iterable<HTMLElement> | ArrayLike<HTMLElement>,
  fontSource: FontSource,
  options: TrimSidebearingsOptions = {},
): Promise<SidebearingController> {
  const {
    trimEnabled = true,
    applyOverlayVariable = true,
    overlayVariable = DEFAULT_OVERLAY_VARIABLE,
    observeResize = true,
    spanClassName = "sb-glyph",
  } = options;

  const targets = normalizeTargets(targetsInput);
  const managedTargets = targets.map((target) => wrapTextNodes(target, spanClassName));
  const font = await resolveFont(fontSource);

  // Fire font mismatch warnings asynchronously without blocking initialization.
  // Only the first target is checked — all targets share the same fontSource,
  // so a single family/weight comparison is sufficient.
  void warnFontMismatch(font, targets[0]);

  let lineStartCount = 0;
  let trimmedCount = 0;

  const recompute = () => {
    lineStartCount = 0;
    trimmedCount = 0;
    for (const managed of managedTargets) {
      const result = applySidebearingTrim({
        elements: managed.tokenElements,
        text: managed.textTokens,
        font,
        trimEnabled,
        applyOverlayVariable,
        overlayVariable,
      });
      lineStartCount += result.lineStartIndexes.size;
      trimmedCount += result.trimmedIndexes.size;
    }
  };

  const onResize = () => recompute();
  if (observeResize) {
    window.addEventListener("resize", onResize);
  }

  recompute();

  const destroy = () => {
    if (observeResize) {
      window.removeEventListener("resize", onResize);
    }
    for (const managed of managedTargets) {
      for (const wrapped of managed.wrappedNodes) {
        for (const wrapper of wrapped.wrappers) {
          wrapper.remove();
        }
        wrapped.anchor.replaceWith(wrapped.original);
      }
    }
  };

  return {
    recompute,
    destroy,
    getState: () => ({
      targetCount: managedTargets.length,
      lineStartCount,
      trimmedCount,
    }),
  };
}

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react";
import type { Font } from "opentype.js";
import { loadFont, warnFontMismatch } from "../core/font";
import { DEFAULT_OVERLAY_VARIABLE } from "../core/style";
import { splitGraphemes } from "../internal/text";
import { applySidebearingTrim } from "../vanilla/apply";

type FontSource = string | ArrayBuffer | Font;

type SidebearingOwnProps = {
  fontSource: FontSource;
  trim?: boolean;
  overlay?: boolean;
  overlayVariable?: string;
  glyphClassName?: string;
  observeResize?: boolean;
  children: ReactNode;
};

type SidebearingProps<TTag extends ElementType> = SidebearingOwnProps & {
  as?: TTag;
} & Omit<ComponentPropsWithoutRef<TTag>, keyof SidebearingOwnProps | "as" | "children">;

function isFont(value: FontSource | null): value is Font {
  if (!value || typeof value !== "object") {
    return false;
  }
  return "charToGlyph" in value && "unitsPerEm" in value;
}

function wrapReactNode(
  node: ReactNode,
  register: (token: string) => number,
  glyphClassName: string,
): ReactNode {
  if (typeof node === "string" || typeof node === "number") {
    const text = String(node);
    return splitGraphemes(text).map((token) => {
      const index = register(token);
      return (
        <span
          key={`sb-${index}`}
          data-sb-glyph="1"
          data-sb-break={token === "\n" ? "1" : undefined}
          className={glyphClassName}
          data-sb-index={index}
        >
          {token}
        </span>
      );
    });
  }

  if (!isValidElement(node)) {
    return node;
  }

  const originalChildren = (node.props as { children?: ReactNode }).children;
  if (originalChildren === undefined) {
    // Void/self-closing elements (<img>, <br>, <input>) have no children to recurse into.
    return node;
  }

  const wrappedChildren = Children.map(originalChildren, (child) =>
    wrapReactNode(child, register, glyphClassName),
  );
  return cloneElement(node, undefined, wrappedChildren);
}

export function Sidebearing<TTag extends ElementType = "span">(
  props: SidebearingProps<TTag>,
) {
  const {
    as,
    fontSource,
    trim = true,
    overlay = true,
    overlayVariable = DEFAULT_OVERLAY_VARIABLE,
    glyphClassName = "sb-glyph",
    observeResize = true,
    children,
    ...rest
  } = props;

  const [font, setFont] = useState<Font | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const tokenElementsRef = useRef<Array<HTMLSpanElement | null>>([]);

  const rendered = useMemo(() => {
    tokenElementsRef.current = [];
    const tokens: string[] = [];
    const register = (token: string) => {
      tokens.push(token);
      return tokens.length - 1;
    };
    const wrappedChildren = Children.map(children, (child) =>
      wrapReactNode(child, register, glyphClassName),
    );
    return { wrappedChildren, tokens };
  }, [children, glyphClassName]);

  useEffect(() => {
    let cancelled = false;
    if (isFont(fontSource)) {
      setFont(fontSource);
      return;
    }

    setFont(null);
    loadFont(fontSource)
      .then((loadedFont) => {
        if (!cancelled) {
          setFont(loadedFont);
          if (rootRef.current) {
            void warnFontMismatch(loadedFont, rootRef.current);
          }
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          console.error("[sidebearing-trim]", err);
          setFont(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fontSource]);

  useEffect(() => {
    if (!font) {
      return;
    }

    const recompute = () => {
      const elements = tokenElementsRef.current;
      applySidebearingTrim({
        elements,
        text: rendered.tokens,
        font,
        trimEnabled: trim,
        applyOverlayVariable: overlay,
        overlayVariable,
      });
    };

    const raf = requestAnimationFrame(recompute);
    if (observeResize) {
      window.addEventListener("resize", recompute);
    }
    return () => {
      cancelAnimationFrame(raf);
      if (observeResize) {
        window.removeEventListener("resize", recompute);
      }
    };
  }, [font, observeResize, overlay, overlayVariable, rendered.tokens, trim]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const nextElements = Array.from(
      root.querySelectorAll<HTMLSpanElement>("span[data-sb-glyph='1']"),
    );
    tokenElementsRef.current = nextElements;
  }, [rendered.wrappedChildren]);

  const Tag = (as ?? "span") as ElementType;
  return (
    <Tag ref={rootRef} {...rest}>
      {rendered.wrappedChildren}
    </Tag>
  );
}

import * as React from "react";
import { componentsRegistry } from "@/lib/components-config";

type ReactNode = React.ReactNode;

type Pattern = { match: string; href: string };

// Build patterns for label (e.g., "Media Card"), camel ("MediaCard"), and id ("media-card").
const patterns: Pattern[] = componentsRegistry
  .flatMap((c) => {
    const label = c.label;
    const camel = label.replace(/\s+/g, "");
    const kebab = c.id;
    return [
      { match: label, href: c.path },
      { match: camel, href: c.path },
      { match: kebab, href: c.path },
    ];
  })
  .sort((a, b) => b.match.length - a.match.length);

function isWordChar(ch?: string) {
  return !!ch && /[A-Za-z0-9_]/.test(ch);
}

function isBoundary(prev: string | undefined, next: string | undefined) {
  // Disallow adjoining word characters or hyphen to avoid partial matches
  const prevIsWord = isWordChar(prev) || prev === "-";
  const nextIsWord = isWordChar(next) || next === "-";
  return !prevIsWord && !nextIsWord;
}

function processText(value: string): ReactNode[] {
  const out: ReactNode[] = [];
  let i = 0;
  while (i < value.length) {
    let bestIdx = Infinity;
    let best: Pattern | null = null;
    let bestLen = 0;

    for (const p of patterns) {
      const idx = value.indexOf(p.match, i);
      if (idx !== -1 && idx < bestIdx) {
        bestIdx = idx;
        best = p;
        bestLen = p.match.length;
      }
    }

    if (!best) {
      if (i < value.length) out.push(value.slice(i));
      break;
    }

    const start = bestIdx;
    const end = bestIdx + bestLen;
    const prev = start > 0 ? value[start - 1] : undefined;
    const next = end < value.length ? value[end] : undefined;
    const ok = isBoundary(prev, next);

    if (!ok) {
      out.push(value.slice(i, start + 1));
      i = start + 1;
      continue;
    }

    if (start > i) out.push(value.slice(i, start));
    out.push(
      React.createElement(
        "a",
        { href: best.href, key: `${best.href}-${start}` },
        value.slice(start, end),
      ),
    );
    i = end;
  }
  return out;
}

const SKIP_TYPES = new Set(["a", "code", "pre", "kbd", "samp"]);

function transform(node: ReactNode): ReactNode {
  if (typeof node === "string") {
    return processText(node);
  }
  if (Array.isArray(node)) {
    return node.map((n, i) =>
      React.isValidElement(n) ? cloneWithChildren(n, i) : transform(n),
    );
  }
  if (React.isValidElement(node)) {
    return cloneWithChildren(node);
  }
  return node;
}

function cloneWithChildren(
  el: React.ReactElement,
  key?: React.Key,
): React.ReactElement {
  const type = el.type;
  const hasHrefProp =
    typeof type !== "string" &&
    (el.props as { href?: unknown } | undefined)?.href !== undefined;
  const skip =
    (typeof type === "string" && SKIP_TYPES.has(type)) || hasHrefProp;
  const hasChildren = Object.prototype.hasOwnProperty.call(
    el.props as object,
    "children",
  );
  if (skip || !hasChildren || (el.props as { children?: ReactNode }).children == null) {
    return key != null ? React.cloneElement(el, { key }) : el;
  }
  const nextChildren = transform(
    (el.props as { children?: ReactNode }).children as ReactNode,
  );
  if (key != null) return React.cloneElement(el, { key }, nextChildren);
  return React.cloneElement(el, undefined, nextChildren);
}

export function AutoLinkChildren({ children }: { children: ReactNode }) {
  return <>{transform(children)}</>;
}

export function withAutoLink<E extends React.ElementType>(Base: E) {
  type Props = React.ComponentPropsWithoutRef<E> & { children?: ReactNode };
  type WithoutChildren = Omit<Props, "children">;

  const AutoLinked: React.FC<Props> = (props) => {
    const { children, ...rest } = props;
    return React.createElement(
      Base,
      rest as WithoutChildren,
      <AutoLinkChildren>{children}</AutoLinkChildren>,
    );
  };
  return AutoLinked as React.FC<React.ComponentPropsWithoutRef<E>>;
}

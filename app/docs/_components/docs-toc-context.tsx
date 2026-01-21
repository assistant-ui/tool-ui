"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useExtractHeadings, type Heading } from "@/hooks/use-extract-headings";
import { useHeadingsObserver } from "@/hooks/use-headings-observer";

type DocsTocContextValue = {
  scrollContainerRef: (node: HTMLElement | null) => void;
  scrollContainer: HTMLElement | null;
  headings: Heading[];
  activeId: string | null;
};

const DocsTocContext = createContext<DocsTocContextValue | null>(null);

export function useDocsToc() {
  const context = useContext(DocsTocContext);
  if (!context) {
    throw new Error("useDocsToc must be used within DocsTocProvider");
  }
  return context;
}

export function DocsTocProvider({ children }: { children: ReactNode }) {
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(
    null,
  );

  const scrollContainerRef = useCallback((node: HTMLElement | null) => {
    if (node) {
      setScrollContainer(node);
    }
  }, []);

  const headings = useExtractHeadings(scrollContainer);
  const activeId = useHeadingsObserver(headings, scrollContainer);

  return (
    <DocsTocContext.Provider
      value={{
        scrollContainerRef,
        scrollContainer,
        headings,
        activeId,
      }}
    >
      {children}
    </DocsTocContext.Provider>
  );
}

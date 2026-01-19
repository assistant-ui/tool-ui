"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type Heading = {
  id: string;
  text: string;
};

export function useExtractHeadings(
  container: HTMLElement | null,
): Heading[] {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    if (!container) return;

    const timer = setTimeout(() => {
      const h2ElementsWithId = container.querySelectorAll("h2[id]");
      const extracted = Array.from(h2ElementsWithId).map((el) => ({
        id: el.id,
        text: el.textContent || "",
      }));
      setHeadings(extracted);
    }, 100);

    return () => clearTimeout(timer);
  }, [container, pathname]);

  return headings;
}

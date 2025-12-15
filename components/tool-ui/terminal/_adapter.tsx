import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { Button } from "../../ui/button";
export { Badge } from "../../ui/badge";
export { Collapsible, CollapsibleTrigger } from "@radix-ui/react-collapsible";

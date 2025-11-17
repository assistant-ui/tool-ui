import type { Prototype } from "./types";

import { foodOrderingPrototype, waymoPrototype } from "./prototypes";

export const PROTOTYPES: Prototype[] = [
  foodOrderingPrototype,
  waymoPrototype,
];

export const listPrototypes = (): Prototype[] => PROTOTYPES;

export const findPrototype = (slug: string): Prototype | undefined =>
  PROTOTYPES.find((prototype) => prototype.slug === slug);

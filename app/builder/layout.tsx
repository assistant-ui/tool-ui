import { ReactNode } from "react";
import { BuilderLayoutClient } from "./builder-layout-client";

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return <BuilderLayoutClient>{children}</BuilderLayoutClient>;
}

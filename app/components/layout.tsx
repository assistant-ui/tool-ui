import { ReactNode } from "react";
import { ComponentsLayoutClient } from "./components-layout-client";

export default function ComponentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ComponentsLayoutClient>{children}</ComponentsLayoutClient>;
}

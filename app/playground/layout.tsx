import { ReactNode } from "react";
import { ComponentNav } from "./components/component-nav";

export default function PlaygroundLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <ComponentNav />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}

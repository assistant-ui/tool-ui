import { ReactNode } from "react";

export default function PlaygroundLayout({ children }: { children: ReactNode }) {
  return <div className="flex h-screen flex-col">{children}</div>;
}

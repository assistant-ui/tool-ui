import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

export default function StagingLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="bg-background text-foreground min-h-screen">
        {children}
      </div>
    </ThemeProvider>
  );
}

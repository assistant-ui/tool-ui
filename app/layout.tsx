import "./globals.css";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { MobileNavSheet } from "@/components/mobile-nav-sheet";

export const metadata = {
  title: {
    template: "%s | Tool UI Directory",
    default: "Tool UI Directory",
  },
  description: "Beautiful UI components for AI tool calls",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background flex min-h-screen flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          {children}
          <MobileNavSheet />
        </ThemeProvider>
      </body>
    </html>
  );
}

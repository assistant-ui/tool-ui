import "./styles/globals.css";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/app/components/theme/theme-provider";
import { MobileNavSheet } from "@/app/components/layout/mobile-nav-sheet.client";

const isProduction = process.env.NODE_ENV === "production";
const title = isProduction ? "Tool UI" : "Tool UI — Dev";
const description = "UI components for AI interfaces";

export const metadata = {
  title,
  description,
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background flex h-screen flex-col overscroll-none">
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

"use client";

import { Toaster } from "@static-wave/ui/components/sonner";

import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // Forced dark. This site is the privacy policy and terms only — pages that
    // get read once, often from a store listing — and the brand palette is
    // built for a near-black ground. `forcedTheme` also stops next-themes from
    // overwriting the `dark` class set on <html> in layout.tsx.
    <ThemeProvider attribute="class" forcedTheme="dark" disableTransitionOnChange>
      {children}
      <Toaster richColors />
    </ThemeProvider>
  );
}

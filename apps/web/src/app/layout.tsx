import type { Metadata } from "next";
import { IBM_Plex_Mono, Outfit } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";

/*
 * The same two families the native app embeds (see apps/native/lib/fonts.ts),
 * pulled from Google Fonts here rather than bundled. Keeping them identical is
 * the point — someone who taps through from the app store listing should land
 * on a page that reads like the app they just saw.
 */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Static Wave",
  description: "Listen to any radio station in the world, free and without an account.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `className="dark"` is fixed rather than driven by next-themes: this site
    // is two legal pages, and a theme toggle on a privacy policy is noise.
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${outfit.variable} ${plexMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

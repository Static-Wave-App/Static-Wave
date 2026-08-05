import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Static Wave",
  description: "Listen to any radio station in the world, free and without an account.",
};

/*
 * Deliberately not a landing page. This site exists to host the privacy policy
 * and terms the app stores require; this route is just an index so `/` isn't a
 * 404 for anyone who trims the path off a store link.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center px-6">
      <span className="font-mono text-xs uppercase tracking-[0.3em]">
        <span className="text-subtle">static</span>
        <span className="bg-gradient-to-r from-brand-pink via-brand-violet to-brand-cyan bg-clip-text text-transparent">
          wave
        </span>
      </span>

      <h1 className="mt-6 font-display text-4xl tracking-tight text-fg sm:text-5xl">
        Radio, everywhere.
      </h1>
      <p className="mt-4 max-w-md leading-relaxed text-subtle">
        Listen to any radio station in the world, free and without an account.
      </p>

      <div className="mt-10 flex gap-5 font-mono text-xs text-subtle">
        <Link href="/privacy" className="hover:text-fg">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-fg">
          Terms
        </Link>
      </div>
    </main>
  );
}

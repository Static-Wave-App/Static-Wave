import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "static wave — radio, everywhere",
  description: "Listen to any radio station in the world.",
};

export default function Home() {
  return (
    <main className="container mx-auto max-w-3xl flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight mb-4">static wave</h1>
      <p className="text-lg text-muted-foreground mb-8">radio, everywhere.</p>
      <p className="text-muted-foreground max-w-md mb-8">
        Listen to any radio station in the world, right from your phone.
      </p>
      <div className="flex gap-4">
        <Link href="/privacy" className="text-sm underline underline-offset-4">
          Privacy Policy
        </Link>
        <Link href="/tos" className="text-sm underline underline-offset-4">
          Terms of Service
        </Link>
      </div>
    </main>
  );
}
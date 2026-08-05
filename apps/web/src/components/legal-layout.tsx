import Link from "next/link";

/*
 * Shared chrome for /privacy and /terms, ported from the excuseless web app so
 * both projects' legal pages stay structurally identical. Only the palette and
 * the wordmark treatment differ.
 *
 * There is deliberately no link to "/" — this site is the two legal pages the
 * app stores require and nothing else. A Home link would lead to a 404.
 */

/** "static wave" in the app's own logotype: plain + gradient, always lowercase. */
function Wordmark() {
  return (
    <span className="font-mono text-xs uppercase tracking-[0.3em]">
      <span className="text-subtle">static</span>
      <span className="bg-gradient-to-r from-brand-pink via-brand-violet to-brand-cyan bg-clip-text text-transparent">
        wave
      </span>
    </span>
  );
}

export function LegalPage({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6">
      <header className="border-b border-line py-16">
        <Wordmark />
        <h1 className="mt-6 font-display text-4xl tracking-tight text-fg sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 font-mono text-xs text-subtle">Effective {effectiveDate}</p>
      </header>

      <div className="py-16">{children}</div>

      <footer className="border-t border-line py-10 font-mono text-xs text-subtle">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Static Wave</span>
          <span className="flex gap-5">
            <Link href="/privacy" className="hover:text-fg">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-fg">
              Terms
            </Link>
          </span>
        </div>
      </footer>
    </main>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="font-display text-2xl tracking-tight text-fg">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed text-subtle">{children}</div>
    </section>
  );
}

export function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2 pl-5">
      {items.map((item, i) => (
        <li key={i} className="list-disc marker:text-brand">
          {item}
        </li>
      ))}
    </ul>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — static wave",
  description: "Terms of service for the static wave radio app",
};

export default function TosPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <p className="text-muted-foreground mb-6">Last updated: August 4, 2026</p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Acceptance of Terms</h2>
        <p>
          By using the static wave mobile application, you agree to these terms
          of service. If you do not agree, do not use the app.
        </p>

        <h2 className="text-xl font-semibold">Description of Service</h2>
        <p>
          static wave is a client application that connects to the publicly
          available RadioBrowser API to allow users to search for and listen to
          internet radio stations. The app does not host, store, or transmit any
          radio content itself.
        </p>

        <h2 className="text-xl font-semibold">User Responsibilities</h2>
        <p>
          You are responsible for providing your own internet connection and
          device. The app is provided &quot;as is&quot; without warranty of any kind.
          You agree not to use the app for any unlawful purpose or in violation
          of any applicable laws.
        </p>

        <h2 className="text-xl font-semibold">Third-Party Content</h2>
        <p>
          Radio stations accessed through the app are provided by third parties
          via the RadioBrowser API. We do not control, endorse, or take
          responsibility for the content of any radio station stream accessible
          through the app.
        </p>

        <h2 className="text-xl font-semibold">Intellectual Property</h2>
        <p>
          The static wave name, logo, and app design are the property of the
          app developer. Radio station names, logos, and content remain the
          property of their respective owners.
        </p>

        <h2 className="text-xl font-semibold">Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, the developer of static wave
          shall not be liable for any damages arising from the use or inability
          to use the app, including but not limited to direct, indirect,
          incidental, or consequential damages.
        </p>

        <h2 className="text-xl font-semibold">Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Changes will
          be posted on this page. Continued use of the app after changes
          constitutes acceptance of the updated terms.
        </p>

        <h2 className="text-xl font-semibold">Contact</h2>
        <p>
          For questions about these terms, contact us at
          <span className="font-mono text-sm"> support@staticwave.app</span>.
        </p>
      </section>
    </main>
  );
}
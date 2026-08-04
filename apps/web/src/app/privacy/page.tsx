import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — static wave",
  description: "Privacy policy for the static wave radio app",
};

export default function PrivacyPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground mb-6">Last updated: August 4, 2026</p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Information We Collect</h2>
        <p>
          static wave does not collect, store, or transmit any personal data. All
          app data (favorites, recently played stations, settings, sleep timer state)
          is stored locally on your device and never sent to any server.
        </p>

        <h2 className="text-xl font-semibold">RadioBrowser API</h2>
        <p>
          static wave connects directly to the RadioBrowser API
          (<a href="https://api.radio-browser.info" className="underline">api.radio-browser.info</a>)
          to search for and retrieve radio station information. When you search for
          or play a station, your device communicates directly with the RadioBrowser
          servers. No personal information is transmitted as part of these requests
          beyond what is required to fulfill the search or stream request.
        </p>

        <h2 className="text-xl font-semibold">Third-Party Services</h2>
        <p>
          static wave does not integrate any third-party analytics, advertising,
          or tracking services. The app contains no telemetry, crash reporting,
          or usage analytics.
        </p>

        <h2 className="text-xl font-semibold">Data Storage</h2>
        <p>
          All data created within the app (favorites, recently played, settings,
          sleep timer preferences) is stored exclusively on your device using
          platform-native storage APIs. This data can be cleared at any time
          by deleting the app or clearing its data in your device settings.
        </p>

        <h2 className="text-xl font-semibold">Internet Access</h2>
        <p>
          static wave requires internet access to search the RadioBrowser database
          and stream radio stations. The app does not access the internet for any
          other purpose.
        </p>

        <h2 className="text-xl font-semibold">Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. Changes will be
          posted on this page. Continued use of the app after changes constitutes
          acceptance of the updated policy.
        </p>

        <h2 className="text-xl font-semibold">Contact</h2>
        <p>
          If you have any questions about this privacy policy, please contact us
          at <span className="font-mono text-sm">privacy@staticwave.app</span>.
        </p>
      </section>
    </main>
  );
}
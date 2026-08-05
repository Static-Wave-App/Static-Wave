import type { Metadata } from "next";

import { LegalPage, List, Section } from "@/components/legal-layout";

export const metadata: Metadata = {
  title: "Privacy Policy — Static Wave",
  description:
    "How Static Wave handles your data. Short version: your favourites, history and settings stay on your device.",
};

const CONTACT = "kinzinzombe07@gmail.com";

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" effectiveDate="5 August 2026">
      <Section title="The short version">
        <p>
          Static Wave has no accounts and no server storing your content. Your favourites,
          listening history, sleep timer and settings stay in storage on your own device. We
          can&apos;t read them, we don&apos;t back them up, and we never sell them. If you
          uninstall the app, they&apos;re gone.
        </p>
        <p>
          The rest of this page explains the exceptions in plain terms — the station directory
          we query, the stations you stream from, and two anonymous app services.
        </p>
      </Section>

      <Section title="Who this policy is from">
        <p>
          Static Wave is built and owned by Kin Leon Zinzombe, who is responsible for this policy
          and for how the app handles data.
        </p>
        <p>
          The app is published to the Apple App Store and Google Play through the developer
          account of Wyven Technologies (private) limited, so that name may appear as the seller
          or developer on the store listing. Wyven is the publisher of record only — it does not
          receive, store, or process any of your data, and it has no access to anything the app
          keeps on your device.
        </p>
      </Section>

      <Section title="What stays on your device">
        <p>
          The following is written to your device&apos;s own storage and never transmitted to us
          or anyone else:
        </p>
        <List
          items={[
            "Your saved stations (favourites), including when you added each one",
            "Your recently played history — the last 50 stations, with timestamps",
            "Onboarding answers: the genres you picked and the country you chose",
            "App preferences such as your light or dark theme and any active sleep timer",
          ]}
        />
        <p>
          There is no account to sign into and no sync. Nothing in this list leaves the device,
          which also means it does not move with you if you switch phones.
        </p>
      </Section>

      <Section title="What leaves your device">
        <p>
          Static Wave is a radio player, so it necessarily talks to the wider internet. Four
          things receive information. None of them receives an identity, because the app never
          creates one.
        </p>

        <p className="text-fg">The RadioBrowser directory</p>
        <p>
          Station listings come from{" "}
          <a
            href="https://api.radio-browser.info"
            className="text-brand hover:text-brand-bright"
            rel="noreferrer noopener"
            target="_blank"
          >
            RadioBrowser
          </a>
          , a free community-run database. When you search, browse a genre or country, or open a
          station, your device queries their servers directly. Those queries contain your search
          terms and filters, and — as with any web request — your IP address is visible to them.
          RadioBrowser is an independent service with its own privacy practices.
        </p>
        <p>
          Two actions also send a small signal back to RadioBrowser so their public rankings stay
          useful: playing a station registers an anonymous play count, and saving a station to
          your favourites registers an anonymous vote for it. Neither carries any identifier for
          you or your device. If you would rather not contribute these, don&apos;t play or
          favourite stations — there is currently no separate switch for it.
        </p>

        <p className="text-fg">The radio stations themselves</p>
        <p>
          Audio is streamed directly from each station&apos;s own servers to your device. We are
          not in the middle of that connection. This means the station operator can see your IP
          address and the fact that something connected to their stream, exactly as they would if
          you opened the same URL in a browser. Their handling of that is governed by their
          policies, not ours.
        </p>

        <p className="text-fg">Expo Insights (analytics)</p>
        <p>
          We use Expo Insights to understand basic app health — how many people open the app,
          which app version they&apos;re on, and whether it&apos;s crashing. This is anonymous and
          aggregated. It includes technical details like device model, operating system version,
          and app version. It does not include your name, email, your favourites, or which
          stations you listen to.
        </p>

        <p className="text-fg">Expo Updates (over-the-air updates)</p>
        <p>
          The app can download bug fixes without a full store update. To check whether an update
          applies to your device, it sends your app version and platform to Expo&apos;s servers.
        </p>

        <p className="text-fg">Payments</p>
        <p>
          The current version of Static Wave is free and contains no in-app purchases, so no
          payment data is collected or processed at all. If we introduce paid features in a future
          version, payments would be handled by Google Play or the Apple App Store — we would
          never see or store your card details — and this policy will be updated before that goes
          live.
        </p>
      </Section>

      <Section title="What we never do">
        <List
          items={[
            "We don't require an account, email address, or phone number",
            "We don't show ads or share data with advertisers",
            "We don't sell or rent personal information to anyone",
            "We don't track you across other apps or websites",
            "We don't access your contacts, camera, photos, microphone, or location",
            "We don't record, store, or analyse the audio you listen to",
          ]}
        />
      </Section>

      <Section title="Permissions the app requests">
        <p>
          <span className="text-fg">Notifications.</span> Used for one thing: telling you the
          sleep timer has finished when the app isn&apos;t open. The notification is scheduled on
          your device — there is no push server, and declining this permission doesn&apos;t limit
          any other feature.
        </p>
        <p>
          <span className="text-fg">Background audio.</span> On Android this appears as a
          foreground service permission, and on iOS as background audio. It exists so playback
          continues when you lock your phone or switch apps, which is what a radio app is for. It
          gives us no access to anything else on your device.
        </p>
      </Section>

      <Section title="Deleting your data">
        <p>
          Because everything lives on your device, you are always in full control. You can remove
          individual favourites, clear your entire listening history from the Recently played
          screen, or simply uninstall Static Wave — uninstalling permanently removes your
          favourites, history, onboarding answers and settings. There is no server-side copy for
          us to delete, and no account to close.
        </p>
        <p>
          Since the app is currently free with no purchases, there are no billing records
          associated with you either.
        </p>
      </Section>

      <Section title="Content we don't control">
        <p>
          Static Wave plays live streams operated by thousands of independent broadcasters. We do
          not host, moderate, or endorse what any station broadcasts, and station listings come
          from a public directory we do not curate. If a station in the directory is broken,
          mislabelled, or objectionable, we encourage you to report it to RadioBrowser, and you
          can also email us.
        </p>
      </Section>

      <Section title="Children">
        <p>
          Static Wave is not directed at children under 13, and we do not knowingly collect
          personal information from them. Since the app collects no personal information from
          anyone, this is largely moot — but note that the app plays live radio from an unmoderated
          public directory, and some stations broadcast content intended for adults.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If we ever start handling data differently, we&apos;ll update this page and change the
          effective date at the top. Material changes will also be noted in the app or its store
          listing.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about privacy, or want to know exactly what we hold on you? Email{" "}
          <a href={`mailto:${CONTACT}`} className="text-brand hover:text-brand-bright">
            {CONTACT}
          </a>
          .
        </p>
      </Section>
    </LegalPage>
  );
}

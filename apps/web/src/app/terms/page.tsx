import type { Metadata } from "next";

import { LegalPage, List, Section } from "@/components/legal-layout";

export const metadata: Metadata = {
  title: "Terms of Service — Static Wave",
  description: "The terms you agree to when you use Static Wave.",
};

const CONTACT = "kinzinzombe07@gmail.com";

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" effectiveDate="5 September 2026">
      <Section title="Agreement">
        <p>
          These terms apply when you download or use Static Wave (the &quot;app&quot;). If you
          don&apos;t agree with them, don&apos;t use the app. If you do use it, you&apos;re
          agreeing to what&apos;s below.
        </p>
      </Section>

      <Section title="Who you're dealing with">
        <p>
          Static Wave is built and owned by Kin Leon Zinzombe (&quot;we&quot;, &quot;us&quot;).
          All rights in the app belong to us.
        </p>
        <p>
          The app is distributed on the Apple App Store and Google Play through the developer
          account of Wyven Technologies (private) limited, which publishes it on our behalf. That
          means Wyven&apos;s name may appear as the seller or developer on those store listings.
          Wyven acts purely as the publisher of record — it does not own the app, does not control
          how it works, and does not receive or process your data. Questions about the app, these
          terms, or your data should come to us at the address at the bottom of this page.
        </p>
      </Section>

      <Section title="What Static Wave is">
        <p>
          Static Wave is a radio player. It lets you search a public directory of internet radio
          stations, play their live streams, save favourites, and set a sleep timer. It runs
          entirely on your device — there&apos;s no account to create and no server holding your
          content.
        </p>
        <p>
          It is a player, not a broadcaster. We do not operate, own, host, or control any of the
          stations you can reach through it.
        </p>
      </Section>

      <Section title="Stations and content are third-party">
        <p>
          Station listings come from RadioBrowser, an independent community-run directory, and the
          audio is streamed directly from each broadcaster&apos;s own servers to your device. We
          are not a party to that connection.
        </p>
        <p>
          This has consequences worth stating plainly. We do not curate, moderate, verify, or
          endorse what any station broadcasts. Stations may go offline, change format, move their
          stream, or disappear from the directory without warning, and we have no control over any
          of that. Some stations may broadcast content that is inaccurate, offensive, or intended
          for adults. Any dispute about what a station broadcasts is between you and that
          broadcaster.
        </p>
        <p>
          You are responsible for making sure your use of a given stream is lawful where you are.
          Some broadcasters restrict listening by region or prohibit certain uses in their own
          terms.
        </p>
      </Section>

      <Section title="Your responsibilities">
        <List
          items={[
            "Use the app lawfully, and don't use it to do anything illegal",
            "Don't rebroadcast, record, or redistribute station streams in breach of the broadcaster's rights",
            "Don't reverse-engineer, decompile, or attempt to extract the app's source code",
            "Don't redistribute, resell, or sublicense the app",
          ]}
        />
      </Section>

      <Section title="Your data is yours">
        <p>
          Your favourites, listening history, and settings belong to you and stay on your device.
          We claim no ownership of them and, as explained in the{" "}
          <a href="/privacy" className="text-brand hover:text-brand-bright">
            Privacy Policy
          </a>
          , neither we nor our publisher ever receive them.
        </p>
        <p>
          Because they live only on your device, you are solely responsible for them. If you lose
          your device, uninstall the app, or clear its data, that content is gone permanently and
          we cannot recover it for you.
        </p>
      </Section>

      <Section title="Advertising">
        <p>
          Static Wave is currently free and supported by advertising. From time to time the app
          may show you advertisements, served by third-party ad networks such as Google AdMob.
          These ads may appear between your actions in the app — for example, before a new
          station starts playing.
        </p>
        <p>
          Before the first ad is shown we ask for your consent to personalised advertising, and
          your choice is honoured. If you consent, ad networks may use technical details about
          your device to choose ads they think are relevant. If you don&apos;t consent, you&apos;ll
          still see ads — they just won&apos;t be personalised.
        </p>
        <p>
          Ad networks are independent companies with their own terms and policies. The ads they
          show are not endorsed by us, and you interact with them at your own discretion. See the{" "}
          <a href="/privacy" className="text-brand hover:text-brand-bright">
            Privacy Policy
          </a>{" "}
          for what we share with them (which is deliberately little).
        </p>
      </Section>

      <Section title="Pricing and future paid features">
        <p>
          The current version of Static Wave is free. There are no in-app purchases, no
          subscriptions, and no paid tier — every feature in the app today is available to you at
          no cost.
        </p>
        <p>
          We may introduce paid features in a future version, which could take the form of a
          one-time purchase, a subscription, or both. If that happens, pricing will be shown
          clearly before you buy anything, and you will never be charged without explicitly
          confirming the purchase. Features that are free in the current version will not be taken
          away and put behind a paywall for existing users.
        </p>
        <p>
          Should paid features be introduced, all payments would be processed by Google Play or
          the Apple App Store rather than by us, and refunds would be handled entirely by
          whichever store you purchased through, under that store&apos;s own refund policy. We
          would not be able to issue refunds directly. These terms will be updated with full
          payment details before any paid feature goes live.
        </p>
      </Section>

      <Section title="Availability and changes">
        <p>
          We may update, change, or discontinue features at any time. We may also deliver bug
          fixes and improvements over the air. We try to keep the app working well, but we
          don&apos;t guarantee it will always be available, uninterrupted, or error-free —
          particularly since the directory and the streams themselves are run by others.
        </p>
      </Section>

      <Section title="Disclaimer and liability">
        <p>
          The app is provided &quot;as is&quot; and &quot;as available&quot;, without warranties
          of any kind, whether express or implied, to the fullest extent permitted by law. This
          includes any warranty that a particular station will be available, will keep working, or
          will broadcast what its listing says it does.
        </p>
        <p>
          To the fullest extent permitted by law, we are not liable for any indirect, incidental,
          or consequential damages arising from your use of the app — including lost data, mobile
          data charges from streaming, or anything you encounter in a third-party broadcast. Where
          liability cannot be excluded, it is limited to the amount you actually paid for the app
          in the twelve months before the claim, which for the current free version is zero.
        </p>
        <p>
          Nothing in these terms limits any rights you have under mandatory consumer protection
          law in your country.
        </p>
      </Section>

      <Section title="Data usage">
        <p>
          Streaming audio consumes mobile data. Static Wave has no control over your carrier
          plan or the bitrate a station chooses to broadcast at, and any charges your carrier
          applies are between you and them. If you&apos;re on a metered connection, consider
          listening over Wi-Fi.
        </p>
      </Section>

      <Section title="Termination">
        <p>
          You can stop using Static Wave at any time by uninstalling it. We may suspend access if
          you materially breach these terms.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms are governed by the laws of Zimbabwe. Any dispute will be subject to the
          courts of Zimbabwe, except where mandatory law in your country of residence gives you
          the right to bring proceedings locally.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          We may revise these terms from time to time. The effective date at the top will change
          when we do. Continuing to use the app after an update means you accept the revised
          terms.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms? Email{" "}
          <a href={`mailto:${CONTACT}`} className="text-brand hover:text-brand-bright">
            {CONTACT}
          </a>
          .
        </p>
      </Section>
    </LegalPage>
  );
}

import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * ── Advertising · interstitial ─────────────────────────────────────────────
 * Single interstitial shown when the user starts playback on a new station.
 * Entirely defensive: the native module is absent on web and in Expo Go,
 * AdMob can be blocked, unfilled or unreachable, and none of that may ever
 * reach the player as an error. An ad failing is the app's normal day; a
 * crash is not.
 */

/** Google's sample interstitial — safe to serve anywhere. Real ID lives in
 *  `app.json` → `extra.ads.interstitialUnitId`, so it can ride an OTA update. */
const TEST_INTERSTITIAL = "ca-app-pub-3940256099942544/1033173712";

interface AdsExtra {
  enabled?: boolean;
  interstitialUnitId?: string;
}

function extra(): Required<AdsExtra> {
  const raw = (Constants.expoConfig?.extra?.ads ?? {}) as AdsExtra;
  return {
    enabled: raw.enabled ?? false,
    interstitialUnitId: raw.interstitialUnitId ?? TEST_INTERSTITIAL,
  };
}

function adsAvailable(): boolean {
  return extra().enabled && Platform.OS !== "web";
}

type AdsModule = typeof import("react-native-google-mobile-ads");

let cachedModule: AdsModule | null = null;

async function loadModule(): Promise<AdsModule | null> {
  if (cachedModule) return cachedModule;
  try {
    cachedModule = await import("react-native-google-mobile-ads");
    return cachedModule;
  } catch {
    // Web, Expo Go, or a stripped native build. Quietly permanent.
    return null;
  }
}

let initPromise: Promise<AdsModule | null> | null = null;
let nonPersonalised = true;

async function ensureReady(): Promise<AdsModule | null> {
  if (!adsAvailable()) return null;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const m = await loadModule();
    if (!m) return null;
    try {
      await m.MobileAds().initialize();

      // Consent runs once, before the first request of a session. Any
      // failure degrades to non-personalised requests, never to a block.
      const info = await m.AdsConsent.requestInfoUpdate();
      await m.AdsConsent.loadAndShowConsentFormIfRequired();
      nonPersonalised = !(
        info.status === m.AdsConsentStatus.OBTAINED ||
        info.status === m.AdsConsentStatus.NOT_REQUIRED
      );
    } catch {
      nonPersonalised = true;
    }
    return m;
  })();

  return initPromise;
}

/**
 * Show one interstitial. Resolves as soon as the ad is dismissed, errors, or
 * fails to show — the caller should never block playback on an ad.
 */
export async function showInterstitial(): Promise<void> {
  const m = await ensureReady();
  if (!m) return;

  await new Promise<void>((resolve) => {
    let settled = false;
    let shown = false;
    let unsubscribe: () => void = () => {};

    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(guard);
      unsubscribe();
      resolve();
    };

    const ad = m.InterstitialAd.createForAdRequest(extra().interstitialUnitId, {
      requestNonPersonalizedAdsOnly: nonPersonalised,
    });

    const subLoaded = ad.addAdEventListener(m.AdEventType.LOADED, () => {
      try {
        ad.show();
        shown = true;
      } catch {
        finish();
      }
    });
    const subClosed = ad.addAdEventListener(m.AdEventType.CLOSED, finish);
    const subError = ad.addAdEventListener(m.AdEventType.ERROR, finish);
    unsubscribe = () => {
      subLoaded();
      subClosed();
      subError();
    };

    // No fill can simply hang. Twenty seconds is longer than any sane load;
    // after that we stop pretending and hand back control.
    const guard = setTimeout(finish, 20_000);
    try {
      ad.load();
    } catch {
      finish();
    }
  });
}

/** Synchronous gate so callers can skip wiring when ads are disabled. */
export function adsEnabled(): boolean {
  return adsAvailable();
}
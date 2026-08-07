import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import Purchases from "react-native-purchases";
import type { PurchasesOffering } from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

import { ENTITLEMENT_ID, OFFERING_ID, REVENUECAT_API_KEY } from "@/lib/purchases/constants";

let configured = false;

function configurePurchases() {
  if (configured) return;
  configured = true;
  Purchases.configure({ apiKey: REVENUECAT_API_KEY });
}

/**
 * Production paywall. Blocks the app behind RevenueCat's own paywall UI until
 * the configured entitlement is active. On purchase or restore the children
 * render; dismissing the sheet reopens it — the only path through is to
 * purchase or restore.
 */
export function HardPaywall({ children }: { children: ReactNode }) {
  // null = still checking, false = not entitled (paywall showing), true = entitled
  const [isEntitled, setIsEntitled] = useState<boolean | null>(null);
  const presenting = useRef(false);
  // Holds the fetched Offering so the presenting effect can read it without
  // needing it as a dependency — presentPaywallIfNeeded takes the actual
  // PurchasesOffering object, not the "default" string.
  const offeringRef = useRef<PurchasesOffering | null>(null);

  useEffect(() => {
    let cancelled = false;

    configurePurchases();
    Promise.all([Purchases.getCustomerInfo(), Purchases.getOfferings()])
      .then(([info, offerings]) => {
        if (cancelled) return;

        const offering = offerings.all[OFFERING_ID] ?? null;
        offeringRef.current = offering ?? offerings.current;

        setIsEntitled(typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined");
      })
      .catch(() => {
        if (!cancelled) setIsEntitled(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isEntitled !== false || presenting.current) return;
    presenting.current = true;

    let stopped = false;
    let errorCount = 0;
    const MAX_ERROR_RETRIES = 5;

    async function presentUntilEntitled() {
      while (!stopped) {
        const result = await RevenueCatUI.presentPaywallIfNeeded({
          requiredEntitlementIdentifier: ENTITLEMENT_ID,
          offering: offeringRef.current ?? undefined,
        });

        if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
          setIsEntitled(true);
          break;
        }

        if (result === PAYWALL_RESULT.NOT_PRESENTED) {
          setIsEntitled(true);
          break;
        }

        if (result === PAYWALL_RESULT.ERROR) {
          errorCount++;
          if (errorCount >= MAX_ERROR_RETRIES) {
            setIsEntitled(false);
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 1500));
          continue;
        }

        // CANCELLED — user backed out. Reopen immediately.
      }
      presenting.current = false;
    }

    presentUntilEntitled();

    return () => {
      stopped = true;
    };
  }, [isEntitled]);

  if (isEntitled) return <>{children}</>;

  // Covers both "still checking" and "paywall is presenting natively over
  // this" — same background either way so there's no flash of the real app.
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#08080A" }}>
      {isEntitled === null ? <ActivityIndicator color="#8B3DFF" /> : null}
    </View>
  );
}

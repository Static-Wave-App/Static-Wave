/**
 * RevenueCat API key — public, safe to embed client-side (RevenueCat
 * API keys are not secrets, unlike a server key).
 */
export const REVENUECAT_API_KEY = "goog_VCeiIwdmTAcmmZCJnZxEVCsMFDb";

/**
 * Must exactly match the entitlement identifier created in the RevenueCat
 * dashboard (Product catalog -> Entitlements).
 */
export const ENTITLEMENT_ID = "entlae90dad7e9";

/**
 * The Offering identifier the paywall (built in the RevenueCat dashboard) is
 * attached to. `presentPaywallIfNeeded` needs the actual PurchasesOffering
 * object, not this string — see hard-paywall.tsx, which fetches offerings
 * and looks this identifier up in `offerings.all`.
 */
export const OFFERING_ID = "ofrng9837c0722d";

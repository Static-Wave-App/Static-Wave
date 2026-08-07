/**
 * RevenueCat Test Store key — public, safe to embed client-side (RevenueCat
 * API keys are not secrets, unlike a server key). Swap for a real goog_...
 * key before shipping to production; see plans/revenuecat.md.
 */
export const REVENUECAT_API_KEY = "test_iyEzwoWITzpccStDtIQwUhCTqlr";

/**
 * Must exactly match the entitlement identifier created in the RevenueCat
 * dashboard (Product catalog -> Entitlements). If nothing is configured
 * there yet, the paywall will still open but no purchase will ever satisfy
 * this check.
 */
export const ENTITLEMENT_ID = "unlimited";

/**
 * The Offering identifier the paywall (built in the RevenueCat dashboard) is
 * attached to. `presentPaywallIfNeeded` needs the actual PurchasesOffering
 * object, not this string — see hard-paywall.tsx, which fetches offerings
 * and looks this identifier up in `offerings.all`.
 */
export const OFFERING_ID = "default";

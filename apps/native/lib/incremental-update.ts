/**
 * Hard update wall — see components/ui/incremental-update-wall.tsx and its
 * mount point in app/_layout.tsx.
 *
 * The idea: some fixes (this one included, historically — the cleartext/ATS
 * change) can't reach existing installs via OTA at all, and even a pure-JS
 * fix an OTA CAN carry won't reach anyone who doesn't happen to have the app
 * open with auto-updates on. This wall is the fallback — a full-screen,
 * unclosable "go update" screen with one button that opens the Play Store
 * listing, toggled on for existing installs after the fix is already live
 * on the store.
 *
 * Release sequence:
 *   1. Build/submit the real fix as a new native version with this flag set
 *      to `false`. A build should never wall off its own fresh installs —
 *      this flag going out `true` in the build submitted TO the store is
 *      the one way to lock EVERYONE out, including new installs, with no
 *      way back short of another store release.
 *   2. Once that build is live on the Play Store, flip this to `true` and
 *      publish an OTA update with `eas update --channel production`.
 *   3. IMPORTANT — app.json's runtimeVersion policy is "appVersion", so
 *      runtime version tracks the app version string exactly (1.3, 1.3.5,
 *      ... are separate, isolated OTA buckets; a device only ever receives
 *      updates published for the runtime version it's actually running).
 *      That isolation is real and automatic and is what stops step 2's OTA
 *      from ever reaching devices already on the new version. But it also
 *      means step 2 must be run once per OLD version that still has active
 *      installs, each with an explicit override so it lands in the right
 *      bucket rather than whatever app.json happens to say locally at that
 *      moment — e.g. `eas update --channel production --runtime-version 1.3`.
 *      Check the Play Console's version distribution for which old versions
 *      are still out there before publishing.
 */
export const INCREMENTAL_CHANGE_PENDING = false;

/**
 * The version this wall is pointing people toward. Copy-only — shown in the
 * wall's body text so it can say something concrete. This is NOT what gates
 * who sees the wall; see the runtimeVersion note above for the real
 * mechanism. Keep it in sync with whatever's actually live on the store.
 */
export const TARGET_VERSION = "1.3.5";

export const ANDROID_PACKAGE = "com.codewithkin.staticwave";

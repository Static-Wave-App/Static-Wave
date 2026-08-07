import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import type { AudioPlayer } from "expo-audio";
import { create } from "zustand";

import type { Station } from "@static-wave/types";

import { api, getPlayableStreamUrl } from "@/lib/api";
import { LOCK_SCREEN_ARTWORK } from "@/lib/lock-screen-artwork";

const NETWORK_ERROR_PATTERN =
  /network|timeout|timed out|connection|unreachable|enotfound|econnrefused|offline/i;

const LOCK_SCREEN_DELAY_MS = 400;

/**
 * How long a stream gets to actually start producing audio before it's
 * treated as failed. Without this, a station that connects but never
 * reaches `playing: true` — throttled, stuck buffering, a format the
 * device silently can't decode — left the player showing "playing" with a
 * moving waveform and no sound, indefinitely. Reported by a user testing
 * globally as roughly 90% of stations in most countries.
 */
const STALL_TIMEOUT_MS = 15000;

type PlaybackFailure = { error: string; isOffline: boolean; detail: string | null };

/**
 * `error` is a deliberately generic, user-facing bucket — "No internet
 * connection" / "Failed to play station" — collapsed from whatever the
 * native player actually said. That collapsing is exactly what made every
 * past failure indistinguishable: a dead stream, a codec ExoPlayer can't
 * decode, a 403 from the broadcaster, and a genuine network drop all read
 * as the same two sentences. `detail` keeps the raw native message instead
 * of discarding it, so it can be shown/reported and actually diagnosed.
 */
export function classifyPlaybackError(reason: unknown): PlaybackFailure {
  let message = "";
  if (reason instanceof Error) message = reason.message;
  else if (typeof reason === "string") message = reason;
  else if (reason && typeof reason === "object" && "message" in reason) {
    message = String((reason as { message: unknown }).message);
  }
  const isOffline = NETWORK_ERROR_PATTERN.test(message);
  return {
    error: isOffline ? "No internet connection" : "Failed to play station",
    isOffline,
    detail: message.trim() || null,
  };
}

/* ------------------------------------------------------------------------ *
 * Single-player invariant
 *
 * expo-audio players are native objects that outlive the JS that created
 * them. A player that is never released keeps decoding audio even after the
 * app is killed — which is exactly what happened: repeated play() calls
 * stacked orphaned players that could only be stopped by uninstalling.
 *
 * Three rules enforced here:
 *   1. At most ONE player exists at any moment.
 *   2. Every player ever created is tracked, so nothing can be orphaned by a
 *      race, an exception, or a fast double-tap.
 *   3. Releasing pauses FIRST — `remove()` alone does not reliably silence a
 *      player before the native object is torn down.
 * ------------------------------------------------------------------------ */

let player: AudioPlayer | null = null;
let statusSub: { remove: () => void } | null = null;
let lockScreenTimer: ReturnType<typeof setTimeout> | null = null;
let stallTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Every player handed out by `createAudioPlayer`. Belt-and-braces: if a race
 * ever leaks one past `player`, `releaseAllPlayers()` still finds it.
 */
const livePlayers = new Set<AudioPlayer>();

/** Bumped on every play(); a call whose token is stale must abort. */
let playToken = 0;

function hardRelease(target: AudioPlayer) {
  livePlayers.delete(target);
  // Order matters: silence, then detach lock screen, then free the object.
  try {
    target.pause();
  } catch {
    /* already gone */
  }
  try {
    target.setActiveForLockScreen(false);
  } catch {
    /* not the active player */
  }
  try {
    target.remove();
  } catch {
    /* already released */
  }
}

/**
 * Tears down the current player. Synchronous and re-entrancy safe: the module
 * reference is cleared BEFORE release, so a concurrent call can neither
 * double-release the same instance nor skip one.
 */
function teardown() {
  if (lockScreenTimer) {
    clearTimeout(lockScreenTimer);
    lockScreenTimer = null;
  }
  if (stallTimer) {
    clearTimeout(stallTimer);
    stallTimer = null;
  }
  if (statusSub) {
    try {
      statusSub.remove();
    } catch {
      /* noop */
    }
    statusSub = null;
  }

  const current = player;
  player = null;
  if (current) hardRelease(current);
}

/**
 * Nuclear option — releases the tracked player and any leaked ones. Called on
 * root-layout teardown so a Fast Refresh or JS reload can't strand audio.
 */
export function releaseAllPlayers() {
  teardown();
  for (const stray of Array.from(livePlayers)) hardRelease(stray);
  livePlayers.clear();
}

type AudioPlayerState = {
  currentStation: Station | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  /**
   * The raw reason behind `error` — an actual native player message, or a
   * plain description of the stall watchdog firing with no error at all.
   * Not shown as the primary error text (still too raw/inconsistent for
   * that), but surfaced as a secondary line so a failure can be reported
   * with the real cause attached instead of just "it didn't work."
   */
  detail: string | null;
  isOffline: boolean;
  isReady: boolean;
};

type AudioPlayerActions = {
  setup: () => Promise<void>;
  play: (station: Station) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  togglePlayback: () => Promise<void>;
};

export const useAudioPlayer = create<AudioPlayerState & AudioPlayerActions>(
  (set, get) => ({
    currentStation: null,
    isPlaying: false,
    isLoading: false,
    error: null,
    detail: null,
    isOffline: false,
    isReady: false,

    setup: async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          // Required for lock screen controls to bind to this player.
          interruptionMode: "doNotMix",
        });
        set({ isReady: true });
      } catch {
        set({ isReady: true, error: "Failed to setup audio player" });
      }
    },

    play: async (station: Station) => {
      // Claim this call. Any play() already in flight is now stale.
      const token = ++playToken;

      // Synchronous, before any await — this is what stops stacking.
      teardown();

      set({
        isLoading: true,
        error: null,
        detail: null,
        isOffline: false,
        currentStation: station,
        isPlaying: false,
      });

      try {
        // Most stations resolve instantly (no network cost — see
        // getPlayableStreamUrl). The subset published as a .pls/.m3u
        // container pays for one fetch here so the player is only ever
        // handed a real, directly playable stream URL.
        const streamUrl = await getPlayableStreamUrl(station);

        // A newer play() started while we were resolving the URL — bail
        // before ever touching the native player.
        if (token !== playToken) return;

        const next = createAudioPlayer({ uri: streamUrl });
        livePlayers.add(next);

        // Same check again: construction itself doesn't await, but belt and
        // braces costs nothing and matches the pattern used everywhere else
        // in this function.
        if (token !== playToken) {
          hardRelease(next);
          return;
        }

        player = next;

        statusSub = next.addListener("playbackStatusUpdate", (status) => {
          if (token !== playToken) return; // stale player, ignore

          if (status.isLoaded === false && "error" in status && status.error) {
            if (stallTimer) {
              clearTimeout(stallTimer);
              stallTimer = null;
            }
            set({
              isPlaying: false,
              isLoading: false,
              ...classifyPlaybackError(status.error),
            });
            return;
          }

          // This used to be entirely unhandled — isPlaying was set once,
          // optimistically, the instant play() was called below, and never
          // touched again unless the native side threw a hard load error.
          // A stream that connects but stalls (throttled, stuck buffering,
          // a format that silently never produces frames) throws no error
          // at all, so nothing here ever noticed: the store kept reporting
          // isPlaying: true — waveform animating, "Pause" button showing —
          // with no audio, forever. Mirror the player's real state instead.
          if (status.playing && stallTimer) {
            clearTimeout(stallTimer);
            stallTimer = null;
          }
          set({
            isPlaying: status.playing,
            isLoading: status.isBuffering && !status.playing,
          });
        });

        next.play();

        // Belt and braces for the same failure mode: if playing never goes
        // true and no error event ever fires either, stop pretending and
        // surface it instead of leaving a silently "live" player on screen.
        stallTimer = setTimeout(() => {
          if (token !== playToken) return;
          if (!get().isPlaying) {
            teardown();
            set({
              isLoading: false,
              isPlaying: false,
              error: "Station isn't responding",
              // Distinct from a caught error's detail on purpose — this
              // path means the native player never threw anything at all,
              // it just never reached playing:true. That's a different
              // failure mode (connects-but-never-plays / silently
              // unsupported format) from an explicit error, and worth
              // being able to tell apart in whatever gets reported back.
              detail: "No error thrown — stream never reached playing state within 15s",
              isOffline: false,
            });
          }
        }, STALL_TIMEOUT_MS);

        lockScreenTimer = setTimeout(() => {
          if (token !== playToken) return;
          try {
            next.setActiveForLockScreen(true, {
              title: station.name,
              artist: "static wave",
              albumTitle: station.country || "Radio",
              artworkUrl: LOCK_SCREEN_ARTWORK,
            });
          } catch {
            /* lock screen metadata is cosmetic */
          }
        }, LOCK_SCREEN_DELAY_MS);

        api.sendStationClick(station.stationuuid).catch(() => {});
      } catch (e) {
        if (token !== playToken) return;
        teardown();
        set({ isLoading: false, isPlaying: false, ...classifyPlaybackError(e) });
      }
    },

    pause: async () => {
      // Clear the stall watchdog: an intentional pause is a valid reason for
      // isPlaying to be false. Without this, pausing while a station is
      // still connecting left the timer armed, and it would fire ~15s later
      // and surface "Station isn't responding" for a station the user had
      // already, deliberately, paused.
      if (stallTimer) {
        clearTimeout(stallTimer);
        stallTimer = null;
      }
      try {
        player?.pause();
      } catch {
        /* noop */
      }
      set({ isPlaying: false });
    },

    resume: async () => {
      const { currentStation, error } = get();

      // A player that errored can't be trusted to resume by calling .play()
      // on it — the underlying connection is dead even though the native
      // object still exists (a live stream that drops mid-play often does
      // this: the socket closes without a clean status event, so nothing
      // else in this store notices). Doing that anyway used to leave the UI
      // stuck showing "playing" (the waveform is driven by isPlaying alone)
      // while the stale error from the original failure stayed on screen
      // and nothing was actually audible — reported directly by a user as
      // "the audio wave pretends to play, offline, nothing plays". Reconnect
      // from scratch instead, the same as resuming after a stop().
      if ((!player || error) && currentStation) {
        await get().play(currentStation);
        return;
      }

      try {
        player?.play();
      } catch {
        /* noop */
      }
      // isPlaying is no longer set optimistically here — the same
      // playbackStatusUpdate listener still attached from the original
      // play() call reflects the real state once the native player
      // actually resumes. Setting it true unconditionally is the same
      // false-"playing" bug this store had for the initial play() path.
      set({ isLoading: true, error: null, detail: null, isOffline: false });
    },

    stop: async () => {
      // Invalidate any in-flight play() so it can't resurrect audio.
      playToken++;
      releaseAllPlayers();
      set({
        currentStation: null,
        isPlaying: false,
        isLoading: false,
        error: null,
        detail: null,
        isOffline: false,
      });
    },

    togglePlayback: async () => {
      if (get().isPlaying) await get().pause();
      else await get().resume();
    },
  }),
);

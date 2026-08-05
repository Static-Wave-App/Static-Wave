import { create } from "zustand";

import type { OnboardingData } from "@static-wave/types";

import { getOnboarding, setOnboarding } from "@/lib/storage";

type OnboardingState = OnboardingData & {
  hydrated: boolean;
};

type OnboardingActions = {
  hydrate: () => void;
  setGenres: (genres: string[]) => void;
  toggleGenre: (genre: string) => void;
  setCountry: (country: string | null) => void;
  /** Marks onboarding complete — this is what releases the gate in the layouts. */
  finish: () => void;
  reset: () => void;
};

function persist(data: OnboardingData): void {
  setOnboarding(data);
}

// MMKV reads are synchronous, so the store starts with the real persisted value
// rather than a default that gets corrected later. This matters because the
// navigation gate reads `complete` during the very first render — an async
// hydrate would briefly report `false` and bounce the user into onboarding.
const initial = getOnboarding();

export const useOnboarding = create<OnboardingState & OnboardingActions>((set, get) => ({
  ...initial,
  hydrated: true,

  // Re-reads storage. Not needed on launch (see `initial` above); kept for
  // cases where storage is mutated outside the store.
  hydrate: () => {
    const stored = getOnboarding();
    set({ ...stored, hydrated: true });
  },

  setGenres: (genres: string[]) => {
    const { complete, selectedCountry } = get();
    const next: OnboardingData = {
      complete,
      selectedGenres: genres,
      selectedCountry,
    };
    persist(next);
    set(next);
  },

  toggleGenre: (genre: string) => {
    const { complete, selectedGenres, selectedCountry } = get();
    const selected = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];

    const next: OnboardingData = {
      complete,
      selectedGenres: selected,
      selectedCountry,
    };
    persist(next);
    set(next);
  },

  setCountry: (country: string | null) => {
    const { complete, selectedGenres } = get();
    const next: OnboardingData = {
      complete,
      selectedGenres,
      selectedCountry: country,
    };
    persist(next);
    set(next);
  },

  finish: () => {
    const { selectedGenres, selectedCountry } = get();
    const next: OnboardingData = {
      complete: true,
      selectedGenres,
      selectedCountry,
    };
    persist(next);
    set(next);
  },

  reset: () => {
    const next: OnboardingData = {
      complete: false,
      selectedGenres: [],
      selectedCountry: null,
    };
    persist(next);
    set(next);
  },
}));

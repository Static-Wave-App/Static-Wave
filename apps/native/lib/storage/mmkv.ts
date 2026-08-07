import { createMMKV } from "react-native-mmkv";

import type { OnboardingData, SettingsState, SleepTimerState } from "@static-wave/types";
import { STORAGE_KEYS } from "@static-wave/types";

const mmkv = createMMKV({ id: "static-wave" });

export function getOnboarding(): OnboardingData {
  const raw = mmkv.getString(STORAGE_KEYS.ONBOARDING);
  if (!raw) {
    return { complete: false, selectedGenres: [], selectedCountry: null };
  }
  return JSON.parse(raw) as OnboardingData;
}

export function setOnboarding(data: OnboardingData): void {
  mmkv.set(STORAGE_KEYS.ONBOARDING, JSON.stringify(data));
}

export function getSleepTimer(): SleepTimerState {
  const raw = mmkv.getString(STORAGE_KEYS.SLEEP_TIMER);
  if (!raw) {
    return { endTime: null };
  }
  return JSON.parse(raw) as SleepTimerState;
}

export function setSleepTimer(state: SleepTimerState): void {
  mmkv.set(STORAGE_KEYS.SLEEP_TIMER, JSON.stringify(state));
}

export function getSettings(): SettingsState {
  const raw = mmkv.getString(STORAGE_KEYS.SETTINGS);
  if (!raw) {
    return { instantPlay: false };
  }
  return JSON.parse(raw) as SettingsState;
}

export function setSettings(state: SettingsState): void {
  mmkv.set(STORAGE_KEYS.SETTINGS, JSON.stringify(state));
}
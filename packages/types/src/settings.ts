export type SettingsState = {
  /**
   * When true, tapping a station anywhere in the app (Search, Favorites,
   * Recently played, Suggested, the Dashboard rails) starts playback
   * immediately, in addition to opening Station Details. Off by default —
   * navigate-then-play is the existing behaviour and shouldn't change under
   * anyone who hasn't opted in.
   */
  instantPlay: boolean;
};

import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Polygon,
  Polyline,
  Rect,
  Stop,
} from "react-native-svg";

/**
 * Every icon in the five content screens, transcribed from the `<svg>` markup
 * in StaticWave Screens.html — same viewBox, same path data, same stroke
 * widths. They are hand-drawn in the design rather than taken from an icon set,
 * so substituting Ionicons would visibly change the line weight and the corner
 * radii on every screen.
 *
 * `size` defaults match the design's default usage; call sites that use a
 * different size are the ones where the design does too.
 */

export type IconProps = {
  size?: number;
  color?: string;
};

/** Dashboard header, left — opens the drawer. `M4 7h16M4 12h16M4 17h9` */
export function MenuIcon({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 7h16M4 12h16M4 17h9"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Crescent — sleep timer. Dashboard header right (19), Player transport (21). */
export function MoonIcon({ size = 19, color = "currentColor" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 14a8 8 0 1 1-9.6-11 6.6 6.6 0 0 0 9.6 11z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Solid play triangle. The design uses `points="8 5 19 12 8 19"` everywhere —
 * note it is NOT centred in the viewBox, which is what gives the glyph its
 * optical balance inside a circle.
 */
export function PlayIcon({ size = 16, color = "rgba(255,255,255,0.96)" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon points="8 5 19 12 8 19" fill={color} />
    </Svg>
  );
}

/** Two bars, rx 1.4 (1.5 at the Player's 26px size). */
export function PauseIcon({
  size = 15,
  color = "rgba(255,255,255,0.96)",
}: IconProps) {
  const rx = size >= 24 ? 1.5 : 1.4;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={6} y={4} width={4} height={16} rx={rx} fill={color} />
      <Rect x={14} y={4} width={4} height={16} rx={rx} fill={color} />
    </Svg>
  );
}

/** "See all" chevron. Note strokeWidth 2.4 — heavier than a typical chevron. */
export function ChevronRightIcon({ size = 12, color = "currentColor" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="9 5 16 12 9 19"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Sort / filter disclosure chevron — Search result bar and filter chips. */
export function ChevronDownIcon({ size = 12, color = "currentColor" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="6 9 12 15 18 9"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Player nav row, left — dismisses the modal. Wider sweep than the chip chevron. */
export function ChevronDownWideIcon({ size = 19, color = "currentColor" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="5 10 12 16.5 19 10"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Station Details nav row, left — back. */
export function ChevronLeftIcon({ size = 19, color = "currentColor" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="14.5 5 8 12 14.5 19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Magnifier — search field, tab bar, and the Favorites empty state. */
export function SearchIcon({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={6.5} stroke={color} strokeWidth={1.9} />
      <Path d="M16 16l4.5 4.5" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
    </Svg>
  );
}

/**
 * Two sliders with offset handles — the gradient button beside the search
 * field. Not a funnel: the design draws mixer faders.
 */
export function TuneIcon({ size = 19, color = "rgba(255,255,255,0.96)" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 7h11M18.5 7H20M4 17h3M10.5 17H20"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
      <Circle cx={16.5} cy={7} r={2.2} stroke={color} strokeWidth={1.9} />
      <Circle cx={8.5} cy={17} r={2.2} stroke={color} strokeWidth={1.9} />
    </Svg>
  );
}

/** Clears an active filter chip. strokeWidth 2.8 at 11px. */
export function CloseIcon({ size = 11, color = "currentColor" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 6l12 12M18 6L6 18"
        stroke={color}
        strokeWidth={2.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const HEART_PATH =
  "M12 20.5s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 8.2a4.4 4.4 0 0 1 7.5 2.7c0 5-7.5 9.6-7.5 9.6z";

/**
 * Favorite toggle. Three states in the design, all the same path:
 *  - outline (not saved) — stroke only, 1.7
 *  - filled (saved, on a neutral surface) — solid currentColor
 *  - gradient (saved, tab bar / Player) — `#FF2FD6 → #8B3DFF`
 */
export function HeartIcon({
  size = 21,
  color = "currentColor",
  filled = false,
  gradient = false,
  gradientId = "heartGradient",
}: IconProps & { filled?: boolean; gradient?: boolean; gradientId?: string }) {
  if (gradient) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <SvgLinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FF2FD6" />
            <Stop offset="1" stopColor="#8B3DFF" />
          </SvgLinearGradient>
        </Defs>
        <Path d={HEART_PATH} fill={`url(#${gradientId})`} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"}>
      <Path d={HEART_PATH} stroke={filled ? "none" : color} strokeWidth={1.7} />
    </Svg>
  );
}

/** Share — Station Details secondary action. An up-arrow out of a tray. */
export function ShareIcon({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 15V4M8 8l4-4 4 4M5 13v6h14v-6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Player nav row, right — overflow. */
export function MoreIcon({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={5.5} cy={12} r={1.7} fill={color} />
      <Circle cx={12} cy={12} r={1.7} fill={color} />
      <Circle cx={18.5} cy={12} r={1.7} fill={color} />
    </Svg>
  );
}

/** Minus — the Favorites edit-mode remove control. */
export function MinusIcon({ size = 16, color = "currentColor" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={5} y={11} width={14} height={2.5} rx={1.25} fill={color} />
    </Svg>
  );
}

/* ------------------------------------------------------------------ *
 * Below this line the icons are NOT in the design file.
 *
 * They exist for the drawer, which the design never covers. They're drawn to
 * the same rules as the transcribed set above — 24 viewBox, 1.8 stroke, round
 * caps and joins — so they don't read as borrowed from an icon pack.
 * ------------------------------------------------------------------ */

/** Drawer — Home. */
export function HomeIcon({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Drawer — Recently played. */
export function ClockIcon({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={1.8} />
      <Path
        d="M12 7.5V12l3 2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Drawer — light theme, paired with `MoonIcon` for dark. */
export function SunIcon({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={4} stroke={color} strokeWidth={1.8} />
      <Path
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Trash — clears the Recently Played history. */
export function TrashIcon({ size = 16, color = "currentColor" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 7h16M9.5 7V5h5v2M6.5 7l1 13h9l1-13"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

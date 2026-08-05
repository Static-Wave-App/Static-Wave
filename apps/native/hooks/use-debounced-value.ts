import { useEffect, useState } from "react";

/**
 * Returns `value` only after it has stopped changing for `delayMs`.
 * Used to keep search input from firing a RadioBrowser request per keystroke
 * (flows/02 specifies 300ms).
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class strings, letting a later class win over an earlier one
 * of the same property. Without this, `cn("text-muted", "text-brand")` would
 * emit both and the winner would depend on stylesheet order.
 */
export function cn(...inputs: Array<string | undefined | null | false>): string {
  return twMerge(inputs.filter(Boolean).join(" "));
}

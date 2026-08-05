import { permanentRedirect } from "next/navigation";

/*
 * The terms used to live at /tos and now live at /terms. This keeps the old
 * path working for anything already pointing at it — a store listing field, or
 * a build that's already shipped — rather than turning it into a 404.
 *
 * Safe to delete this folder outright once you're sure nothing references /tos.
 */
export default function TosRedirect(): never {
  permanentRedirect("/terms");
}

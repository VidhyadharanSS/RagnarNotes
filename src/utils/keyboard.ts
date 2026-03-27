/**
 * Keyboard shortcut utilities — macOS-aware key detection.
 */

export type ModifierKey = "meta" | "ctrl" | "alt" | "shift";

export interface Shortcut {
  key: string;
  modifiers?: ModifierKey[];
}

/** Parse a shortcut string like "cmd+k" into a Shortcut object. */
export function parseShortcut(raw: string): Shortcut {
  const parts = raw.toLowerCase().split("+");
  const key = parts[parts.length - 1];
  const modifiers: ModifierKey[] = [];

  for (const p of parts.slice(0, -1)) {
    if (p === "cmd" || p === "meta") modifiers.push("meta");
    else if (p === "ctrl") modifiers.push("ctrl");
    else if (p === "alt" || p === "opt") modifiers.push("alt");
    else if (p === "shift") modifiers.push("shift");
  }

  return { key, modifiers };
}

/** Check if a KeyboardEvent matches a shortcut. */
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: Shortcut,
): boolean {
  const { key, modifiers = [] } = shortcut;

  const metaOk = modifiers.includes("meta")
    ? event.metaKey || event.ctrlKey // treat Ctrl as Cmd fallback on non-mac
    : !event.metaKey;
  const ctrlOk = modifiers.includes("ctrl") ? event.ctrlKey : !event.ctrlKey;
  const altOk = modifiers.includes("alt") ? event.altKey : !event.altKey;
  const shiftOk = modifiers.includes("shift")
    ? event.shiftKey
    : !event.shiftKey;

  // If both meta and ctrl in modifiers, only require one
  if (modifiers.includes("meta") && !modifiers.includes("ctrl")) {
    return (
      (event.metaKey || event.ctrlKey) &&
      altOk &&
      shiftOk &&
      event.key.toLowerCase() === key
    );
  }

  return metaOk && ctrlOk && altOk && shiftOk && event.key.toLowerCase() === key;
}

/** Pretty-print a shortcut for display (macOS symbols). */
export function formatShortcut(shortcut: Shortcut): string {
  const { key, modifiers = [] } = shortcut;
  const parts: string[] = [];

  if (modifiers.includes("meta")) parts.push("⌘");
  if (modifiers.includes("ctrl")) parts.push("⌃");
  if (modifiers.includes("alt")) parts.push("⌥");
  if (modifiers.includes("shift")) parts.push("⇧");

  parts.push(key.toUpperCase());
  return parts.join("");
}

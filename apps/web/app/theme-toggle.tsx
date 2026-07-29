"use client";

import { useEffect, useState } from "react";
import { THEME_BG, THEME_KEY } from "../lib/theme";

/**
 * Cycles the page through system → light → dark.
 *
 * Three states rather than two because "follow the OS" is a real preference —
 * the one every visitor starts with — and a two-state switch silently takes it
 * away on the first click with no way back. The button wears the current
 * state, not the next one: a label that names what pressing will do reads as
 * a description of the page as it already is, and with three states "next"
 * is not even guessable.
 *
 * The mechanism is two lines of CSS away: globals.css defines every colour
 * with light-dark(), so forcing a theme is just data-theme on <html> flipping
 * color-scheme. This component owns that attribute after hydration; the boot
 * script in layout.tsx sets it before first paint so a forced theme never
 * flashes the other one.
 */

type Mode = "system" | "light" | "dark";

const ORDER: Mode[] = ["system", "light", "dark"];

const FACE: Record<Mode, { glyph: string; label: string }> = {
  system: { glyph: "◐", label: "систем" },
  light: { glyph: "○", label: "цайвар" },
  dark: { glyph: "●", label: "бараан" },
};

function apply(mode: Mode): void {
  const root = document.documentElement;
  if (mode === "system") delete root.dataset.theme;
  else root.dataset.theme = mode;
  // The browser picks a theme-color meta by its OS media query, so on a
  // forced theme both metas take the forced colour — otherwise the address
  // bar keeps the OS's colour around a page showing the other one.
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    const os = meta.getAttribute("media")?.includes("dark") ? "dark" : "light";
    meta.setAttribute("content", THEME_BG[mode === "system" ? os : mode]);
  }
}

export function ThemeToggle() {
  // Rendered as "system" during the export build and corrected after mount,
  // like the reviewer badge: which theme this device forced is a property of
  // the device, and prerendered HTML cannot know it.
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === "light" || stored === "dark") {
        setMode(stored);
        // The boot script already set the attribute; this settles the metas.
        apply(stored);
      }
    } catch {
      // Private modes may refuse storage. The OS theme stands.
    }
  }, []);

  function cycle(): void {
    const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]!;
    setMode(next);
    apply(next);
    try {
      if (next === "system") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, next);
    } catch {
      // Still applies for this page view; it just will not survive one.
    }
  }

  const face = FACE[mode];
  return (
    <button
      className="card-action theme-toggle"
      aria-label={`Дэлгэцийн горим — одоо: ${face.label}. Дарж солино`}
      onClick={cycle}
    >
      <span aria-hidden="true">{face.glyph}</span> {face.label}
    </button>
  );
}

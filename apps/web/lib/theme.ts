/**
 * The one colour that three places must agree on: the page background per
 * theme. It is --bg in globals.css, the <meta name="theme-color"> pair the
 * layout declares, and the value the toggle writes into those metas when a
 * reader forces a theme. Change it here and in globals.css together.
 */
export const THEME_BG = {
  light: "#faf9f7",
  dark: "#101214",
} as const;

/** localStorage key holding a forced theme ("light" | "dark"); absent means
 *  follow the OS. Shared between the toggle and the boot script in
 *  layout.tsx that applies it before first paint. */
export const THEME_KEY = "khudam.theme";

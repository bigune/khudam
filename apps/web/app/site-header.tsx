import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

/**
 * The one bar every page opens with: the mark, the name, and the reader's
 * theme.
 *
 * It lives in the root layout for the reason the footer is one component — a
 * site that renames itself page by page is not a site. The name being here is
 * also why no page repeats it as its own title: the converter's h1 says what
 * the page does, and the pages that are not the converter say what they are.
 */
export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        {/* The favicon's open book, inline: it takes currentColor, so it themes
            itself and costs no request. Keep in step with app/icon.svg. */}
        <svg
          className="brand-mark"
          viewBox="0 0 14 14"
          width="17"
          height="17"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="m 0,0 0,10 c 2,3 5.24979,2.039143 5.24979,4 L 6.25,14 6.25,4 C 6.25,1.0168774 2,3 0,0 z M 14,0 C 12,3 7.75,1.0449388 7.75,4 l 0,10 1,0 C 8.75,12.020266 12,13 14,10 z"
          />
        </svg>
        <span className="brand-name">Худам</span>
      </Link>
      {/* A group rather than a bare button: whatever joins the right end later
          — a menu, a second language — belongs beside the theme, not instead
          of it. */}
      <div className="site-header-tools">
        <ThemeToggle />
      </div>
    </header>
  );
}

import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { PT_Sans, PT_Serif } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted FULL Noto Sans Mongolian (v3.002, OFL — see fonts/OFL.txt).
// Do not switch to next/font/google: Google Fonts serves this family sliced
// into many unicode-range @font-face resources, which puts NNBSP (U+202F) in
// a different resource than the Mongolian letters. That splits the text into
// separate font runs, so the font's suffix-shaping rules (e.g. ᠶᠢᠨ after
// NNBSP taking the I-shaped form) can never apply.
const notoMongolian = localFont({
  src: "./fonts/NotoSansMongolian-Regular.woff2",
  weight: "400",
  variable: "--font-mongolian",
  display: "swap",
});

// ParaType's public-domain-project pair, chosen because both were designed
// Cyrillic-first — the page is Mongolian Cyrillic before it is anything else,
// and a Latin face with Cyrillic added later shows it in exactly the letters
// this site is made of. next/font self-hosts these at build time; no request
// ever goes to Google from a visitor's browser.
const ptSans = PT_Sans({
  weight: ["400", "700"],
  subsets: ["cyrillic", "latin"],
  variable: "--font-sans",
  display: "swap",
});

// Headings only, so one weight is enough.
const ptSerif = PT_Serif({
  weight: "700",
  subsets: ["cyrillic", "latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Худам — монгол бичиг хөрвүүлэгч",
  description:
    "Кирилл үгийг монгол бичиг рүү шууд хөрвүүлэх үнэгүй, нээлттэй эхийн хөрвүүлэгч. " +
    "Free open-source Cyrillic → traditional Mongolian script (Mongol bichig) converter.",
};

// The browser chrome around the page matches the paper it shows. The two
// values are --bg from globals.css; change them together.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#101214" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="mn"
      className={`${notoMongolian.variable} ${ptSans.variable} ${ptSerif.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

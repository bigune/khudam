import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Худам — монгол бичиг хөрвүүлэгч",
  description:
    "Кирилл үгийг монгол бичиг рүү шууд хөрвүүлэх үнэгүй, нээлттэй эхийн хөрвүүлэгч. " +
    "Free open-source Cyrillic → traditional Mongolian script (Mongol bichig) converter.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className={notoMongolian.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

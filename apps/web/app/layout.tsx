import type { Metadata } from "next";
import { Noto_Sans_Mongolian } from "next/font/google";
import "./globals.css";

const notoMongolian = Noto_Sans_Mongolian({
  weight: "400",
  subsets: ["mongolian"],
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
      <body>{children}</body>
    </html>
  );
}

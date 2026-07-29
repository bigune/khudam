import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "./site-footer";

export const metadata: Metadata = {
  title: "Хуудас олдсонгүй — Худам",
};

/**
 * Without this file a broken link lands on Next's default 404 — English, in a
 * system font, with no way back. The page keeps the site's document shape:
 * the same header anatomy, one link to the converter, the same colophon.
 */
export default function NotFound() {
  return (
    <main>
      <header>
        <h1>Хуудас олдсонгүй</h1>
        <p className="subtitle">Ийм хаяг энэ сайтад алга</p>
        <p className="en" lang="en">
          404 — page not found
        </p>
      </header>

      <section className="info">
        <p>
          Хайсан хуудас тань нүүсэн, устсан эсвэл хаяг нь буруу бичигдсэн байж
          болно. <Link href="/">Хөрвүүлэгч рүү буцах →</Link>
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}

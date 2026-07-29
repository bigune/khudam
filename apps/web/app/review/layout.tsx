import type { Metadata } from "next";

// The page is a client component and cannot export metadata, so the title
// lives here — and it matters more here than elsewhere: this is the page a
// reviewer keeps open in a tab beside their dictionary.
//
// `noindex` is not secrecy. Everything the page shows is compiled from files
// in a public repository, and a search engine could read those directly. It is
// that a page asking "is this spelling right?" of a passing stranger, in a
// tone written for somebody holding a grant, is not a page anyone should
// arrive at from a search result.
export const metadata: Metadata = {
  title: "Хянагчийн хуудас — Худам",
  description:
    "Итгэмжлэгдсэн хянагчийн шийдвэрийн хуудас. " +
    "Trusted-reviewer decisions on traditional Mongolian spellings.",
  robots: { index: false, follow: false },
};

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}

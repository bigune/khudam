import type { Metadata } from "next";

// The page itself is a client component and cannot export metadata, so the
// title lives here. Without it the queue would inherit the converter's title
// and read as the same page in a tab strip, in history, and in a shared link —
// which is the opposite of what this page is asking someone to do.
export const metadata: Metadata = {
  title: "Хянагдахаар хүлээгдэж буй үгс — Худам",
  description:
    "Монгол бичгийн зурлагыг хянаж, баталгаажуулахад туслах дараалал. " +
    "Help verify traditional Mongolian spellings, one question at a time.",
};

export default function QueueLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import Link from "next/link";
import { signalsEnabled } from "../lib/signals";

const REPO_URL = "https://github.com/bigune/khudam";
// rel="noopener" rather than "noreferrer": it is our own site, and the
// referrer is what lets suray.mn see the traffic came from the converter.
const SURAY_URL = "https://suray.mn";
const NPM_URL = "https://www.npmjs.com/package/khudam";

/**
 * The same close on every page: who this is, where the source lives, and how
 * to take part. A colophon rather than a link pile — the brand block anchors
 * the left axis, the two groups carry every destination under a caption, and
 * the licence line ends the page the way a book's imprint page ends a book.
 */
export function SiteFooter() {
  return (
    <footer>
      <div className="footer-cols">
        <div className="footer-brand">
          <span className="footer-name">Худам</span>
          <p className="footer-tag">Нээлттэй монгол бичиг хөрвүүлэгч</p>
          <p className="footer-tag">
            <a href={SURAY_URL} target="_blank" rel="noopener">
              Үндсэн вебсайт — suray.mn
            </a>
          </p>
        </div>

        <nav className="footer-group" aria-label="Нээлттэй эх">
          <span className="field-label">Нээлттэй эх</span>
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={NPM_URL} target="_blank" rel="noreferrer">
            npm
          </a>
          <a
            href={`${REPO_URL}/blob/main/data/SOURCES.md`}
            target="_blank"
            rel="noreferrer"
          >
            Өгөгдлийн эх сурвалж
          </a>
        </nav>

        <nav className="footer-group" aria-label="Оролцох">
          <span className="field-label">Оролцох</span>
          {signalsEnabled && (
            <Link href="/queue">Хянагдахаар хүлээгдэж буй үгс</Link>
          )}
          <a
            href={`${REPO_URL}/blob/main/CONTRIBUTING.md`}
            target="_blank"
            rel="noreferrer"
          >
            Хувь нэмрийн заавар
          </a>
          <a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer">
            Алдаа мэдэгдэх
          </a>
        </nav>
      </div>

      <p className="footer-legal">
        Код{" "}
        <a
          href={`${REPO_URL}/blob/main/LICENSE`}
          target="_blank"
          rel="noreferrer"
        >
          MIT
        </a>{" "}
        · Өгөгдөл{" "}
        <a
          href={`${REPO_URL}/blob/main/data/LICENSE`}
          target="_blank"
          rel="noreferrer"
        >
          CC BY-SA 4.0
        </a>
      </p>
    </footer>
  );
}

"use client";

import { useEffect, useState } from "react";
import { claimGrant, clearReviewer, signalsEnabled } from "../lib/signals";

/**
 * Says, quietly, that this browser holds a trusted-reviewer grant.
 *
 * It renders on both surfaces because the grant applies to both: a reviewer
 * flagging a spelling in the converter is telling us the same quality of thing
 * they would tell us in the queue. Claiming happens here too — the grant
 * arrives in a link, and this is the one component every page mounts.
 *
 * It exists mostly to be honest. Somebody whose answers carry more weight than
 * a stranger's should be able to see that they do, and should be able to put
 * the weight down: a shared computer, a borrowed phone, or a reviewer who wants
 * to answer as an ordinary visitor for a while.
 */
export function ReviewerBadge() {
  // Rendered only after mount, never during the export build: whether a grant
  // is held is a property of the device, and prerendered HTML that assumed one
  // way or the other would flash the wrong answer.
  const [trusted, setTrusted] = useState(false);

  useEffect(() => {
    setTrusted(claimGrant() !== null);
  }, []);

  if (!trusted) return null;

  return (
    <section className="reviewer">
      <span className="badge verified">итгэмжлэгдсэн хянагч ✓</span>
      <p>
        Энэ төхөөрөмжөөс өгсөн хариултууд тань{" "}
        <strong>баталгаа болж тэмдэглэгдэнэ</strong>. Хоёр өөр хянагч нэг
        зурлагыг зөв гэвэл долоо хоног тутмын хүсэлтэд түүнийг «баталгаажсан»
        болгох санал ордог — эцсийн шийдвэрийг хүн гаргана.
      </p>
      {!signalsEnabled && (
        <p>
          Гэхдээ энэ хувилбар дээр хариулт хүлээн авах тохиргоо идэвхгүй тул
          юу ч хадгалагдахгүй.
        </p>
      )}
      <p className="en" lang="en">
        Answers from this device are recorded as attestations. Two different
        reviewers agreeing on a spelling stages it as verified in the weekly
        pull request, where a human merges it.
      </p>
      <button
        className="card-action"
        onClick={() => {
          clearReviewer();
          setTrusted(false);
        }}
      >
        ✕ хянагчийн эрхийг энэ төхөөрөмжөөс хасах
      </button>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";

const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

type Labels = { prompt: string; yes: string; no: string; thanks: string };

/**
 * Maqola "engagement" bloki: ochilganda ko'rish (view) yoziladi va
 * "Foydali bo'ldimi?" fikri yig'iladi (analitika uchun). Xatolar jimgina
 * yutiladi — sahifa ishlashiga ta'sir qilmaydi.
 */
export function ArticleEngagement({
  entityId,
  entityType = "article",
  locale,
  labels,
}: {
  entityId: string;
  entityType?: "article" | "faq";
  locale: string;
  labels: Labels;
}) {
  const [sent, setSent] = useState(false);

  useEffect(() => {
    // Har sessiyada bir marta — takroriy ko'rishlarni kamaytirish.
    const key = `sz_viewed_${entityType}_${entityId}`;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(key)) return;
    fetch(`${PUBLIC_API_URL}/content/view`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ entityType, entityId, locale, referrer: typeof document !== "undefined" ? document.referrer : "" }),
      keepalive: true,
    })
      .then(() => {
        try {
          sessionStorage.setItem(key, "1");
        } catch {
          /* ignore */
        }
      })
      .catch(() => undefined);
  }, [entityId, entityType, locale]);

  const vote = (helpful: boolean) => {
    setSent(true);
    fetch(`${PUBLIC_API_URL}/content/feedback`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ entityType, entityId, locale, helpful }),
      keepalive: true,
    }).catch(() => undefined);
  };

  return (
    <div className="sz-feedback">
      {sent ? (
        <p className="sz-feedback__thanks">{labels.thanks}</p>
      ) : (
        <>
          <span className="sz-feedback__prompt">{labels.prompt}</span>
          <div className="sz-feedback__btns">
            <button type="button" onClick={() => vote(true)} aria-label={labels.yes}>
              <span aria-hidden>👍</span> {labels.yes}
            </button>
            <button type="button" onClick={() => vote(false)} aria-label={labels.no}>
              <span aria-hidden>👎</span> {labels.no}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

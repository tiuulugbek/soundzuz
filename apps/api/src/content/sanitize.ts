import sanitizeHtml from "sanitize-html";

/**
 * Admin yozgan maqola matnini tozalaydi.
 *
 * Bu matn public saytda `dangerouslySetInnerHTML` bilan render qilinadi —
 * ya'ni bu funksiya XSS'ga qarshi yagona to'siq. Ruxsat etilgan teglar va
 * atributlar ro'yxati ATAYLAB qisqa; kengaytirishdan oldin o'ylab ko'ring.
 */
export const sanitizeArticleContent = (value: unknown): string =>
  sanitizeHtml(String(value ?? ""), {
    allowedTags: ["p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "blockquote", "a", "img", "hr", "code", "pre"],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      h2: ["id"],
      h3: ["id"],
      h4: ["id"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      // Tashqi havolalar orqali `window.opener` hujumini oldini olamiz.
      a: (_tagName, attribs) => ({ tagName: "a", attribs: { ...attribs, rel: "noopener noreferrer" } }),
      img: (_tagName, attribs) => ({ tagName: "img", attribs: { ...attribs, loading: "lazy" } }),
    },
  });

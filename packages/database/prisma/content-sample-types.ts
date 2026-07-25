/** Content Hub seed'i uchun umumiy tiplar (asosiy va kengaytma fayllar baham ko'radi). */

export type L = { uz: string; ru: string; en: string };

export type ExtraArticle = {
  slug: string;
  /** `article_categories.slug` — kategoriya shu bo'yicha topiladi. */
  category: string;
  readMin: number;
  title: L;
  excerpt: L;
  content: L;
};

export type ExtraFaq = {
  slug: string;
  /** `faq_categories.slug` */
  category: string;
  order: number;
  q: L;
  a: L;
};

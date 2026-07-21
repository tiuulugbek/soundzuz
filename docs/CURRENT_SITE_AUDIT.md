# Current Site Audit — Initial External Pass

**Audit date:** 2026-07-21  
**Scope:** Public, unauthenticated external inspection

## Confirmed from indexed results

- Homepage title currently positions Soundz Uzbekistan around Custom In-Ear Monitors and earplugs.
- Indexed pages include Shop, About Soundz, Support, Contact, Privacy Policy and Refund/Returns.
- Indexed product URLs use `/product/.../`, strongly indicating WooCommerce-style routing.
- The visible content and indexed copy are mainly IEM-oriented rather than hearing-care-oriented.

## Availability finding

Direct fetches of homepage, shop and product pages returned HTTP 502 during this audit. Therefore:

- live DOM/theme/plugin inspection could not be completed;
- REST API availability could not be confirmed;
- sitemap/robots could not be reliably fetched;
- performance metrics would be misleading;
- server/DNS/reverse-proxy/WordPress health must be checked when access is available.

## Product implications

The new website must not be implemented as a visual refresh of the current information architecture. It needs:

- hearing-care-first homepage;
- clear separation of hearing aids and IEM;
- branch and appointment journeys;
- real availability and price controls;
- lead tracking and admin workflow;
- content/SEO migration with review.

## Next audit inputs

Any one of these unlocks a full audit:

- WordPress admin access;
- server SSH;
- database dump;
- `wp-content/uploads` archive;
- WordPress XML export;
- temporary restored/staging copy.

## Source references used in external pass

- https://soundz.uz/
- https://soundz.uz/shop/
- https://soundz.uz/about-soundz/
- https://soundz.uz/support/
- https://soundz.uz/contact/
- https://soundz.uz/privacy-policy/
- https://soundz.uz/refund_returns/

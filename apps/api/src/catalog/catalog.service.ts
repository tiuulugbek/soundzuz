import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { PrismaClient } from "@soundz/database";
import { PRISMA } from "../prisma/prisma.module.js";

@Injectable()
export class CatalogService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  private async ensureSchema() {
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        locale TEXT NOT NULL DEFAULT 'uz',
        name TEXT NOT NULL,
        short_description TEXT,
        description TEXT,
        brand TEXT,
        form_factor TEXT,
        technology_level TEXT,
        price_from NUMERIC,
        price_to NUMERIC,
        rechargeable BOOLEAN NOT NULL DEFAULT FALSE,
        bluetooth BOOLEAN NOT NULL DEFAULT FALSE,
        in_stock BOOLEAN NOT NULL DEFAULT TRUE,
        is_featured BOOLEAN NOT NULL DEFAULT FALSE,
        status TEXT NOT NULL DEFAULT 'DRAFT',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  async filters() {
    await this.ensureSchema();
    const [brands, forms, levels, prices] = await Promise.all([
      this.prisma.$queryRawUnsafe<any[]>(`SELECT DISTINCT brand AS value FROM products WHERE status='PUBLISHED' AND brand IS NOT NULL ORDER BY brand`),
      this.prisma.$queryRawUnsafe<any[]>(`SELECT DISTINCT form_factor AS value FROM products WHERE status='PUBLISHED' AND form_factor IS NOT NULL ORDER BY form_factor`),
      this.prisma.$queryRawUnsafe<any[]>(`SELECT DISTINCT technology_level AS value FROM products WHERE status='PUBLISHED' AND technology_level IS NOT NULL ORDER BY technology_level`),
      this.prisma.$queryRawUnsafe<any[]>(`SELECT MIN(price_from)::float AS "minPrice", MAX(COALESCE(price_to,price_from))::float AS "maxPrice" FROM products WHERE status='PUBLISHED'`),
    ]);
    return { brands: brands.map((x) => x.value), formFactors: forms.map((x) => x.value), technologyLevels: levels.map((x) => x.value), priceRange: prices[0] ?? { minPrice: 0, maxPrice: 0 } };
  }

  async list(input: Record<string, string | undefined>) {
    await this.ensureSchema();
    const minPrice = input.minPrice ? Number(input.minPrice) : null;
    const maxPrice = input.maxPrice ? Number(input.maxPrice) : null;
    const sortSql = input.sort === "price-asc" ? `price_from ASC NULLS LAST` : input.sort === "price-desc" ? `price_from DESC NULLS LAST` : input.sort === "name" ? `name ASC` : `is_featured DESC, updated_at DESC`;
    return this.prisma.$queryRawUnsafe(
      `SELECT p.id,p.slug,p.name,p.short_description AS "shortDescription",p.brand,p.form_factor AS "formFactor",
              p.technology_level AS "technologyLevel",p.price_from::float AS "priceFrom",p.price_to::float AS "priceTo",
              p.rechargeable,p.bluetooth,p.in_stock AS "inStock",
              (SELECT v.url FROM media_usages u JOIN media_variants v ON v.media_id=u.media_id AND v.variant_key='card'
               WHERE u.entity_type='product' AND u.entity_id=p.id AND u.slot='featured' ORDER BY u.sort_order LIMIT 1) AS "imageUrl"
       FROM products p
       WHERE p.status='PUBLISHED'
         AND ($1::text IS NULL OR to_tsvector('simple',coalesce(p.name,'')||' '||coalesce(p.short_description,'')||' '||coalesce(p.brand,'')) @@ plainto_tsquery('simple',$1))
         AND ($2::text IS NULL OR p.brand=$2)
         AND ($3::text IS NULL OR p.form_factor=$3)
         AND ($4::text IS NULL OR p.technology_level=$4)
         AND ($5::numeric IS NULL OR COALESCE(p.price_to,p.price_from) >= $5)
         AND ($6::numeric IS NULL OR p.price_from <= $6)
         AND ($7::boolean IS NULL OR p.rechargeable=$7)
         AND ($8::boolean IS NULL OR p.bluetooth=$8)
         AND ($9::boolean IS NULL OR p.in_stock=$9)
       ORDER BY ${sortSql}`,
      input.search?.trim() || null,
      input.brand || null,
      input.formFactor || null,
      input.technologyLevel || null,
      minPrice,
      maxPrice,
      input.rechargeable === undefined ? null : input.rechargeable === "true",
      input.bluetooth === undefined ? null : input.bluetooth === "true",
      input.inStock === undefined ? null : input.inStock === "true",
    );
  }

  async get(slug: string) {
    await this.ensureSchema();
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT p.*,
        COALESCE((SELECT json_agg(json_build_object('slot',u.slot,'sortOrder',u.sort_order,'variants',(
          SELECT json_agg(json_build_object('key',v.variant_key,'url',v.url,'width',v.width,'height',v.height) ORDER BY v.width)
          FROM media_variants v WHERE v.media_id=u.media_id
        )) ORDER BY u.sort_order) FROM media_usages u WHERE u.entity_type='product' AND u.entity_id=p.id),'[]') AS media
       FROM products p WHERE p.slug=$1 AND p.status='PUBLISHED' LIMIT 1`, slug,
    );
    if (!rows[0]) throw new NotFoundException("Mahsulot topilmadi");
    return rows[0];
  }
}

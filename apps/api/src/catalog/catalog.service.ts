import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { PrismaClient } from "@soundz/database";
import { randomUUID } from "node:crypto";
import { PRISMA } from "../prisma/prisma.module.js";

type Loc = "uz" | "ru" | "en";
const normLocale = (value?: string): Loc => (value === "ru" ? "ru" : value === "en" ? "en" : "uz");

@Injectable()
export class CatalogService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async filters(localeInput: string = "uz") {
    const locale = normLocale(localeInput);
    const [managed, prices] = await Promise.all([
      this.prisma.$queryRawUnsafe<any[]>(
        `SELECT type,value,label FROM catalog_taxonomies WHERE is_active=TRUE ORDER BY type,sort_order,label`,
      ),
      this.prisma.$queryRawUnsafe<any[]>(
        `SELECT MIN(price_from)::float AS "minPrice",MAX(COALESCE(price_to,price_from))::float AS "maxPrice"
         FROM products WHERE status='PUBLISHED' AND locale=$1`,
        locale,
      ),
    ]);
    const pick = (type: string) => managed.filter((item) => item.type === type).map((item) => item.value);
    return {
      brands: pick("brand"),
      formFactors: pick("form_factor"),
      technologyLevels: pick("technology_level"),
      priceRange: prices[0] ?? { minPrice: 0, maxPrice: 0 },
    };
  }

  async list(input: Record<string, string | undefined>) {
    const locale = normLocale(input.locale);
    const search = input.search?.trim() || null;
    const brand = input.brand || null;
    const formFactor = input.formFactor || null;
    const technologyLevel = input.technologyLevel || null;
    const minPrice = input.minPrice ? Number(input.minPrice) : null;
    const maxPrice = input.maxPrice ? Number(input.maxPrice) : null;
    const rechargeable = input.rechargeable === undefined ? null : input.rechargeable === "true";
    const bluetooth = input.bluetooth === undefined ? null : input.bluetooth === "true";
    const inStock = input.inStock === undefined ? null : input.inStock === "true";
    const page = Math.max(1, Number(input.page) || 1);
    const limit = Math.min(48, Math.max(1, Number(input.limit) || 12));
    const offset = (page - 1) * limit;
    const sort = input.sort === "price-asc"
      ? "price_from ASC NULLS LAST"
      : input.sort === "price-desc"
        ? "price_from DESC NULLS LAST"
        : input.sort === "name"
          ? "name ASC"
          : "is_featured DESC,updated_at DESC";

    const where = `p.status='PUBLISHED'
      AND p.locale=$1
      AND ($2::text IS NULL OR to_tsvector('simple',coalesce(p.name,'')||' '||coalesce(p.short_description,'')||' '||coalesce(p.brand,''))@@plainto_tsquery('simple',$2))
      AND ($3::text IS NULL OR p.brand=$3)
      AND ($4::text IS NULL OR p.form_factor=$4)
      AND ($5::text IS NULL OR p.technology_level=$5)
      AND ($6::numeric IS NULL OR COALESCE(p.price_to,p.price_from)>=$6)
      AND ($7::numeric IS NULL OR p.price_from<=$7)
      AND ($8::boolean IS NULL OR p.rechargeable=$8)
      AND ($9::boolean IS NULL OR p.bluetooth=$9)
      AND ($10::boolean IS NULL OR p.in_stock=$10)`;

    const queryArgs: Array<string | number | boolean | null> = [
      locale,
      search,
      brand,
      formFactor,
      technologyLevel,
      minPrice,
      maxPrice,
      rechargeable,
      bluetooth,
      inStock,
    ];

    const [items, countRows] = await Promise.all([
      this.prisma.$queryRawUnsafe<any[]>(
        `SELECT p.id,p.slug,p.name,p.short_description AS "shortDescription",p.brand,p.form_factor AS "formFactor",
         p.technology_level AS "technologyLevel",p.price_from::float AS "priceFrom",p.price_to::float AS "priceTo",
         p.rechargeable,p.bluetooth,p.in_stock AS "inStock",
         (SELECT v.url FROM media_usages u JOIN media_variants v ON v.media_id=u.media_id AND v.variant_key='card'
          WHERE u.entity_type='product' AND u.entity_id=p.id AND u.slot='featured' ORDER BY u.sort_order LIMIT 1) AS "imageUrl"
         FROM products p WHERE ${where} ORDER BY ${sort} LIMIT $11 OFFSET $12`,
        ...queryArgs,
        limit,
        offset,
      ),
      this.prisma.$queryRawUnsafe<any[]>(
        `SELECT COUNT(*)::int AS total FROM products p WHERE ${where}`,
        ...queryArgs,
      ),
    ]);

    const total = Number(countRows[0]?.total ?? 0);
    return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async get(slug: string, localeInput: string = "uz") {
    const locale = normLocale(localeInput);
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT p.*,
       p.short_description AS "shortDescription",p.form_factor AS "formFactor",p.technology_level AS "technologyLevel",
       p.brand_slug AS "brandSlug",p.price_from::float AS "priceFrom",p.price_to::float AS "priceTo",
       p.in_stock AS "inStock",p.seo_title AS "seoTitle",p.seo_description AS "seoDescription",
       COALESCE((SELECT json_agg(json_build_object('slot',u.slot,'sortOrder',u.sort_order,'variants',
       (SELECT json_agg(json_build_object('key',v.variant_key,'url',v.url,'width',v.width,'height',v.height) ORDER BY v.width)
        FROM media_variants v WHERE v.media_id=u.media_id)) ORDER BY u.sort_order)
       FROM media_usages u WHERE u.entity_type='product' AND u.entity_id=p.id),'[]') AS media,
       COALESCE((SELECT json_agg(json_build_object('group',s.spec_group,'label',s.label,'value',s.value,'unit',s.unit) ORDER BY s.sort_order)
       FROM product_specs s WHERE s.product_id=p.id),'[]') AS specs,
       COALESCE((SELECT json_agg(json_build_object('author',r.author_name,'rating',r.rating,'title',r.title,'body',r.body,'createdAt',r.created_at) ORDER BY r.created_at DESC)
       FROM reviews r WHERE r.product_id=p.id AND r.is_published=TRUE),'[]') AS reviews,
       (SELECT ROUND(AVG(r.rating)::numeric,1)::float FROM reviews r WHERE r.product_id=p.id AND r.is_published=TRUE) AS "ratingAverage",
       (SELECT COUNT(*)::int FROM reviews r WHERE r.product_id=p.id AND r.is_published=TRUE) AS "ratingCount"
       FROM products p WHERE p.slug=$1 AND p.locale=$2 AND p.status='PUBLISHED' LIMIT 1`,
      slug,
      locale,
    );
    if (!rows[0]) throw new NotFoundException(locale === "ru" ? "Товар не найден" : locale === "en" ? "Product not found" : "Mahsulot topilmadi");
    return rows[0];
  }

  async listBrands(localeInput: string = "uz") {
    const locale = normLocale(localeInput);
    return this.prisma.$queryRawUnsafe(
      `SELECT b.id,b.slug,b.name,b.tagline,b.description,b.origin_country AS "originCountry",b.website_url AS "websiteUrl",
       (SELECT COUNT(*)::int FROM products p WHERE p.brand_slug=b.slug AND p.locale=b.locale AND p.status='PUBLISHED') AS "productCount",
       (SELECT v.url FROM media_usages u JOIN media_variants v ON v.media_id=u.media_id AND v.variant_key='logo'
        WHERE u.entity_type='brand' AND u.entity_id=b.id ORDER BY u.sort_order LIMIT 1) AS "logoUrl"
       FROM brands b WHERE b.locale=$1 AND b.is_active=TRUE AND b.status='PUBLISHED' ORDER BY b.sort_order,b.name`,
      locale,
    );
  }

  async getBrand(slug: string, localeInput: string = "uz") {
    const locale = normLocale(localeInput);
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT b.*,
       (SELECT v.url FROM media_usages u JOIN media_variants v ON v.media_id=u.media_id AND v.variant_key='logo'
        WHERE u.entity_type='brand' AND u.entity_id=b.id ORDER BY u.sort_order LIMIT 1) AS "logoUrl"
       FROM brands b WHERE b.slug=$1 AND b.locale=$2 AND b.status='PUBLISHED' LIMIT 1`,
      slug,
      locale,
    );
    if (!rows[0]) throw new NotFoundException(locale === "ru" ? "Бренд не найден" : locale === "en" ? "Brand not found" : "Brend topilmadi");
    const brandProducts = await this.prisma.$queryRawUnsafe(
      `SELECT p.id,p.slug,p.name,p.short_description AS "shortDescription",p.brand,p.form_factor AS "formFactor",
       p.technology_level AS "technologyLevel",p.price_from::float AS "priceFrom",p.price_to::float AS "priceTo",p.rechargeable,p.bluetooth,
       (SELECT v.url FROM media_usages u JOIN media_variants v ON v.media_id=u.media_id AND v.variant_key='card'
        WHERE u.entity_type='product' AND u.entity_id=p.id AND u.slot='featured' ORDER BY u.sort_order LIMIT 1) AS "imageUrl"
       FROM products p WHERE p.brand_slug=$1 AND p.locale=$2 AND p.status='PUBLISHED' ORDER BY p.is_featured DESC,p.updated_at DESC`,
      slug,
      locale,
    );
    return { ...rows[0], products: brandProducts };
  }

  listAdmin() {
    return this.prisma.$queryRawUnsafe(
      `SELECT id,slug,name,brand,status,in_stock AS "inStock",is_featured AS "isFeatured",updated_at AS "updatedAt" FROM products ORDER BY updated_at DESC`,
    );
  }

  async getAdmin(id: string) {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id,slug,locale,name,short_description AS "shortDescription",description,brand,form_factor AS "formFactor",technology_level AS "technologyLevel",price_from::float AS "priceFrom",price_to::float AS "priceTo",rechargeable,bluetooth,in_stock AS "inStock",is_featured AS "isFeatured",status,seo_title AS "seoTitle",seo_description AS "seoDescription" FROM products WHERE id=$1 LIMIT 1`,
      id,
    );
    if (!rows[0]) throw new NotFoundException("Mahsulot topilmadi");
    return rows[0];
  }

  async create(input: any) {
    const id = randomUUID();
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `INSERT INTO products(id,slug,locale,name,short_description,description,brand,form_factor,technology_level,price_from,price_to,rechargeable,bluetooth,in_stock,is_featured,status,seo_title,seo_description) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
      id,input.slug,input.locale??"uz",input.name,input.shortDescription??null,input.description??null,input.brand??null,input.formFactor??null,input.technologyLevel??null,input.priceFrom??null,input.priceTo??null,!!input.rechargeable,!!input.bluetooth,input.inStock!==false,!!input.isFeatured,input.status??"DRAFT",input.seoTitle??null,input.seoDescription??null,
    );
    return rows[0];
  }

  async update(id: string, input: any) {
    await this.getAdmin(id);
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `UPDATE products SET slug=$2,locale=$3,name=$4,short_description=$5,description=$6,brand=$7,form_factor=$8,technology_level=$9,price_from=$10,price_to=$11,rechargeable=$12,bluetooth=$13,in_stock=$14,is_featured=$15,status=$16,seo_title=$17,seo_description=$18,updated_at=NOW() WHERE id=$1 RETURNING *`,
      id,input.slug,input.locale??"uz",input.name,input.shortDescription??null,input.description??null,input.brand??null,input.formFactor??null,input.technologyLevel??null,input.priceFrom??null,input.priceTo??null,!!input.rechargeable,!!input.bluetooth,input.inStock!==false,!!input.isFeatured,input.status??"DRAFT",input.seoTitle??null,input.seoDescription??null,
    );
    return rows[0];
  }

  adminTaxonomies() {
    return this.prisma.$queryRawUnsafe(
      `SELECT id,type,value,label,sort_order AS "sortOrder",is_active AS "isActive" FROM catalog_taxonomies ORDER BY type,sort_order,label`,
    );
  }

  async createTaxonomy(input: any) {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `INSERT INTO catalog_taxonomies(id,type,value,label,sort_order,is_active) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      randomUUID(),input.type,input.value,input.label??input.value,input.sortOrder??0,input.isActive!==false,
    );
    return rows[0];
  }

  async updateTaxonomy(id: string, input: any) {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `UPDATE catalog_taxonomies SET type=$2,value=$3,label=$4,sort_order=$5,is_active=$6,updated_at=NOW() WHERE id=$1 RETURNING *`,
      id,input.type,input.value,input.label??input.value,input.sortOrder??0,input.isActive!==false,
    );
    if (!rows[0]) throw new NotFoundException("Taxonomiya topilmadi");
    return rows[0];
  }

  adminBrands() {
    return this.prisma.$queryRawUnsafe(
      `SELECT id,slug,locale,name,tagline,status,is_active AS "isActive",sort_order AS "sortOrder",updated_at AS "updatedAt" FROM brands ORDER BY sort_order,name`,
    );
  }

  async getAdminBrand(id: string) {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id,slug,locale,name,tagline,description,origin_country AS "originCountry",website_url AS "websiteUrl",sort_order AS "sortOrder",is_active AS "isActive",status,seo_title AS "seoTitle",seo_description AS "seoDescription" FROM brands WHERE id=$1 LIMIT 1`,
      id,
    );
    if (!rows[0]) throw new NotFoundException("Brend topilmadi");
    return rows[0];
  }

  async createBrand(input: any) {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `INSERT INTO brands(id,slug,locale,name,tagline,description,origin_country,website_url,sort_order,is_active,status,seo_title,seo_description) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      randomUUID(),input.slug,input.locale??"uz",input.name,input.tagline??null,input.description??null,input.originCountry??null,input.websiteUrl??null,input.sortOrder??0,input.isActive!==false,input.status??"DRAFT",input.seoTitle??null,input.seoDescription??null,
    );
    return rows[0];
  }

  async updateBrand(id: string, input: any) {
    await this.getAdminBrand(id);
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `UPDATE brands SET slug=$2,locale=$3,name=$4,tagline=$5,description=$6,origin_country=$7,website_url=$8,sort_order=$9,is_active=$10,status=$11,seo_title=$12,seo_description=$13,updated_at=NOW() WHERE id=$1 RETURNING *`,
      id,input.slug,input.locale??"uz",input.name,input.tagline??null,input.description??null,input.originCountry??null,input.websiteUrl??null,input.sortOrder??0,input.isActive!==false,input.status??"DRAFT",input.seoTitle??null,input.seoDescription??null,
    );
    return rows[0];
  }

  productSpecs(productId: string) {
    return this.prisma.$queryRawUnsafe(
      `SELECT id,spec_group AS "specGroup",label,value,unit,sort_order AS "sortOrder" FROM product_specs WHERE product_id=$1 ORDER BY sort_order,label`,
      productId,
    );
  }

  async createSpec(input: any) {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `INSERT INTO product_specs(id,product_id,spec_group,label,value,unit,sort_order) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      randomUUID(),input.productId,input.specGroup??null,input.label,input.value,input.unit??null,input.sortOrder??0,
    );
    return rows[0];
  }

  async updateSpec(id: string, input: any) {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `UPDATE product_specs SET spec_group=$2,label=$3,value=$4,unit=$5,sort_order=$6 WHERE id=$1 RETURNING *`,
      id,input.specGroup??null,input.label,input.value,input.unit??null,input.sortOrder??0,
    );
    if (!rows[0]) throw new NotFoundException("Spetsifikatsiya topilmadi");
    return rows[0];
  }

  async deleteSpec(id: string) {
    await this.prisma.$queryRawUnsafe(`DELETE FROM product_specs WHERE id=$1`, id);
    return { ok: true };
  }
}

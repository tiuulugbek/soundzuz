import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { PrismaClient } from "@soundz/database";
import { randomUUID } from "node:crypto";
import { PRISMA } from "../prisma/prisma.module.js";

@Injectable()
export class CatalogService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  private async ensureSchema() {
    await this.prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, locale TEXT NOT NULL DEFAULT 'uz', name TEXT NOT NULL,
      short_description TEXT, description TEXT, brand TEXT, form_factor TEXT, technology_level TEXT,
      price_from NUMERIC, price_to NUMERIC, rechargeable BOOLEAN NOT NULL DEFAULT FALSE,
      bluetooth BOOLEAN NOT NULL DEFAULT FALSE, in_stock BOOLEAN NOT NULL DEFAULT TRUE,
      is_featured BOOLEAN NOT NULL DEFAULT FALSE, status TEXT NOT NULL DEFAULT 'DRAFT',
      seo_title TEXT, seo_description TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    await this.prisma.$executeRawUnsafe(`ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title TEXT`);
    await this.prisma.$executeRawUnsafe(`ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description TEXT`);
    await this.prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS catalog_taxonomies (
      id TEXT PRIMARY KEY, taxonomy_type TEXT NOT NULL, value TEXT NOT NULL, label TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(taxonomy_type,value))`);
  }

  async filters() {
    await this.ensureSchema();
    const [managed, prices] = await Promise.all([
      this.prisma.$queryRawUnsafe<any[]>(`SELECT taxonomy_type AS type,value,label FROM catalog_taxonomies WHERE is_active=TRUE ORDER BY taxonomy_type,sort_order,label`),
      this.prisma.$queryRawUnsafe<any[]>(`SELECT MIN(price_from)::float AS "minPrice",MAX(COALESCE(price_to,price_from))::float AS "maxPrice" FROM products WHERE status='PUBLISHED'`),
    ]);
    const pick=(type:string)=>managed.filter(x=>x.type===type).map(x=>x.value);
    return { brands:pick('brand'), formFactors:pick('form_factor'), technologyLevels:pick('technology_level'), priceRange:prices[0]??{minPrice:0,maxPrice:0} };
  }

  async list(input: Record<string,string|undefined>) {
    await this.ensureSchema();
    const min=input.minPrice?Number(input.minPrice):null, max=input.maxPrice?Number(input.maxPrice):null;
    const sort=input.sort==='price-asc'?'price_from ASC NULLS LAST':input.sort==='price-desc'?'price_from DESC NULLS LAST':input.sort==='name'?'name ASC':'is_featured DESC,updated_at DESC';
    return this.prisma.$queryRawUnsafe(`SELECT p.id,p.slug,p.name,p.short_description AS "shortDescription",p.brand,p.form_factor AS "formFactor",
      p.technology_level AS "technologyLevel",p.price_from::float AS "priceFrom",p.price_to::float AS "priceTo",
      p.rechargeable,p.bluetooth,p.in_stock AS "inStock",(SELECT v.url FROM media_usages u JOIN media_variants v ON v.media_id=u.media_id AND v.variant_key='card'
      WHERE u.entity_type='product' AND u.entity_id=p.id AND u.slot='featured' ORDER BY u.sort_order LIMIT 1) AS "imageUrl"
      FROM products p WHERE p.status='PUBLISHED'
      AND ($1::text IS NULL OR to_tsvector('simple',coalesce(p.name,'')||' '||coalesce(p.short_description,'')||' '||coalesce(p.brand,''))@@plainto_tsquery('simple',$1))
      AND ($2::text IS NULL OR p.brand=$2) AND ($3::text IS NULL OR p.form_factor=$3) AND ($4::text IS NULL OR p.technology_level=$4)
      AND ($5::numeric IS NULL OR COALESCE(p.price_to,p.price_from)>=$5) AND ($6::numeric IS NULL OR p.price_from<=$6)
      AND ($7::boolean IS NULL OR p.rechargeable=$7) AND ($8::boolean IS NULL OR p.bluetooth=$8) AND ($9::boolean IS NULL OR p.in_stock=$9)
      ORDER BY ${sort}`,input.search?.trim()||null,input.brand||null,input.formFactor||null,input.technologyLevel||null,min,max,
      input.rechargeable===undefined?null:input.rechargeable==='true',input.bluetooth===undefined?null:input.bluetooth==='true',input.inStock===undefined?null:input.inStock==='true');
  }

  async get(slug:string) {
    await this.ensureSchema();
    const rows=await this.prisma.$queryRawUnsafe<any[]>(`SELECT p.*,COALESCE((SELECT json_agg(json_build_object('slot',u.slot,'sortOrder',u.sort_order,'variants',(
      SELECT json_agg(json_build_object('key',v.variant_key,'url',v.url,'width',v.width,'height',v.height) ORDER BY v.width) FROM media_variants v WHERE v.media_id=u.media_id
    )) ORDER BY u.sort_order) FROM media_usages u WHERE u.entity_type='product' AND u.entity_id=p.id),'[]') AS media FROM products p WHERE p.slug=$1 AND p.status='PUBLISHED' LIMIT 1`,slug);
    if(!rows[0]) throw new NotFoundException("Mahsulot topilmadi"); return rows[0];
  }

  async listAdmin(){ await this.ensureSchema(); return this.prisma.$queryRawUnsafe(`SELECT id,slug,name,brand,status,in_stock AS "inStock",is_featured AS "isFeatured",updated_at AS "updatedAt" FROM products ORDER BY updated_at DESC`); }
  async getAdmin(id:string){ await this.ensureSchema(); const rows=await this.prisma.$queryRawUnsafe<any[]>(`SELECT id,slug,locale,name,short_description AS "shortDescription",description,brand,form_factor AS "formFactor",technology_level AS "technologyLevel",price_from::float AS "priceFrom",price_to::float AS "priceTo",rechargeable,bluetooth,in_stock AS "inStock",is_featured AS "isFeatured",status,seo_title AS "seoTitle",seo_description AS "seoDescription" FROM products WHERE id=$1 LIMIT 1`,id); if(!rows[0])throw new NotFoundException("Mahsulot topilmadi"); return rows[0]; }
  async create(input:any){ await this.ensureSchema(); const id=randomUUID(); const rows=await this.prisma.$queryRawUnsafe<any[]>(`INSERT INTO products(id,slug,locale,name,short_description,description,brand,form_factor,technology_level,price_from,price_to,rechargeable,bluetooth,in_stock,is_featured,status,seo_title,seo_description) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,id,input.slug,input.locale??'uz',input.name,input.shortDescription??null,input.description??null,input.brand??null,input.formFactor??null,input.technologyLevel??null,input.priceFrom??null,input.priceTo??null,!!input.rechargeable,!!input.bluetooth,input.inStock!==false,!!input.isFeatured,input.status??'DRAFT',input.seoTitle??null,input.seoDescription??null); return rows[0]; }
  async update(id:string,input:any){ await this.getAdmin(id); const rows=await this.prisma.$queryRawUnsafe<any[]>(`UPDATE products SET slug=$2,locale=$3,name=$4,short_description=$5,description=$6,brand=$7,form_factor=$8,technology_level=$9,price_from=$10,price_to=$11,rechargeable=$12,bluetooth=$13,in_stock=$14,is_featured=$15,status=$16,seo_title=$17,seo_description=$18,updated_at=NOW() WHERE id=$1 RETURNING *`,id,input.slug,input.locale??'uz',input.name,input.shortDescription??null,input.description??null,input.brand??null,input.formFactor??null,input.technologyLevel??null,input.priceFrom??null,input.priceTo??null,!!input.rechargeable,!!input.bluetooth,input.inStock!==false,!!input.isFeatured,input.status??'DRAFT',input.seoTitle??null,input.seoDescription??null); return rows[0]; }
  async adminTaxonomies(){ await this.ensureSchema(); return this.prisma.$queryRawUnsafe(`SELECT id,taxonomy_type AS "type",value,label,sort_order AS "sortOrder",is_active AS "isActive" FROM catalog_taxonomies ORDER BY taxonomy_type,sort_order,label`); }
  async createTaxonomy(input:any){ await this.ensureSchema(); const rows=await this.prisma.$queryRawUnsafe<any[]>(`INSERT INTO catalog_taxonomies(id,taxonomy_type,value,label,sort_order,is_active) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,randomUUID(),input.type,input.value,input.label??input.value,input.sortOrder??0,input.isActive!==false); return rows[0]; }
  async updateTaxonomy(id:string,input:any){ await this.ensureSchema(); const rows=await this.prisma.$queryRawUnsafe<any[]>(`UPDATE catalog_taxonomies SET taxonomy_type=$2,value=$3,label=$4,sort_order=$5,is_active=$6,updated_at=NOW() WHERE id=$1 RETURNING *`,id,input.type,input.value,input.label??input.value,input.sortOrder??0,input.isActive!==false); if(!rows[0])throw new NotFoundException("Taxonomiya topilmadi"); return rows[0]; }
}

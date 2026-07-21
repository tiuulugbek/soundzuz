import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { PrismaClient } from "@soundz/database";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { PRISMA } from "../prisma/prisma.module.js";

type VariantPreset = { key: string; width: number; height: number; fit: "cover" | "contain" };
const PRESETS: VariantPreset[] = [
  { key: "thumb", width: 320, height: 210, fit: "cover" },
  { key: "card", width: 640, height: 420, fit: "cover" },
  { key: "hero", width: 1600, height: 900, fit: "cover" },
  { key: "og", width: 1200, height: 630, fit: "cover" },
];

@Injectable()
export class MediaService {
  private readonly root = process.env.MEDIA_STORAGE_PATH ?? join(process.cwd(), "storage", "media");
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  private async ensureSchema() {
    await this.prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY, original_name TEXT NOT NULL, mime_type TEXT NOT NULL, width INTEGER NOT NULL,
      height INTEGER NOT NULL, alt_text TEXT, caption TEXT, storage_provider TEXT NOT NULL DEFAULT 'local',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    await this.prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS media_variants (
      id TEXT PRIMARY KEY, media_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
      variant_key TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL, size_bytes INTEGER NOT NULL,
      path TEXT NOT NULL, url TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(media_id, variant_key))`);
    await this.prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS media_usages (
      id TEXT PRIMARY KEY, media_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
      entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, slot TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(entity_type, entity_id, slot, sort_order))`);
  }

  async upload(input: { buffer: Buffer; originalName: string; mimeType: string; altText?: string; caption?: string }) {
    await this.ensureSchema();
    const id = randomUUID();
    const metadata = await sharp(input.buffer, { failOn: "error" }).rotate().metadata();
    if (!metadata.width || !metadata.height) throw new Error("Rasm o‘lchamini aniqlab bo‘lmadi");
    const dir = join(this.root, id); await mkdir(dir, { recursive: true });
    const variants: any[] = [];
    for (const preset of PRESETS) {
      const output = await sharp(input.buffer).rotate().resize(preset.width, preset.height, {
        fit: preset.fit, position: "centre", withoutEnlargement: false,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      }).webp({ quality: 82, effort: 5, smartSubsample: true }).toBuffer();
      const filePath = join(dir, `${preset.key}.webp`); await writeFile(filePath, output);
      variants.push({ id: randomUUID(), key: preset.key, width: preset.width, height: preset.height,
        sizeBytes: output.byteLength, path: filePath, url: `/v1/media/${id}/${preset.key}` });
    }
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO media_assets (id, original_name, mime_type, width, height, alt_text, caption) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      id, input.originalName, "image/webp", metadata.width, metadata.height, input.altText ?? null, input.caption ?? null,
    );
    for (const v of variants) await this.prisma.$executeRawUnsafe(
      `INSERT INTO media_variants (id, media_id, variant_key, width, height, size_bytes, path, url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      v.id, id, v.key, v.width, v.height, v.sizeBytes, v.path, v.url,
    );
    return this.get(id);
  }

  async attach(input: { mediaId: string; entityType: string; entityId: string; slot: string; sortOrder?: number }) {
    await this.ensureSchema(); await this.get(input.mediaId);
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO media_usages (id,media_id,entity_type,entity_id,slot,sort_order) VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (entity_type,entity_id,slot,sort_order) DO UPDATE SET media_id=EXCLUDED.media_id`,
      randomUUID(), input.mediaId, input.entityType, input.entityId, input.slot, input.sortOrder ?? 0,
    );
    return { success: true };
  }

  async usages(entityType: string, entityId: string) {
    await this.ensureSchema();
    return this.prisma.$queryRawUnsafe(`SELECT u.slot,u.sort_order AS "sortOrder",m.id,m.alt_text AS "altText",
      COALESCE(json_agg(json_build_object('key',v.variant_key,'url',v.url,'width',v.width,'height',v.height)
      ORDER BY v.width) FILTER (WHERE v.id IS NOT NULL),'[]') AS variants
      FROM media_usages u JOIN media_assets m ON m.id=u.media_id LEFT JOIN media_variants v ON v.media_id=m.id
      WHERE u.entity_type=$1 AND u.entity_id=$2 GROUP BY u.id,m.id ORDER BY u.slot,u.sort_order`, entityType, entityId);
  }

  async list() { await this.ensureSchema(); return this.prisma.$queryRawUnsafe(`SELECT m.id,m.original_name AS "originalName",
    m.mime_type AS "mimeType",m.width,m.height,m.alt_text AS "altText",m.caption,m.created_at AS "createdAt",
    COALESCE(json_agg(json_build_object('key',v.variant_key,'width',v.width,'height',v.height,'sizeBytes',v.size_bytes,'url',v.url)
    ORDER BY v.width) FILTER (WHERE v.id IS NOT NULL),'[]') AS variants FROM media_assets m LEFT JOIN media_variants v ON v.media_id=m.id
    GROUP BY m.id ORDER BY m.created_at DESC`); }

  async get(id: string) { await this.ensureSchema(); const rows=await this.prisma.$queryRawUnsafe<any[]>(`SELECT m.id,
    m.original_name AS "originalName",m.mime_type AS "mimeType",m.width,m.height,m.alt_text AS "altText",m.caption,
    m.created_at AS "createdAt",COALESCE(json_agg(json_build_object('key',v.variant_key,'width',v.width,'height',v.height,
    'sizeBytes',v.size_bytes,'url',v.url) ORDER BY v.width) FILTER (WHERE v.id IS NOT NULL),'[]') AS variants
    FROM media_assets m LEFT JOIN media_variants v ON v.media_id=m.id WHERE m.id=$1 GROUP BY m.id LIMIT 1`, id);
    if(!rows[0]) throw new NotFoundException("Media topilmadi"); return rows[0]; }

  async readVariant(mediaId: string, key: string) { await this.ensureSchema(); const rows=await this.prisma.$queryRawUnsafe<any[]>(
    `SELECT path FROM media_variants WHERE media_id=$1 AND variant_key=$2 LIMIT 1`,mediaId,key);
    if(!rows[0]) throw new NotFoundException("Rasm varianti topilmadi"); return readFile(rows[0].path); }
}

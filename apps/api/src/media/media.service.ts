import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { PrismaClient } from "@soundz/database";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { PRISMA } from "../prisma/prisma.module.js";
import { createMediaStorage, type MediaStorage } from "./media-storage.js";

type VariantPreset = { key: string; width: number; height: number; fit: "cover" | "contain" };
const PRESETS: VariantPreset[] = [
  { key: "thumb", width: 320, height: 210, fit: "cover" },
  { key: "card", width: 640, height: 420, fit: "cover" },
  { key: "hero", width: 1600, height: 900, fit: "cover" },
  { key: "og", width: 1200, height: 630, fit: "cover" },
];

@Injectable()
export class MediaService {
  private readonly storage: MediaStorage = createMediaStorage();

  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async upload(input: { buffer: Buffer; originalName: string; mimeType: string; altText?: string; caption?: string }) {
    const id = randomUUID();
    const source = sharp(input.buffer, { failOn: "error", limitInputPixels: 50_000_000 }).rotate();
    const metadata = await source.metadata();
    if (!metadata.width || !metadata.height) throw new Error("Rasm o‘lchamini aniqlab bo‘lmadi");

    const variants: Array<{
      id: string;
      key: string;
      width: number;
      height: number;
      sizeBytes: number;
      path: string;
      url: string;
      provider: string;
    }> = [];

    for (const preset of PRESETS) {
      const output = await sharp(input.buffer, { failOn: "error", limitInputPixels: 50_000_000 })
        .rotate()
        .resize(preset.width, preset.height, {
          fit: preset.fit,
          position: "centre",
          withoutEnlargement: false,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .webp({ quality: 82, effort: 5, smartSubsample: true })
        .toBuffer();
      const stored = await this.storage.put(`${id}/${preset.key}.webp`, output, "image/webp");
      variants.push({
        id: randomUUID(),
        key: preset.key,
        width: preset.width,
        height: preset.height,
        sizeBytes: output.byteLength,
        path: stored.path,
        url: stored.url,
        provider: stored.provider,
      });
    }

    const provider = variants[0]?.provider ?? "local";
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `INSERT INTO media_assets (id, original_name, mime_type, width, height, alt_text, caption, storage_provider)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        id,
        input.originalName,
        "image/webp",
        metadata.width,
        metadata.height,
        input.altText ?? null,
        input.caption ?? null,
        provider,
      );
      for (const variant of variants) {
        await tx.$executeRawUnsafe(
          `INSERT INTO media_variants (id, media_id, variant_key, width, height, size_bytes, path, url)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          variant.id,
          id,
          variant.key,
          variant.width,
          variant.height,
          variant.sizeBytes,
          variant.path,
          variant.url,
        );
      }
    });
    return this.get(id);
  }

  async attach(input: { mediaId: string; entityType: string; entityId: string; slot: string; sortOrder?: number }) {
    await this.get(input.mediaId);
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO media_usages (id,media_id,entity_type,entity_id,slot,sort_order) VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (entity_type,entity_id,slot,sort_order) DO UPDATE SET media_id=EXCLUDED.media_id`,
      randomUUID(),
      input.mediaId,
      input.entityType,
      input.entityId,
      input.slot,
      input.sortOrder ?? 0,
    );
    return { success: true };
  }

  async usages(entityType: string, entityId: string) {
    return this.prisma.$queryRawUnsafe(`SELECT u.slot,u.sort_order AS "sortOrder",m.id,m.alt_text AS "altText",
      COALESCE(json_agg(json_build_object('key',v.variant_key,'url',v.url,'width',v.width,'height',v.height)
      ORDER BY v.width) FILTER (WHERE v.id IS NOT NULL),'[]') AS variants
      FROM media_usages u JOIN media_assets m ON m.id=u.media_id LEFT JOIN media_variants v ON v.media_id=m.id
      WHERE u.entity_type=$1 AND u.entity_id=$2 GROUP BY u.id,m.id ORDER BY u.slot,u.sort_order`, entityType, entityId);
  }

  async list() {
    return this.prisma.$queryRawUnsafe(`SELECT m.id,m.original_name AS "originalName",m.mime_type AS "mimeType",
      m.width,m.height,m.alt_text AS "altText",m.caption,m.storage_provider AS "storageProvider",m.created_at AS "createdAt",
      COALESCE(json_agg(json_build_object('key',v.variant_key,'width',v.width,'height',v.height,'sizeBytes',v.size_bytes,'url',v.url)
      ORDER BY v.width) FILTER (WHERE v.id IS NOT NULL),'[]') AS variants
      FROM media_assets m LEFT JOIN media_variants v ON v.media_id=m.id GROUP BY m.id ORDER BY m.created_at DESC`);
  }

  async get(id: string) {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(`SELECT m.id,m.original_name AS "originalName",
      m.mime_type AS "mimeType",m.width,m.height,m.alt_text AS "altText",m.caption,m.storage_provider AS "storageProvider",
      m.created_at AS "createdAt",COALESCE(json_agg(json_build_object('key',v.variant_key,'width',v.width,'height',v.height,
      'sizeBytes',v.size_bytes,'url',v.url) ORDER BY v.width) FILTER (WHERE v.id IS NOT NULL),'[]') AS variants
      FROM media_assets m LEFT JOIN media_variants v ON v.media_id=m.id WHERE m.id=$1 GROUP BY m.id LIMIT 1`, id);
    if (!rows[0]) throw new NotFoundException("Media topilmadi");
    return rows[0];
  }

  async readVariant(mediaId: string, key: string) {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT v.path,m.storage_provider AS provider FROM media_variants v
       JOIN media_assets m ON m.id=v.media_id WHERE v.media_id=$1 AND v.variant_key=$2 LIMIT 1`,
      mediaId,
      key,
    );
    if (!rows[0]) throw new NotFoundException("Rasm varianti topilmadi");
    return this.storage.read(rows[0].path);
  }
}

import { BadRequestException, Body, Controller, Get, Param, Post, Query, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { MediaService } from "./media.service.js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

@Controller("media")
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get(":id/:variant")
  async file(@Param("id") id: string, @Param("variant") variant: string, @Res({ passthrough: true }) response: Response) {
    const buffer = await this.media.readVariant(id, variant);
    response.setHeader("content-type", "image/webp");
    response.setHeader("cache-control", "public, max-age=31536000, immutable");
    return new StreamableFile(buffer);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  list() { return this.media.list(); }

  @Get("usage/list")
  @UseGuards(JwtAuthGuard)
  usages(@Query("entityType") entityType: string, @Query("entityId") entityId: string) {
    return this.media.usages(entityType, entityId);
  }

  @Post("attach")
  @UseGuards(JwtAuthGuard)
  attach(@Body() body: { mediaId: string; entityType: string; entityId: string; slot: string; sortOrder?: number }) {
    if (!body.mediaId || !body.entityType || !body.entityId || !body.slot) throw new BadRequestException("Media bog‘lash ma’lumotlari to‘liq emas");
    return this.media.attach(body);
  }

  @Post("upload")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 12 * 1024 * 1024 } }))
  upload(@UploadedFile() file: Express.Multer.File, @Body("altText") altText?: string, @Body("caption") caption?: string) {
    if (!file) throw new BadRequestException("Rasm fayli yuborilmadi");
    if (!ALLOWED_TYPES.includes(file.mimetype)) throw new BadRequestException("Faqat JPG, PNG, WEBP yoki HEIC rasm yuklash mumkin");
    return this.media.upload({ buffer: file.buffer, originalName: file.originalname, mimeType: file.mimetype, altText, caption });
  }
}

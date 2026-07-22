import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { MediaService } from "./media.service.js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MEDIA_ROLES = ["CONTENT_MANAGER", "PRODUCT_MANAGER", "BRANCH_MANAGER"] as const;

@Controller("media")
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get(":id/:variant")
  async file(
    @Param("id") id: string,
    @Param("variant") variant: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const buffer = await this.media.readVariant(id, variant);
    response.setHeader("content-type", "image/webp");
    response.setHeader("cache-control", "public, max-age=31536000, immutable");
    return new StreamableFile(buffer);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...MEDIA_ROLES)
  list() {
    return this.media.list();
  }

  @Get("usage/list")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...MEDIA_ROLES)
  usages(@Query("entityType") entityType: string, @Query("entityId") entityId: string) {
    return this.media.usages(entityType, entityId);
  }

  @Post("attach")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...MEDIA_ROLES)
  attach(@Body() body: { mediaId: string; entityType: string; entityId: string; slot: string; sortOrder?: number }) {
    if (!body.mediaId || !body.entityType || !body.entityId || !body.slot) {
      throw new BadRequestException("Media bog‘lash ma’lumotlari to‘liq emas");
    }
    return this.media.attach(body);
  }

  @Delete("usage")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...MEDIA_ROLES)
  detach(@Body() body: { mediaId: string; entityType: string; entityId: string; slot: string }) {
    if (!body.mediaId || !body.entityType || !body.entityId || !body.slot) {
      throw new BadRequestException("Media bog‘lanishini o‘chirish ma’lumotlari to‘liq emas");
    }
    return this.media.detach(body);
  }

  @Patch("usage/reorder")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...MEDIA_ROLES)
  reorder(@Body() body: { entityType: string; entityId: string; slot: string; mediaIds: string[] }) {
    if (!body.entityType || !body.entityId || !body.slot || !Array.isArray(body.mediaIds)) {
      throw new BadRequestException("Media tartiblash ma’lumotlari noto‘g‘ri");
    }
    return this.media.reorder(body);
  }

  @Post("upload")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...MEDIA_ROLES)
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 12 * 1024 * 1024 } }))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body("altText") altText?: string,
    @Body("caption") caption?: string,
  ) {
    if (!file) throw new BadRequestException("Rasm fayli yuborilmadi");
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException("Faqat JPG, PNG, WEBP yoki HEIC rasm yuklash mumkin");
    }
    return this.media.upload({ buffer: file.buffer, originalName: file.originalname, mimeType: file.mimetype, altText, caption });
  }
}

import { BadRequestException, Body, Controller, Get, Param, Post, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
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
  list() {
    return this.media.list();
  }

  @Post("upload")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 12 * 1024 * 1024 } }))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body("altText") altText?: string,
    @Body("caption") caption?: string,
  ) {
    if (!file) throw new BadRequestException("Rasm fayli yuborilmadi");
    if (!ALLOWED_TYPES.includes(file.mimetype)) throw new BadRequestException("Faqat JPG, PNG, WEBP yoki HEIC rasm yuklash mumkin");
    return this.media.upload({ buffer: file.buffer, originalName: file.originalname, mimeType: file.mimetype, altText, caption });
  }
}

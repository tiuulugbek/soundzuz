import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { CatalogService } from "./catalog.service.js";

@Controller("admin/catalog")
@UseGuards(JwtAuthGuard)
export class AdminCatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get("products")
  products() { return this.catalog.listAdmin(); }

  @Get("products/:id")
  product(@Param("id") id: string) { return this.catalog.getAdmin(id); }

  @Post("products")
  create(@Body() body: unknown) { return this.catalog.create(body); }

  @Patch("products/:id")
  update(@Param("id") id: string, @Body() body: unknown) { return this.catalog.update(id, body); }

  @Get("taxonomies")
  taxonomies() { return this.catalog.adminTaxonomies(); }

  @Post("taxonomies")
  createTaxonomy(@Body() body: unknown) { return this.catalog.createTaxonomy(body); }

  @Patch("taxonomies/:id")
  updateTaxonomy(@Param("id") id: string, @Body() body: unknown) { return this.catalog.updateTaxonomy(id, body); }
}

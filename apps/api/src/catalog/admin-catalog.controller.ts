import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { CatalogService } from "./catalog.service.js";

@Controller("admin/catalog")
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles("PRODUCT_MANAGER")
export class AdminCatalogController {
  constructor(private readonly catalog:CatalogService){}
  @Get("products") products(){return this.catalog.listAdmin()}
  @Get("products/:id") product(@Param("id")id:string){return this.catalog.getAdmin(id)}
  @Post("products") create(@Body()body:unknown){return this.catalog.create(body)}
  @Patch("products/:id") update(@Param("id")id:string,@Body()body:unknown){return this.catalog.update(id,body)}
  @Get("taxonomies") taxonomies(){return this.catalog.adminTaxonomies()}
  @Post("taxonomies") createTaxonomy(@Body()body:unknown){return this.catalog.createTaxonomy(body)}
  @Patch("taxonomies/:id") updateTaxonomy(@Param("id")id:string,@Body()body:unknown){return this.catalog.updateTaxonomy(id,body)}
  @Get("brands") brands(){return this.catalog.adminBrands()}
  @Get("brands/:id") brand(@Param("id")id:string){return this.catalog.getAdminBrand(id)}
  @Post("brands") createBrand(@Body()body:unknown){return this.catalog.createBrand(body)}
  @Patch("brands/:id") updateBrand(@Param("id")id:string,@Body()body:unknown){return this.catalog.updateBrand(id,body)}
  @Get("products/:id/specs") specs(@Param("id")id:string){return this.catalog.productSpecs(id)}
  @Post("specs") createSpec(@Body()body:unknown){return this.catalog.createSpec(body)}
  @Patch("specs/:id") updateSpec(@Param("id")id:string,@Body()body:unknown){return this.catalog.updateSpec(id,body)}
  @Delete("specs/:id") deleteSpec(@Param("id")id:string){return this.catalog.deleteSpec(id)}
}

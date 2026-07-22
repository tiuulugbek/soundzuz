import { Controller, Get, Param, Query } from "@nestjs/common";
import { CatalogService } from "./catalog.service.js";

@Controller("catalog")
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}
  @Get("filters") filters(){return this.catalog.filters()}
  @Get("products") products(@Query("search")search?:string,@Query("brand")brand?:string,@Query("formFactor")formFactor?:string,@Query("technologyLevel")technologyLevel?:string,@Query("minPrice")minPrice?:string,@Query("maxPrice")maxPrice?:string,@Query("rechargeable")rechargeable?:string,@Query("bluetooth")bluetooth?:string,@Query("inStock")inStock?:string,@Query("sort")sort?:string,@Query("page")page?:string,@Query("limit")limit?:string){return this.catalog.list({search,brand,formFactor,technologyLevel,minPrice,maxPrice,rechargeable,bluetooth,inStock,sort,page,limit})}
  @Get("products/:slug") product(@Param("slug")slug:string){return this.catalog.get(slug)}
}

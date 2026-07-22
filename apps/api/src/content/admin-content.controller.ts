import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { ContentService } from "./content.service.js";

@Controller("admin/content")
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles("CONTENT_MANAGER")
export class AdminContentController {
  constructor(private readonly content:ContentService){}
  @Get("articles") articles(){return this.content.listAdminArticles()}
  @Get("articles/:id") article(@Param("id")id:string){return this.content.getAdminArticle(id)}
  @Post("articles") createArticle(@Body()body:unknown){return this.content.createArticle(body)}
  @Patch("articles/:id") updateArticle(@Param("id")id:string,@Body()body:unknown){return this.content.updateArticle(id,body)}
  @Get("faqs") faqs(){return this.content.listAdminFaqs()}
  @Get("faqs/:id") faq(@Param("id")id:string){return this.content.getAdminFaq(id)}
  @Post("faqs") createFaq(@Body()body:unknown){return this.content.createFaq(body)}
  @Patch("faqs/:id") updateFaq(@Param("id")id:string,@Body()body:unknown){return this.content.updateFaq(id,body)}
  @Get("categories/:kind") categories(@Param("kind")kind:string){return this.content.listAdminCategories(kind)}
  @Post("categories/:kind") createCategory(@Param("kind")kind:string,@Body()body:unknown){return this.content.createCategory(kind,body)}
  @Patch("categories/:kind/:id") updateCategory(@Param("kind")kind:string,@Param("id")id:string,@Body()body:unknown){return this.content.updateCategory(kind,id,body)}
}

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { AuthenticatedRequest } from "./jwt-auth.guard.js";
import { ROLES_KEY } from "./roles.decorator.js";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const required=this.reflector.getAllAndOverride<string[]>(ROLES_KEY,[context.getHandler(),context.getClass()])??[];
    if(required.length===0)return true;
    const request=context.switchToHttp().getRequest<AuthenticatedRequest>();
    const roles=request.user?.roles??[];
    if(roles.includes("SUPER_ADMIN")||required.some(role=>roles.includes(role)))return true;
    throw new ForbiddenException("Bu amal uchun ruxsat yetarli emas");
  }
}

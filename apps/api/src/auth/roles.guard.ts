import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { AuthenticatedRequest } from "./jwt-auth.guard.js";
import { ROLES_KEY } from "./roles.decorator.js";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? [];
    if (requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userRoles: string[] = Array.isArray(request.user?.roles) ? request.user.roles : [];
    const allowed = userRoles.includes("SUPER_ADMIN") || requiredRoles.some((role) => userRoles.includes(role));
    if (!allowed) throw new ForbiddenException("Bu amal uchun ruxsat yetarli emas");
    return true;
  }
}

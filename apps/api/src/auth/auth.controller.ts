import { Body, Controller, Ip, Post, UnauthorizedException } from "@nestjs/common";
import { loginSchema } from "@soundz/contracts";
import { AuthService } from "./auth.service.js";
import { RateLimitService } from "../common/rate-limit.service.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly rateLimit: RateLimitService) {}

  @Post("login")
  async login(@Body() body: unknown, @Ip() ip: string): Promise<{ accessToken: string; user: object }> {
    await this.rateLimit.consume(`auth:${ip || "unknown"}`, 10, 15 * 60_000);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) throw new UnauthorizedException("Email yoki parol noto‘g‘ri");
    return this.authService.login(parsed.data);
  }
}

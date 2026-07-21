import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcryptjs";
import type { LoginInput } from "@soundz/contracts";
import type { PrismaClient } from "@soundz/database";
import { PRISMA } from "../prisma/prisma.module.js";

@Injectable()
export class AuthService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
  ) {}

  async login(input: LoginInput): Promise<{ accessToken: string; user: object }> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
      include: { roles: { include: { role: true } } },
    });
    if (!user || user.status !== "ACTIVE" || !(await compare(input.password, user.passwordHash))) {
      throw new UnauthorizedException("Email yoki parol noto‘g‘ri");
    }

    const roles = user.roles.map(({ role }) => role.code);
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      roles,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
      },
    };
  }
}

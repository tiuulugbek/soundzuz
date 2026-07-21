import { Injectable, OnModuleDestroy, TooManyRequestsException } from "@nestjs/common";
import IORedis from "ioredis";

@Injectable()
export class RateLimitService implements OnModuleDestroy {
  private readonly redis = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
  });

  async consume(key: string, limit = 5, windowMs = 60_000): Promise<void> {
    const bucket = Math.floor(Date.now() / windowMs);
    const redisKey = `soundz:rate:${key}:${bucket}`;
    const count = await this.redis.incr(redisKey);
    if (count === 1) await this.redis.pexpire(redisKey, windowMs + 1_000);
    if (count > limit) {
      throw new TooManyRequestsException("Juda ko‘p so‘rov yuborildi. Birozdan keyin qayta urinib ko‘ring.");
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}

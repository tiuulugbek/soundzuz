import "dotenv/config";
import { createPrismaClient } from "../src/index.js";
import { catalogStatements } from "./catalog-sample.js";

/**
 * Faqat katalog namuna ma'lumotini seed qiladi (brendlar, mahsulotlar, spek, taksonomiya).
 * Admin foydalanuvchi/rollarga TEGMAYDI — production'da parolni tiklamaydi.
 * Ishga tushirish: pnpm db:seed:catalog
 */
const prisma = createPrismaClient();

async function main(): Promise<void> {
  const stmts = catalogStatements();
  for (const s of stmts) await prisma.$executeRawUnsafe(s.text, ...(s.values as unknown[]));
  console.log(`Seeded catalog sample: ${stmts.length} statements (3 brands, 9 models, uz/ru/en)`);
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });

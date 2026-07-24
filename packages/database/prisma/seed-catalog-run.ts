import "dotenv/config";
import { createPrismaClient } from "../src/index.js";
import { catalogStatements } from "./catalog-sample.js";
import { contentStatements } from "./content-sample.js";

/**
 * Namuna ma'lumotni seed qiladi: katalog (brend/mahsulot/spek/taksonomiya) + bilim
 * markazi (kategoriya/maqola). Admin foydalanuvchi/rollarga TEGMAYDI — parolni tiklamaydi.
 * Ishga tushirish: pnpm db:seed:catalog
 */
const prisma = createPrismaClient();

async function main(): Promise<void> {
  const cat = catalogStatements();
  for (const s of cat) await prisma.$executeRawUnsafe(s.text, ...(s.values as unknown[]));
  console.log(`Seeded catalog sample: ${cat.length} statements (3 brands, 9 models, uz/ru/en)`);
  const content = contentStatements();
  for (const s of content) await prisma.$executeRawUnsafe(s.text, ...(s.values as unknown[]));
  console.log(`Seeded knowledge sample: ${content.length} statements (5 categories, 6 articles, uz/ru/en)`);
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });

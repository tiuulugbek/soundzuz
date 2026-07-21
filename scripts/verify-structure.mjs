import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const errors = [];

async function walk(directory) {
  const entries = await readdir(directory);
  const output = [];
  for (const entry of entries) {
    if (["node_modules", ".next", "dist", ".git"].includes(entry)) continue;
    const path = join(directory, entry);
    const info = await stat(path);
    if (info.isDirectory()) output.push(...await walk(path));
    else output.push(path);
  }
  return output;
}

const files = await walk(root);
for (const file of files.filter((path) => path.endsWith(".json"))) {
  try { JSON.parse(await readFile(file, "utf8")); }
  catch (error) { errors.push(`${relative(root, file)}: invalid JSON (${error.message})`); }
}

const sourceFiles = files.filter((path) => [".ts", ".tsx", ".mjs"].includes(extname(path)));
const importPattern = /from\s+["'](\.{1,2}\/[^"']+)["']/g;
for (const file of sourceFiles) {
  const content = await readFile(file, "utf8");
  for (const match of content.matchAll(importPattern)) {
    const specifier = match[1];
    const target = resolve(dirname(file), specifier);
    const candidates = [target, target.replace(/\.js$/, ".ts"), target.replace(/\.js$/, ".tsx"), `${target}.ts`, `${target}.tsx`, join(target, "index.ts")];
    let found = false;
    for (const candidate of candidates) {
      try { if ((await stat(candidate)).isFile()) { found = true; break; } } catch {}
    }
    if (!found && !specifier.includes("generated/client")) {
      errors.push(`${relative(root, file)}: missing relative import ${specifier}`);
    }
  }
}

const schemaPath = join(root, "packages/database/prisma/schema.prisma");
const schema = await readFile(schemaPath, "utf8");
const names = [...schema.matchAll(/^(model|enum)\s+(\w+)/gm)].map((match) => `${match[1]}:${match[2]}`);
const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
if (duplicates.length) errors.push(`schema.prisma duplicate declarations: ${[...new Set(duplicates)].join(", ")}`);
const opening = (schema.match(/{/g) ?? []).length;
const closing = (schema.match(/}/g) ?? []).length;
if (opening !== closing) errors.push(`schema.prisma brace mismatch: ${opening} opening / ${closing} closing`);

const required = [
  "apps/web/app/page.tsx",
  "apps/admin/app/leads/page.tsx",
  "apps/admin/app/appointments/page.tsx",
  "apps/api/src/main.ts",
  "apps/worker/src/main.ts",
  "packages/database/prisma/schema.prisma",
  "compose.yaml",
  "compose.production.yaml",
];
for (const item of required) {
  try { await stat(join(root, item)); }
  catch { errors.push(`required file missing: ${item}`); }
}

const migrations = files.filter((path) => path.endsWith("migration.sql"));
if (migrations.length < 2) errors.push("expected at least two Prisma SQL migrations");

if (errors.length) {
  console.error("Structure verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Structure verification passed: ${files.length} files, ${sourceFiles.length} source files, ${migrations.length} migrations.`);

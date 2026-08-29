#!/usr/bin/env node
/**
 * ---------------------------------------------------------------------------
 * VELLORA — release packager
 * ---------------------------------------------------------------------------
 * Produces a clean, distributable copy of the template:
 *
 *   release/Vellora-Luxury-Real-Estate-Template/   the folder
 *   Vellora-Luxury-Real-Estate-Template.zip        the upload
 *
 * Only files a customer needs are copied. Dependencies, build output, caches,
 * environment files, editor settings and version control are all excluded.
 *
 *   npm run package
 *
 * The ZIP is written with Node's own zlib, so nothing needs to be installed.
 * ---------------------------------------------------------------------------
 */
import { readdir, mkdir, copyFile, rm, stat, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync, crc32 } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const NAME = "Vellora-Luxury-Real-Estate-Template";
const outRoot = join(root, "release");
const outDir = join(outRoot, NAME);

/** Directory names that never ship. */
const SKIP_DIRS = new Set([
  "node_modules", ".next", ".git", ".github", "release", "out", "build",
  ".vercel", ".turbo", ".cache", ".idea", ".vscode", ".DS_Store", "coverage",
]);

/** Exact filenames that never ship. */
const SKIP_FILES = new Set([
  ".DS_Store", "Thumbs.db", "next-env.d.ts", "npm-debug.log",
  "yarn-error.log", ".pnpm-debug.log", "tsconfig.tsbuildinfo",
]);

/** Anything matching these never ships, whatever it is called. */
const SKIP_PATTERNS = [
  /^\.env($|\.)/,          // .env, .env.local, .env.production — but not .env.example
  /\.tsbuildinfo$/,
  /\.log$/,
  /\.pem$/,
  /^\.claude$/,
  /\.zip$/,               // never let the archive contain a previous archive
];

function shouldSkip(name, isDir) {
  if (name === ".env.example") return false;
  if (isDir && SKIP_DIRS.has(name)) return true;
  if (!isDir && SKIP_FILES.has(name)) return true;
  return SKIP_PATTERNS.some((pattern) => pattern.test(name));
}

async function collect(dir, acc = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (shouldSkip(entry.name, entry.isDirectory())) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await collect(full, acc);
    else if (entry.isFile()) acc.push(full);
  }
  return acc;
}

/* -------------------------------------------------------------------------- */
/*  A minimal, dependency-free ZIP writer (store or deflate, no ZIP64).        */
/* -------------------------------------------------------------------------- */

function dosTime(date) {
  const time =
    (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
  const day =
    ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function buildZip(entries) {
  const chunks = [];
  const central = [];
  let offset = 0;
  const now = new Date();
  const { time, day } = dosTime(now);

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, "utf8");
    const deflated = deflateRawSync(entry.data, { level: 9 });
    const useDeflate = deflated.length < entry.data.length;
    const body = useDeflate ? deflated : entry.data;
    const method = useDeflate ? 8 : 0;
    const sum = crc32(entry.data) >>> 0;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);          // version needed
    local.writeUInt16LE(0x0800, 6);      // UTF-8 filenames
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(day, 12);
    local.writeUInt32LE(sum, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(entry.data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    chunks.push(local, nameBuf, body);

    const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(20, 4);         // version made by
    header.writeUInt16LE(20, 6);         // version needed
    header.writeUInt16LE(0x0800, 8);
    header.writeUInt16LE(method, 10);
    header.writeUInt16LE(time, 12);
    header.writeUInt16LE(day, 14);
    header.writeUInt32LE(sum, 16);
    header.writeUInt32LE(body.length, 20);
    header.writeUInt32LE(entry.data.length, 24);
    header.writeUInt16LE(nameBuf.length, 28);
    header.writeUInt32LE(0o644 << 16, 38); // external attributes
    header.writeUInt32LE(offset, 42);
    central.push(header, nameBuf);

    offset += local.length + nameBuf.length + body.length;
  }

  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);

  return Buffer.concat([...chunks, centralBuf, end]);
}

/* -------------------------------------------------------------------------- */

async function main() {
  if (existsSync(outRoot)) await rm(outRoot, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const files = await collect(root);
  files.sort();

  const zipEntries = [];
  let bytes = 0;

  for (const file of files) {
    const rel = relative(root, file);
    const target = join(outDir, rel);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(file, target);

    const data = await readFile(file);
    bytes += data.length;
    zipEntries.push({ name: `${NAME}/${rel.split(sep).join("/")}`, data });
  }

  // The archive sits at the project root, which is where the brief expects it
  // and where it is easiest to find after running the script.
  const zipPath = join(root, `${NAME}.zip`);
  await writeFile(zipPath, buildZip(zipEntries));
  const zipped = await stat(zipPath);

  const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;
  console.log(`\n  ${NAME}\n`);
  console.log(`  Files      ${files.length}`);
  console.log(`  Folder     release/${NAME}  (${mb(bytes)})`);
  console.log(`  Archive    ${NAME}.zip  (${mb(zipped.size)})`);
  console.log(`\n  Ready to upload.\n`);

  // Fail loudly rather than shipping something that should not leave the office.
  const leaked = zipEntries.filter((e) =>
    /(^|\/)(node_modules|\.next|\.git)\//.test(e.name) ||
    /(^|\/)\.env(\.|$)(?!example)/.test(e.name),
  );
  if (leaked.length) {
    console.error("  Excluded content leaked into the archive:");
    leaked.slice(0, 10).forEach((e) => console.error(`   - ${e.name}`));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

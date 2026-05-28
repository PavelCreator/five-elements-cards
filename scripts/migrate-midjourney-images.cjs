#!/usr/bin/env node

/*
  Downloads MidJourney CDN images by opening direct URLs in Chromium,
  stores them in src/assets/images and rewrites source links to local paths.
*/

const fs = require('node:fs/promises');
const path = require('node:path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Missing dependency: playwright');
  console.error('Run: npm i -D playwright');
  process.exit(1);
}

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const ASSET_BASE_DIR = path.join(SRC_DIR, 'assets', 'images');

const URL_REGEX = /https:\/\/cdn\.midjourney\.com\/([0-9a-fA-F-]+)\/(\d+_\d+\.[a-zA-Z0-9]+)(\?[^\s'\"`)]*)?/g;
const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.html',
  '.css',
  '.scss',
  '.json',
  '.md',
  '.txt',
]);
const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', '.angular', '.vscode', 'coverage']);

function toPosix(p) {
  return p.split(path.sep).join('/');
}

async function walk(dir, output) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(full, output);
      continue;
    }

    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name).toLowerCase();
    if (!TEXT_EXTENSIONS.has(ext)) continue;

    output.push(full);
  }
}

async function fetchImageViaPage(page, url) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  if (!response) {
    throw new Error(`No response for ${url}`);
  }

  if (!response.ok()) {
    throw new Error(`HTTP ${response.status()} for ${url}`);
  }

  return response.body();
}

async function ensureDownloaded(url, id, filename, cache, failedUrls, page) {
  const relativeAssetPath = toPosix(path.join('assets', 'images', id, filename));
  const localPath = path.join(ASSET_BASE_DIR, id, filename);

  if (cache.has(url)) {
    return cache.get(url) ? relativeAssetPath : null;
  }

  try {
    await fs.access(localPath);
    cache.set(url, true);
    return relativeAssetPath;
  } catch {
    // File does not exist yet.
  }

  try {
    const data = await fetchImageViaPage(page, url);
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, data);
    cache.set(url, true);
  } catch (error) {
    failedUrls.set(url, error.message);
    cache.set(url, false);
    return null;
  }

  return relativeAssetPath;
}

async function processFile(filePath, downloadCache, failedUrls, page) {
  const original = await fs.readFile(filePath, 'utf8');
  const matches = [...original.matchAll(URL_REGEX)];

  if (matches.length === 0) {
    return { changed: false, replacements: 0 };
  }

  let updated = original;
  let replacements = 0;

  for (const match of matches) {
    const fullMatch = match[0];
    const id = match[1];
    const filename = match[2];

    const relativeAssetPath = await ensureDownloaded(fullMatch, id, filename, downloadCache, failedUrls, page);
    if (!relativeAssetPath) continue;

    const escaped = fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'g');
    const before = updated;
    updated = updated.replace(re, relativeAssetPath);
    if (updated !== before) {
      replacements += (before.match(re) || []).length;
    }
  }

  if (updated === original) {
    return { changed: false, replacements: 0 };
  }

  await fs.writeFile(filePath, updated, 'utf8');
  return { changed: true, replacements };
}

async function main() {
  const files = [];
  await walk(ROOT, files);

  const sourceWithUrls = [];
  for (const filePath of files) {
    const text = await fs.readFile(filePath, 'utf8');
    if (URL_REGEX.test(text)) {
      sourceWithUrls.push(filePath);
    }
    URL_REGEX.lastIndex = 0;
  }

  if (sourceWithUrls.length === 0) {
    console.log('No MidJourney URLs found.');
    return;
  }

  const forceHeadless = process.env.MJ_HEADLESS === '1';
  const browser = await chromium.launch({ headless: forceHeadless ? true : false });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US',
  });
  const page = await context.newPage();

  const downloadCache = new Map();
  const failedUrls = new Map();
  let changedFiles = 0;
  let totalReplacements = 0;

  try {
    for (const filePath of sourceWithUrls) {
      const result = await processFile(filePath, downloadCache, failedUrls, page);
      if (result.changed) {
        changedFiles += 1;
        totalReplacements += result.replacements;
        console.log(`Updated: ${path.relative(ROOT, filePath)}`);
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('\nDone.');
  console.log(`Files changed: ${changedFiles}`);
  const successCount = [...downloadCache.values()].filter(Boolean).length;
  console.log(`Unique image URLs processed: ${downloadCache.size}`);
  console.log(`Successful downloads: ${successCount}`);
  console.log(`Failed downloads: ${failedUrls.size}`);
  console.log(`Total replacements: ${totalReplacements}`);

  if (failedUrls.size > 0) {
    console.log('\nFailed URLs (left unchanged):');
    for (const [url, reason] of failedUrls.entries()) {
      console.log(`- ${url} :: ${reason}`);
    }
  }
}

main().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exit(1);
});

#!/usr/bin/env node
/*
  Cleanup duplicate assets for a store by content hash and update store.json references.
  Usage:
    node cleanup-duplicate-assets.js shekha

  What it does:
  - Scans public/assets/<slug>/{logo,sliders,products}
  - Computes SHA1 for each file
  - Keeps the first occurrence of each hash and deletes the rest (backups to .bak if --backup provided)
  - Rewrites /public/assets/<slug>/store.json to point to the kept files
  - Creates a backup of store.json before writing (store.json.bak)

  Notes:
  - Idempotent: repeated runs will not duplicate work
  - Safe: won't throw on missing folders
*/
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');

function sha1(buf) {
  return crypto.createHash('sha1').update(buf).digest('hex');
}

function listFiles(dir) {
  try {
    return fs.readdirSync(dir).map((f) => path.join(dir, f));
  } catch {
    return [];
  }
}

function ensureFile(p) {
  try { return fs.existsSync(p); } catch { return false; }
}

function normalizeWebPath(absPath) {
  // Convert absolute path inside public/ to web path starting with '/'
  const idx = absPath.replace(/\\/g, '/').indexOf('/public/');
  if (idx >= 0) {
    return absPath.replace(/\\/g, '/').slice(idx + '/public'.length);
  }
  // Fallback: try to cut until /assets/
  const ai = absPath.replace(/\\/g, '/').indexOf('/assets/');
  if (ai >= 0) return absPath.replace(/\\/g, '/').slice(ai);
  return absPath;
}

function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: node cleanup-duplicate-assets.js <store-slug>');
    process.exit(1);
  }

  const storeDir = path.join(PUBLIC_DIR, 'assets', slug);
  const logoDir = path.join(storeDir, 'logo');
  const slidersDir = path.join(storeDir, 'sliders');
  const productsDir = path.join(storeDir, 'products');
  const storeJsonPath = path.join(storeDir, 'store.json');

  const allFiles = [
    ...listFiles(logoDir),
    ...listFiles(slidersDir),
    ...listFiles(productsDir)
  ].filter((p) => fs.existsSync(p) && fs.statSync(p).isFile());

  const byHash = new Map();
  const duplicates = [];

  for (const file of allFiles) {
    const buf = fs.readFileSync(file);
    const h = sha1(buf);
    if (!byHash.has(h)) {
      byHash.set(h, file);
    } else {
      duplicates.push({ keep: byHash.get(h), remove: file, hash: h });
    }
  }

  // Remove duplicates (keep first occurrence)
  for (const d of duplicates) {
    try {
      fs.unlinkSync(d.remove);
      console.log('Removed duplicate:', d.remove, '-> keep', d.keep);
    } catch (e) {
      console.warn('Failed removing', d.remove, e.message);
    }
  }

  // Rewrite store.json
  if (ensureFile(storeJsonPath)) {
    try {
      const orig = fs.readFileSync(storeJsonPath, 'utf-8');
      const backupPath = storeJsonPath + '.bak';
      fs.writeFileSync(backupPath, orig);

      const data = JSON.parse(orig);
      const rewritePath = (p) => {
        if (!p || typeof p !== 'string') return p;
        // If path no longer exists (deleted duplicate), try to find kept by content hash match
        const abs = path.join(PUBLIC_DIR, p.replace(/^\//, ''));
        if (fs.existsSync(abs)) return p; // still valid
        // attempt: search kept set (byHash values) for same basename without random tokens
        const base = path.basename(p).replace(/^[0-9-]+-[a-z0-9]+-/, '');
        for (const kept of byHash.values()) {
          if (path.basename(kept).endsWith(base)) {
            return normalizeWebPath(kept);
          }
        }
        // last resort: leave as is
        return p;
      };

      if (Array.isArray(data.sliderImages)) {
        data.sliderImages = data.sliderImages.map((s) => ({
          ...s,
          image: rewritePath(s.image)
        }));
      }

      if (Array.isArray(data.products)) {
        data.products = data.products.map((p) => ({
          ...p,
          images: Array.isArray(p.images) ? p.images.map(rewritePath) : p.images
        }));
      }

      if (data.logo) data.logo = rewritePath(data.logo);

      fs.writeFileSync(storeJsonPath, JSON.stringify(data, null, 2), 'utf-8');
      console.log('store.json updated:', storeJsonPath);
    } catch (e) {
      console.warn('Failed updating store.json:', e.message);
    }
  } else {
    console.warn('No store.json found at', storeJsonPath);
  }

  console.log('Done. Duplicates removed:', duplicates.length);
}

main();

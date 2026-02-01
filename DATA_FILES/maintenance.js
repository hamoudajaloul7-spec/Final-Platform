#!/usr/bin/env node

/**
 * سكريبت الصيانة لتنظيف وإصلاح مشاكل الأصول
 * Maintenance script for cleaning and fixing asset issues
 *
 * الاستخدام:
 * Usage:
 *   npm run maintenance
 *   npm run maintenance -- --store shekha
 *   npm run maintenance -- --all
 *   npm run maintenance -- --help
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// استيراد دوال التنظيف من assetDeduplication
// Import cleanup functions from assetDeduplication
async function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

async function collectAssetInfo(directory) {
  const assets = [];

  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
          assets.push({
            filePath: fullPath,
            hash: '',
            size: stat.size,
            mtime: stat.mtime
          });
        }
      }
    }
  }

  scanDirectory(directory);
  return assets;
}

async function deduplicateAssets(directory) {
  console.log(`🔍 بدء فحص مجلد الأصول: ${directory}`);
  console.log(`🔍 Starting asset directory scan: ${directory}`);

  const assets = await collectAssetInfo(directory);
  console.log(`📊 تم العثور على ${assets.length} ملف`);
  console.log(`📊 Found ${assets.length} files`);

  for (const asset of assets) {
    try {
      asset.hash = await calculateFileHash(asset.filePath);
    } catch (error) {
      console.warn(`⚠️ فشل في حساب البصمة للملف: ${asset.filePath}`, error.message);
      console.warn(`⚠️ Failed to calculate hash for: ${asset.filePath}`, error.message);
    }
  }

  const hashGroups = new Map();
  for (const asset of assets) {
    if (!hashGroups.has(asset.hash)) {
      hashGroups.set(asset.hash, []);
    }
    hashGroups.get(asset.hash).push(asset);
  }

  let duplicatesRemoved = 0;
  let spaceSaved = 0;
  const renamedFiles = [];

  for (const [hash, group] of hashGroups) {
    if (group.length <= 1) continue;

    group.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    const keepFile = group[0];
    const duplicates = group.slice(1);

    console.log(`🗑️  إزالة ${duplicates.length} نسخة مكررة للبصمة: ${hash.substring(0, 8)}...`);
    console.log(`🗑️  Removing ${duplicates.length} duplicates for hash: ${hash.substring(0, 8)}...`);

    const ext = path.extname(keepFile.filePath);
    const dir = path.dirname(keepFile.filePath);
    const newFileName = `${hash}${ext}`;
    const newPath = path.join(dir, newFileName);

    if (keepFile.filePath !== newPath) {
      try {
        fs.renameSync(keepFile.filePath, newPath);
        renamedFiles.push({ oldPath: keepFile.filePath, newPath });
        console.log(`📝 إعادة تسمية: ${path.basename(keepFile.filePath)} → ${newFileName}`);
        console.log(`📝 Renamed: ${path.basename(keepFile.filePath)} → ${newFileName}`);
      } catch (error) {
        console.error(`❌ فشل في إعادة التسمية: ${keepFile.filePath}`, error.message);
        console.error(`❌ Failed to rename: ${keepFile.filePath}`, error.message);
      }
    }

    for (const duplicate of duplicates) {
      try {
        fs.unlinkSync(duplicate.filePath);
        duplicatesRemoved++;
        spaceSaved += duplicate.size;
        console.log(`🗑️  حذف: ${path.basename(duplicate.filePath)}`);
        console.log(`🗑️  Deleted: ${path.basename(duplicate.filePath)}`);
      } catch (error) {
        console.error(`❌ فشل في حذف: ${duplicate.filePath}`, error.message);
        console.error(`❌ Failed to delete: ${duplicate.filePath}`, error.message);
      }
    }
  }

  return {
    duplicatesRemoved,
    filesProcessed: assets.length,
    spaceSaved,
    renamedFiles
  };
}

function updateStoreJsonReferences(storeJsonPath, renamedFiles) {
  if (!fs.existsSync(storeJsonPath)) {
    console.warn(`⚠️ ملف store.json غير موجود: ${storeJsonPath}`);
    console.warn(`⚠️ store.json not found: ${storeJsonPath}`);
    return;
  }

  try {
    const content = fs.readFileSync(storeJsonPath, 'utf-8');
    let storeData = JSON.parse(content);
    let updated = false;

    const pathMap = new Map();
    for (const { oldPath, newPath } of renamedFiles) {
      const relativeOldPath = oldPath.replace(/\\/g, '/').split('/assets/')[1];
      const relativeNewPath = newPath.replace(/\\/g, '/').split('/assets/')[1];
      if (relativeOldPath && relativeNewPath) {
        pathMap.set(relativeOldPath, relativeNewPath);
      }
    }

    // تحديث logo
    if (storeData.logo && typeof storeData.logo === 'string') {
      for (const [oldPath, newPath] of pathMap) {
        if (storeData.logo.includes(oldPath)) {
          storeData.logo = storeData.logo.replace(oldPath, newPath);
          updated = true;
          break;
        }
      }
    }

    // تحديث sliderImages
    if (storeData.sliderImages && Array.isArray(storeData.sliderImages)) {
      for (const slide of storeData.sliderImages) {
        if (slide.image && typeof slide.image === 'string') {
          for (const [oldPath, newPath] of pathMap) {
            if (slide.image.includes(oldPath)) {
              slide.image = slide.image.replace(oldPath, newPath);
              updated = true;
              break;
            }
          }
        }
      }
    }

    // تحديث products
    if (storeData.products && Array.isArray(storeData.products)) {
      for (const product of storeData.products) {
        if (product.images && Array.isArray(product.images)) {
          for (let i = 0; i < product.images.length; i++) {
            const image = product.images[i];
            if (typeof image === 'string') {
              for (const [oldPath, newPath] of pathMap) {
                if (image.includes(oldPath)) {
                  product.images[i] = image.replace(oldPath, newPath);
                  updated = true;
                  break;
                }
              }
            }
          }
        }
      }
    }

    if (updated) {
      fs.writeFileSync(storeJsonPath, JSON.stringify(storeData, null, 2), 'utf-8');
      console.log(`📝 تم تحديث ملف store.json: ${storeJsonPath}`);
      console.log(`📝 Updated store.json: ${storeJsonPath}`);
    }
  } catch (error) {
    console.error(`❌ فشل في تحديث store.json: ${storeJsonPath}`, error.message);
    console.error(`❌ Failed to update store.json: ${storeJsonPath}`, error.message);
  }
}

async function cleanupStoreAssets(storeSlug) {
  const publicAssetsPath = path.resolve('./public/assets');
  const storeAssetsPath = path.join(publicAssetsPath, storeSlug);

  if (!fs.existsSync(storeAssetsPath)) {
    console.warn(`⚠️ مجلد الأصول غير موجود: ${storeAssetsPath}`);
    console.warn(`⚠️ Assets directory not found: ${storeAssetsPath}`);
    return {
      duplicatesRemoved: 0,
      filesProcessed: 0,
      spaceSaved: 0,
      renamedFiles: []
    };
  }

  const result = await deduplicateAssets(storeAssetsPath);

  if (result.renamedFiles.length > 0) {
    const storeJsonPath = path.join(publicAssetsPath, storeSlug, 'store.json');
    updateStoreJsonReferences(storeJsonPath, result.renamedFiles);
  }

  return result;
}

async function cleanupAllStores() {
  const publicAssetsPath = path.resolve('./public/assets');
  const storesIndexPath = path.join(publicAssetsPath, 'stores', 'index.json');

  let storeSlugs = [];

  if (fs.existsSync(storesIndexPath)) {
    try {
      const indexContent = fs.readFileSync(storesIndexPath, 'utf-8');
      const indexData = JSON.parse(indexContent);
      const stores = Array.isArray(indexData) ? indexData : indexData.stores || [];
      storeSlugs = stores.map(store => store.slug).filter(Boolean);
    } catch (error) {
      console.error('❌ فشل في قراءة فهرس المتاجر:', error.message);
      console.error('❌ Failed to read stores index:', error.message);
    }
  }

  if (storeSlugs.length === 0) {
    if (fs.existsSync(publicAssetsPath)) {
      const items = fs.readdirSync(publicAssetsPath);
      for (const item of items) {
        const fullPath = path.join(publicAssetsPath, item);
        if (fs.statSync(fullPath).isDirectory() && item !== 'stores') {
          storeSlugs.push(item);
        }
      }
    }
  }

  console.log(`🏪 بدء تنظيف ${storeSlugs.length} متجر`);
  console.log(`🏪 Starting cleanup for ${storeSlugs.length} stores`);

  let totalResult = {
    duplicatesRemoved: 0,
    filesProcessed: 0,
    spaceSaved: 0,
    renamedFiles: []
  };

  for (const slug of storeSlugs) {
    console.log(`\n🔄 تنظيف متجر: ${slug}`);
    console.log(`🔄 Cleaning store: ${slug}`);
    try {
      const result = await cleanupStoreAssets(slug);
      totalResult.duplicatesRemoved += result.duplicatesRemoved;
      totalResult.filesProcessed += result.filesProcessed;
      totalResult.spaceSaved += result.spaceSaved;
      totalResult.renamedFiles.push(...result.renamedFiles);
    } catch (error) {
      console.error(`❌ فشل في تنظيف متجر ${slug}:`, error.message);
      console.error(`❌ Failed to cleanup store ${slug}:`, error.message);
    }
  }

  console.log(`\n🎉 انتهى التنظيف الشامل:`);
  console.log(`🎉 Complete cleanup finished:`);
  console.log(`   - إجمالي الملفات المعالجة: ${totalResult.filesProcessed}`);
  console.log(`   - Total files processed: ${totalResult.filesProcessed}`);
  console.log(`   - إجمالي النسخ المكررة المحذوفة: ${totalResult.duplicatesRemoved}`);
  console.log(`   - Total duplicates removed: ${totalResult.duplicatesRemoved}`);
  console.log(`   - إجمالي المساحة الموفرة: ${(totalResult.spaceSaved / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   - Total space saved: ${(totalResult.spaceSaved / 1024 / 1024).toFixed(2)} MB`);

  return totalResult;
}

async function validateStoreAssets(storeSlug) {
  const publicAssetsPath = path.resolve('./public/assets');
  const storeJsonPath = path.join(publicAssetsPath, storeSlug, 'store.json');

  if (!fs.existsSync(storeJsonPath)) {
    console.error(`❌ ملف store.json غير موجود: ${storeJsonPath}`);
    console.error(`❌ store.json not found: ${storeJsonPath}`);
    return false;
  }

  try {
    const content = fs.readFileSync(storeJsonPath, 'utf-8');
    const storeData = JSON.parse(content);

    let issues = [];

    // فحص الشعار
    if (storeData.logo) {
      const logoPath = path.join(publicAssetsPath, storeData.logo.replace('/assets/', ''));
      if (!fs.existsSync(logoPath)) {
        issues.push(`شعار مفقود: ${storeData.logo}`);
        issues.push(`Logo missing: ${storeData.logo}`);
      }
    }

    // فحص صور السلايدر
    if (storeData.sliderImages && Array.isArray(storeData.sliderImages)) {
      for (const slide of storeData.sliderImages) {
        if (slide.image) {
          const imagePath = path.join(publicAssetsPath, slide.image.replace('/assets/', ''));
          if (!fs.existsSync(imagePath)) {
            issues.push(`صورة سلايدر مفقودة: ${slide.image}`);
            issues.push(`Slider image missing: ${slide.image}`);
          }
        }
      }
    }

    // فحص صور المنتجات
    if (storeData.products && Array.isArray(storeData.products)) {
      for (const product of storeData.products) {
        if (product.images && Array.isArray(product.images)) {
          for (const image of product.images) {
            if (typeof image === 'string') {
              const imagePath = path.join(publicAssetsPath, image.replace('/assets/', ''));
              if (!fs.existsSync(imagePath)) {
                issues.push(`صورة منتج مفقودة: ${image}`);
                issues.push(`Product image missing: ${image}`);
              }
            }
          }
        }
      }
    }

    if (issues.length > 0) {
      console.log(`⚠️ مشاكل في متجر ${storeSlug}:`);
      console.log(`⚠️ Issues in store ${storeSlug}:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
      return false;
    } else {
      console.log(`✅ متجر ${storeSlug} سليم`);
      console.log(`✅ Store ${storeSlug} is valid`);
      return true;
    }
  } catch (error) {
    console.error(`❌ خطأ في فحص متجر ${storeSlug}:`, error.message);
    console.error(`❌ Error validating store ${storeSlug}:`, error.message);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🛠️  سكريبت صيانة منصة إشرو');
  console.log('🛠️  Eishro Platform Maintenance Script');
  console.log('=====================================\n');

  if (!command || command === '--help' || command === '-h') {
    console.log('الاستخدام:');
    console.log('Usage:');
    console.log('  npm run maintenance -- --all              # تنظيف جميع المتاجر');
    console.log('  npm run maintenance -- --all              # Clean all stores');
    console.log('  npm run maintenance -- --store <slug>     # تنظيف متجر محدد');
    console.log('  npm run maintenance -- --store <slug>     # Clean specific store');
    console.log('  npm run maintenance -- --validate <slug>  # فحص متجر محدد');
    console.log('  npm run maintenance -- --validate <slug>  # Validate specific store');
    console.log('  npm run maintenance -- --help             # عرض هذه المساعدة');
    console.log('  npm run maintenance -- --help             # Show this help');
    return;
  }

  try {
    if (command === '--all') {
      await cleanupAllStores();
    } else if (command === '--store') {
      const storeSlug = args[1];
      if (!storeSlug) {
        console.error('❌ يجب تحديد سلاج المتجر');
        console.error('❌ Store slug must be specified');
        process.exit(1);
      }
      await cleanupStoreAssets(storeSlug);
    } else if (command === '--validate') {
      const storeSlug = args[1];
      if (!storeSlug) {
        console.error('❌ يجب تحديد سلاج المتجر');
        console.error('❌ Store slug must be specified');
        process.exit(1);
      }
      const isValid = await validateStoreAssets(storeSlug);
      process.exit(isValid ? 0 : 1);
    } else {
      console.error(`❌ أمر غير معروف: ${command}`);
      console.error(`❌ Unknown command: ${command}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ خطأ في تنفيذ السكريبت:', error.message);
    console.error('❌ Script execution error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ خطأ غير متوقع:', error);
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = {
  cleanupAllStores,
  cleanupStoreAssets,
  validateStoreAssets,
  deduplicateAssets
};
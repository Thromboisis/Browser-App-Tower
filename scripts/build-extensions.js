import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const extDir = path.join(rootDir, 'extension');
const distDir = path.join(rootDir, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Helper to recursively collect files
function collectFiles(dir, baseDir = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const itemPath = path.join(dir, item);
    const relPath = path.join(baseDir, item);
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      results = results.concat(collectFiles(itemPath, relPath));
    } else {
      results.push({ fullPath: itemPath, relPath });
    }
  }
  return results;
}

// Generate Firefox-compatible manifest from Chrome manifest
function createFirefoxManifest(chromeManifestObj) {
  const firefoxManifest = JSON.parse(JSON.stringify(chromeManifestObj));

  // 1. Transform background service_worker to background.scripts
  if (firefoxManifest.background && firefoxManifest.background.service_worker) {
    const workerScript = firefoxManifest.background.service_worker;
    firefoxManifest.background = {
      scripts: [workerScript]
    };
  }

  // 2. Filter out Chrome-only permissions and web_accessible_resources if present
  if (Array.isArray(firefoxManifest.permissions)) {
    firefoxManifest.permissions = firefoxManifest.permissions.filter(p => p !== 'favicon');
  }
  if (Array.isArray(firefoxManifest.web_accessible_resources)) {
    firefoxManifest.web_accessible_resources = firefoxManifest.web_accessible_resources.map(entry => {
      if (Array.isArray(entry.resources)) {
        return {
          ...entry,
          resources: entry.resources.filter(r => !r.includes('_favicon'))
        };
      }
      return entry;
    }).filter(entry => Array.isArray(entry.resources) && entry.resources.length > 0);
  }

  // 3. Add Gecko browser-specific settings for Firefox
  firefoxManifest.browser_specific_settings = {
    gecko: {
      id: 'app-tower-sidebar@local',
      strict_min_version: '109.0'
    }
  };

  return firefoxManifest;
}

async function buildDistribution(target) {
  const isFirefox = target === 'firefox';
  const targetName = isFirefox ? 'Firefox' : 'Chrome';
  const outDir = path.join(distDir, target);
  const zipPath = path.join(distDir, `app-tower-${target}.zip`);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const zip = new JSZip();
  const allFiles = collectFiles(extDir);

  const manifestPath = path.join(extDir, 'manifest.json');
  const baseManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  for (const file of allFiles) {
    const outFilePath = path.join(outDir, file.relPath);
    const parentDir = path.dirname(outFilePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    if (file.relPath === 'manifest.json' && isFirefox) {
      const firefoxManifest = createFirefoxManifest(baseManifest);
      const manifestStr = JSON.stringify(firefoxManifest, null, 2);
      fs.writeFileSync(outFilePath, manifestStr, 'utf8');
      zip.file(file.relPath, manifestStr);
    } else {
      const fileData = fs.readFileSync(file.fullPath);
      fs.writeFileSync(outFilePath, fileData);
      zip.file(file.relPath, fileData);
    }
  }

  // Generate ZIP
  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  fs.writeFileSync(zipPath, zipBuffer);

  const sizeKb = (zipBuffer.length / 1024).toFixed(1);
  console.log(`✓ Built ${targetName} extension (v${baseManifest.version}): ${zipPath} (${sizeKb} KB, ${allFiles.length} files)`);
}

async function main() {
  console.log('Building App Tower Unified Extensions...');
  await buildDistribution('chrome');
  await buildDistribution('firefox');
  console.log('✓ Both Chrome and Firefox extension packages generated successfully in dist/');
}

main().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});

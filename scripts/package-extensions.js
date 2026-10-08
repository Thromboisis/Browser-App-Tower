import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const EXTENSION_DIR = path.resolve('extension');
const DIST_DIR = path.resolve('dist');

if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

function addDirectoryToZip(zip, dirPath, rootDir) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(rootDir, fullPath);

    if (entry.name.startsWith('.') || entry.name === '__MACOSX') {
      continue;
    }

    if (entry.isDirectory()) {
      addDirectoryToZip(zip, fullPath, rootDir);
    } else {
      const content = fs.readFileSync(fullPath);
      zip.file(relativePath, content);
    }
  }
}

async function buildPackages() {
  console.log('Packaging extensions...');

  // 1. Chrome Extension Zip
  const chromeZip = new JSZip();
  addDirectoryToZip(chromeZip, EXTENSION_DIR, EXTENSION_DIR);
  const chromeBuffer = await chromeZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  const chromeOutputPath = path.join(DIST_DIR, 'app-tower-chrome.zip');
  fs.writeFileSync(chromeOutputPath, chromeBuffer);
  console.log(`Created Chrome package: ${chromeOutputPath}`);

  // 2. Firefox Extension Zip (customized manifest)
  const firefoxZip = new JSZip();
  addDirectoryToZip(firefoxZip, EXTENSION_DIR, EXTENSION_DIR);

  // Read base manifest
  const rawManifest = fs.readFileSync(path.join(EXTENSION_DIR, 'manifest.json'), 'utf8');
  const firefoxManifest = JSON.parse(rawManifest);

  // Configure Firefox specific settings
  firefoxManifest.browser_specific_settings = {
    gecko: {
      id: 'app-tower-sidebar@local',
      strict_min_version: '113.0'
    }
  };

  // Use scripts array for widest Firefox compatibility
  firefoxManifest.background = {
    scripts: ['background.js']
  };

  firefoxZip.file('manifest.json', JSON.stringify(firefoxManifest, null, 2));

  const firefoxBuffer = await firefoxZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  const firefoxOutputPath = path.join(DIST_DIR, 'app-tower-firefox.zip');
  fs.writeFileSync(firefoxOutputPath, firefoxBuffer);
  console.log(`Created Firefox package: ${firefoxOutputPath}`);

  console.log('\nBoth packages ready in dist/');
}

buildPackages().catch((err) => {
  console.error('Packaging failed:', err);
  process.exit(1);
});

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const extDir = path.join(rootDir, 'extension');
const targetFile = path.join(rootDir, 'src', 'data', 'extensionFiles.ts');

const meta = {
  'manifest.json': {
    language: 'json',
    description: 'Manifest V3 configuration declaring background service worker, storage, tabs, activeTab, newtab override, favicon, and declarative rules.'
  },
  'background.js': {
    language: 'javascript',
    description: 'Service worker maintaining tab-specific collapse states, companion windows, exact position & size memory, and authentic webpage favicon resolution.'
  },
  'content.js': {
    language: 'javascript',
    description: 'Universal Floating Rail on the right edge of the screen (leaves host page DOM completely untouched), companion window manager, and settings dialog with live favicon sync and tab-specific collapse state.'
  },
  'styles.css': {
    language: 'css',
    description: 'Isolated styles for the App Tower Universal Floating Rail, edge pull tab, buttons, smooth transitions, and settings modal.'
  },
  'rules.json': {
    language: 'json',
    description: 'DeclarativeNetRequest ruleset removing restrictive frame headers and configuring mobile User-Agent overrides.'
  },
  'newtab.html': {
    language: 'html',
    description: 'Minimalist companion new tab page that seamlessly docks the sidebar rail.'
  },
  'newtab.js': {
    language: 'javascript',
    description: 'Fast client-side script for the new tab experience.'
  },
  'newtab.css': {
    language: 'css',
    description: 'Clean modern styling for the new tab page.'
  },
  'README.md': {
    language: 'markdown',
    description: 'Complete extension documentation and installation guide.'
  }
};

const entries = [];
for (const [filename, info] of Object.entries(meta)) {
  const filePath = path.join(extDir, filename);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    entries.push({
      key: filename,
      filename,
      language: info.language,
      description: info.description,
      content
    });
  }
}

const tsContent = `export interface ExtensionFile {
  key: string;
  filename: string;
  language: string;
  description: string;
  content: string;
}

export const EXTENSION_FILES: ExtensionFile[] = ${JSON.stringify(entries, null, 2)};
`;

fs.writeFileSync(targetFile, tsContent, 'utf8');
console.log(`Successfully synced ${entries.length} extension files to ${targetFile}`);

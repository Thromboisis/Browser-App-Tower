import JSZip from 'jszip';
import { EXTENSION_FILES } from '../data/extensionFiles';
import { ICON_16_B64, ICON_48_B64, ICON_128_B64 } from '../data/appTowerIcon';

export const downloadExtensionZip = async (target: 'chrome' | 'firefox' = 'chrome') => {
  const zip = new JSZip();
  const isFirefox = target === 'firefox';

  // 1. Add all core extension files directly at the root level of the ZIP
  EXTENSION_FILES.forEach((file) => {
    const filename = file.filename;
    let content = file.content;

    // Adapt manifest for Firefox if target is firefox
    if (filename === 'manifest.json' && isFirefox) {
      try {
        const manifestObj = JSON.parse(content);
        if (manifestObj.background && manifestObj.background.service_worker) {
          const sw = manifestObj.background.service_worker;
          manifestObj.background = { scripts: [sw] };
        }
        if (Array.isArray(manifestObj.permissions)) {
          manifestObj.permissions = manifestObj.permissions.filter((p: string) => p !== 'favicon');
        }
        if (Array.isArray(manifestObj.web_accessible_resources)) {
          manifestObj.web_accessible_resources = manifestObj.web_accessible_resources.map((entry: any) => {
            if (Array.isArray(entry.resources)) {
              return {
                ...entry,
                resources: entry.resources.filter((r: string) => !r.includes('_favicon'))
              };
            }
            return entry;
          }).filter((entry: any) => Array.isArray(entry.resources) && entry.resources.length > 0);
        }
        manifestObj.browser_specific_settings = {
          gecko: {
            id: 'app-tower-sidebar@local',
            strict_min_version: '109.0'
          }
        };
        content = JSON.stringify(manifestObj, null, 2);
      } catch (e) {
        console.warn('Could not parse manifest for Firefox adaptation', e);
      }
    }

    zip.file(filename, content);
  });

  // 2. Add official App Tower PNG icons inside icons/ subdirectory
  zip.file("icons/icon16.png", ICON_16_B64, { base64: true });
  zip.file("icons/icon48.png", ICON_48_B64, { base64: true });
  zip.file("icons/icon128.png", ICON_128_B64, { base64: true });

  // 3. Add clear instructions README
  const instructions = isFirefox
    ? `# App Tower - Firefox WebExtension (Manifest V3)

## Quick Installation in Firefox:
1. Unzip this downloaded archive into any folder.
2. In Mozilla Firefox, navigate to \`about:debugging#/runtime/this-firefox\` in your address bar.
3. Click **"Load Temporary Add-on..."**.
4. Select the \`manifest.json\` file inside your extracted folder.
5. You're all set! Open any website to use the App Tower sidebar.
`
    : `# App Tower - Chrome Extension (Manifest V3)

## Quick 2-Step Installation in Google Chrome / Edge:
1. Unzip this downloaded archive into any folder.
2. In Google Chrome or Microsoft Edge, navigate to \`chrome://extensions\` (or \`edge://extensions\`).
3. Enable **"Developer mode"** in the top-right corner.
4. Click **"Load unpacked"** (top-left) and select this extracted folder.
5. You're all set! Open any website to use the App Tower sidebar.
`;

  zip.file('README.md', instructions);

  // Generate binary blob
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `app-tower-${target}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

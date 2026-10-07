import JSZip from 'jszip';
import { EXTENSION_FILES } from '../data/extensionFiles';

export const downloadExtensionZip = async () => {
  const zip = new JSZip();

  // 1. Add all core extension files directly at the root level of the ZIP
  Object.entries(EXTENSION_FILES).forEach(([filename, file]) => {
    zip.file(filename, file.content);
  });

  // 2. Add valid PNG icons inside icons/ subdirectory
  const iconBase64 = "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABMSURBVHgB7dNBDQAwCAMAwL9zKjNIBk7lQ2a673b5hUAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBB4BfL4AZ9sZ/J5AAAAAElFTkSuQmCC";
  zip.file('icons/icon16.png', iconBase64, { base64: true });
  zip.file('icons/icon48.png', iconBase64, { base64: true });
  zip.file('icons/icon128.png', iconBase64, { base64: true });

  // 3. Add clear instructions README
  zip.file(
    'README.md',
    `# App Tower - Chrome Extension (Manifest V3)

## Quick 2-Step Installation:
1. Unzip this downloaded archive into any folder.
2. In Google Chrome, navigate to \`chrome://extensions\`.
3. Enable "Developer mode" in the top-right corner.
4. Click "Load unpacked" (top-left) and select this extracted folder.
5. You're all set! Open any website to use the App Tower sidebar.
`
  );

  // Generate binary blob
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'edge-app-tower.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

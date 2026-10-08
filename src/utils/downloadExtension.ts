import JSZip from 'jszip';
import { EXTENSION_FILES } from '../data/extensionFiles';

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

  // 2. Add real sidebar PNG icons inside icons/ subdirectory
  const icon16Base64 = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAnElEQVR4nGNggAI5TWtWOU1rFzlN6ygiMEgdKwOSZj05TeuF7qGZ/4nFIPUgfTCbFyJJYMX84lpwjGwIyAAXmACyImRs7BiKIQbTAzIgClkzMc7/vV8FrharAbhcANIIMwDGpq8BMHmyvZCw9BdYHkTD2PQ1ACYP0kyWF0wuzwTLg2gYm6x0gG4ASSkRWTPMAJS8QExSRskLlOZGAIhEnNb3RMJfAAAAAElFTkSuQmCC";
  const icon48Base64 = "iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABkklEQVR4nO2ZoW7DMBCGo+BKg2NGIy5sx4yKRkNCigpK9kijkcb2DqPje5sNrPJkV553d7Y3+xIrtvSTpPL9X32+SHdd11Zb5ZeQqhdS7YRUg5DqyKDBxOv/a3wjpDoLqV4exscvbum4Jv7mL+b1PzDNYRwAmbSfJPPEZll0c7tFRcQOQ5i0mUqYjgXAYMxJ0Omkc660+RQAAOJMme/dC1vKfCqAC2EuNlyd/NxfIgB5F3T9dX+YGiRG+8P4Lejd5+vdLyEAAwZwDJnnKJshCO2zKgALkRUgZwpZkw2gAawVwEKwVqHcAO7ekPmqAEKxkwD2h/HNlX3vPw8pBeD0/HFVNQDaLATgQiw2haxRDMBCNIAG0ADWWIWq/w5wpFDs3tUA3L8/XVUNgDYLAbgQiwWwRjEAC7FOAKwKlRTLCSwVYJbOHGTYl+uL6szt5gAIQfgnT/VGf3SnOQEwCD91ye50B8wHOAFi7h05H+iQCc2cAJ758IQGugs5YWIAsNjJg75qp5ReOtU5J/ZA6pzUt8WwLkA2Ucz8WIEYAAAAAElFTkSuQmCC";
  const icon128Base64 = "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAEjElEQVR4nO3aP27bMBTHcS2ZC3hwN01dVI/xYEBTpsIHiIdMXTv5Ar5IJy/uAXKCrt17m3Zo8QoWSBSKpMgnkZK+D3hLgAj2+32sP6SqiqIoiqIoiqIoiqIoiqI0q27abd20+7ppj3XTnuqmfaLf9MnMR+a0zZ1ZctVNe6ib9lw37fXT45c/9LCWuZn5HXJnGVx1094ZyYSuj0Hmepc7494yp69b7mEtuWW+MufcWb+qumk3ddNecg9nTS3zlrnnzl7C33G6z4ZALgu7nOHL3epz5Ieffb97/1G1I+f4LDnkCH8XGn7uoOYCIBaFQTDdmcBc872n/dwBLQFAKARzOZjmnsB3w5c7mCUCCIEguUwR/pHw8wEIQDDeI6JZ5Ol9zs8dyFoAuBCYdYJxFotkJYrwywDgQXAaC0DvjV/uMADw+oZwjPAPhF8WAA8C3Q0k2ZUCwKwAnLUBWE//uUNYO4A+BKqXAXk5gV//vACYbHReKpG1ZgDMEoDOHoFr8Sf3l8/R9w+P/zr35wgAoLMo5Hr+z/3l5wjg9/cPgzoBgM56gLywqB1+34dec6dg6AHwBIAZdcoZAQAL6JTLAgAW0ABYea8eQMrxpuzQpwBXgKkAugiKAnD/8PjD17bjhfzfmA0AAAAAAAAAAADSAIQ0N4EAAAAAAAAAAAAAAAAAAAAAAIACwtUE4EKQCiBkngAAAAAAAICsAPoQpAAInScACgFgQxALYMg8AVAQgC6GIQBi5wmAQgGM8f2LAsB2MAAA4OjP335ZA5O/2xoACwDQDXUIgBAMACgYgC3IWAB9CIoCEHvKSjnelD0EQF+IKQBsCAAAAAAAAABFAXAFmAqgiwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAmBsB2MAAA4EGQCiDkjAoAAAAAABkAhPQabgJdCFIAhM4TAIUAsCGIBTBkngAoCEAXwxAAsfMEQKEAxvj+AAAAAOYCYP/zq/X7y99tDYDCOgZAN9QhAEIwAKBgALYgYwH0IQBAoQD6QkwBYEMAAAAAAAAAKAqAK8BUAF0EAAAAAABQCAC2gwEAAAAAAAAAWCeAkLYdb+0NgJU3AFbeAFh5A2DlXTKAU9+HTkEw19bYDErtkB+T5KYF4AiAWQI4agHYA2CWAPZaALYAiAMwBoLu8R0AtioADIIrAOIAaCKwHbsn/Kta+AbAmbNAPIAUDK5jOX79Z20ABwDoANBsB4CDKoDKcRlYG4JSADjC1z39vwDAesA8AOg8/1sA3NVNe/MhyL2tW8p2cKbwb5LTKAAqz6LQfwS5g1w6ANf81RZ/PAguPgRL7pwAPOFfRg/fANi4bgiXDiEHAN+sJQ/JZRIABsGubtpn3wdbIoQpAYTMV3KQPCYL/wWCfSiCJaEYC0DMHE34Omv+kQh2IZcDWr/NaX/6X74FwcZ3Y0irh3+Z9JofUvII4lonoFWCv03yqBdbZrHoxGVBPfirmet4izzaJRsSsisFhqTQz6Ns7Exd8nKCeWo4GslP9Js+mfnsVV/moCiKoiiKoiiKoiiKqqrqL7JSzNm8b2OlAAAAAElFTkSuQmCC";
  zip.file("icons/icon16.png", icon16Base64, { base64: true });
  zip.file("icons/icon48.png", icon48Base64, { base64: true });
  zip.file("icons/icon128.png", icon128Base64, { base64: true });

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

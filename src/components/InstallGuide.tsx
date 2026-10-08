import React, { useState } from 'react';
import { 
  Chrome, 
  Globe,
  Terminal, 
  ToggleRight, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Copy,
  Check,
  AlertTriangle,
  Layout,
  ExternalLink,
  ShieldCheck,
  FileCode2
} from 'lucide-react';

export const InstallGuide: React.FC = () => {
  const [selectedBrowser, setSelectedBrowser] = useState<'chrome' | 'firefox'>('chrome');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Why No-Iframe Solves Google 403 & Loops */}
      <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>Why the No-Iframe Architecture Works 100% of the Time</span>
        </div>
        <p className="text-xs text-emerald-100/90 leading-relaxed">
          Google actively returns <strong>403 Forbidden</strong> and infinite <strong>Redirect Loops</strong> when its apps are placed inside webpage <code className="bg-emerald-900/60 px-1 py-0.5 rounded font-mono">&lt;iframe&gt;</code> tags.
          Instead of breaking against Google's anti-iframe firewall, this extension uses a <strong>frameless companion window docked to the right edge of your monitor</strong>:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 pt-2 text-xs">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-900/40">
            <span className="font-semibold text-emerald-300">01. Zero Iframes</span>
            <p className="text-slate-300 text-[11px] mt-1">Runs as top-level native browser companion windows. Immune to iframe blocking.</p>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-900/40">
            <span className="font-semibold text-emerald-300">02. Toolbar Toggle</span>
            <p className="text-slate-300 text-[11px] mt-1">Sidebar collapse option is in the extension toolbar action icon.</p>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-900/40">
            <span className="font-semibold text-emerald-300">03. Add Any App (+)</span>
            <p className="text-slate-300 text-[11px] mt-1">Plus button at the bottom of the sidebar lets you bookmark any URL or web app.</p>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-900/40">
            <span className="font-semibold text-emerald-300">04. Mobile/Desktop</span>
            <p className="text-slate-300 text-[11px] mt-1">Slider button in Add/Edit modal sets whether window opens in mobile or desktop view.</p>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-900/40">
            <span className="font-semibold text-emerald-300">05. Window Memory</span>
            <p className="text-slate-300 text-[11px] mt-1">Automatically remembers custom window sizes and screen locations per app.</p>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-900/40">
            <span className="font-semibold text-emerald-300">06. Right-Click Edit</span>
            <p className="text-slate-300 text-[11px] mt-1">Right-click any icon to Edit URL/mode, Reset window geometry, or Remove app.</p>
          </div>
        </div>
      </div>

      {/* Browser Tab Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Select Browser for Installation Instructions</h3>
          <p className="text-xs text-slate-400">One unified codebase generates customized Manifest V3 builds for both browsers.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setSelectedBrowser('chrome')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedBrowser === 'chrome'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Chrome className="w-4 h-4" />
            <span>Google Chrome / Edge</span>
          </button>
          <button
            onClick={() => setSelectedBrowser('firefox')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedBrowser === 'firefox'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Mozilla Firefox</span>
          </button>
        </div>
      </div>

      {selectedBrowser === 'chrome' ? (
        <>
          {/* Chrome Header Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
              <Chrome className="w-4 h-4" /> Chrome & Edge Extension Setup
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              How to Load & Run in Google Chrome (Developer Mode)
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Test the ready-to-install extension directly in your browser with zero manual configuration.
            </p>
          </div>

          {/* Chrome Step by Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-700 transition">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center">
                  01
                </div>
                <h4 className="text-sm font-semibold text-slate-100">Download Chrome ZIP</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click <strong>"Chrome ZIP"</strong> in the top header bar, then extract all files into any folder.
                </p>
              </div>
              <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                📂 app-tower-chrome
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-700 transition">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs flex items-center justify-center">
                  02
                </div>
                <h4 className="text-sm font-semibold text-slate-100">Open Extensions</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In Google Chrome or Edge, navigate to the extensions management screen in your address bar:
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-blue-300 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                <span>chrome://extensions</span>
                <button
                  onClick={() => copyToClipboard('chrome://extensions', 'url')}
                  className="text-slate-400 hover:text-slate-200"
                  title="Copy URL"
                >
                  {copiedText === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-700 transition">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 font-bold text-xs flex items-center justify-center">
                  03
                </div>
                <h4 className="text-sm font-semibold text-slate-100">Enable Developer Mode</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Toggle the <strong>"Developer mode"</strong> switch located in the top-right corner of Chrome's Extensions tab.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                <ToggleRight className="w-4 h-4" />
                <span>Developer Mode: ON</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-700 transition">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center">
                  04
                </div>
                <h4 className="text-sm font-semibold text-slate-100">Click "Load unpacked"</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click <strong>Load unpacked</strong> and select the extracted folder directly.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>App Tower Active!</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Firefox Header Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
              <Globe className="w-4 h-4" /> Firefox WebExtension Setup
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              How to Load & Run in Mozilla Firefox
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Firefox Manifest V3 build uses background scripts and explicit Gecko ID settings for flawless compatibility.
            </p>
          </div>

          {/* Firefox Step by Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-700 transition">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-xl bg-orange-600/20 border border-orange-500/30 text-orange-400 font-bold text-xs flex items-center justify-center">
                  01
                </div>
                <h4 className="text-sm font-semibold text-slate-100">Download Firefox ZIP</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click <strong>"Firefox ZIP"</strong> in the top header bar, then extract all files into any folder.
                </p>
              </div>
              <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                📂 app-tower-firefox
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-700 transition">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center justify-center">
                  02
                </div>
                <h4 className="text-sm font-semibold text-slate-100">Open Debugging Page</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In Mozilla Firefox, navigate to the Add-on debugging screen:
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-orange-300 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                <span>about:debugging</span>
                <button
                  onClick={() => copyToClipboard('about:debugging#/runtime/this-firefox', 'ff_url')}
                  className="text-slate-400 hover:text-slate-200"
                  title="Copy URL"
                >
                  {copiedText === 'ff_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-700 transition">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 font-bold text-xs flex items-center justify-center">
                  03
                </div>
                <h4 className="text-sm font-semibold text-slate-100">Click "This Firefox"</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In the left sidebar of the debugging page, select <strong>"This Firefox"</strong>.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-purple-400 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                <Globe className="w-4 h-4" />
                <span>Runtime: This Firefox</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-700 transition">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center">
                  04
                </div>
                <h4 className="text-sm font-semibold text-slate-100">Load Temporary Add-on</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click <strong>Load Temporary Add-on...</strong> and choose the <code className="text-emerald-300">manifest.json</code> in the extracted folder.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Firefox Extension Active!</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* GitHub Automatic Build Workflow Info */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <FileCode2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <span>Automated GitHub Actions CI/CD Pipeline</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The repository includes an automatic GitHub Actions workflow (<code className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-300 font-mono">.github/workflows/build-extensions.yml</code>).
          On every push, pull request, or release tag:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="font-semibold text-blue-400">1. Builds Chrome MV3</span>
            <p className="text-slate-400 text-[11px] mt-1">Packages <code className="text-slate-200">app-tower-chrome.zip</code> ready for Chrome & Edge Web Store submission or unpacked developer loading.</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="font-semibold text-orange-400">2. Adapts & Builds Firefox</span>
            <p className="text-slate-400 text-[11px] mt-1">Transforms background worker to background scripts, embeds Gecko ID, and generates <code className="text-slate-200">app-tower-firefox.zip</code>.</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="font-semibold text-emerald-400">3. Publishes Artifacts & Releases</span>
            <p className="text-slate-400 text-[11px] mt-1">Uploads both zip files as downloadable GitHub workflow artifacts and attaches them to any new GitHub Release tag automatically.</p>
          </div>
        </div>
      </div>

      {/* Chrome Restricted Pages & New Tab FAQ */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <HelpCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <span>Browser Restricted Pages & New Tab Page FAQ</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Why doesn't the sidebar show on internal browser tabs?</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Chromium and Firefox have an intentional, built-in security boundary that strictly forbids extension content scripts from executing on any internal browser pages (like <code className="bg-slate-900 text-amber-300 px-1 py-0.5 rounded font-mono">chrome://*</code>, <code className="bg-slate-900 text-amber-300 px-1 py-0.5 rounded font-mono">about:*</code>) and web stores.
            </p>
            <p className="text-slate-400 leading-relaxed">
              This is a browser-level security rule designed to protect user settings and prevent script injection into core browser surfaces.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-blue-400">
              <Layout className="w-4 h-4 flex-shrink-0" />
              <span>How does the New Tab Override & Settings work?</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              App Tower includes full extension customization and a dedicated New Tab dashboard:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li>
                <strong className="text-slate-200">New Tab Override (Disabled by default):</strong> You can turn this setting on in the gear settings menu to replace your blank tab with customizable search engines, Bing wallpapers, and draggable live clock & weather modals.
              </li>
              <li>
                <strong className="text-slate-200">Custom Sidebar Width & Color:</strong> Adjust the rail width (36px to 72px) and choose between Obsidian, Navy, Charcoal, Black, or custom hex colors.
              </li>
              <li>
                <strong className="text-slate-200">Live Clock & Weather Applets:</strong> Draggable cards on the New Tab page that automatically resolve time and weather based on your current IP/location.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

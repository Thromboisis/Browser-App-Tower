import React, { useState } from 'react';
import { 
  Chrome, 
  FolderDown, 
  Terminal, 
  ToggleRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Keyboard, 
  HelpCircle,
  Copy,
  Check,
  AlertTriangle,
  FolderOpen,
  Layout,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const InstallGuide: React.FC = () => {
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
            <p className="text-slate-300 text-[11px] mt-1">Sidebar collapse option is now in the Chrome extension toolbar action icon.</p>
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

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
          <Chrome className="w-4 h-4" /> Chrome Extension Setup
        </div>
        <h3 className="text-lg font-bold text-slate-100">
          How to Load & Run in Google Chrome (Developer Mode)
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Test the ready-to-install extension directly in your browser with no build steps or file moving required.
        </p>
      </div>

      {/* Step by Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-700 transition">
          <div className="space-y-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center">
              01
            </div>
            <h4 className="text-sm font-semibold text-slate-100">Download & Extract ZIP</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click <strong>"Download ZIP"</strong> on the top navbar, then right-click and extract all files into a folder.
            </p>
          </div>
          <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
            📂 edge-app-tower
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-700 transition">
          <div className="space-y-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs flex items-center justify-center">
              02
            </div>
            <h4 className="text-sm font-semibold text-slate-100">Open Extensions</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              In Google Chrome, navigate to the extensions management screen in your address bar:
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
    </div>
  );
};

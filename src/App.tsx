/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Play, 
  Code2, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2,
  Chrome,
  Globe
} from 'lucide-react';
import { LiveSimulator } from './components/LiveSimulator';
import { CodeViewer } from './components/CodeViewer';
import { RuleVisualizer } from './components/RuleVisualizer';
import { InstallGuide } from './components/InstallGuide';
import { downloadExtensionZip } from './utils/downloadExtension';
import { APP_TOWER_SVG } from './data/appTowerIcon';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'rules' | 'install'>('simulator');
  const [downloadingBrowser, setDownloadingBrowser] = useState<'chrome' | 'firefox' | null>(null);

  const handleDownload = async (browser: 'chrome' | 'firefox') => {
    try {
      setDownloadingBrowser(browser);
      await downloadExtensionZip(browser);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadingBrowser(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Official App Tower 3-Cube Logo */}
          <div 
            className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 p-1 shadow-lg shadow-amber-500/10 flex items-center justify-center shrink-0"
            title="App Tower Sidebar"
          >
            <div 
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: APP_TOWER_SVG }}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white">App Tower Sidebar</h1>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                v1.15 MV3
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                Universal Floating Rail
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Leaves Host DOM 100% Untouched • Chrome & Firefox Universal Build
            </p>
          </div>
        </div>

        {/* Tab Controls & Multi-Browser Download CTAs */}
        <div className="flex items-center flex-wrap gap-2.5">
          <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'simulator'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Files & Code</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'rules'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Header Rules</span>
            </button>

            <button
              onClick={() => setActiveTab('install')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'install'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Install Guide</span>
            </button>
          </nav>

          {/* Chrome & Firefox Dual Download Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleDownload('chrome')}
              disabled={downloadingBrowser !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Download Chrome & Edge compatible ZIP package"
            >
              <Chrome className="w-3.5 h-3.5" />
              <span>{downloadingBrowser === 'chrome' ? 'Packaging...' : 'Chrome ZIP'}</span>
            </button>

            <button
              onClick={() => handleDownload('firefox')}
              disabled={downloadingBrowser !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold shadow-sm shadow-orange-500/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Download Firefox compatible WebExtension ZIP package"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{downloadingBrowser === 'firefox' ? 'Packaging...' : 'Firefox ZIP'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {activeTab === 'simulator' && <LiveSimulator />}
        {activeTab === 'code' && <CodeViewer />}
        {activeTab === 'rules' && <RuleVisualizer />}
        {activeTab === 'install' && <InstallGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span>App Tower Sidebar v1.14</span>
          <span>•</span>
          <span>Unified Codebase for Google Chrome & Mozilla Firefox</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Default Collapsed Mode Active
          </span>
        </div>
      </footer>
    </div>
  );
}

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
  FolderArchive, 
  Sparkles, 
  Layers, 
  ExternalLink,
  Github,
  CheckCircle2,
  Download
} from 'lucide-react';
import { LiveSimulator } from './components/LiveSimulator';
import { CodeViewer } from './components/CodeViewer';
import { RuleVisualizer } from './components/RuleVisualizer';
import { InstallGuide } from './components/InstallGuide';
import { downloadExtensionZip } from './utils/downloadExtension';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'rules' | 'install'>('simulator');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadExtensionZip();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-[1px] shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <div className="grid grid-cols-2 gap-0.5 p-1">
                <span className="w-1.5 h-1.5 rounded-sm bg-blue-500"></span>
                <span className="w-1.5 h-1.5 rounded-sm bg-emerald-500"></span>
                <span className="w-1.5 h-1.5 rounded-sm bg-amber-500"></span>
                <span className="w-1.5 h-1.5 rounded-sm bg-purple-500"></span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white">App Tower Extension</h1>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Manifest V3
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Direct Unpack & Load Ready • No Moving Files Required
            </p>
          </div>
        </div>

        {/* Tab Controls & Direct Download CTA */}
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'install'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Install Guide</span>
            </button>
          </nav>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'Packaging...' : 'Download ZIP'}</span>
          </button>
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
        <div className="flex items-center gap-2">
          <span>App Tower Sidebar for Google Chrome</span>
          <span>•</span>
          <span>Manifest V3</span>
          <span>•</span>
          <span>Shadow DOM Encapsulation</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Chrome Load Unpacked
          </span>
        </div>
      </footer>
    </div>
  );
}

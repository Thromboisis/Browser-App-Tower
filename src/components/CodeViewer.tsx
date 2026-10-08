import React, { useState } from 'react';
import { EXTENSION_FILES, ExtensionFile } from '../data/extensionFiles';
import { Copy, Check, Download, FileCode, Shield, Layers, Code, Sparkles, FolderArchive, ArrowDownToLine } from 'lucide-react';
import { downloadExtensionZip } from '../utils/downloadExtension';

export const CodeViewer: React.FC = () => {
  const [activeFileKey, setActiveFileKey] = useState<string>('manifest.json');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const activeFile = EXTENSION_FILES.find(f => f.key === activeFileKey) || EXTENSION_FILES[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadSingleFile = (file: ExtensionFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      await downloadExtensionZip();
    } catch (error) {
      console.error('Failed to generate ZIP:', error);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & ZIP Download Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Zero Subfolders
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Unpack & Load Directly
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100">Extension Package & Source Code</h3>
          <p className="text-xs text-slate-400">
            Files are structured so you can select the extracted folder directly in Chrome without moving files around.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleDownloadSingleFile(activeFile)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition shadow-sm"
            title={`Download individual ${activeFile.filename}`}
          >
            <ArrowDownToLine className="w-4 h-4 text-blue-400" />
            <span>Save {activeFile.filename}</span>
          </button>

          <button
            onClick={() => handleCopy(activeFile.content, activeFileKey)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition shadow-sm"
          >
            {copiedKey === activeFileKey ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={isDownloadingZip}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition active:scale-95 disabled:opacity-50"
          >
            <FolderArchive className="w-4 h-4" />
            <span>{isDownloadingZip ? 'Packaging ZIP...' : 'Download Ready Extension (.ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {Object.entries(EXTENSION_FILES).map(([key, file]) => {
          const isActive = activeFileKey === key;
          return (
            <button
              key={key}
              onClick={() => setActiveFileKey(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:bg-slate-900'
              }`}
            >
              <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>{file.filename}</span>
            </button>
          );
        })}
      </div>

      {/* Active File Explanation Card */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-300">
        <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">{activeFile.filename}: </span>
          <span className="text-slate-400">{activeFile.description}</span>
        </div>
      </div>

      {/* Code Editor Box */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl font-mono text-xs">
        <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
            <span className="text-slate-200 font-semibold">{activeFile.filename}</span>
            <span className="text-[11px] text-slate-500">({activeFile.content.split('\n').length} lines)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadSingleFile(activeFile)}
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg hover:bg-slate-800 transition"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>Save File</span>
            </button>
            <button
              onClick={() => handleCopy(activeFile.content, activeFileKey)}
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg hover:bg-slate-800 transition"
            >
              {copiedKey === activeFileKey ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 overflow-x-auto max-h-[550px] overflow-y-auto leading-relaxed text-slate-200 selection:bg-blue-600/40">
          <pre className="font-mono text-[12px]">
            <code>
              {activeFile?.content.split('\n').map((line: string, idx: number) => (
                <div key={idx} className="table-row hover:bg-slate-900/50">
                  <span className="table-cell pr-4 text-right select-none text-slate-600 text-[11px] w-10 font-mono">
                    {idx + 1}
                  </span>
                  <span className="table-cell whitespace-pre font-mono text-slate-200">
                    {line}
                  </span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

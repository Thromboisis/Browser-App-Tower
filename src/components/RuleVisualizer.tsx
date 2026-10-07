import React from 'react';
import { ShieldCheck, ArrowRight, XCircle, CheckCircle2, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

export const RuleVisualizer: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
          <Cpu className="w-4 h-4" /> Network Architecture & Security
        </div>
        <h3 className="text-lg font-bold text-slate-100">
          How declarativeNetRequest Enables Iframe Embedding
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Google Keep (<code className="text-slate-300">keep.google.com</code>) and Google Messages (<code className="text-slate-300">messages.google.com</code>) normally emit HTTP response headers that forbid browsers from rendering them inside an iframe on third-party domains. Manifest V3 uses declarativeNetRequest rule sets to intercept and strip these blocking headers on the fly.
        </p>
      </div>

      {/* Header Transformation Pipeline Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* Step 1: Upstream Response */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Step 1: Origin Server</span>
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <h4 className="text-sm font-semibold text-slate-100 mt-2">Default HTTP Headers</h4>
            <p className="text-xs text-slate-400 mt-1">
              Google servers send restrictive framing directives by default.
            </p>
          </div>

          <div className="bg-slate-950 rounded-xl p-3 border border-red-900/30 font-mono text-[11px] space-y-2">
            <div className="text-red-400 flex items-center justify-between">
              <span>x-frame-options: DENY</span>
              <XCircle className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="text-red-400/90 flex items-center justify-between">
              <span>content-security-policy: frame-ancestors 'self'</span>
              <XCircle className="w-3.5 h-3.5 text-red-400" />
            </div>
          </div>
        </div>

        {/* Step 2: Declarative Rule Engine */}
        <div className="bg-blue-950/30 border border-blue-800/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg relative">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Step 2: Chrome DNR</span>
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <h4 className="text-sm font-semibold text-slate-100 mt-2">rules.json Matching</h4>
            <p className="text-xs text-slate-300 mt-1">
              Matches <code className="text-blue-300">keep.google.com</code> & <code className="text-blue-300">messages.google.com</code> sub_frame requests.
            </p>
          </div>

          <div className="bg-slate-950 rounded-xl p-3 border border-blue-900/50 font-mono text-[11px] space-y-1.5 text-blue-200">
            <div className="text-slate-400 text-[10px]">// modifyHeaders Action</div>
            <div>• remove("x-frame-options")</div>
            <div>• remove("content-security-policy")</div>
            <div>• remove("frame-options")</div>
          </div>
        </div>

        {/* Step 3: Result in Content Script */}
        <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Step 3: Shadow DOM Iframe</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-sm font-semibold text-slate-100 mt-2">Clean Iframe Render</h4>
            <p className="text-xs text-slate-300 mt-1">
              Browser allows the subframe to load with cookies & authentication preserved.
            </p>
          </div>

          <div className="bg-slate-950 rounded-xl p-3 border border-emerald-900/40 font-mono text-[11px] space-y-2">
            <div className="text-emerald-400 flex items-center justify-between">
              <span>Status: 200 OK (Framed)</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-emerald-400/90 flex items-center justify-between">
              <span>380px App Panel: Active</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Rules Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200">Configured Rule Specifications</span>
          <span className="text-[11px] text-slate-500 font-mono">rules.json (4 Active Rules)</span>
        </div>
        <div className="divide-y divide-slate-800/60 text-xs">
          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-slate-200">Rule #1: Google Keep</div>
              <div className="text-slate-400 font-mono text-[11px]">Filter: ||keep.google.com/</div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px] self-start md:self-auto">
              Remove X-Frame-Options + Relax CSP
            </span>
          </div>
          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-slate-200">Rule #2: Google Messages</div>
              <div className="text-slate-400 font-mono text-[11px]">Filter: ||messages.google.com/</div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px] self-start md:self-auto">
              Remove X-Frame-Options + Relax CSP
            </span>
          </div>
          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-slate-200">Rule #3: Google Calendar</div>
              <div className="text-slate-400 font-mono text-[11px]">Filter: ||calendar.google.com/</div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px] self-start md:self-auto">
              Remove X-Frame-Options + Relax CSP
            </span>
          </div>
          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-slate-200">Rule #4: Google Tasks</div>
              <div className="text-slate-400 font-mono text-[11px]">Filter: ||tasks.google.com/</div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px] self-start md:self-auto">
              Remove X-Frame-Options + Relax CSP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

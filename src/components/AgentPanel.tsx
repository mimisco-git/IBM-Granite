import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu, Plus, ExternalLink, Shield, Loader, CheckCircle,
  AlertTriangle, X, RefreshCcw, ChevronDown,
} from 'lucide-react';
import { OnChainAgent, AgentRegistrationForm, PolicyValidation } from '../types';
import { registerAgent, fetchAgentsByOwner, fetchRecentAgents, getArcScanAgentUrl, getArcScanAddressUrl } from '../services/agentRegistry';
import { validatePolicy } from '../services/claudeService';
import { AGENT_CAPABILITIES, POLICY_TEMPLATES } from '../constants';

interface Props {
  walletAddress: string | null;
  isOnArc: boolean;
}

type View = 'list' | 'register';

const RISK_COLORS: Record<string, string> = {
  safe:     'text-green-400 border-green-400/20 bg-green-400/5',
  moderate: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5',
  risky:    'text-orange-400 border-orange-400/20 bg-orange-400/5',
  critical: 'text-red-400 border-red-400/20 bg-red-400/5',
};

const AGENT_TYPE_OPTIONS = [
  { value: 'trading',    label: '📈 Trading Agent' },
  { value: 'fx',        label: '💱 FX Agent' },
  { value: 'payroll',   label: '💸 Payroll Agent' },
  { value: 'yield',     label: '🌱 Yield Agent' },
  { value: 'bridge',    label: '🌉 Bridge Agent' },
  { value: 'compliance',label: '🔐 Compliance Agent' },
  { value: 'custom',    label: '⚙️ Custom Agent' },
];

const AGENT_ICONS: Record<string, string> = {
  trading: '📈', fx: '💱', payroll: '💸', yield: '🌱',
  bridge: '🌉', compliance: '🔐', custom: '⚙️',
};

export default function AgentPanel({ walletAddress, isOnArc }: Props) {
  const [view, setView] = useState<View>('list');
  const [agents, setAgents] = useState<OnChainAgent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [policyValidation, setPolicyValidation] = useState<PolicyValidation | null>(null);
  const [isValidatingPolicy, setIsValidatingPolicy] = useState(false);

  const [form, setForm] = useState<AgentRegistrationForm & { policyTemplate: string }>({
    name: '',
    description: '',
    agentType: 'trading',
    capabilities: ['usdc_transfer'],
    policyTemplate: 'balanced',
    customPolicy: POLICY_TEMPLATES.balanced,
  });

  const loadAgents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (walletAddress) {
        const mine = await fetchAgentsByOwner(walletAddress);
        if (mine.length > 0) { setAgents(mine); return; }
      }
      const recent = await fetchRecentAgents();
      setAgents(recent);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load agents');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => { loadAgents(); }, [loadAgents]);

  const handleValidatePolicy = async () => {
    if (!form.customPolicy.trim()) return;
    setIsValidatingPolicy(true);
    setPolicyValidation(null);
    try {
      const result = await validatePolicy(form.customPolicy, form.agentType);
      setPolicyValidation(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Policy validation failed');
    } finally {
      setIsValidatingPolicy(false);
    }
  };

  const handleRegister = async () => {
    if (!walletAddress || !form.name.trim()) return;
    if (!isOnArc) { setError('Switch to Arc Testnet first'); return; }
    setIsRegistering(true);
    setError(null);
    setTxHash(null);
    try {
      const result = await registerAgent({
        name: form.name, description: form.description,
        agentType: form.agentType, capabilities: form.capabilities,
        policyTemplate: form.policyTemplate, customPolicy: form.customPolicy,
      }, walletAddress);
      setTxHash(result.txHash);
      setTimeout(loadAgents, 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const toggleCapability = (cap: string) => {
    setForm(f => ({
      ...f,
      capabilities: f.capabilities.includes(cap)
        ? f.capabilities.filter(c => c !== cap)
        : [...f.capabilities, cap],
    }));
  };

  const setTemplate = (t: 'conservative' | 'balanced' | 'aggressive') => {
    setForm(f => ({ ...f, policyTemplate: t, customPolicy: POLICY_TEMPLATES[t] }));
    setPolicyValidation(null);
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Cpu size={14} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white tracking-tight">Agent Registry</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">ERC-8004 on Arc Testnet</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={loadAgents} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
            <RefreshCcw size={12} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => { setView(v => v === 'list' ? 'register' : 'list'); setError(null); setTxHash(null); }}
            className={`p-1.5 rounded-lg transition-all ${view === 'register' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
          >
            {view === 'register' ? <X size={12} /> : <Plus size={12} />}
          </button>
        </div>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 shrink-0">
            <AlertTriangle size={10} className="text-red-400 shrink-0" />
            <p className="text-[9px] text-red-400 leading-relaxed">{error}</p>
          </motion.div>
        )}
        {txHash && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shrink-0">
            <CheckCircle size={10} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[9px] text-emerald-400 font-bold">Agent registered on-chain!</p>
              <a href={getArcScanAgentUrl(txHash)} target="_blank" rel="noopener noreferrer"
                className="text-[8px] text-emerald-500/70 hover:text-emerald-400 flex items-center gap-1 mt-0.5">
                <ExternalLink size={7} /> View on ArcScan
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div key="list" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
            className="flex-1 overflow-y-auto no-scrollbar space-y-2">
            {!walletAddress && (
              <p className="text-center text-[9px] text-slate-600 py-2">
                Connect wallet to see your agents. Showing recent network agents.
              </p>
            )}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader size={16} className="text-emerald-400 animate-spin" />
              </div>
            ) : agents.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-[10px] text-slate-500">No agents found on Arc Testnet</p>
                <button onClick={() => setView('register')} className="text-[9px] text-emerald-400 hover:text-emerald-300 transition-colors">
                  Register the first agent
                </button>
              </div>
            ) : (
              agents.map((agent, idx) => (
                <motion.div key={agent.tokenId} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                  className="p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-all group">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{AGENT_ICONS[agent.agentType ?? 'custom'] ?? '⚙️'}</span>
                      <div>
                        <p className="text-[10px] font-bold text-white">{agent.name}</p>
                        <p className="text-[8px] text-slate-600 font-mono">Token #{agent.tokenId}</p>
                      </div>
                    </div>
                    {agent.txHash && (
                      <a href={getArcScanAgentUrl(agent.txHash)} target="_blank" rel="noopener noreferrer"
                        className="p-1 text-slate-600 hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100">
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  {agent.description && (
                    <p className="text-[9px] text-slate-400 leading-relaxed mb-2">{agent.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {(agent.capabilities ?? []).slice(0, 3).map(cap => (
                        <span key={cap} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[7px] font-bold uppercase">
                          {cap.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                    {agent.owner && (
                      <a href={getArcScanAddressUrl(agent.owner)} target="_blank" rel="noopener noreferrer"
                        className="text-[7px] text-slate-600 hover:text-slate-400 font-mono transition-colors">
                        {agent.owner.slice(0, 6)}...{agent.owner.slice(-4)}
                      </a>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div key="register" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
            className="flex-1 overflow-y-auto no-scrollbar space-y-3">
            {!walletAddress && (
              <div className="p-2.5 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                <p className="text-[9px] text-yellow-400">Connect wallet to register on Arc Testnet</p>
              </div>
            )}

            {/* Basic info */}
            <div className="space-y-2">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Agent name..."
                className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/30 transition-all" />
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Description (optional)..."
                className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2.5 text-[10px] text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/30 transition-all" />
              <div className="relative">
                <select value={form.agentType} onChange={e => setForm(f => ({ ...f, agentType: e.target.value }))}
                  className="w-full appearance-none bg-black/40 border border-white/5 rounded-xl px-3 py-2.5 text-[10px] text-white focus:outline-none focus:border-emerald-500/30 pr-8">
                  {AGENT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Capabilities */}
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Capabilities</p>
              <div className="flex flex-wrap gap-1.5">
                {AGENT_CAPABILITIES.map(cap => (
                  <button key={cap} onClick={() => toggleCapability(cap)}
                    className={`px-2 py-1 rounded text-[8px] font-bold uppercase transition-all border ${
                      form.capabilities.includes(cap)
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-white/5 text-slate-500 border-white/5 hover:text-slate-300'
                    }`}>
                    {cap.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Policy */}
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Policy DSL</p>
              <div className="flex gap-1 mb-2">
                {(['conservative', 'balanced', 'aggressive'] as const).map(t => (
                  <button key={t} onClick={() => setTemplate(t)}
                    className={`flex-1 py-1.5 rounded text-[8px] font-bold uppercase transition-all ${
                      form.policyTemplate === t
                        ? t === 'conservative' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : t === 'balanced' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-white/5 text-slate-500 border border-white/5'
                    }`}>
                    {t.slice(0, 4)}
                  </button>
                ))}
              </div>
              <textarea value={form.customPolicy}
                onChange={e => { setForm(f => ({ ...f, customPolicy: e.target.value })); setPolicyValidation(null); }}
                rows={6}
                className="w-full bg-black/40 border border-white/5 rounded-xl p-2.5 text-[9px] text-indigo-300 font-mono resize-none focus:outline-none focus:border-emerald-500/30 transition-all leading-relaxed" />
              <button onClick={handleValidatePolicy} disabled={isValidatingPolicy}
                className="mt-1.5 w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-40">
                {isValidatingPolicy ? <Loader size={10} className="animate-spin" /> : <Shield size={10} />}
                {isValidatingPolicy ? 'Validating with Claude...' : 'Validate Policy with Claude'}
              </button>
            </div>

            {/* Validation Result */}
            <AnimatePresence>
              {policyValidation && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-xl border ${RISK_COLORS[policyValidation.riskLabel] ?? RISK_COLORS.moderate}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest">{policyValidation.riskLabel} risk</p>
                    <p className="text-[9px] font-mono font-bold">{policyValidation.riskScore}/100</p>
                  </div>
                  <p className="text-[9px] leading-relaxed mb-2">{policyValidation.explanation}</p>
                  {policyValidation.issues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-1.5 mt-1">
                      <AlertTriangle size={8} className="shrink-0 mt-0.5 opacity-70" />
                      <p className="text-[8px] opacity-80">{issue}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Register */}
            <button onClick={handleRegister}
              disabled={isRegistering || !walletAddress || !form.name.trim()}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              {isRegistering
                ? <><Loader size={12} className="animate-spin" />Registering on Arc...</>
                : <><Cpu size={12} />Register ERC-8004 Agent</>}
            </button>
            {walletAddress && !isOnArc && (
              <p className="text-center text-[9px] text-orange-400">Switch to Arc Testnet first</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

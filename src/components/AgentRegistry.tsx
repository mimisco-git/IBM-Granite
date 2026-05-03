import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Plus, ExternalLink, Star, Shield, Loader, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { OnChainAgent, AgentRegistrationForm } from '../types';
import { fetchRecentAgents, fetchAgentsByOwner, registerAgent, getArcScanAddressUrl, getArcScanAgentUrl } from '../services/agentRegistry';
import { AGENT_CAPABILITIES, ARC_TESTNET } from '../constants';
import PolicyEditor from './PolicyEditor';

interface Props {
  walletAddress: string | null;
  isOnArc: boolean;
  onAgentRegistered?: (agent: OnChainAgent) => void;
}

const AGENT_TYPE_ICONS: Record<string, string> = {
  trading: '📈',
  payroll: '💸',
  fx: '🔄',
  bridge: '🌉',
  yield: '🌾',
  compliance: '🛡️',
  custom: '⚙️',
};

const AGENT_TYPES = ['trading', 'payroll', 'fx', 'bridge', 'yield', 'compliance', 'custom'];

export default function AgentRegistry({ walletAddress, isOnArc, onAgentRegistered }: Props) {
  const [agents, setAgents] = useState<OnChainAgent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationTx, setRegistrationTx] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'registry' | 'register'>('registry');
  const [selectedAgent, setSelectedAgent] = useState<OnChainAgent | null>(null);
  const [savedPolicy, setSavedPolicy] = useState('');

  const [form, setForm] = useState<AgentRegistrationForm>({
    name: '',
    description: '',
    agentType: 'trading',
    capabilities: ['usdc_transfer'],
    policyTemplate: 'balanced',
    customPolicy: '',
  });

  const loadAgents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const all = await fetchRecentAgents();
      if (walletAddress) {
        const mine = await fetchAgentsByOwner(walletAddress);
        // Merge, deduplicate by tokenId
        const merged = [...mine, ...all.filter(a => !mine.find(m => m.tokenId === a.tokenId))];
        setAgents(merged);
      } else {
        setAgents(all);
      }
    } catch (e) {
      setError('Failed to load agents from Arc Testnet');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, [walletAddress]);

  const handleRegister = async () => {
    if (!walletAddress || !isOnArc) return;
    if (!form.name || !form.description) {
      setError('Name and description required');
      return;
    }
    setIsRegistering(true);
    setError(null);
    setRegistrationTx(null);
    try {
      const formWithPolicy = { ...form, customPolicy: savedPolicy || form.customPolicy };
      const { txHash } = await registerAgent(formWithPolicy, walletAddress);
      setRegistrationTx(txHash);

      const newAgent: OnChainAgent = {
        tokenId: 'pending',
        owner: walletAddress,
        metadataURI: '',
        name: form.name,
        description: form.description,
        agentType: form.agentType,
        capabilities: form.capabilities,
        txHash,
      };

      setAgents(prev => [newAgent, ...prev]);
      onAgentRegistered?.(newAgent);
      setTimeout(() => {
        setActiveView('registry');
        setShowForm(false);
        loadAgents();
      }, 3000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Registration failed';
      if (msg.includes('rejected') || msg.includes('denied')) {
        setError('Transaction rejected by user');
      } else {
        setError(msg);
      }
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

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Cpu size={14} className="text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white tracking-tight">Agent Registry</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">ERC-8004 on-chain identity</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={loadAgents}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-all"
          >
            <RefreshCw size={11} className={isLoading ? 'animate-spin' : ''} />
          </button>
          {walletAddress && isOnArc && (
            <button
              onClick={() => setActiveView(v => v === 'register' ? 'registry' : 'register')}
              className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-all"
            >
              <Plus size={11} />
            </button>
          )}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-black/30 border border-white/5">
        {(['registry', 'register'] as const).map(v => (
          <button
            key={v}
            onClick={() => setActiveView(v)}
            disabled={v === 'register' && !walletAddress}
            className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all disabled:opacity-30 ${
              activeView === v
                ? 'bg-blue-500 text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {v === 'registry' ? 'Browse Chain' : 'Register Agent'}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={10} className="text-red-400 shrink-0" />
          <p className="text-[9px] text-red-400">{error}</p>
        </div>
      )}

      {/* Registry View */}
      {activeView === 'registry' && (
        <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
          {isLoading && (
            <div className="py-8 flex flex-col items-center gap-2">
              <Loader size={20} className="text-blue-400 animate-spin" />
              <p className="text-[9px] text-slate-500">Reading Arc Testnet chain...</p>
            </div>
          )}

          {!isLoading && agents.length === 0 && (
            <div className="py-8 flex flex-col items-center gap-3 text-center">
              <Cpu size={24} className="text-slate-700" />
              <div>
                <p className="text-xs text-slate-500">No agents found</p>
                <p className="text-[9px] text-slate-700 mt-1">
                  {walletAddress ? 'Register your first agent on Arc Testnet' : 'Connect wallet to see your agents'}
                </p>
              </div>
            </div>
          )}

          <AnimatePresence>
            {agents.map((agent, i) => (
              <motion.div
                key={agent.tokenId + i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedAgent(selectedAgent?.tokenId === agent.tokenId ? null : agent)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedAgent?.tokenId === agent.tokenId
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-white/3 border-white/5 hover:bg-white/5'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-base shrink-0">
                    {AGENT_TYPE_ICONS[agent.agentType ?? 'custom'] ?? '⚙️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-[10px] font-bold text-white truncate">{agent.name}</p>
                      {agent.tokenId !== 'pending' && (
                        <span className="text-[8px] text-slate-600 font-mono shrink-0 ml-1">#{agent.tokenId}</span>
                      )}
                    </div>
                    {agent.tokenId === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 text-[7px] font-bold">
                        <Loader size={7} className="animate-spin" />
                        Pending
                      </span>
                    )}
                    <p className="text-[9px] text-slate-500 leading-relaxed mt-0.5 line-clamp-1">{agent.description}</p>

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[7px] font-bold uppercase">
                        {agent.agentType}
                      </span>
                      {agent.capabilities?.slice(0, 2).map(cap => (
                        <span key={cap} className="text-[7px] text-slate-600 font-mono">{cap}</span>
                      ))}
                      {(agent.capabilities?.length ?? 0) > 2 && (
                        <span className="text-[7px] text-slate-700">+{(agent.capabilities?.length ?? 0) - 2}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {selectedAgent?.tokenId === agent.tokenId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                        <div>
                          <p className="text-[8px] text-slate-600 uppercase tracking-widest mb-1">Owner</p>
                          <a
                            href={getArcScanAddressUrl(agent.owner)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-[9px] text-blue-400 font-mono hover:text-blue-300 flex items-center gap-1"
                          >
                            {agent.owner.slice(0, 14)}...{agent.owner.slice(-6)}
                            <ExternalLink size={8} />
                          </a>
                        </div>

                        <div>
                          <p className="text-[8px] text-slate-600 uppercase tracking-widest mb-1">All Capabilities</p>
                          <div className="flex flex-wrap gap-1">
                            {agent.capabilities?.map(cap => (
                              <span key={cap} className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 text-[7px] font-mono">
                                {cap}
                              </span>
                            ))}
                          </div>
                        </div>

                        {agent.txHash && agent.txHash !== 'pending' && (
                          <div>
                            <p className="text-[8px] text-slate-600 uppercase tracking-widest mb-1">Registration Tx</p>
                            <a
                              href={getArcScanAgentUrl(agent.txHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-[9px] text-cyan-400 font-mono hover:text-cyan-300 flex items-center gap-1"
                            >
                              {agent.txHash.slice(0, 18)}...
                              <ExternalLink size={8} />
                            </a>
                          </div>
                        )}

                        {agent.owner.toLowerCase() === walletAddress?.toLowerCase() && (
                          <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-blue-500/5 border border-blue-500/20">
                            <Shield size={8} className="text-blue-400 shrink-0" />
                            <p className="text-[8px] text-blue-400">You own this agent</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {!walletAddress && (
            <div className="p-3 rounded-xl bg-white/3 border border-white/5 text-center">
              <p className="text-[9px] text-slate-500">Connect wallet to see your agents and register new ones</p>
            </div>
          )}
        </div>
      )}

      {/* Registration Form */}
      {activeView === 'register' && (
        <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
          {registrationTx ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 flex flex-col items-center gap-3 text-center"
            >
              <CheckCircle size={28} className="text-green-400" />
              <div>
                <p className="text-sm font-bold text-white">Agent Registered!</p>
                <p className="text-[9px] text-slate-500 mt-1">Transaction submitted to Arc Testnet</p>
              </div>
              <a
                href={getArcScanAgentUrl(registrationTx)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[9px] text-cyan-400 hover:text-cyan-300"
              >
                <ExternalLink size={10} />
                View on ArcScan
              </a>
            </motion.div>
          ) : (
            <>
              <div className="space-y-2.5">
                <div>
                  <p className="text-[8px] text-slate-600 uppercase tracking-widest mb-1">Agent Name</p>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. DeFi Arbitrage Agent v1.0"
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-2.5 py-2 text-[10px] text-white focus:outline-none focus:border-blue-500/30"
                  />
                </div>

                <div>
                  <p className="text-[8px] text-slate-600 uppercase tracking-widest mb-1">Description</p>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="What does this agent do?"
                    rows={2}
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-2.5 py-2 text-[10px] text-white resize-none focus:outline-none focus:border-blue-500/30"
                  />
                </div>

                <div>
                  <p className="text-[8px] text-slate-600 uppercase tracking-widest mb-1">Agent Type</p>
                  <div className="grid grid-cols-4 gap-1">
                    {AGENT_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => setForm(f => ({ ...f, agentType: type }))}
                        className={`py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all flex flex-col items-center gap-0.5 ${
                          form.agentType === type
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/5 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <span>{AGENT_TYPE_ICONS[type]}</span>
                        <span>{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[8px] text-slate-600 uppercase tracking-widest mb-1">Capabilities</p>
                  <div className="flex flex-wrap gap-1">
                    {AGENT_CAPABILITIES.map(cap => (
                      <button
                        key={cap}
                        onClick={() => toggleCapability(cap)}
                        className={`px-2 py-1 rounded-lg text-[7px] font-mono font-bold uppercase transition-all ${
                          form.capabilities.includes(cap)
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-white/3 text-slate-600 border border-white/5 hover:text-slate-400'
                        }`}
                      >
                        {cap}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Inline Policy Editor */}
              <div className="rounded-xl border border-white/5 overflow-hidden">
                <div className="px-3 py-2 bg-white/3 border-b border-white/5">
                  <p className="text-[8px] text-slate-500 uppercase tracking-widest">Agent Policy</p>
                </div>
                <div className="h-48">
                  <PolicyEditor
                    agentType={form.agentType}
                    onPolicySave={setSavedPolicy}
                  />
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={isRegistering || !form.name}
                className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                {isRegistering ? (
                  <><Loader size={12} className="animate-spin" />Registering on Arc...</>
                ) : (
                  <><Cpu size={12} />Register Agent (ERC-8004)</>
                )}
              </button>

              <p className="text-center text-[8px] text-slate-600">
                Registers agent identity on Arc Testnet via IdentityRegistry contract
              </p>

              {!isOnArc && walletAddress && (
                <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-[9px] text-yellow-400 text-center">
                    Switch to Arc Testnet (Chain ID: {ARC_TESTNET.id}) to register
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

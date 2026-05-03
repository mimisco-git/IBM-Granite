import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ChevronRight, CheckCircle, XCircle, AlertTriangle, Loader, ExternalLink, TriangleAlert, Play } from 'lucide-react';
import { Node, Edge, DecomposedIntent, IntentStep } from '../types';
import { decomposeIntent } from '../services/claudeService';
import { ARC_EXPLORER } from '../constants';

interface Props {
  nodes: Node[];
  edges: Edge[];
  walletAddress: string | null;
  onStepExecute?: (step: IntentStep) => Promise<string | null>;
}

const EXAMPLE_INTENTS = [
  'Bridge 100 USDC from Base to Arc and fund my FX agent for 7 days',
  'Swap 500 USDC to EURC using StableFX and send to payroll agent',
  'Register a new yield-harvesting agent with balanced risk policy',
  'Split 1000 USDC equally between all active agents on Arc',
];

const RISK_COLORS = {
  low: 'text-green-400 bg-green-400/10 border-green-400/20',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  high: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const ACTION_ICONS: Record<string, string> = {
  check_balance: '💰',
  estimate_gas: '⛽',
  approve_token: '✅',
  bridge: '🌉',
  transfer: '📤',
  fx_swap: '🔄',
  register_agent: '🤖',
  fund_escrow: '🔒',
};

export default function IntentDecomposer({ nodes, edges, walletAddress, onStepExecute }: Props) {
  const [input, setInput] = useState('');
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [result, setResult] = useState<DecomposedIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [executingStep, setExecutingStep] = useState<string | null>(null);

  const handleDecompose = async () => {
    if (!input.trim()) return;
    setIsDecomposing(true);
    setError(null);
    setResult(null);
    try {
      const decomposed = await decomposeIntent(input.trim(), nodes, edges);
      setResult(decomposed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Decomposition failed');
    } finally {
      setIsDecomposing(false);
    }
  };

  const handleExecuteStep = async (step: IntentStep) => {
    if (!onStepExecute || executingStep) return;
    setExecutingStep(step.id);
    try {
      const txHash = await onStepExecute(step);
      if (result && txHash) {
        setResult(prev => prev ? {
          ...prev,
          steps: prev.steps.map(s => s.id === step.id
            ? { ...s, status: 'done', txHash }
            : s
          )
        } : null);
      }
    } catch {
      setResult(prev => prev ? {
        ...prev,
        steps: prev.steps.map(s => s.id === step.id
          ? { ...s, status: 'failed' }
          : s
        )
      } : null);
    } finally {
      setExecutingStep(null);
    }
  };

  const approveStep = (stepId: string) => {
    setResult(prev => prev ? {
      ...prev,
      steps: prev.steps.map(s => s.id === stepId
        ? { ...s, status: 'approved' }
        : s
      )
    } : null);
  };

  const rejectStep = (stepId: string) => {
    setResult(prev => prev ? {
      ...prev,
      steps: prev.steps.map(s => s.id === stepId
        ? { ...s, status: 'rejected' }
        : s
      )
    } : null);
  };

  const riskColor = (score: number) =>
    score < 30 ? 'text-green-400' : score < 60 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
          <Zap size={14} className="text-violet-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-white tracking-tight">Intent Decomposer</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest">Claude-powered execution engine</p>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Describe your financial intent in plain English..."
          rows={3}
          className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white placeholder-slate-600 resize-none focus:outline-none focus:border-violet-500/30 transition-all font-mono leading-relaxed"
          onKeyDown={e => {
            if (e.key === 'Enter' && e.metaKey) handleDecompose();
          }}
        />

        {/* Examples */}
        <div className="space-y-1">
          <p className="text-[9px] text-slate-600 uppercase tracking-widest">Examples:</p>
          <div className="flex flex-col gap-1">
            {EXAMPLE_INTENTS.map((ex, i) => (
              <button
                key={i}
                onClick={() => setInput(ex)}
                className="text-left text-[9px] text-slate-500 hover:text-violet-400 transition-colors leading-relaxed"
              >
                <ChevronRight size={8} className="inline mr-1" />
                {ex}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleDecompose}
          disabled={isDecomposing || !input.trim()}
          className="w-full py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
        >
          {isDecomposing ? (
            <>
              <Loader size={12} className="animate-spin" />
              Decomposing with Claude...
            </>
          ) : (
            <>
              <Zap size={12} />
              Decompose Intent
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={12} className="text-red-400 shrink-0" />
          <p className="text-[10px] text-red-400">{error}</p>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 overflow-y-auto space-y-3 no-scrollbar"
          >
            {/* Summary */}
            <div className="p-3 rounded-xl bg-white/3 border border-white/5">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Summary</p>
              <p className="text-xs text-white leading-relaxed">{result.summary}</p>
              <div className="flex items-center gap-3 mt-2">
                <div>
                  <p className="text-[8px] text-slate-600 uppercase">Total Gas</p>
                  <p className="text-[10px] text-slate-300 font-mono">{result.totalEstimatedGas}</p>
                </div>
                <div>
                  <p className="text-[8px] text-slate-600 uppercase">Risk Score</p>
                  <p className={`text-[10px] font-bold font-mono ${riskColor(result.riskScore)}`}>
                    {result.riskScore}/100
                  </p>
                </div>
                <div>
                  <p className="text-[8px] text-slate-600 uppercase">Steps</p>
                  <p className="text-[10px] text-slate-300 font-mono">{result.steps.length}</p>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 space-y-1">
                {result.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <TriangleAlert size={10} className="text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-yellow-400">{w}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Steps */}
            <div className="space-y-2">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest">Execution Steps</p>
              {result.steps.map((step, idx) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-3 rounded-xl border transition-all ${
                    step.status === 'done' ? 'bg-green-500/5 border-green-500/20' :
                    step.status === 'failed' ? 'bg-red-500/5 border-red-500/20' :
                    step.status === 'rejected' ? 'bg-white/3 border-white/5 opacity-50' :
                    step.status === 'approved' ? 'bg-violet-500/5 border-violet-500/20' :
                    'bg-white/3 border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-sm leading-none mt-0.5">
                        {ACTION_ICONS[step.action] ?? '⚡'}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest">
                            Step {idx + 1}: {step.action.replace(/_/g, ' ')}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase border ${RISK_COLORS[step.riskLevel]}`}>
                            {step.riskLevel}
                          </span>
                        </div>
                        <p className="text-[10px] text-white leading-relaxed">{step.description}</p>

                        {/* Params */}
                        {Object.keys(step.params).length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {Object.entries(step.params).map(([k, v]) => (
                              <span key={k} className="px-1.5 py-0.5 rounded bg-black/40 text-[8px] font-mono text-slate-400">
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        )}

                        {step.estimatedGas && (
                          <p className="mt-1 text-[8px] text-slate-600">Gas: {step.estimatedGas}</p>
                        )}

                        {step.txHash && (
                          <a
                            href={`${ARC_EXPLORER}/tx/${step.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 flex items-center gap-1 text-[8px] text-green-400 hover:text-green-300"
                          >
                            <ExternalLink size={8} />
                            {step.txHash.slice(0, 18)}...
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {step.status === 'pending' && (
                        <>
                          <button
                            onClick={() => approveStep(step.id)}
                            className="p-1 rounded text-green-400 hover:bg-green-400/10 transition-all"
                            title="Approve step"
                          >
                            <CheckCircle size={12} />
                          </button>
                          <button
                            onClick={() => rejectStep(step.id)}
                            className="p-1 rounded text-red-400 hover:bg-red-400/10 transition-all"
                            title="Reject step"
                          >
                            <XCircle size={12} />
                          </button>
                        </>
                      )}
                      {step.status === 'approved' && walletAddress && (
                        <button
                          onClick={() => handleExecuteStep(step)}
                          disabled={executingStep === step.id}
                          className="p-1 rounded text-violet-400 hover:bg-violet-400/10 transition-all disabled:opacity-50"
                          title="Execute on Arc"
                        >
                          {executingStep === step.id
                            ? <Loader size={12} className="animate-spin" />
                            : <Play size={12} />
                          }
                        </button>
                      )}
                      {step.status === 'done' && <CheckCircle size={12} className="text-green-400" />}
                      {step.status === 'failed' && <XCircle size={12} className="text-red-400" />}
                      {step.status === 'rejected' && <XCircle size={12} className="text-slate-600" />}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {!walletAddress && (
              <p className="text-center text-[9px] text-slate-600 py-2">
                Connect wallet to execute steps on Arc Testnet
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

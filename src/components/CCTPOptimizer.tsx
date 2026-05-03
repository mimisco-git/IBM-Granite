import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, ArrowRight, Zap, Shield, Clock, Loader, Star, ChevronDown } from 'lucide-react';
import { CCTPRoute } from '../types';
import { analyzeCCTPRoutes } from '../services/claudeService';
import { CCTP_DOMAINS } from '../constants';

interface Props {
  walletAddress: string | null;
  onRouteSelected?: (route: CCTPRoute) => void;
}

const CHAIN_COLORS: Record<string, string> = {
  arc:       'from-indigo-500 to-violet-600',
  ethereum:  'from-blue-500 to-blue-700',
  base:      'from-blue-400 to-blue-600',
  avalanche: 'from-red-500 to-red-700',
  optimism:  'from-red-400 to-red-600',
  arbitrum:  'from-blue-500 to-cyan-600',
  polygon:   'from-purple-500 to-purple-700',
  solana:    'from-green-400 to-emerald-600',
};

const CHAIN_ICONS: Record<string, string> = {
  arc:       '⬡',
  ethereum:  'Ξ',
  base:      'B',
  avalanche: '▲',
  optimism:  'Ⓞ',
  arbitrum:  'Ⓐ',
  polygon:   '⬡',
  solana:    '◎',
};

export default function CCTPOptimizer({ walletAddress, onRouteSelected }: Props) {
  const [fromChain, setFromChain] = useState('arc');
  const [toChain, setToChain] = useState('base');
  const [amount, setAmount] = useState('100');
  const [asset, setAsset] = useState<'USDC' | 'EURC'>('USDC');
  const [routes, setRoutes] = useState<CCTPRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chains = Object.keys(CCTP_DOMAINS);

  const handleCalculate = async () => {
    if (fromChain === toChain) {
      setError('Source and destination chains must be different');
      return;
    }
    setIsCalculating(true);
    setError(null);
    setRoutes([]);
    setSelectedRoute(null);
    try {
      const result = await analyzeCCTPRoutes(fromChain, toChain, amount, asset);
      setRoutes(result.routes ?? []);
      setRecommendation(result.recommendation ?? '');
      const rec = result.routes?.find(r => r.recommended);
      if (rec) setSelectedRoute(rec.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Route calculation failed');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSelect = (route: CCTPRoute) => {
    setSelectedRoute(route.id);
    onRouteSelected?.(route);
  };

  const SecurityBar = ({ score }: { score: number }) => (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${score >= 80 ? 'bg-green-400' : score >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[8px] text-slate-500 font-mono">{score}</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center">
          <Globe size={14} className="text-cyan-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-white tracking-tight">CCTP Route Optimizer</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest">Circle Cross-Chain Transfer Protocol V2</p>
        </div>
      </div>

      {/* Config */}
      <div className="space-y-3 p-3 rounded-xl bg-white/3 border border-white/5">
        {/* From / To chains */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="text-[8px] text-slate-600 uppercase tracking-widest mb-1">From</p>
            <div className="relative">
              <select
                value={fromChain}
                onChange={e => setFromChain(e.target.value)}
                className="w-full appearance-none bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[10px] text-white focus:outline-none focus:border-cyan-500/30 pr-6"
              >
                {chains.map(c => (
                  <option key={c} value={c}>{CCTP_DOMAINS[c].name}</option>
                ))}
              </select>
              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
          <ArrowRight size={14} className="text-cyan-500 shrink-0 mt-4" />
          <div className="flex-1">
            <p className="text-[8px] text-slate-600 uppercase tracking-widest mb-1">To</p>
            <div className="relative">
              <select
                value={toChain}
                onChange={e => setToChain(e.target.value)}
                className="w-full appearance-none bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[10px] text-white focus:outline-none focus:border-cyan-500/30 pr-6"
              >
                {chains.map(c => (
                  <option key={c} value={c}>{CCTP_DOMAINS[c].name}</option>
                ))}
              </select>
              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Amount + Asset */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="text-[8px] text-slate-600 uppercase tracking-widest mb-1">Amount</p>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[10px] text-white font-mono focus:outline-none focus:border-cyan-500/30"
              placeholder="100"
            />
          </div>
          <div className="w-24">
            <p className="text-[8px] text-slate-600 uppercase tracking-widest mb-1">Asset</p>
            <div className="flex rounded-lg overflow-hidden border border-white/5">
              {(['USDC', 'EURC'] as const).map(a => (
                <button
                  key={a}
                  onClick={() => setAsset(a)}
                  className={`flex-1 py-2 text-[9px] font-bold transition-all ${asset === a ? 'bg-cyan-500 text-white' : 'bg-black/40 text-slate-500 hover:text-slate-300'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-white text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
        >
          {isCalculating ? (
            <><Loader size={12} className="animate-spin" />Calculating routes...</>
          ) : (
            <><Globe size={12} />Find Optimal Route</>
          )}
        </button>
      </div>

      {/* Chain flow visualization */}
      {(fromChain || toChain) && (
        <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-black/20">
          {[fromChain, toChain].map((chain, i) => (
            <React.Fragment key={chain}>
              {i > 0 && (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map(j => (
                      <motion.div
                        key={j}
                        className="w-1.5 h-1.5 rounded-full bg-cyan-500"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: j * 0.3 }}
                      />
                    ))}
                  </div>
                  <p className="text-[7px] text-slate-600">CCTP V2</p>
                </div>
              )}
              <div className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${CHAIN_COLORS[chain] ?? 'from-slate-600 to-slate-800'} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                  {CHAIN_ICONS[chain] ?? '?'}
                </div>
                <p className="text-[8px] text-slate-400 text-center">{CCTP_DOMAINS[chain]?.name?.split(' ')[0] ?? chain}</p>
                <p className="text-[7px] text-slate-600">Domain {CCTP_DOMAINS[chain]?.domain ?? '?'}</p>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-[10px] text-red-400">{error}</p>
        </div>
      )}

      {/* Routes */}
      <AnimatePresence>
        {routes.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
            {recommendation && (
              <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Claude Recommendation</p>
                <p className="text-[10px] text-cyan-300 leading-relaxed">{recommendation}</p>
              </div>
            )}

            <div className="space-y-2">
              {routes.map((route, i) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleSelect(route)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedRoute === route.id
                      ? 'bg-cyan-500/10 border-cyan-500/40'
                      : 'bg-white/3 border-white/5 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      {route.recommended && (
                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                      )}
                      <p className="text-[10px] font-bold text-white">
                        {route.hops.join(' › ')}
                      </p>
                    </div>
                    <p className="text-[9px] font-bold text-cyan-400 font-mono">{route.feeUsd}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1">
                        <Clock size={8} className="text-slate-600" />
                        <p className="text-[8px] text-slate-600">Time</p>
                      </div>
                      <p className="text-[9px] text-slate-300">{route.estimatedTime}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <Zap size={8} className="text-slate-600" />
                        <p className="text-[8px] text-slate-600">Gas</p>
                      </div>
                      <p className="text-[9px] text-slate-300 font-mono">{route.estimatedFee}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <Shield size={8} className="text-slate-600" />
                        <p className="text-[8px] text-slate-600">Security</p>
                      </div>
                      <SecurityBar score={route.securityScore} />
                    </div>
                  </div>

                  <p className="text-[8px] text-slate-500 leading-relaxed">{route.notes}</p>
                </motion.div>
              ))}
            </div>

            {selectedRoute && walletAddress && (
              <button
                onClick={() => {
                  const r = routes.find(r => r.id === selectedRoute);
                  if (r) onRouteSelected?.(r);
                }}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                Execute via Selected Route
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

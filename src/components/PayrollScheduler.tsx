import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Plus, Play, Pause, Trash2, CheckCircle, AlertTriangle, ChevronDown, User } from 'lucide-react';
import { PayrollEntry } from '../types';
import { ARC_EXPLORER } from '../constants';

interface Props {
  walletAddress: string | null;
  onExecutePayroll?: (entry: PayrollEntry) => Promise<string>;
}

const FREQUENCY_MS: Record<string, number> = {
  hourly:  60 * 60 * 1000,
  daily:   24 * 60 * 60 * 1000,
  weekly:  7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
};

const FREQUENCY_LABEL: Record<string, string> = {
  hourly: 'Every hour',
  daily: 'Every day',
  weekly: 'Every week',
  monthly: 'Every month',
};

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Due now';
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ${hrs % 24}h`;
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  if (mins > 0) return `${mins}m ${secs % 60}s`;
  return `${secs}s`;
}

const STORAGE_KEY = 'arcana_payroll_v1';

function loadPayroll(): PayrollEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePayroll(entries: PayrollEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function PayrollScheduler({ walletAddress, onExecutePayroll }: Props) {
  const [entries, setEntries] = useState<PayrollEntry[]>(loadPayroll);
  const [showForm, setShowForm] = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // Form state
  const [form, setForm] = useState({
    name: '',
    recipientAddress: '',
    recipientLabel: '',
    amount: '',
    asset: 'USDC' as 'USDC' | 'EURC',
    chain: 'arc',
    frequency: 'daily' as PayrollEntry['frequency'],
  });

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Save on change
  useEffect(() => {
    savePayroll(entries);
  }, [entries]);

  const handleAdd = () => {
    if (!form.name || !form.recipientAddress || !form.amount) return;
    const entry: PayrollEntry = {
      id: `pay_${Date.now()}`,
      name: form.name,
      recipientAddress: form.recipientAddress,
      recipientLabel: form.recipientLabel || `${form.recipientAddress.slice(0, 6)}...${form.recipientAddress.slice(-4)}`,
      amount: form.amount,
      asset: form.asset,
      chain: form.chain,
      frequency: form.frequency,
      nextExecution: Date.now() + FREQUENCY_MS[form.frequency],
      status: 'active',
      executionCount: 0,
      totalPaid: '0',
    };
    setEntries(prev => [...prev, entry]);
    setShowForm(false);
    setForm({ name: '', recipientAddress: '', recipientLabel: '', amount: '', asset: 'USDC', chain: 'arc', frequency: 'daily' });
  };

  const handleToggle = useCallback((id: string) => {
    setEntries(prev => prev.map(e => e.id === id
      ? { ...e, status: e.status === 'active' ? 'paused' : 'active' }
      : e
    ));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const handleExecuteNow = useCallback(async (entry: PayrollEntry) => {
    if (!walletAddress || !onExecutePayroll || executing) return;
    setExecuting(entry.id);
    try {
      const txHash = await onExecutePayroll(entry);
      setEntries(prev => prev.map(e => e.id === entry.id ? {
        ...e,
        lastExecution: Date.now(),
        lastTxHash: txHash,
        nextExecution: Date.now() + FREQUENCY_MS[e.frequency],
        executionCount: e.executionCount + 1,
        totalPaid: (parseFloat(e.totalPaid) + parseFloat(e.amount)).toFixed(6),
      } : e));
    } catch { /* user likely rejected */ }
    finally { setExecuting(null); }
  }, [walletAddress, onExecutePayroll, executing]);

  const totalMonthlyUsdc = entries
    .filter(e => e.status === 'active' && e.asset === 'USDC')
    .reduce((sum, e) => {
      const periodsPerMonth = FREQUENCY_MS.monthly / FREQUENCY_MS[e.frequency];
      return sum + parseFloat(e.amount) * periodsPerMonth;
    }, 0);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Clock size={14} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white tracking-tight">Payroll Scheduler</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">Agentic USDC disbursements</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-all"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Active', value: entries.filter(e => e.status === 'active').length.toString() },
          { label: 'Monthly Est.', value: `$${totalMonthlyUsdc.toFixed(0)}` },
          { label: 'Total Paid', value: `$${entries.reduce((s, e) => s + parseFloat(e.totalPaid || '0'), 0).toFixed(2)}` },
        ].map(stat => (
          <div key={stat.label} className="p-2 rounded-xl bg-white/3 border border-white/5 text-center">
            <p className="text-[8px] text-slate-600 uppercase tracking-widest">{stat.label}</p>
            <p className="text-xs font-bold text-white tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
              <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">New Payroll Entry</p>

              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Schedule name (e.g. FX Agent Daily)"
                className="w-full bg-black/40 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-emerald-500/30"
              />
              <input
                value={form.recipientAddress}
                onChange={e => setForm(f => ({ ...f, recipientAddress: e.target.value }))}
                placeholder="Recipient address (0x...)"
                className="w-full bg-black/40 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-mono focus:outline-none focus:border-emerald-500/30"
              />
              <input
                value={form.recipientLabel}
                onChange={e => setForm(f => ({ ...f, recipientLabel: e.target.value }))}
                placeholder="Label (optional, e.g. 'Compute Agent #1')"
                className="w-full bg-black/40 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-emerald-500/30"
              />

              <div className="flex gap-2">
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="Amount"
                  className="flex-1 bg-black/40 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-mono focus:outline-none focus:border-emerald-500/30"
                />
                <div className="flex rounded-lg overflow-hidden border border-white/5">
                  {(['USDC', 'EURC'] as const).map(a => (
                    <button
                      key={a}
                      onClick={() => setForm(f => ({ ...f, asset: a }))}
                      className={`px-2 py-1.5 text-[9px] font-bold transition-all ${form.asset === a ? 'bg-emerald-500 text-white' : 'bg-black/40 text-slate-500'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <select
                  value={form.frequency}
                  onChange={e => setForm(f => ({ ...f, frequency: e.target.value as PayrollEntry['frequency'] }))}
                  className="w-full appearance-none bg-black/40 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-emerald-500/30 pr-6"
                >
                  {Object.keys(FREQUENCY_LABEL).map(f => (
                    <option key={f} value={f}>{FREQUENCY_LABEL[f]}</option>
                  ))}
                </select>
                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-[9px] font-bold uppercase tracking-widest transition-all"
                >
                  Add Schedule
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 text-[9px] font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
        {entries.length === 0 && (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
            <Clock size={24} className="text-slate-700" />
            <div>
              <p className="text-xs text-slate-500">No payroll schedules</p>
              <p className="text-[9px] text-slate-700 mt-1">Add a schedule to automate USDC disbursements to agents</p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {entries.map(entry => {
            const timeUntil = entry.nextExecution - now;
            const isDue = timeUntil <= 0;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`p-3 rounded-xl border transition-all ${
                  isDue && entry.status === 'active'
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : entry.status === 'paused'
                    ? 'bg-white/2 border-white/5 opacity-60'
                    : 'bg-white/3 border-white/5'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <User size={10} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white">{entry.name}</p>
                      <p className="text-[8px] text-slate-500 font-mono">{entry.recipientLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggle(entry.id)}
                      className="p-1 rounded text-slate-500 hover:text-white transition-all"
                    >
                      {entry.status === 'active' ? <Pause size={10} /> : <Play size={10} />}
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1 rounded text-slate-600 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-baseline gap-1">
                    <p className="text-sm font-bold text-white tabular-nums">{entry.amount}</p>
                    <p className="text-[9px] text-slate-400">{entry.asset}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-slate-600 uppercase">{FREQUENCY_LABEL[entry.frequency]}</p>
                    <p className={`text-[9px] font-mono font-bold ${isDue && entry.status === 'active' ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {entry.status === 'paused' ? 'Paused' : isDue ? 'Due now!' : formatCountdown(timeUntil)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] text-slate-600">
                      {entry.executionCount} executions • ${entry.totalPaid} total
                    </span>
                    {entry.lastTxHash && (
                      <a
                        href={`${ARC_EXPLORER}/tx/${entry.lastTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[8px] text-cyan-500 hover:text-cyan-300"
                      >
                        Last tx
                      </a>
                    )}
                  </div>

                  {(isDue || true) && entry.status === 'active' && walletAddress && (
                    <button
                      onClick={() => handleExecuteNow(entry)}
                      disabled={executing === entry.id}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[8px] font-bold uppercase transition-all disabled:opacity-50"
                    >
                      {executing === entry.id ? (
                        <span className="animate-pulse">Executing...</span>
                      ) : (
                        <><Play size={8} />Execute</>
                      )}
                    </button>
                  )}
                </div>

                {isDue && entry.status === 'active' && (
                  <div className="mt-2 flex items-center gap-1.5 p-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <AlertTriangle size={8} className="text-emerald-400 shrink-0" />
                    <p className="text-[8px] text-emerald-400">Payment due. Approve in MetaMask to execute.</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

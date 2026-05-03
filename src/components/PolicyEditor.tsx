import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code, Shield, Loader, AlertTriangle, CheckCircle, ChevronDown, Sparkles } from 'lucide-react';
import { PolicyValidation } from '../types';
import { validatePolicy } from '../services/claudeService';
import { POLICY_TEMPLATES } from '../constants';

interface Props {
  initialPolicy?: string;
  agentType?: string;
  onPolicySave?: (policy: string) => void;
}

const RISK_CONFIG = {
  safe:     { color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20', label: 'Safe' },
  moderate: { color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', label: 'Moderate Risk' },
  risky:    { color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20', label: 'Risky' },
  critical: { color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', label: 'Critical Risk' },
};

// Minimal syntax highlighter for the policy DSL
function highlight(code: string): string {
  return code
    .replace(/\b(const|let|var|function|if|else|return|true|false|null|undefined|for|while|break|continue|async|await)\b/g,
      '<span style="color:#c792ea">$1</span>')
    .replace(/\b(\d+(\.\d+)?)\b/g, '<span style="color:#f78c6c">$1</span>')
    .replace(/(".*?"|'.*?'|`.*?`)/g, '<span style="color:#c3e88d">$1</span>')
    .replace(/(\/\/.*)/g, '<span style="color:#546e7a;font-style:italic">$1</span>');
}

export default function PolicyEditor({ initialPolicy, agentType = 'custom', onPolicySave }: Props) {
  const [policy, setPolicy] = useState(initialPolicy || POLICY_TEMPLATES.balanced);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('balanced');
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<PolicyValidation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [savedPolicy, setSavedPolicy] = useState<string | null>(null);

  const handleTemplateSelect = (key: string) => {
    setSelectedTemplate(key);
    setPolicy(POLICY_TEMPLATES[key as keyof typeof POLICY_TEMPLATES] ?? policy);
    setValidation(null);
  };

  const handleValidate = useCallback(async () => {
    if (!policy.trim()) return;
    setIsValidating(true);
    setError(null);
    setValidation(null);
    try {
      const result = await validatePolicy(policy, agentType);
      setValidation(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  }, [policy, agentType]);

  const handleSave = () => {
    setSavedPolicy(policy);
    onPolicySave?.(policy);
  };

  const riskBar = (score: number) => {
    const color = score < 30 ? '#4ade80' : score < 60 ? '#facc15' : score < 80 ? '#fb923c' : '#f87171';
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${score}%`, background: color }}
          />
        </div>
        <span className="text-[10px] font-bold font-mono" style={{ color }}>{score}/100</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Code size={14} className="text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white tracking-tight">Policy Editor</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">Agentic DSL with Claude Validation</p>
          </div>
        </div>
        <button
          onClick={() => setShowPreview(s => !s)}
          className="text-[8px] text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-all"
        >
          {showPreview ? 'Editor' : 'Preview'}
        </button>
      </div>

      {/* Template Selector */}
      <div className="flex gap-1.5">
        {Object.keys(POLICY_TEMPLATES).map(key => (
          <button
            key={key}
            onClick={() => handleTemplateSelect(key)}
            className={`flex-1 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all ${
              selectedTemplate === key
                ? 'bg-amber-500 text-white'
                : 'bg-white/5 text-slate-500 hover:text-slate-300'
            }`}
          >
            {key}
          </button>
        ))}
        <button
          onClick={() => { setSelectedTemplate('custom'); setValidation(null); }}
          className={`flex-1 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all ${
            selectedTemplate === 'custom'
              ? 'bg-amber-500 text-white'
              : 'bg-white/5 text-slate-500 hover:text-slate-300'
          }`}
        >
          Custom
        </button>
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 relative min-h-0">
        {showPreview ? (
          <div
            className="h-full rounded-xl bg-[#0d1117] border border-white/5 p-3 overflow-y-auto no-scrollbar font-mono text-[10px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlight(policy) }}
          />
        ) : (
          <textarea
            value={policy}
            onChange={e => { setPolicy(e.target.value); setValidation(null); setSelectedTemplate('custom'); }}
            className="w-full h-full bg-[#0d1117] border border-white/5 rounded-xl p-3 font-mono text-[10px] text-slate-300 resize-none focus:outline-none focus:border-amber-500/30 transition-all leading-relaxed no-scrollbar"
            spellCheck={false}
          />
        )}

        {/* Line count badge */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[7px] text-slate-600 font-mono pointer-events-none">
          {policy.split('\n').length}L
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleValidate}
          disabled={isValidating || !policy.trim()}
          className="flex-1 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 disabled:opacity-40 text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
        >
          {isValidating ? <Loader size={11} className="animate-spin" /> : <Sparkles size={11} />}
          {isValidating ? 'Validating...' : 'Validate with Claude'}
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-[9px] font-bold uppercase tracking-widest transition-all"
        >
          Save
        </button>
      </div>

      {savedPolicy === policy && !validation && (
        <div className="flex items-center gap-1.5 text-[9px] text-green-400">
          <CheckCircle size={10} />
          Policy saved
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-[9px] text-red-400">{error}</p>
        </div>
      )}

      {/* Validation Result */}
      <AnimatePresence>
        {validation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl border space-y-2.5 ${RISK_CONFIG[validation.riskLabel].bg}`}
          >
            {/* Risk Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {validation.isValid
                  ? <CheckCircle size={12} className="text-green-400" />
                  : <AlertTriangle size={12} className="text-red-400" />
                }
                <span className={`text-[10px] font-bold ${RISK_CONFIG[validation.riskLabel].color}`}>
                  {RISK_CONFIG[validation.riskLabel].label}
                </span>
              </div>
              <Shield size={12} className={RISK_CONFIG[validation.riskLabel].color} />
            </div>

            {/* Risk Bar */}
            {riskBar(validation.riskScore)}

            {/* Explanation */}
            <p className="text-[9px] text-slate-300 leading-relaxed">{validation.explanation}</p>

            {/* Issues */}
            {validation.issues.length > 0 && (
              <div className="space-y-1">
                <p className="text-[8px] text-slate-600 uppercase tracking-widest">Issues</p>
                {validation.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <AlertTriangle size={8} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-red-300">{issue}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {validation.suggestions.length > 0 && (
              <div className="space-y-1">
                <p className="text-[8px] text-slate-600 uppercase tracking-widest">Suggestions</p>
                {validation.suggestions.map((sug, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 text-[8px] shrink-0">+</span>
                    <p className="text-[9px] text-emerald-300">{sug}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!validation.isValid}
              className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-40 text-[9px] text-white font-bold uppercase tracking-widest transition-all"
            >
              {validation.isValid ? 'Apply Validated Policy' : 'Fix Issues First'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

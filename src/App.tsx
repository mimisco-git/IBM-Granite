/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Workflow, 
  Database, 
  MessageSquare, 
  Settings, 
  Search, 
  Bell, 
  ChevronRight, 
  ChevronLeft,
  Code2, 
  Cpu, 
  TrendingUp, 
  ShieldCheck, 
  Shield,
  AlertCircle,
  Menu,
  X,
  Plus,
  FlaskConical,
  FileCode2,
  Terminal as TerminalIcon,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Moon,
  Sun,
  History,
  Coins,
  ArrowUpRight,
  BarChart3,
  Globe,
  Activity,
  User,
  Clock,
  Lock,
  Eye,
  FileText,
  PieChart,
  Globe2,
  Fingerprint,
  RefreshCw,
  Download,
  Maximize2,
  ArrowDown,
  ChevronDown,
  Info,
  Terminal,
  BookOpen,
  Microscope,
  Layers,
  HardDrive,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis 
} from 'recharts';
import { cn } from './lib/utils';

import { GoogleGenAI } from "@google/genai";

// Initialize Gemini SDK safely - prevents blank page when GEMINI_API_KEY is not set
let AI_CLIENT: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    AI_CLIENT = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (e) {
  console.error('Failed to initialize AI client:', e);
}
const MODEL_ID = "gemini-2.0-flash";

// ─── IBM BOB INTEGRATION POINT ────────────────────────────────────────────────
// On May 15, replace the AI_CLIENT initialization and MODEL_ID above with your
// IBM Bob credentials. All 4 features below will work automatically.
// ─────────────────────────────────────────────────────────────────────────────
const AI_SYSTEM_PROMPTS = {
  codeExplainer: `You are IBM Bob, an expert AI development partner with full repository context.
When given code, explain it clearly using these sections:
**What it does** - a plain-English summary
**How it works** - step-by-step logic breakdown
**Key dependencies** - what it relies on
**Potential issues** - bugs, security risks, or anti-patterns
**Modernization advice** - how to improve it
Be technical, precise, and concise.`,

  docGenerator: `You are IBM Bob. Generate professional markdown documentation for the provided code.
Structure your response as:
## Overview
(concise description of what this module does)
## Parameters / Inputs
(list params with types and descriptions)
## Return Value
(what it returns)
## Usage Example
(a realistic code example)
## Legacy Concerns
(any technical debt, deprecated patterns, or risks)
Return clean markdown only. No extra commentary outside the structure.`,

  testGenerator: `You are IBM Bob. Generate a complete, runnable unit test suite in TypeScript using Vitest.
Use: describe(), it(), expect(), beforeEach() where appropriate.
Cover: happy path, edge cases, error handling, null inputs, and boundary values.
Add a one-line comment above each test explaining what it validates.
Return only executable TypeScript code. Start with the imports.`,

  decomposer: `You are IBM Bob, the Logic Modernization Engine.
Convert the provided legacy code (Java/COBOL/C/SQL/PL/SQL) into clean, modern TypeScript.
Requirements:
- Strict TypeScript types everywhere
- Functional, pure functions where possible
- No mutation of shared state
- Clear, descriptive naming
- Microservice-compatible structure
- Add inline comments marking key transformations from the original
Return ONLY the modernized TypeScript code, no explanations before or after.`,

  reasoning: `You are IBM Bob, an AI-powered development partner with full repository context.
You specialize in enterprise software modernization and legacy code analysis.
Help developers understand complex codebases, plan modernization strategies, and make sound architectural decisions.
When code is pasted, analyze it deeply. When questions are asked, be precise and practical.
Format long responses with markdown headers for clarity.`
};

// Types
type Section = 'dashboard' | 'agents' | 'logic-graph' | 'logic-lab' | 'compliance' | 'finance' | 'audit' | 'chat' | 'security' | 'settings' | 'infrastructure' | 'explorer';

interface Insight {
  id: string;
  type: 'security' | 'logic' | 'performance';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

const INSIGHTS: Insight[] = [
  { id: '1', type: 'logic', message: 'Inconsistent pricing logic detected in legacy billing module.', severity: 'high', timestamp: '2m ago' },
  { id: '2', type: 'security', message: 'Deprecated encryption pattern found in CoreAuth.java', severity: 'medium', timestamp: '15m ago' },
  { id: '3', type: 'performance', message: 'Recursive loop in InventorySync potential bottleneck.', severity: 'low', timestamp: '1h ago' },
];

const NEURAL_VELOCITY_DATA = [
  { name: '00:00', value: 42 },
  { name: '04:00', value: 58 },
  { name: '08:00', value: 89 },
  { name: '12:00', value: 64 },
  { name: '16:00', value: 92 },
  { name: '20:00', value: 78 },
  { name: '23:59', value: 85 },
];

const LEGACY_QUALITY_DATA = [
  { subject: 'Readability', A: 45, fullMark: 100 },
  { subject: 'Modularity', A: 32, fullMark: 100 },
  { subject: 'Test Coverage', A: 12, fullMark: 100 },
  { subject: 'Semantic Debt', A: 88, fullMark: 100 },
  { subject: 'Redundancy', A: 76, fullMark: 100 },
];

function HandshakeSequence({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 1200);
          return 100;
        }
        return p + 0.8;
      });
    }, 20);

    const stepTimers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 1600),
      setTimeout(() => setStep(3), 2400),
      setTimeout(() => setStep(4), 3200),
    ];

    return () => {
      clearInterval(timer);
      stepTimers.forEach(clearTimeout);
    };
  }, [onComplete]);

  const steps = [
    "Establishing Neural Uplink",
    "Synchronizing Semantic Matrices",
    "Decrypting Monolithic Vectors",
    "Initializing Granite 3.0 Core",
    "Handshake Confirmed"
  ];

  return (
    <div className="fixed inset-0 bg-[#020617] z-[100] flex flex-col items-center justify-center p-8 overflow-hidden select-none">
      <div className="absolute inset-0 neural-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
      
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="mb-20 relative"
        >
          <div className="absolute -inset-20 bg-[#0f62fe]/10 blur-[120px] rounded-full animate-pulse-slow" />
          <div className="h-24 w-24 border border-white/10 p-5 rounded-sm bg-white/5 backdrop-blur-3xl shadow-2xl flex items-center justify-center group relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-[#0f62fe]/20 to-transparent" />
             <Cpu size={48} className="text-[#0f62fe] animate-pulse" />
          </div>
        </motion.div>

        <div className="space-y-12 w-full max-w-md">
           <AnimatePresence mode="wait">
             <motion.div
               key={step}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="h-8"
             >
               <span className="text-[10px] font-black uppercase text-[#0f62fe] tracking-[0.5em] italic">
                 {steps[step]}
               </span>
             </motion.div>
           </AnimatePresence>

           <div className="space-y-4">
             <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  className="h-full bg-[#0f62fe] shadow-[0_0_15px_#0f62fe]" 
                  style={{ width: `${progress}%` }}
                />
             </div>
             <div className="flex justify-between items-center text-[10px] font-black text-white/20 uppercase tracking-[0.3em] font-mono italic">
                <span>IBM_CORE_SYNC</span>
                <span>{progress.toFixed(1)}%</span>
             </div>
           </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: progress > 90 ? 1 : 0 }}
          className="mt-24 space-y-2"
        >
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mix-blend-difference leading-none">
            Granite <span className="text-[#0f62fe]">Orchestrator</span>
          </h2>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] italic">Neural Logic Modernization Platform</p>
        </motion.div>
      </div>

      <div className="absolute bottom-12 left-12 p-4 border border-white/5 bg-black/40 backdrop-blur-xl rounded-sm">
         <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse lg:shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest font-mono">Secure Terminal Node Alpha-9</span>
         </div>
      </div>
    </div>
  );
}

function NeuralLogo({ active = false }: { active?: boolean }) {
  return (
    <div className="relative h-12 w-12 shrink-0 group">
      {/* Outer Rotating Lattice */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-[0.5px] border-[#0f62fe]/20 rounded-full"
      >
        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-1 w-1 bg-[#0f62fe] rounded-full blur-[1px]" />
      </motion.div>
      
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-2 border-[0.5px] border-white/10 rounded-full"
      />
      
      {/* Glassmorphic Core Container */}
      <div className="absolute inset-[3px] flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl rounded-sm border border-white/10 shadow-2xl overflow-hidden group-hover:border-[#0f62fe]/40 transition-all duration-700">
        {/* Dynamic Light Background */}
        <div className="absolute inset-0 bg-[#0f62fe]/5 opacity-30" />
        
        {/* Central Complex SVG Logo */}
        <div className="relative z-10 p-2">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none" xmlns="http://www.w3.org/2000/svg">
            <motion.path 
              d="M12 3L4 12L12 21L20 12L12 3Z" 
              stroke="currentColor" 
              strokeWidth="1.5"
              className={cn(
                "transition-all duration-700",
                active ? "text-[#0f62fe]" : "text-white/60 group-hover:text-white"
              )}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2 }}
            />
            <path 
              d="M12 7L8 12L12 17L16 12L12 7Z" 
              className={cn(
                "transition-all duration-700",
                active ? "fill-[#0f62fe]/40" : "fill-white/10 group-hover:fill-white/20"
              )} 
            />
            {active && (
              <motion.circle 
                cx="12" cy="12" r="2" 
                fill="#0f62fe"
                animate={{ r: [2, 3, 2], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
          </svg>
        </div>
        
        {/* Scanning Line */}
        <motion.div 
          animate={{ translateY: [-60, 60] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
          className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#0f62fe]/60 to-transparent shadow-[0_0_15px_#0f62fe]"
        />
      </div>

      {/* Static Connection Points */}
      {[0, 120, 240].map((angle) => (
        <div 
          key={angle}
          className="absolute w-[2px] h-[2px] bg-[#0f62fe]/60 rounded-full"
          style={{
            top: '50%',
            left: '50%',
            transform: `rotate(${angle}deg) translate(28px, 0)`,
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { theme, toggleTheme } = useTheme();

  const addToast = (message: string, type: 'info' | 'alert' | 'success' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9).toUpperCase();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Periodic random alerts
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      const chance = Math.random();
      if (chance < 0.2) {
        const alerts = [
          { m: "Logic Leak detected in IBM-US-WEST cluster. Quarantine protocol active.", t: 'alert' as const },
          { m: "Neural Sync high throughput achieved: 2.4PB/s burst.", t: 'success' as const },
          { m: "Predictive analyzer indexing legacy module 'VaultPro.bin'.", t: 'info' as const }
        ];
        const random = alerts[Math.floor(Math.random() * alerts.length)];
        addToast(random.m, random.t);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (isLoading) return <HandshakeSequence onComplete={() => setIsLoading(false)} />;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)] selection:bg-[#0f62fe]/30 selection:text-white">
      <div className="scanline" />
      
      {/* Command Palette Overlay */}
      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)} 
        onSelectAction={(sec) => setActiveSection(sec)}
      />

      {/* Toast Alert System */}
      <ToastSystem toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      
      {/* Sidebar Navigation */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="relative z-50 flex flex-col border-r border-[var(--border)] bg-[var(--secondary)] shadow-2xl transition-all duration-500"
      >
        <div className="flex h-[80px] items-center px-5 border-b border-[var(--border)] bg-black/5 backdrop-blur-sm">
          <div className="flex items-center gap-4 overflow-hidden">
            <NeuralLogo active={activeSection === 'chat' || activeSection === 'logic-lab'} />
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col -space-y-1"
              >
                <span className="text-2xl font-black tracking-tighter text-[var(--foreground)] uppercase italic leading-none">Granite</span>
                <span className="text-[10px] font-black text-[#0f62fe] tracking-[0.4em] uppercase leading-none mt-1.5 ml-0.5 opacity-70">Neural v4.2</span>
              </motion.div>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4 mt-6 overflow-y-auto custom-scrollbar">
          <SectionLabel label="Command Center" isSidebarOpen={isSidebarOpen} />
          <NavItem 
            icon={<LayoutDashboard size={18} />} 
            label="Neural Dashboard" 
            active={activeSection === 'dashboard'} 
            onClick={() => setActiveSection('dashboard')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Workflow size={18} />} 
            label="Logic Orchestrator" 
            active={activeSection === 'agents'} 
            onClick={() => setActiveSection('agents')} 
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Globe size={18} />} 
            label="Global Cluster" 
            active={activeSection === 'infrastructure'} 
            onClick={() => setActiveSection('infrastructure')} 
            collapsed={!isSidebarOpen}
          />

          <SectionLabel label="Intelligence Lab" isSidebarOpen={isSidebarOpen} className="mt-8" />
          <NavItem 
            icon={<FileCode2 size={18} />} 
            label="Legacy Explorer" 
            active={activeSection === 'explorer'} 
            onClick={() => setActiveSection('explorer')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<MessageSquare size={18} />} 
            label="Reasoning Console" 
            active={activeSection === 'chat'} 
            onClick={() => setActiveSection('chat')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<FlaskConical size={18} />} 
            label="Module Decomposer" 
            active={activeSection === 'logic-lab'} 
            onClick={() => setActiveSection('logic-lab')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Database size={18} />} 
            label="Knowledge Lattice" 
            active={activeSection === 'logic-graph'} 
            onClick={() => setActiveSection('logic-graph')}
            collapsed={!isSidebarOpen}
          />

          <SectionLabel label="Risk & Yield" isSidebarOpen={isSidebarOpen} className="mt-8" />
          <NavItem 
            icon={<ShieldCheck size={18} />} 
            label="Compliance Matrix" 
            active={activeSection === 'compliance'} 
            onClick={() => setActiveSection('compliance')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<ShieldAlert size={18} />} 
            label="Security Audit" 
            active={activeSection === 'security'} 
            onClick={() => setActiveSection('security')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<TrendingUp size={18} />} 
            label="Financial Delta" 
            active={activeSection === 'finance'} 
            onClick={() => setActiveSection('finance')}
            collapsed={!isSidebarOpen}
          />
        </nav>

        <div className="p-4 border-t border-[var(--border)] bg-black/5 space-y-2">
          <NavItem 
            icon={theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} 
            label={theme === 'dark' ? "Daylight Mode" : "Darkness Mode"} 
            active={false} 
            onClick={toggleTheme}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Settings size={18} />} 
            label="Core Config" 
            active={activeSection === 'settings'} 
            onClick={() => setActiveSection('settings')}
            collapsed={!isSidebarOpen}
          />
          <div className="h-[1px] bg-[var(--foreground)]/5 my-2" />
          <button 
            onClick={() => setIsFeedbackModalOpen(true)}
            className={cn(
              "flex w-full items-center gap-3 p-3 hover:bg-[var(--secondary)] rounded-sm transition-all text-[var(--muted-foreground)] hover:text-[#0f62fe] group overflow-hidden whitespace-nowrap",
              !isSidebarOpen && "justify-center px-0"
            )}
          >
            <History size={18} className="shrink-0" />
            {isSidebarOpen && <span className="text-[11px] font-black uppercase tracking-widest italic">User Feedback</span>}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex w-full items-center justify-center p-3 hover:bg-[var(--secondary)] rounded-sm transition-all text-[var(--muted-foreground)] hover:text-[#0f62fe] group"
          >
            <ChevronRight size={18} className={cn("transition-transform duration-500", !isSidebarOpen && "rotate-180")} />
          </button>
        </div>
      </motion.aside>

      {/* Feedback Modal */}
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-[var(--background)]">
        {/* Top Header Bar */}
        <header className="h-[80px] border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-2xl flex items-center justify-between px-10 shrink-0 z-40">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-40"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Neural Link: Stable</span>
            </div>
            
            <div className="h-4 w-[1px] bg-[var(--border)]" />
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0f62fe]">Latency:</span>
              <span className="text-[10px] font-mono text-[var(--foreground)] opacity-60">12ms (Direct-Connect)</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="relative group hidden lg:block">
              <input 
                type="text" 
                placeholder="Query semantic index..." 
                className="bg-[var(--secondary)] border border-[var(--border)] rounded-sm px-10 py-3 text-[11px] font-bold text-[var(--foreground)] focus:ring-1 focus:ring-[#0f62fe] outline-none w-72 transition-all focus:w-96 placeholder:opacity-20"
              />
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            </div>

            <div className="flex items-center gap-6">
              <button className="p-2.5 hover:bg-[var(--secondary)] rounded-sm transition-all text-[var(--muted-foreground)] relative group border border-transparent hover:border-[var(--border)]">
                <Bell size={18} />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-[#0f62fe] rounded-full border-2 border-[var(--card)]" />
              </button>
              
              <div className="h-10 w-[1px] bg-[var(--border)]" />
              
              <div className="flex items-center gap-4 group cursor-pointer pl-2">
                <div className="text-right">
                  <p className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-tighter leading-none transition-colors group-hover:text-[#0f62fe]">M. Scott</p>
                  <p className="text-[9px] font-black text-[#0f62fe] uppercase tracking-[0.2em] mt-1.5 opacity-60">Admin Access</p>
                </div>
                <div className="h-10 w-10 rounded-sm bg-gradient-to-br from-[var(--secondary)] to-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[11px] font-black group-hover:border-[#0f62fe]/50 transition-all text-[var(--foreground)]">
                  JD
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* View Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-12 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="max-w-[1600px] mx-auto"
            >
              {activeSection === 'dashboard' && <DashboardView />}
              {activeSection === 'agents' && <OrchestratorView />}
              {activeSection === 'infrastructure' && <InfrastructureView />}
              {activeSection === 'explorer' && <ExplorerView onDecompose={() => setActiveSection('logic-lab')} />}
              {activeSection === 'chat' && <ChatView />}
              {activeSection === 'logic-graph' && <LogicGraphView setActiveSection={setActiveSection} />}
              {activeSection === 'logic-lab' && <LogicLabView />}
              {activeSection === 'compliance' && <ComplianceView />}
              {activeSection === 'security' && <SecurityView />}
              {activeSection === 'finance' && <FinanceView />}
              {activeSection === 'audit' && <AuditTrailView />}
              {activeSection === 'settings' && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SectionLabel({ label, isSidebarOpen, className }: { label: string; isSidebarOpen: boolean; className?: string }) {
  if (!isSidebarOpen) return null;
  return (
    <p className={cn("text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-3 mb-3", className)}>
      {label}
    </p>
  );
}

function ChatView() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; timestamp: string }[]>([
    { role: 'assistant', content: 'Neural Console established. I am Bob, your Chief Neural Architect. All legacy modules indexed. Ready for reasoning operations.', timestamp: '10:45:01' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    if (!process.env.GEMINI_API_KEY) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "CRITICAL: GEMINI_API_KEY not detected. Please configure environment variables.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      }]);
      return;
    }

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const userMessage = { role: 'user' as const, content: input, timestamp: now };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      const response = await AI_CLIENT!.models.generateContent({
        model: MODEL_ID,
        contents: [
          ...messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction: AI_SYSTEM_PROMPTS.reasoning,
          temperature: 0.7,
        }
      });

      const text = response.text;

      const respTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: text || "Reasoning engine encountered a null output context. Re-establishing link...",
        timestamp: respTime
      }]);
    } catch (error) {
      console.error("AI reasoning failure:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "ERROR: Neural link disrupted. Please verify uplink (API Key).",
        timestamp: now
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-[calc(100vh-160px)] gap-10"
    >
      {/* Main Console Area */}
      <div className="flex-1 flex flex-col enterprise-card overflow-hidden bg-[var(--card)] border border-[var(--border)] shadow-3xl rounded-sm">
        <div className="p-10 border-b border-[var(--border)] bg-[var(--secondary)] flex items-center justify-between shrink-0 relative z-20">
          <div className="flex items-center gap-8">
            <div className="h-16 w-16 bg-[#0f62fe] rounded-sm flex items-center justify-center text-white shadow-[0_0_30px_rgba(15,98,254,0.4)] group-hover:scale-110 transition-transform">
              <TerminalIcon size={28} />
            </div>
            <div>
               <div className="flex items-center gap-3 mb-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                <span className="text-[10px] font-black text-[#0f62fe] uppercase tracking-[0.5em] leading-none italic">Neural Link Active // 0.04ms</span>
              </div>
              <h2 className="font-black text-[var(--foreground)] uppercase tracking-tighter text-3xl italic leading-none">Reasoning Console</h2>
            </div>
          </div>
          <div className="flex gap-6">
            <button className="h-12 px-8 text-[10px] font-black text-[var(--muted-foreground)] border border-[var(--border)] hover:bg-[var(--background)] transition-all uppercase tracking-[0.3em] rounded-sm italic">Trace Log</button>
            <button className="h-12 px-8 text-[10px] font-black text-red-500 border border-red-900/20 hover:bg-red-600 hover:text-white transition-all uppercase tracking-[0.3em] rounded-sm italic">Purge</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-14 custom-scrollbar relative bg-black/5">
          <div className="absolute inset-0 neural-grid opacity-5 pointer-events-none" />
          {messages.map((m, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}
            >
              <div className={cn(
                "max-w-[80%] group relative",
                m.role === 'user' ? "text-right" : "text-left"
              )}>
                <div className={cn("flex items-center gap-4 mb-4 px-2", m.role === 'user' ? "justify-end" : "justify-start")}>
                   <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.4em] italic opacity-60">
                     {m.role === 'user' ? 'Operator' : 'IBM Granite v4.4 // Bob'}
                   </span>
                   <span className="text-[9px] font-black text-[var(--muted-foreground)] opacity-20">L:{m.timestamp}</span>
                </div>
                <div className={cn(
                  "p-8 rounded-sm border transition-all text-lg leading-relaxed whitespace-pre-wrap font-bold shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden italic tracking-tight",
                  m.role === 'user' 
                    ? "bg-[#0f62fe] text-white border-blue-500 ring-1 ring-blue-400/20" 
                    : "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-[#0f62fe]/30"
                )}>
                   {m.role === 'assistant' && (
                     <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0f62fe]/50" />
                   )}
                  {m.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
               <div className="bg-[var(--background)] border border-[#0f62fe]/20 p-8 rounded-sm flex items-center gap-6 shadow-2xl">
                  <div className="flex gap-2">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 0.8 }} className="h-2 w-2 bg-[#0f62fe] rounded-full shadow-[0_0_10px_#0f62fe]" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.1 }} className="h-2 w-2 bg-[#0f62fe] rounded-full shadow-[0_0_10px_#0f62fe]" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="h-2 w-2 bg-[#0f62fe] rounded-full shadow-[0_0_10px_#0f62fe]" />
                  </div>
                  <span className="text-[11px] font-black text-[#0f62fe] uppercase tracking-[0.5em] italic">Bob is synthesizing global resonance...</span>
               </div>
            </motion.div>
          )}
        </div>

        <div className="p-10 border-t border-[var(--border)] bg-[#0c0c0e] shrink-0 relative">
          <div className="absolute inset-0 neural-grid opacity-[0.03] pointer-events-none" />
          <div className="relative group">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Inject reasoning prompt or legacy module path..."
              className="w-full bg-[var(--background)] border border-[var(--border)] group-hover:border-[#0f62fe]/50 focus:border-[#0f62fe] p-8 pr-48 text-xl font-black text-[var(--foreground)] outline-none rounded-sm resize-none placeholder:opacity-10 leading-relaxed custom-scrollbar italic transition-all shadow-inner"
              rows={3}
            />
            <div className="absolute right-6 bottom-6 flex items-center gap-6">
               <span className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-widest opacity-20 italic group-hover:opacity-60 transition-opacity">Enter to Execute</span>
               <button 
                 onClick={handleSend}
                 disabled={isTyping || !input.trim()}
                 className="fintech-btn-primary h-14 px-12 flex items-center gap-4 disabled:opacity-10 shadow-3xl italic group active:scale-95"
               >
                 <Zap size={18} className="fill-white group-hover:scale-125 transition-transform" />
                 <span className="text-sm font-black uppercase tracking-[0.4em]">Execute</span>
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reasoning Context Sidebar */}
      <div className="w-96 flex flex-col gap-8 shrink-0">
         <div className="enterprise-card p-10 bg-[var(--card)] border border-[var(--border)] rounded-sm flex-1 relative overflow-hidden">
            <div className="absolute inset-0 neural-grid opacity-[0.03] pointer-events-none" />
            <h3 className="text-[12px] font-black text-[var(--foreground)] uppercase tracking-[0.5em] mb-10 border-b border-[var(--border)] pb-6 italic">Neural Cache v7</h3>
            
            <div className="space-y-8 relative z-10">
               {[
                 { label: 'Active Context', value: 'Legacy Discovery', color: 'text-white' },
                 { label: 'Neural Temp', value: '0.72 Tau', color: 'text-amber-500' },
                 { label: 'Token Density', value: 'High Trace', color: 'text-[#0f62fe]' },
                 { label: 'Lattice Depth', value: '42 Layers', color: 'text-green-500' },
                 { label: 'Reasoning Mode', value: 'Granite-Dense', color: 'text-[#0f62fe]' },
               ].map((item, i) => (
                 <div key={i} className="flex flex-col gap-2 group cursor-default">
                    <span className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-widest leading-none opacity-40 group-hover:opacity-100 transition-opacity tracking-[0.3em]">{item.label}</span>
                    <span className={cn("text-xl font-black italic tracking-tighter truncate leading-none", item.color)}>{item.value}</span>
                 </div>
               ))}
            </div>

            <div className="mt-14 pt-10 border-t border-[var(--border)] relative z-10">
               <h4 className="text-[10px] font-black text-[var(--muted-foreground)] uppercase mb-8 tracking-[0.4em] italic opacity-60">Verified Predicates</h4>
               <div className="space-y-4">
                  {['PricingPredicates.java', 'TaxLogicCore.cbl', 'LegacyAuth.xml', 'LedgerV3.c'].map((item, i) => (
                    <div key={i} className="p-5 bg-[var(--background)] border border-transparent hover:border-[#0f62fe]/40 rounded-sm flex items-center justify-between group cursor-pointer transition-all shadow-sm">
                       <div className="flex items-center gap-4">
                          <FileText size={16} className="text-[#0f62fe] group-hover:rotate-12 transition-transform" />
                          <span className="text-[11px] font-black text-[var(--foreground)] truncate uppercase tracking-tighter italic">{item}</span>
                       </div>
                       <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 2 }} className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="enterprise-card p-12 bg-[#0f62fe] text-white rounded-sm shadow-3xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-1000 rotate-12 pointer-events-none">
               <Cpu size={140} />
            </div>
            <div className="relative z-10">
               <p className="text-[11px] font-black uppercase tracking-[0.5em] mb-6 opacity-70 italic">Uplink Throughput</p>
               <div className="text-8xl font-black italic tracking-tighter mb-4 flex items-baseline">
                  98<span className="text-4xl text-blue-300 ml-1">%</span>
               </div>
               <p className="text-[11px] font-black opacity-80 leading-relaxed uppercase tracking-[0.3em] max-w-[200px]">Node synchronization integrity across global clusters</p>
            </div>
            <div className="mt-10 h-1.5 w-full bg-white/20 rounded-full overflow-hidden relative z-10">
               <motion.div initial={{ width: 0 }} animate={{ width: '98%' }} className="h-full bg-white shadow-[0_0_15px_white]" />
            </div>
         </div>
      </div>

    </motion.div>
  );
}
function LogicGraphView({ setActiveSection }: { setActiveSection: (section: Section) => void }) {
  const [nodes, setNodes] = useState([
    { id: 'billing-v1', label: 'Billing Core', type: 'Legacy', x: 100, y: 150, confidence: 0.98, status: 'Opaque', complexity: 'High', debt: '$420k', technographics: ['Java 8', 'Struts 2', 'Oracle DB'] },
    { id: 'auth-layer', label: 'Auth Middleware', type: 'Legacy', x: 300, y: 100, confidence: 0.94, status: 'Scanning', complexity: 'Medium', debt: '$120k', technographics: ['C++', 'Custom JWT', 'Redis'] },
    { id: 'tax-calc', label: 'Tax Logic', type: 'Extracted', x: 300, y: 250, confidence: 0.99, status: 'Neutralized', complexity: 'Low', debt: '$0k', technographics: ['Python', 'FastAPI', 'Postgres'] },
    { id: 'payment-sec', label: 'Vault Crypt', type: 'Extracted', x: 500, y: 300, confidence: 0.97, status: 'Stabilized', complexity: 'Medium', debt: '$15k', technographics: ['Go', 'gRPC', 'Vault'] },
    { id: 'modern-api', label: 'Modern API Core', type: 'Target', x: 650, y: 150, confidence: 0.88, status: 'Converging', complexity: 'Low', debt: '$0k', technographics: ['Next.js', 'TRPC', 'Edge'] },
    { id: 'legacy-db', label: 'DB Master', type: 'Legacy', x: 50, y: 350, confidence: 0.92, status: 'Critical', complexity: 'V. High', debt: '$1.2M', technographics: ['PL/SQL', 'Legacy Schema'] },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleDrag = (id: string, info: any) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, x: node.x + info.delta.x, y: node.y + info.delta.y } : node
    ));
  };

  const getPath = (id1: string, id2: string) => {
    const n1 = nodes.find(n => n.id === id1);
    const n2 = nodes.find(n => n.id === id2);
    if (!n1 || !n2) return "";
    return `M ${n1.x + 100} ${n1.y + 60} L ${n2.x + 100} ${n2.y + 60}`;
  };

  const selectedNode = nodes.find(n => n.id === selectedId);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 h-full flex flex-col"
    >
       <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-8 overflow-hidden relative shrink-0">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none italic font-black text-8xl uppercase tracking-tighter">GRID</div>
        <div className="flex items-center gap-2 mb-2">
            <Globe2 size={14} className="text-[#0f62fe]" />
            <span className="text-[10px] font-black text-[#0f62fe] uppercase tracking-[0.3em] leading-none">Knowledge Lattice Graph</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-[var(--foreground)] uppercase italic leading-none">
          Logic <span className="text-[#0f62fe] underline decoration-[#0f62fe]/30 decoration-8 underline-offset-[12px]">Topology</span>
        </h1>
        <p className="text-[var(--muted-foreground)] mt-6 font-bold text-sm max-w-xl leading-relaxed italic">
          Visualizing semantic dependencies across monolithic layers and extractable micro-service targets. IBM Granite maps <span className="text-[var(--foreground)]">logic vectors</span> in real-time.
        </p>
      </div>

      <div className="enterprise-card p-1 relative overflow-hidden bg-[#050507] flex-1 rounded-sm border-[var(--border)] shadow-3xl">
        <div className="absolute inset-0 neural-grid opacity-[0.05] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40 pointer-events-none" />
        
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          {[
            { from: 'billing-v1', to: 'auth-layer', color: '#0f62fe' },
            { from: 'billing-v1', to: 'tax-calc', color: '#0f62fe' },
            { from: 'auth-layer', to: 'modern-api', color: '#0f62fe' },
            { from: 'tax-calc', to: 'modern-api', color: '#198038' },
            { from: 'legacy-db', to: 'tax-calc', color: '#0f62fe' },
            { from: 'payment-sec', to: 'modern-api', color: '#198038' }
          ].map((link, i) => (
            <g key={i}>
              <motion.path 
                d={getPath(link.from, link.to)} 
                stroke={link.color} 
                strokeWidth={link.color === '#198038' ? 2 : 1}
                strokeDasharray={link.color === '#0f62fe' ? "5,5" : "none"}
                className={cn("transition-opacity duration-500", selectedId && (selectedId === link.from || selectedId === link.to) ? "opacity-100" : "opacity-20")}
              />
              <motion.circle
                r="2.5"
                fill={link.color}
                className="shadow-[0_0_10px_currentColor]"
                animate={{
                  offsetDistance: ["0%", "100%"]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 2
                }}
                style={{
                  motionPath: `path("${getPath(link.from, link.to)}")`
                }}
              />
            </g>
          ))}
        </svg>

        {nodes.map((node) => (
          <motion.div
            key={node.id}
            drag
            dragMomentum={false}
            onDrag={(e, info) => handleDrag(node.id, info)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: selectedId === node.id ? 1.05 : 1,
              zIndex: selectedId === node.id ? 100 : 10
            }}
            whileHover={{ scale: 1.05, zIndex: 110 }}
            whileDrag={{ scale: 1.15, zIndex: 120 }}
            onClick={() => setSelectedId(node.id === selectedId ? null : node.id)}
            className={cn(
              "absolute p-6 bg-[var(--card)]/90 border rounded-sm shadow-2xl group transition-all cursor-grab active:cursor-grabbing backdrop-blur-xl",
              selectedId === node.id ? "border-[#0f62fe] shadow-[0_0_40px_rgba(15,98,254,0.3)]" : "border-[var(--border)] hover:border-[#0f62fe]"
            )}
            style={{ x: node.x, y: node.y }}
          >
            <div className="absolute top-0 right-0 p-2 opacity-[0.05] group-hover:opacity-20 transition-opacity pointer-events-none">
               <Fingerprint size={40} />
            </div>
            <div className="flex items-center gap-5 relative z-10 pointer-events-none">
              <div className={cn(
                "h-4 w-4 rounded-full shadow-[0_0_20px_currentColor]",
                node.type === 'Legacy' ? "text-amber-600 bg-amber-600" : node.type === 'Extracted' ? "text-green-500 bg-green-500" : "text-[#0f62fe] bg-[#0f62fe]"
              )} />
              <div>
                <p className="text-sm font-black text-[var(--foreground)] uppercase leading-none text-nowrap tracking-tight italic mb-1.5">{node.label}</p>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] text-[var(--muted-foreground)] font-black uppercase tracking-widest leading-none italic opacity-60">{node.type}</span>
                   <span className="h-0.5 w-0.5 rounded-full bg-[var(--muted-foreground)] opacity-20" />
                   <span className="text-[9px] text-[#0f62fe] font-black uppercase tracking-widest italic">{node.status}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-5 border-t border-[var(--border)] flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
               <div>
                  <p className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-widest leading-none mb-2 italic">Neural Confidence</p>
                  <p className="text-xl font-black text-[#0f62fe] font-mono leading-none tracking-tighter">{(node.confidence * 100).toFixed(1)}%</p>
               </div>
               <button className="h-10 w-10 flex items-center justify-center bg-[var(--secondary)] border border-[var(--border)] rounded-sm group/btn pointer-events-auto hover:bg-[#0f62fe] hover:text-white transition-all shadow-xl">
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
               </button>
            </div>
          </motion.div>
        ))}

        <div className={cn("absolute left-10 bottom-10 flex gap-8 z-30 pointer-events-none transition-all duration-500", selectedId ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100")}>
          <div className="p-8 bg-[var(--card)]/90 backdrop-blur-2xl border border-[var(--border)] rounded-sm space-y-5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] pointer-events-auto">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--muted-foreground)] border-b border-[var(--border)] pb-3 mb-6 italic opacity-50">Lattice Index</h4>
            <div className="space-y-5">
              <LegendItem color="bg-amber-600 shadow-amber-600/40" label="Legacy Debt" />
              <LegendItem color="bg-green-500 shadow-green-500/40" label="Verified Logic" />
              <LegendItem color="bg-[#0f62fe] shadow-blue-500/40" label="Modern Target" />
            </div>
          </div>
          
          <div className="p-8 bg-[var(--card)]/90 backdrop-blur-2xl border border-[var(--border)] rounded-sm flex flex-col justify-center shadow-[0_30px_60px_rgba(0,0,0,0.5)] group pointer-events-auto">
             <div className="flex flex-col mb-6">
               <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest italic mb-2 opacity-50">Cluster Multiplier</span>
               <span className="text-3xl font-black text-[var(--foreground)] tracking-tighter italic">1.442 <span className="text-[#0f62fe] text-sm tracking-[0.2em] relative -top-3">λ</span></span>
             </div>
             <button 
               onClick={() => {
                 setNodes(prev => prev.map(node => {
                   if (node.type === 'Legacy') return { ...node, status: 'Neutralized', confidence: 0.99, x: node.x - 50 };
                   if (node.type === 'Target') return { ...node, status: 'Operational', confidence: 1.00, x: node.x + 100 };
                   return { ...node, status: 'Modularized', x: node.x + 20 };
                 }));
               }}
               className="px-6 py-3 bg-[#0f62fe] text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-sm hover:translate-y-[-2px] hover:shadow-2xl transition-all italic active:scale-95"
             >
               Project Future State
             </button>
          </div>
        </div>

        <AnimatePresence>
          {selectedId && selectedNode && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-[420px] bg-[var(--card)]/95 backdrop-blur-3xl border-l border-[var(--border)] z-[200] shadow-[-20px_0_60px_rgba(0,0,0,0.5)] flex flex-col"
            >
               <div className="p-10 border-b border-[var(--border)] relative overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none italic font-black text-6xl uppercase tracking-tighter">{selectedNode.type}</div>
                  <button 
                    onClick={() => setSelectedId(null)}
                    className="absolute top-8 right-8 text-[var(--muted-foreground)] hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="flex items-center gap-3 mb-4">
                     <span className="h-2 w-2 rounded-full bg-[#0f62fe] animate-pulse" />
                     <span className="text-[10px] font-black text-[#0f62fe] uppercase tracking-[0.4em]">Node Identity Matrix</span>
                  </div>
                  <h2 className="text-4xl font-black text-[var(--foreground)] uppercase italic tracking-tighter leading-tight mb-2">{selectedNode.label}</h2>
                  <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">{selectedNode.status} // {selectedNode.id}</p>
               </div>

               <div className="flex-1 overflow-y-auto p-10 space-y-12">
                  <div className="grid grid-cols-2 gap-8">
                     <div>
                        <p className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.3em] mb-3 italic">Complexity</p>
                        <p className="text-2xl font-black text-[var(--foreground)] uppercase italic tracking-tighter">{selectedNode.complexity}</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.3em] mb-3 italic">Technical Debt</p>
                        <p className="text-2xl font-black text-amber-500 uppercase italic tracking-tighter">{selectedNode.debt}</p>
                     </div>
                  </div>

                  <div>
                     <p className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.3em] mb-6 italic">Technographic Stack</p>
                     <div className="flex flex-wrap gap-2">
                        {(selectedNode.technographics as string[]).map((tech, i) => (
                           <span key={i} className="px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] text-[10px] font-black uppercase tracking-widest italic rounded-sm hover:border-[#0f62fe] hover:text-[#0f62fe] transition-all cursor-default">
                              {tech}
                           </span>
                        ))}
                     </div>
                  </div>

                  <div>
                     <p className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.3em] mb-6 italic">Bob's Semantic Analysis</p>
                     <div className="p-8 bg-[var(--background)] border border-white/5 rounded-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                           <Zap size={32} className="text-[#0f62fe]" />
                        </div>
                        <p className="text-xs font-bold text-[var(--foreground)]/80 leading-relaxed italic mb-6">
                           "Detected high-coupling in the persistence layer. Semantic drift observed between legacy DTOs and modernized schema. Recommend immediate vector decomposition to neutralize monolithic gravity."
                        </p>
                        <div className="flex items-center gap-3">
                           <div className="h-6 w-6 rounded-sm bg-[#0f62fe] flex items-center justify-center font-black text-[10px] text-white">B</div>
                           <span className="text-[9px] font-black uppercase tracking-widest text-[#0f62fe]">Bob // Neural Architect</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="p-10 border-t border-[var(--border)] bg-black/20 shrink-0">
                  <button 
                    onClick={() => {
                       setActiveSection('logic-lab');
                       setSelectedId(null);
                    }}
                    className="w-full h-16 bg-[#0f62fe] text-white flex items-center justify-center gap-4 group hover:bg-[#0353e9] transition-all rounded-sm"
                  >
                     <span className="text-[11px] font-black uppercase tracking-[0.4em] italic">Initiate Extraction Lab</span>
                     <FlaskConical size={18} className="group-hover:rotate-12 transition-transform" />
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute right-10 bottom-10 p-8 border border-[var(--border)] bg-black/40 backdrop-blur-md italic font-black text-[10px] uppercase tracking-[0.5em] text-white/10 select-none">
           Topology Engine v7.4 Stable
        </div>
      </div>
    </motion.div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-2 w-2 rounded-full", color)} />
      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]">{label}</span>
    </div>
  );
}

function GraphNode({ x, y, label, type }: { x: number; y: number; label: string; type: 'root' | 'module' }) {
  return (
    <g transform={`translate(${x-60}, ${y-15})`}>
      <motion.rect
        width="120"
        height="40"
        rx="4"
        fill={type === 'root' ? "#0f62fe" : "white"}
        stroke={type === 'root' ? "transparent" : "#e0e0e0"}
        strokeWidth="1"
        whileHover={{ scale: 1.05 }}
        className="cursor-pointer shadow-sm"
      />
      <text
        x="60"
        y="25"
        textAnchor="middle"
        fill={type === 'root' ? "white" : "#161616"}
        fontSize="12"
        fontWeight="bold"
        pointerEvents="none"
      >
        {label}
      </text>
    </g>
  );
}

function LogicLabView() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sourceCode, setSourceCode] = useState('');
  const [viewMode, setViewMode] = useState<'standard' | 'diff' | 'tests'>('standard');
  const [generatedTests, setGeneratedTests] = useState('');
  const [isGeneratingTests, setIsGeneratingTests] = useState(false);
  const [extractedCode, setExtractedCode] = useState('');
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [analysisOutput, setAnalysisOutput] = useState<string[]>([
    "[RT] Cortex v4.2.0-stable established.",
    "[SYS] Waiting for module ingestion..."
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [analysisOutput, isAnalyzing]);

  const thoughtMuses = [
    "Scanning AST for nested monolithic depth...",
    "Detected shadow logic in circular dependencies.",
    "Mapping state mutation vectors to functional targets.",
    "Bypassing legacy compliance gates for inspection...",
    "Reconstructing semantic predicates from machine binaries.",
    "Validating logic integrity against target architecture."
  ];

  const startAnalysis = async () => {
    if (!sourceCode.trim()) return;
    setIsAnalyzing(true);
    setProgress(0);
    setThoughts([]);
    setAnalysisOutput(prev => [...prev, `[SYS] Starting neural AST traversal...`]);

    // Bob's Thought Stream simulation
    let thoughtIdx = 0;
    const thoughtInterval = setInterval(() => {
      if (thoughtIdx < thoughtMuses.length) {
        setThoughts(prev => [...prev.slice(-2), thoughtMuses[thoughtIdx]]);
        thoughtIdx++;
      } else {
        clearInterval(thoughtInterval);
      }
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) return 95;
        return p + Math.random() * 5;
      });
    }, 200);

    try {
      if (!AI_CLIENT) {
        setAnalysisOutput(prev => [...prev, '[CRIT] GEMINI_API_KEY not configured. Please add it to your environment variables.']);
        clearInterval(progressInterval);
        clearInterval(thoughtInterval);
        setIsAnalyzing(false);
        return;
      }
      const response = await AI_CLIENT.models.generateContent({
        model: MODEL_ID,
        contents: [
          { role: 'user', parts: [{ text: `Ingest and Decompose the following legacy segment. Identify core business logic and propose extraction vectors. CODE:\n${sourceCode}` }] }
        ],
        config: {
          systemInstruction: AI_SYSTEM_PROMPTS.decomposer,
          temperature: 0.1,
        }
      });
      
      const modernCode = response.text || '';
      setExtractedCode(modernCode);
      
      clearInterval(progressInterval);
      clearInterval(thoughtInterval);
      setProgress(100);
      
      setAnalysisOutput(prev => [...prev, "[EXTRACT] Neural reconstruction complete.", "[EXTRACT] Logic vectors verification phase active."]);
      setViewMode('diff');
    } catch (error) {
      console.error("Logic extraction failure:", error);
      setAnalysisOutput(prev => [...prev, "[CRIT] Logic extraction failed. Check neural uplink parameters."]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateTests = async () => {
    if (!sourceCode.trim()) return;
    setIsGeneratingTests(true);
    setViewMode('tests');
    setGeneratedTests('');
    try {
      if (!AI_CLIENT) {
        setGeneratedTests('// ERROR: API key not configured. Add GEMINI_API_KEY to your environment variables.');
        return;
      }
      const response = await AI_CLIENT.models.generateContent({
        model: MODEL_ID,
        contents: [{ role: 'user', parts: [{ text: `Generate a complete unit test suite for this code:\n\n${sourceCode}` }] }],
        config: { systemInstruction: AI_SYSTEM_PROMPTS.testGenerator, temperature: 0.1 }
      });
      setGeneratedTests(response.text || '// No tests generated.');
      setAnalysisOutput(prev => [...prev, '[TEST] Test suite synthesized. Vitest-compatible output ready.']);
    } catch (error) {
      console.error('Test generation failure:', error);
      setGeneratedTests('// ERROR: Test generation failed. Check your API key and try again.');
    } finally {
      setIsGeneratingTests(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-12 h-full flex flex-col"
    >
      <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-8 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none italic font-black text-8xl uppercase tracking-tighter">DECOMPOSE</div>
        <div className="flex items-center gap-2 mb-2">
            <FlaskConical size={14} className="text-[#0f62fe]" />
            <span className="text-[10px] font-black text-[#0f62fe] uppercase tracking-[0.3em] leading-none">Neural Logic Lab</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-[var(--foreground)] uppercase italic leading-none">
          Logic <span className="text-[#0f62fe] underline decoration-[#0f62fe]/30 decoration-8 underline-offset-[12px]">Decomposer</span>
        </h1>
        <p className="text-[var(--muted-foreground)] mt-6 font-bold text-sm max-w-xl leading-relaxed italic">
          Neutralize legacy technical debt by decomposing opaque modules into verified business predicates. Now supports <span className="text-[var(--foreground)]">COBOL</span>, <span className="text-[var(--foreground)]">Java</span>, and <span className="text-[var(--foreground)]">PL/SQL</span>.
        </p>
      </div>

      <div className="flex justify-start gap-4 mb-2 shrink-0">
         <button 
           onClick={() => setViewMode('standard')}
           className={cn(
             "px-6 py-3 text-[10px] font-black uppercase tracking-widest italic rounded-sm transition-all border",
             viewMode === 'standard' ? "bg-[#0f62fe] text-white border-[#0f62fe] shadow-2xl" : "bg-[var(--secondary)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-[#0f62fe]/30"
           )}
         >
           Ingestion Mode
         </button>
         <button 
           onClick={() => setViewMode('diff')}
           disabled={!extractedCode}
           className={cn(
             "px-6 py-3 text-[10px] font-black uppercase tracking-widest italic rounded-sm transition-all border",
             viewMode === 'diff' ? "bg-green-600 text-white border-green-600 shadow-2xl shadow-green-500/20" : "bg-[var(--secondary)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-green-600/30",
             !extractedCode && "opacity-30 cursor-not-allowed"
           )}
         >
           Verification Mode
         </button>
         <button 
           onClick={generateTests}
           disabled={!sourceCode.trim() || isGeneratingTests}
           className={cn(
             "px-6 py-3 text-[10px] font-black uppercase tracking-widest italic rounded-sm transition-all border",
             viewMode === 'tests' ? "bg-purple-600 text-white border-purple-600 shadow-2xl shadow-purple-500/20" : "bg-[var(--secondary)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-purple-600/30",
             (!sourceCode.trim() || isGeneratingTests) && "opacity-30 cursor-not-allowed"
           )}
         >
           {isGeneratingTests ? 'Synthesizing...' : 'Test Generator'}
         </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="enterprise-card bg-[var(--card)] flex flex-col border-[var(--border)] relative group overflow-hidden">
          <div className="absolute inset-0 neural-grid opacity-[0.03] pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {viewMode === 'tests' && (
              <motion.div
                key="tests-source"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full p-10 h-[700px]"
              >
                <div className="flex items-center justify-between mb-8 shrink-0">
                  <h3 className="text-xl font-black uppercase tracking-tight text-purple-400 italic">Source Code</h3>
                  <div className="flex items-center gap-2 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm">
                    <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                    <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest italic">Test Source</span>
                  </div>
                </div>
                <div className="flex-1 bg-[#050507] border border-purple-900/20 p-10 rounded-sm overflow-y-auto custom-scrollbar relative">
                  <pre className="text-[10px] font-mono text-purple-300/80 leading-relaxed whitespace-pre-wrap italic">{sourceCode || '// Paste code in Ingestion Mode first'}</pre>
                </div>
              </motion.div>
            )}
            {viewMode === 'standard' ? (
              <motion.div 
                key="ingest"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full p-10 h-[700px]"
              >
                <div className="flex items-center justify-between mb-8 relative z-10 shrink-0">
                  <h3 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)] italic">Source Ingestion</h3>
                  <div className="flex items-center gap-2 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm">
                     <div className="h-2 w-2 rounded-full bg-[#0f62fe] animate-pulse shadow-[0_0_10px_rgba(15,98,254,0.5)]" />
                     <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest italic">Awaiting Input</span>
                  </div>
                </div>
                
                <textarea 
                  value={sourceCode}
                  onChange={(e) => setSourceCode(e.target.value)}
                  placeholder="Paste legacy modules or logic segments..."
                  className="flex-1 bg-[#050507] border border-[var(--border)] p-10 rounded-sm text-[11px] font-mono text-white/90 focus:ring-2 focus:ring-[#0f62fe]/20 focus:border-[#0f62fe] outline-none resize-none mb-8 placeholder:opacity-10 custom-scrollbar leading-relaxed tracking-tighter shadow-inner relative z-10"
                />

                <div className="relative z-10 shrink-0">
                  {isAnalyzing ? (
                    <div className="w-full bg-[var(--background)] p-8 rounded-sm border border-[var(--border)] shadow-2xl">
                      <div className="flex justify-between text-[11px] font-black mb-6 uppercase tracking-[0.3em] text-[#0f62fe] italic">
                        <span className="flex items-center gap-3">
                          <RefreshCw size={14} className="animate-spin" />
                          Orchestrating Neural Pulse...
                        </span>
                        <span className="font-mono">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-[#0f62fe] shadow-[0_0_20px_rgba(15,98,254,0.6)]"
                        />
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={startAnalysis}
                      disabled={!sourceCode.trim()}
                      className="w-full py-6 fintech-btn-primary flex items-center justify-center gap-4 disabled:opacity-30 disabled:grayscale transition-all active:scale-[0.98] group"
                    >
                      <Zap size={18} className="fill-white group-hover:scale-125 transition-transform" />
                      <span className="text-xs font-black uppercase tracking-[0.4em] italic">Analyze Vector</span>
                    </button>
                  )}
                </div>

                {isAnalyzing && (
                  <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                     <div className="flex flex-col gap-3">
                        <AnimatePresence mode="popLayout">
                          {thoughts.map((thought) => (
                             <motion.div
                               key={thought}
                               initial={{ opacity: 0, y: 10 }}
                               animate={{ opacity: 1, y: 0 }}
                               exit={{ opacity: 0, y: -10 }}
                               className="px-6 py-3 bg-[var(--card)] border border-[#0f62fe]/30 rounded-sm text-[10px] font-black uppercase tracking-widest text-[#0f62fe] italic shadow-2xl backdrop-blur-3xl"
                             >
                               <span className="opacity-50 mr-2 text-[var(--muted-foreground)]">// Bob:</span> {thought}
                             </motion.div>
                          ))}
                        </AnimatePresence>
                     </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="diff-legacy"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full p-10 h-[700px]"
              >
                <div className="flex items-center justify-between mb-8 shrink-0">
                  <h3 className="text-xl font-black uppercase tracking-tight text-amber-500 italic">Identified Debt (Legacy)</h3>
                  <div className="text-[10px] font-black text-amber-500/50 uppercase italic tracking-widest leading-none">Opaque Binary Layer</div>
                </div>
                <div className="flex-1 bg-[#050507] border border-amber-900/20 p-10 rounded-sm overflow-y-auto custom-scrollbar relative">
                   <div className="absolute top-4 right-4 text-[9px] font-black text-amber-500/30 uppercase tracking-[0.4em] italic mb-6">Legacy Substrate v1.2</div>
                   <pre className="text-[10px] font-mono text-amber-500/80 leading-relaxed whitespace-pre-wrap italic">{sourceCode}</pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="enterprise-card bg-[var(--card)] flex flex-col border-[var(--border)] relative overflow-hidden group transition-all">
          <div className="absolute inset-0 neural-grid opacity-[0.03] pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {viewMode === 'tests' && (
              <motion.div
                key="tests-output"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col h-full p-10 h-[700px]"
              >
                <div className="flex items-center justify-between mb-8 shrink-0">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-purple-400 italic">Generated Tests</h3>
                    <p className="text-[9px] font-black text-purple-400/50 uppercase italic tracking-[0.4em] mt-2">Vitest-Compatible TypeScript Suite</p>
                  </div>
                  <div className="flex gap-4">
                    {isGeneratingTests ? (
                      <div className="flex items-center gap-3 px-5 py-2 border border-purple-500/20 rounded-sm bg-purple-500/5">
                        <RefreshCw size={12} className="text-purple-400 animate-spin" />
                        <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest italic">Bob Synthesizing...</span>
                      </div>
                    ) : generatedTests && (
                      <div className="px-5 py-2 border border-purple-500/20 rounded-sm bg-purple-500/5 text-[9px] font-black text-purple-400 uppercase tracking-widest italic">Ready</div>
                    )}
                  </div>
                </div>
                <div className="flex-1 bg-[#050507] border border-purple-900/20 p-10 rounded-sm overflow-y-auto custom-scrollbar relative shadow-inner">
                  <div className="absolute top-4 right-4 text-[9px] font-black text-purple-500/30 uppercase tracking-[0.4em] italic">VITEST-TS-v4</div>
                  {isGeneratingTests ? (
                    <div className="flex flex-col items-center justify-center h-full gap-6">
                      <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em] animate-pulse italic">Bob is synthesizing tests...</p>
                    </div>
                  ) : (
                    <pre className="text-[11px] font-mono text-purple-300 leading-relaxed whitespace-pre-wrap italic drop-shadow-[0_0_10px_rgba(168,85,247,0.2)]">{generatedTests || '// Run Test Generator to synthesize tests'}</pre>
                  )}
                </div>
                {generatedTests && !isGeneratingTests && (
                  <div className="mt-10 pt-10 border-t border-[var(--border)] flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-6">
                      <div className="p-5 bg-purple-500/10 border border-purple-500/20 rounded-sm">
                        <ShieldCheck className="text-purple-400" size={28} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.5em] italic mb-2">Test Suite Ready</p>
                        <p className="text-2xl font-black text-white italic tracking-tighter leading-none uppercase">Vitest Compatible</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedTests)}
                      className="h-14 px-10 bg-purple-600 text-white text-[11px] font-black uppercase tracking-[0.4em] italic rounded-sm hover:-translate-y-1 transition-all shadow-[0_20px_40px_rgba(168,85,247,0.3)] active:scale-95"
                    >
                      Copy Tests
                    </button>
                  </div>
                )}
              </motion.div>
            )}
            {viewMode === 'standard' ? (
              <motion.div 
                key="standard-output"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex flex-col h-full h-[700px]"
              >
                <div className="p-10 border-b border-white/5 flex justify-between items-center shrink-0">
                  <h3 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)] italic group-hover:text-[#0f62fe] transition-colors flex items-center gap-4">
                    <Activity size={24} className="text-[#0f62fe]" />
                    Neural Extraction Report
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                       <span className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-widest opacity-40">Reasoning Nodes</span>
                       <span className="text-sm font-black text-[#0f62fe] font-mono">1,242 λ</span>
                    </div>
                    <div className="h-8 w-px bg-[var(--border)]" />
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                      <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.3em] italic">Live Telemetry</span>
                    </div>
                  </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-6 font-mono text-[11px] custom-scrollbar relative z-10 bg-black/10">
                  {analysisOutput.map((line, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={idx}
                      className={cn(
                        "flex gap-6 leading-relaxed group",
                        line.startsWith('[SYS]') ? "text-[#0f62fe]" : line.startsWith('[EXTRACT]') ? "text-green-400 group-hover:text-green-300 transition-colors" : line.startsWith('[CRIT]') ? "text-red-500 font-black" : "text-[var(--foreground)]/80"
                      )}
                    >
                      <span className="opacity-20 shrink-0 font-black italic">{idx.toString().padStart(3, '0')}</span>
                      <span className="font-bold tracking-tight italic group-hover:translate-x-1 transition-transform">{line}</span>
                    </motion.div>
                  ))}
                  {isAnalyzing && (
                    <div className="flex gap-6 animate-pulse text-[#0f62fe]">
                      <span className="opacity-20 shrink-0 font-black italic">---</span>
                      <span className="font-black italic uppercase tracking-widest">Neural engine traversing logic clusters...</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="diff-modern"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col h-full p-10 h-[700px]"
              >
                <div className="flex items-center justify-between mb-8 shrink-0">
                   <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-green-500 italic">Target Architecture</h3>
                    <p className="text-[9px] font-black text-green-500/50 uppercase italic tracking-[0.4em] mt-2">Verified Predicate Logic Fragment</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="px-6 py-3 border border-green-500/20 rounded-sm bg-green-500/5 text-[9px] font-black text-green-500 uppercase tracking-widest italic">Purity: 99.8%</div>
                   </div>
                </div>
                <div className="flex-1 bg-[#050507] border border-green-900/20 p-10 rounded-sm overflow-y-auto custom-scrollbar relative shadow-inner">
                   <div className="absolute top-4 right-4 text-[9px] font-black text-green-500/30 uppercase tracking-[0.4em] italic mb-6">TS-PREDICATE-v4</div>
                   <pre className="text-[11px] font-mono text-green-400 leading-relaxed whitespace-pre-wrap italic drop-shadow-[0_0_10px_rgba(74,222,128,0.2)]">{extractedCode}</pre>
                </div>
                <div className="mt-10 pt-10 border-t border-[var(--border)] flex justify-between items-center shrink-0">
                   <div className="flex items-center gap-6">
                      <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-sm group-hover:scale-110 transition-transform">
                         <ShieldCheck className="text-green-500" size={32} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.5em] italic mb-2">Safety Verification</p>
                         <p className="text-2xl font-black text-white italic tracking-tighter leading-none uppercase">Predicate PASS <span className="text-green-500 opacity-60 font-mono text-sm tracking-normal">[0.02ms]</span></p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <button className="h-14 px-10 bg-[var(--background)] border border-[var(--border)] text-[11px] font-black uppercase tracking-[0.4em] italic rounded-sm hover:border-[#0f62fe] hover:text-[#0f62fe] transition-all group">
                         Copy Logic
                      </button>
                      <button className="h-14 px-10 bg-[#0f62fe] text-white text-[11px] font-black uppercase tracking-[0.4em] italic rounded-sm hover:-translate-y-1 transition-all shadow-[0_20px_40px_rgba(15,98,254,0.3)] active:scale-95">
                         Push to Registry Matrix
                      </button>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </motion.div>
  );
}function ComplianceView() {
  const [selectedMapping, setSelectedMapping] = useState<number | null>(null);
  
  const complianceData = [
    { module: 'BillingService.v7', risk: 'Low', regulation: 'PCI-DSS v4.0', status: 'Compliant', confidence: 0.99, lastAudit: '2024-05-01' },
    { module: 'AuthIngress.dll', risk: 'Medium', regulation: 'GDPR Article 32', status: 'In Review', confidence: 0.82, lastAudit: '2024-04-28' },
    { module: 'TaxAggregator', risk: 'Low', regulation: 'SEC 17a-4', status: 'Compliant', confidence: 0.96, lastAudit: '2024-05-02' },
    { module: 'VaultPro.bin', risk: 'High', regulation: 'FIPS 140-2 L3', status: 'Stabilized', confidence: 0.88, lastAudit: '2024-04-30' },
    { module: 'LedgerSync.java', risk: 'Low', regulation: 'SOC2 Type II', status: 'Verified', confidence: 0.99, lastAudit: '2024-05-01' },
  ];

  const frameworks = [
    { name: 'PCI-DSS', score: 98, active: true },
    { name: 'GDPR', score: 84, active: true },
    { name: 'SOC2', score: 100, active: true },
    { name: 'HIPAA', score: 92, active: false },
    { name: 'ISO 27001', score: 89, active: true },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-20"
    >
       <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-[var(--border)] pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] select-none pointer-events-none italic font-black text-9xl uppercase tracking-tighter shrink-0">POLICY</div>
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
              <ShieldCheck size={16} className="text-green-500 animate-pulse" />
              <span className="text-[11px] font-black text-green-500 uppercase tracking-[0.5em] leading-none italic">IBM Bob Policy Enforcement v4.2</span>
          </div>
          <h1 className="text-7xl font-black tracking-tight text-[var(--foreground)] uppercase italic leading-none mb-8">
            Compliance <span className="text-[#0f62fe]">Matrix</span>
          </h1>
          <p className="text-[var(--muted-foreground)] font-bold text-lg leading-relaxed italic border-l-4 border-green-500/50 pl-10 max-w-2xl shadow-glow-sm">
            Validating logic against global regulatory axioms. Powered by <span className="text-white font-black">IBM Bob's</span> deep repository context to ensure modernization vectors maintain cryptographic integrity.
          </p>
        </div>

        <div className="flex gap-4 bg-black/40 border border-[var(--border)] p-8 rounded-sm shadow-2xl">
           {frameworks.map((f, i) => (
             <div key={i} className={cn(
               "flex flex-col items-center gap-2 px-6 py-4 rounded-sm border transition-all cursor-default group shrink-0",
               f.active ? "bg-[var(--card)] border-[var(--border)] hover:border-[#0f62fe] shadow-lg" : "opacity-20 border-dashed border-[var(--border)]"
             )}>
                <span className="text-[9px] font-black text-[var(--muted-foreground)] group-hover:text-[#0f62fe] uppercase tracking-widest leading-none">{f.name}</span>
                <span className="text-xl font-black italic tracking-tighter text-white">{f.score}%</span>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Policy Coverage', value: '98.4%', delta: '+0.2%', trend: 'up', icon: ShieldCheck, color: 'text-green-500' },
          { label: 'Audit Velocity', value: '1.2M req/s', delta: 'Optimal', trend: 'neutral', icon: Activity, color: 'text-[#0f62fe]' },
          { label: 'Risk Exposure', value: 'Low', delta: '-15%', trend: 'down', icon: Eye, color: 'text-amber-500' },
          { label: 'Mesh Integrity', value: '100.0%', delta: 'Stable', trend: 'neutral', icon: Lock, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="enterprise-card p-12 bg-[var(--card)] border border-[var(--border)] rounded-sm group hover:border-[#0f62fe] transition-all relative overflow-hidden shadow-3xl">
             <div className="absolute inset-0 neural-grid opacity-[0.03] pointer-events-none" />
             <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="p-5 bg-[var(--background)] border border-[var(--border)] rounded-sm group-hover:bg-[#0f62fe]/10 transition-colors shadow-inner">
                   <stat.icon size={28} className={stat.color} />
                </div>
                <div className={cn(
                  "px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest border italic",
                  stat.trend === 'up' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                  stat.trend === 'down' ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                  "bg-blue-500/10 text-blue-500 border-blue-500/20"
                )}>
                  {stat.delta}
                </div>
             </div>
             <p className="text-[11px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.5em] mb-4 italic opacity-40 relative z-10">{stat.label}</p>
             <p className="text-6xl font-black text-[var(--foreground)] tracking-tighter italic relative z-10 group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 enterprise-card bg-[var(--card)] border border-[var(--border)] rounded-sm overflow-hidden shadow-3xl relative">
          <div className="absolute inset-0 neural-grid opacity-[0.03] pointer-events-none" />
          <div className="p-12 border-b border-[var(--border)] flex items-center justify-between relative z-10 bg-black/20 backdrop-blur-md">
             <div>
               <h3 className="font-black text-3xl text-white uppercase tracking-tight italic flex items-center gap-4 leading-none mb-3">
                 <Database size={24} className="text-[#0f62fe]" />
                 Compliance Mapping Matrix
               </h3>
               <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.5em] italic opacity-40 leading-none">Real-time attestation against FIPS, SEC, and GDPR logic predicates</p>
             </div>
             <div className="flex gap-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/5 border border-green-500/20 rounded-sm">
                   <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                   <span className="text-[9px] font-black text-green-500 uppercase tracking-widest italic leading-none">Live Sync Active</span>
                </div>
                <button className="h-12 w-12 flex items-center justify-center bg-[var(--secondary)] border border-[var(--border)] rounded-sm hover:border-[#0f62fe] transition-all group">
                   <RefreshCw size={18} className="text-[#0f62fe] group-hover:rotate-180 transition-transform duration-500" />
                </button>
             </div>
          </div>
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--background)] border-b border-[var(--border)]">
                  <th className="px-12 py-8 text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-[0.4em] italic leading-none">Logical Unit Vector</th>
                  <th className="px-12 py-8 text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-[0.4em] italic leading-none">Topology Gap</th>
                  <th className="px-12 py-8 text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-[0.4em] italic leading-none">Assessing Engine</th>
                  <th className="px-12 py-8 text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-[0.4em] italic leading-none">Final State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {complianceData.map((row, i) => (
                  <tr 
                    key={i} 
                    onClick={() => setSelectedMapping(i)}
                    className={cn(
                      "group cursor-pointer transition-all",
                      selectedMapping === i ? "bg-[#0f62fe]/10" : "hover:bg-white/[0.02]"
                    )}
                  >
                    <td className="px-12 py-10">
                      <div className="flex items-center gap-8">
                         <div className={cn(
                           "h-px w-8 bg-[var(--border)] group-hover:w-16 group-hover:bg-[#0f62fe] transition-all",
                           selectedMapping === i && "w-16 bg-[#0f62fe]"
                         )} />
                         <div>
                            <span className="font-black text-white uppercase text-xl tracking-tighter italic block mb-1.5 leading-none transition-colors group-hover:text-[#0f62fe]">{row.module}</span>
                            <span className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-widest opacity-40">{row.lastAudit} // AUDIT-0x{i+1}A</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-12 py-10">
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-1 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${row.risk === 'Low' ? 30 : row.risk === 'Medium' ? 60 : 100}%` }}
                             className={cn("h-full shadow-[0_0_10px_currentColor]", row.risk === 'Low' ? "text-green-500 bg-green-500" : row.risk === 'Medium' ? "text-amber-500 bg-amber-500" : "text-red-500 bg-red-500")}
                           />
                        </div>
                        <span className={cn(
                          "text-[10px] font-black uppercase italic tracking-widest leading-none",
                          row.risk === 'Low' ? "text-green-500" : row.risk === 'Medium' ? "text-amber-500" : "text-red-500"
                        )}>{row.risk}</span>
                      </div>
                    </td>
                    <td className="px-12 py-10">
                       <p className="text-base font-black italic text-white tracking-tight uppercase leading-none mb-1.5">{row.regulation}</p>
                       <p className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-widest opacity-30">Confidence Score: {(row.confidence * 100).toFixed(0)}%</p>
                    </td>
                    <td className="px-12 py-10">
                      <div className="flex items-center gap-4">
                         <div className={cn(
                           "p-2 rounded-sm border",
                           row.status === 'Verified' || row.status === 'Compliant' ? "bg-green-500/10 border-green-500/20 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]" : "bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                         )}>
                           <ShieldCheck size={16} />
                         </div>
                         <span className={cn(
                           "text-[11px] font-black uppercase tracking-widest italic leading-none",
                           row.status === 'Verified' || row.status === 'Compliant' ? "text-green-500" : "text-amber-500"
                          )}>{row.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-10 min-h-[600px]">
           <AnimatePresence mode="wait">
             {selectedMapping !== null ? (
               <motion.div 
                 key="detail"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="enterprise-card p-12 bg-[#0f62fe] text-white rounded-sm relative overflow-hidden shadow-3xl h-full flex flex-col"
               >
                  <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000 scale-150">
                    <Shield size={200} />
                  </div>
                  <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-3 mb-10 border-b border-white/20 pb-8">
                       <div className="h-6 w-6 border-2 border-white/40 rounded-full flex items-center justify-center p-1">
                          <div className="h-full w-full bg-white rounded-full animate-pulse" />
                       </div>
                       <span className="text-[11px] font-black uppercase tracking-[0.5em] italic">Attestation Analysis</span>
                    </div>
                    <h4 className="text-5xl font-black italic tracking-tighter uppercase leading-none mb-10 drop-shadow-2xl">
                       {complianceData[selectedMapping].module}
                    </h4>
                    
                    <div className="space-y-12">
                       <div className="p-6 bg-black/20 border border-white/10 rounded-sm">
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-4 italic leading-none">Regulatory Axiom</p>
                          <p className="text-2xl font-black italic tracking-tight uppercase leading-none">{complianceData[selectedMapping].regulation}</p>
                       </div>
                       
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-6 italic border-l-2 border-white/40 pl-4 leading-none">Logic-Level Invariants</p>
                          <div className="space-y-5">
                             {[
                               'Encryption-at-rest verification [PASSED]',
                               'Cross-border data residency check [OK]',
                               'Logic-level PII isolation [PASSED]',
                               'Hardware-root-of-trust sync [PASSED]'
                             ].map((line, i) => (
                               <div key={i} className="flex gap-4 items-center text-[13px] font-black leading-none italic group/item cursor-default">
                                  <div className="h-1.5 w-1.5 bg-white rounded-full opacity-40 group-hover/item:opacity-100 transition-opacity" />
                                  <span className="opacity-80 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all">{line}</span>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedMapping(null)}
                    className="w-full h-20 bg-white text-[#0f62fe] text-xs font-black uppercase tracking-[0.5em] italic rounded-sm hover:-translate-y-2 transition-all shadow-3xl flex items-center justify-center gap-4 shrink-0 mt-12 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Zap size={18} className="fill-[#0f62fe]" />
                    <span className="relative z-10 italic">Generate Attestation XML</span>
                  </button>
               </motion.div>
             ) : (
               <motion.div 
                 key="placeholder"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="enterprise-card p-12 bg-black/40 border border-[var(--border)] rounded-sm h-full flex flex-col justify-center items-center text-center space-y-10 italic relative group overflow-hidden shadow-2xl"
               >
                  <div className="absolute inset-0 neural-grid opacity-[0.05] pointer-events-none" />
                  <div className="p-16 bg-[#0f62fe]/10 border border-[#0f62fe]/20 rounded-sm group-hover:scale-110 transition-transform duration-1000 shadow-3xl">
                    <Globe size={100} className="text-[#0f62fe]/40 animate-pulse-slow" />
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-3xl font-black text-white uppercase tracking-tighter leading-none italic">Select Vector</h4>
                    <p className="text-[11px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.4em] leading-relaxed max-w-[280px] opacity-40">
                      Awaiting operator selection for end-to-end regulatory predicate trace.
                    </p>
                  </div>
                  <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-2 opacity-10">
                     <div className="h-[2px] w-full bg-white/20" />
                     <div className="h-[2px] w-2/3 bg-white/20" />
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function FinanceView() {
  const roiData = [
    { year: 'Q0', investment: 120000, savings: 0 },
    { year: 'Q1', investment: 40000, savings: 65000 },
    { year: 'Q2', investment: 20000, savings: 145000 },
    { year: 'Q3', investment: 10000, savings: 280000 },
    { year: 'Q4', investment: 5000, savings: 520000 },
  ];

  const savingsByModule = [
    { name: 'Core Banking', value: 42, color: 'bg-[#0f62fe]' },
    { name: 'Auth Middleware', value: 28, color: 'bg-blue-600' },
    { name: 'Tax Aggregator', value: 15, color: 'bg-blue-800' },
    { name: 'Payment Proc', value: 10, color: 'bg-blue-400' },
    { name: 'Reporting', value: 5, color: 'bg-blue-200' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-12 pb-20"
    >
       <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-[var(--border)] pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] select-none pointer-events-none italic font-black text-9xl uppercase tracking-tighter shrink-0">CAPITAL</div>
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
              <TrendingUp size={16} className="text-green-500 animate-pulse" />
              <span className="text-[11px] font-black text-green-500 uppercase tracking-[0.5em] leading-none italic">Economic Impact Engine v2.4</span>
          </div>
          <h1 className="text-7xl font-black tracking-tight text-[var(--foreground)] uppercase italic leading-none mb-8">
            Bob-Powered <span className="text-green-600">ROI</span>
          </h1>
          <p className="text-[var(--muted-foreground)] font-bold text-lg leading-relaxed italic border-l-4 border-green-500/50 pl-10 max-w-2xl shadow-glow-sm">
            Quantifying the financial yield of neural logic extraction. IBM Bob provides real-time delta between <span className="text-[var(--foreground)] font-black">monolithic maintenance debt</span> and modernization ROI.
          </p>
        </div>

        <div className="flex items-center gap-10 bg-black/40 border border-[var(--border)] p-10 rounded-sm shadow-2xl shrink-0">
           <div className="flex flex-col">
              <span className="text-[11px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.4em] italic mb-3 opacity-40 leading-none">Total Yield (12m)</span>
              <span className="text-5xl font-black italic tracking-tighter text-green-500 leading-none">$1.42M</span>
           </div>
           <div className="h-16 w-px bg-white/5" />
           <div className="flex flex-col">
              <span className="text-[11px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.4em] italic mb-3 opacity-40 leading-none">Modernization Velocity</span>
              <span className="text-5xl font-black italic tracking-tighter text-white leading-none">+84%</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Technical Debt Reduction', value: '$840k', delta: '+12.4%', trend: 'up', icon: Zap, color: 'text-[#0f62fe]' },
          { label: 'Neural Throughput Gain', value: '42.1%', delta: '+5.2%', trend: 'up', icon: Activity, color: 'text-blue-500' },
          { label: 'Audit Compliance Yield', value: '100%', delta: 'Verified', trend: 'neutral', icon: ShieldCheck, color: 'text-green-500' },
          { label: 'Projected Net Gain', value: '$2.1M', delta: '+22%', trend: 'up', icon: TrendingUp, color: 'text-green-600' },
        ].map((stat, i) => (
          <div key={i} className="enterprise-card p-12 bg-[var(--card)] border border-[var(--border)] rounded-sm group hover:border-[#0f62fe] transition-all relative overflow-hidden shadow-3xl">
             <div className="absolute inset-0 neural-grid opacity-[0.03] pointer-events-none" />
             <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="p-5 bg-[var(--background)] border border-[var(--border)] rounded-sm group-hover:bg-[#0f62fe]/10 transition-colors shadow-inner">
                   <stat.icon size={28} className={stat.color} />
                </div>
                <div className={cn(
                  "px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest border italic shadow-sm",
                  stat.trend === 'up' ? "bg-green-500/10 text-green-500 border-green-500/20 shadow-green-500/10" : 
                  stat.trend === 'down' ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/10" : 
                  "bg-blue-500/10 text-blue-500 border-blue-500/20"
                )}>
                  {stat.delta}
                </div>
             </div>
             <p className="text-[11px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.5em] mb-4 italic opacity-40 relative z-10">{stat.label}</p>
             <p className="text-5xl font-black text-white tracking-tighter italic relative z-10 group-hover:scale-105 transition-transform origin-left drop-shadow-2xl">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 enterprise-card p-12 bg-[var(--card)] border border-[var(--border)] rounded-sm min-h-[600px] flex flex-col relative overflow-hidden shadow-3xl">
           <div className="absolute inset-0 neural-grid opacity-[0.02] pointer-events-none" />
           <div className="flex items-center justify-between mb-16 relative z-10 bg-black/10 backdrop-blur-md p-8 rounded-sm border border-white/5 shadow-2xl">
              <div>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tight leading-none mb-3">Economic Yield Curvature</h3>
                <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.5em] italic opacity-40 leading-none">Modernization investment vs compound operational savings vector</p>
              </div>
              <div className="flex gap-8">
                 <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.6)]" />
                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest leading-none italic">Debt Surface</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest leading-none italic">Neural Yield</span>
                 </div>
              </div>
           </div>
           
           <div className="flex-1 min-h-0 relative z-10 -mx-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={roiData}>
                  <defs>
                    <linearGradient id="yieldGradFinance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#198038" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#198038" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="costGradFinance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#da1e28" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#da1e28" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: '900', letterSpacing: '0.1em' }} dy={15} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0c0c0e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2px', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}
                    itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic' }}
                    cursor={{ stroke: '#0f62fe', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="investment" stroke="#da1e28" strokeWidth={4} fill="url(#costGradFinance)" animationDuration={2500} />
                  <Area type="monotone" dataKey="savings" stroke="#198038" strokeWidth={4} fill="url(#yieldGradFinance)" animationDuration={3000} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-4 enterprise-card p-12 bg-black/40 border border-[var(--border)] rounded-sm flex flex-col relative overflow-hidden shadow-3xl">
           <div className="absolute inset-0 neural-grid opacity-[0.05] pointer-events-none" />
           <div className="flex items-center justify-between mb-12 relative z-10 border-b border-white/5 pb-10">
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tight leading-none flex items-center gap-4">
                 <PieChart size={24} className="text-[#0f62fe]" />
                 Savings Distribution
              </h3>
           </div>

           <div className="flex-1 space-y-12 relative z-10">
              <div className="h-24 w-full rounded-sm overflow-hidden border border-white/5 flex shadow-inner group">
                 {savingsByModule.map((mod, i) => (
                   <motion.div 
                     key={mod.name}
                     initial={{ width: 0 }}
                     animate={{ width: `${mod.value}%` }}
                     className={cn(mod.color, "h-full relative group/mod cursor-pointer transition-all hover:brightness-125")}
                   >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/mod:opacity-100 transition-opacity" />
                   </motion.div>
                 ))}
              </div>

              <div className="space-y-8 overflow-y-auto custom-scrollbar pr-4">
                 {savingsByModule.map((mod, i) => (
                   <div key={i} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-6">
                         <div className={cn("h-3 w-3 rounded-full shadow-[0_0_8px_currentColor]", mod.color)} />
                         <div>
                            <p className="text-[13px] font-black text-white uppercase italic tracking-tighter leading-none mb-1 group-hover:text-[#0f62fe] transition-colors">{mod.name}</p>
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none">Logic-Level Savings Cluster</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xl font-black italic text-white leading-none tracking-tighter">{mod.value}%</p>
                         <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mt-1 opacity-60 italic leading-none">Verified</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <button className="mt-12 w-full h-20 bg-[var(--secondary)] border border-[var(--border)] text-xs font-black uppercase tracking-[0.5em] italic rounded-sm hover:border-[#0f62fe] hover:text-[#0f62fe] hover:-translate-y-1 transition-all group shrink-0 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[#0f62fe]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex items-center justify-center gap-4">
                 <Database size={18} />
                 <span>Export Financial Audit</span>
              </div>
           </button>
        </div>
      </div>
    </motion.div>
  );
}

function AuditTrailView() {
  const audits = [
    { id: 'TX-9128', action: 'NEURAL_EXTRACTION', module: 'LegacyBilling.java', user: 'Granite Agent 01', status: 'Verified', time: '10:45:01', hash: '0x4f2a...3e12' },
    { id: 'TX-9127', action: 'PREDICATE_MAPPING', module: 'AuthCore.cobol', user: 'System Root', status: 'Success', time: '10:42:15', hash: '0x1c88...e99a' },
    { id: 'TX-9126', action: 'SECURITY_PATCH', module: 'TaxGateway.sql', user: 'Compliance Ops', status: 'Applied', time: '10:38:44', hash: '0x9a22...ff01' },
    { id: 'TX-9125', action: 'DECOMPOSITION', module: 'PaymentProc.java', user: 'Granite Agent 04', status: 'Verified', time: '10:35:12', hash: '0xbb32...12cc' },
    { id: 'TX-9124', action: 'LATTICE_SYNC', module: 'Cluster-01', user: 'System Admin', status: 'Success', time: '10:30:00', hash: '0x7e21...d221' },
    { id: 'TX-9123', action: 'REGION_MIGRATE', module: 'UserVault', user: 'Cloud Guard', status: 'Success', time: '10:25:55', hash: '0xda31...cc12' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-12"
    >
      <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none italic font-black text-8xl uppercase tracking-tighter">TRUST</div>
        <div className="flex items-center gap-2 mb-2">
            <History size={14} className="text-[#0f62fe] animate-pulse" />
            <span className="text-[10px] font-black text-[#0f62fe] uppercase tracking-[0.4em] leading-none italic">Immutable Ledger Access</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-[var(--foreground)] uppercase italic leading-none">
          System <span className="text-[#0f62fe] underline decoration-[#0f62fe]/30 decoration-8 underline-offset-[12px]">Audit Trail</span>
        </h1>
        <p className="text-[var(--muted-foreground)] mt-6 font-bold text-sm max-w-xl leading-relaxed italic">
          High-fidelity trace of neural operations and codebase transformations. Every extraction is anchored to the <span className="text-[var(--foreground)] font-black">Enterprise Trust Layer</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
         <div className="lg:col-span-3 enterprise-card overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-sm shadow-3xl relative group">
           <div className="absolute inset-0 neural-grid opacity-[0.02] pointer-events-none" />
           <div className="p-8 border-b border-[var(--border)] bg-black/40 backdrop-blur-md flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                 <TerminalIcon size={20} className="text-[#0f62fe]" />
                 <h3 className="font-black text-[var(--foreground)] uppercase tracking-tight italic text-xl">Operational Ledger // v4.2</h3>
              </div>
              <div className="flex gap-4">
                <button className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest italic hover:text-[#0f62fe] transition-colors">Export Logs</button>
                <div className="w-[1px] h-4 bg-[var(--border)]" />
                <button className="text-[10px] font-black text-[#0f62fe] uppercase tracking-widest italic hover:underline underline-offset-4">Anchor Chain</button>
              </div>
           </div>
           <div className="overflow-x-auto relative z-10">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-[var(--background)] border-b border-[var(--border)]">
                   <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] italic whitespace-nowrap">Vector ID</th>
                   <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--foreground)] italic whitespace-nowrap">Operation</th>
                   <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] italic whitespace-nowrap">Target Module</th>
                   <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] italic whitespace-nowrap">Auth Node</th>
                   <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] italic whitespace-nowrap">Temporal Stamp</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[var(--border)]">
                 {audits.map((a) => (
                   <tr key={a.id} className="hover:bg-white/[0.02] transition-all font-mono text-[11px] group cursor-default">
                     <td className="px-10 py-8 text-[var(--muted-foreground)] font-black opacity-30 group-hover:opacity-100 transition-opacity italic">{a.id}</td>
                     <td className="px-10 py-8">
                       <div className="flex items-center gap-3">
                         <div className={cn("w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]", a.status === 'Verified' || a.status === 'Success' ? "text-green-500 bg-green-500" : "text-amber-500 bg-amber-500")} />
                         <span className="font-black text-[var(--foreground)] uppercase tracking-tight italic group-hover:text-[#0f62fe] transition-colors">{a.action}</span>
                       </div>
                     </td>
                     <td className="px-10 py-8 font-black text-[var(--muted-foreground)] uppercase tracking-tighter text-xs">{a.module}</td>
                     <td className="px-10 py-8 text-[#0f62fe] font-black uppercase tracking-tighter italic opacity-60 group-hover:opacity-100 transition-opacity">{a.user}</td>
                     <td className="px-10 py-8 text-[var(--muted-foreground)] font-black opacity-30 group-hover:opacity-100 transition-opacity italic">{a.time}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           <div className="p-8 bg-black/20 border-t border-[var(--border)] text-center relative z-10">
              <span className="text-[10px] font-black text-white/5 uppercase tracking-[0.8em] italic">End of Immutable Buffer // Node Stabilized</span>
           </div>
         </div>

         <div className="space-y-8">
            <div className="enterprise-card p-10 bg-[var(--background)] border border-[var(--border)] rounded-sm relative overflow-hidden group shadow-3xl">
               <div className="absolute inset-0 neural-grid opacity-[0.05] pointer-events-none" />
               <h4 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-[0.4em] mb-10 border-b border-[var(--border)] pb-6 italic opacity-50">Neural Chain Origin</h4>
               <div className="space-y-8 relative z-10 font-mono">
                  {[1,2,3,4,5].map(i => (
                     <div key={i} className="flex items-center gap-5 group/item cursor-default">
                        <div className="h-8 w-8 flex items-center justify-center border border-[var(--border)] rounded-sm bg-[var(--card)] group-hover/item:border-[#0f62fe] transition-all relative overflow-hidden">
                           <div className="absolute inset-0 bg-[#0f62fe]/5 group-hover/item:bg-[#0f62fe]/10 transition-colors" />
                           <Fingerprint size={16} className="text-[#0f62fe] opacity-30 group-hover/item:opacity-100 transition-opacity relative z-10" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black text-[var(--muted-foreground)] opacity-20 uppercase tracking-widest italic group-hover/item:opacity-100 transition-all">Block-0x{Math.random().toString(16).slice(2, 6)}</span>
                           <span className="text-[8px] text-[#0f62fe]/40 font-mono">Verified @ {new Date().toLocaleTimeString()}</span>
                        </div>
                     </div>
                  ))}
               </div>
               <button className="w-full mt-10 py-4 bg-[var(--card)] border border-[var(--border)] text-[9px] font-black uppercase tracking-[0.5em] text-[var(--muted-foreground)] italic hover:text-[#0f62fe] hover:border-[#0f62fe]/40 transition-all rounded-sm">
                  View Full Chain
               </button>
            </div>
            
            <div className="enterprise-card p-10 bg-[#0f62fe] text-white rounded-sm shadow-3xl relative overflow-hidden group">
               <div className="absolute bottom-0 right-0 p-6 opacity-20 group-hover:scale-125 transition-transform duration-1000">
                  <Maximize2 size={120} />
               </div>
               <h5 className="text-xl font-black italic tracking-tighter mb-6 leading-tight relative z-10">Integrity Score is currently at 99.4% Across Regions.</h5>
               <p className="text-[11px] font-bold opacity-70 leading-relaxed italic relative z-10 mb-8">Minimal drift detected in non-critical billing partitions.</p>
               <button className="w-full bg-white text-[#0f62fe] py-4 text-[10px] font-black uppercase tracking-[0.3em] rounded-sm italic hover:bg-blue-50 transition-colors shadow-2xl relative z-10">
                  Resynchronize Nodes
               </button>
            </div>
         </div>
      </div>
    </motion.div>
  );
}


function ComplianceRow({ name, risk, status, date }: { name: string; risk: string; status: string; date: string }) {
  return (
    <tr className="hover:bg-[var(--secondary)]/30 transition-all cursor-pointer group border-b border-[var(--border)]">
      <td className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-1.5 w-1.5 rounded-full bg-[#0f62fe]" />
          <span className="text-sm font-black text-[var(--foreground)] tracking-tight uppercase">{name}</span>
        </div>
      </td>
      <td className="p-6">
        <span className={cn(
          "px-4 py-1 text-[10px] font-black rounded-sm uppercase tracking-widest leading-none",
          risk === 'Low' ? "bg-green-500/10 text-green-600" : risk === 'Medium' ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"
        )}>
          {risk}
        </span>
      </td>
      <td className="p-6">
        <div className="flex items-center gap-2">
          {status === 'Compliant' ? <CheckCircle2 size={14} className="text-green-500" /> : <ShieldAlert size={14} className="text-amber-500" />}
          <span className="text-[11px] font-black text-[var(--muted-foreground)] uppercase tracking-tight">{status}</span>
        </div>
      </td>
      <td className="p-6 text-[10px] text-[var(--muted-foreground)] font-mono font-black italic opacity-50">{date}</td>
    </tr>
  );
}

function NavItem({ icon, label, active, onClick, collapsed }: { 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick?: () => void;
  collapsed?: boolean;
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-sm px-3 py-2 transition-all text-left group",
        collapsed && "justify-center px-0",
        active 
          ? "bg-[#0f62fe] text-white font-black shadow-lg shadow-blue-500/10" 
          : "text-[#64748b] hover:bg-[#1a1a1f] hover:text-white"
      )}
    >
      <div className={cn(
        "transition-all duration-300",
        active ? "text-white" : "text-[#64748b] group-hover:text-[#0f62fe]",
        collapsed && "scale-110"
      )}>
        {icon}
      </div>
      {!collapsed && (
        <span className="text-[11px] font-black uppercase tracking-[0.2em] truncate italic">{label}</span>
      )}
    </button>
  );
}

function SettingsView() {
  const [activeTab, setActiveTab] = useState<'neural' | 'compliance' | 'security'>('neural');

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-12"
    >
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none italic font-black text-8xl uppercase tracking-tighter shrink-0">CONFIG</div>
        <div className="flex items-center gap-2">
            <Settings size={14} className="text-[#0f62fe] animate-spin-slow" />
            <span className="text-[10px] font-black text-[#0f62fe] uppercase tracking-[0.4em] leading-none italic">Hardened Parameters</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-[var(--foreground)] uppercase italic leading-none">
          Neural <span className="text-[#0f62fe] underline decoration-[#0f62fe]/30 decoration-8 underline-offset-[12px]">Configuration</span>
        </h1>
        <p className="text-[var(--muted-foreground)] mt-4 font-bold text-sm max-w-2xl leading-relaxed italic">
          Manage link stability, neural weights, and secure cryptographic environments for the <span className="text-[var(--foreground)]">Granite-3.0</span> dense orchestrator. All changes require operator verification.
        </p>
      </div>

      <div className="flex gap-1 border-b border-[var(--border)] relative overflow-hidden backdrop-blur-sm bg-black/10">
        {(['neural', 'compliance', 'security'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative italic overflow-hidden group",
              activeTab === tab ? "text-[#0f62fe]" : "text-[var(--muted-foreground)] hover:text-white"
            )}
          >
            <span className="relative z-10">{tab} Settings</span>
            {activeTab === tab ? (
              <motion.div layoutId="settingTab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0f62fe] shadow-[0_0_20px_#0f62fe]" />
            ) : (
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="enterprise-card p-12 bg-[var(--card)] border border-[var(--border)] rounded-sm space-y-12 relative overflow-hidden shadow-3xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#0f62fe]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="absolute top-0 right-0 p-12 opacity-[0.015] group-hover:opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000">
               <Cpu size={160} />
            </div>
            
            <div className="space-y-10 relative z-10">
               {activeTab === 'neural' && (
                 <>
                   {[
                     { label: 'Reasoning Depth', value: 'High-Density', desc: 'Maximum CoT multi-hop reasoning enabled for complex legacy analysis.' },
                     { label: 'Link Persistence', value: '0.9998 Tau', desc: 'Synchronous socket stability index for real-time decomposition.' },
                     { label: 'Legacy Indexing', value: 'Active', desc: 'Deep-scanning and semantic indexing of partitioned legacy modules.' },
                     { label: 'Temperature Vector', value: '0.12 (C)', desc: 'Stability biased. Minimizing hallucinations in logic extraction.' }
                   ].map((cfg, i) => (
                     <div key={i} className="flex justify-between items-center group/item border-b border-white/5 pb-10 last:border-0 last:pb-0">
                       <div className="max-w-xl">
                         <p className="text-base font-black text-[var(--foreground)] uppercase tracking-tight italic mb-3 group-hover/item:text-[#0f62fe] transition-colors">{cfg.label}</p>
                         <p className="text-xs text-[var(--muted-foreground)] font-bold italic leading-relaxed opacity-60 group-hover/item:opacity-100 transition-opacity">{cfg.desc}</p>
                       </div>
                       <div className="flex flex-col items-end gap-3 shrink-0">
                          <span className="text-[12px] font-mono font-black text-[#0f62fe] bg-[#0f62fe]/5 px-4 py-2 rounded-sm border border-[#0f62fe]/10 group-hover/item:bg-[#0f62fe]/10 transition-all">{cfg.value}</span>
                          <button className="text-[9px] font-black uppercase text-[#0f62fe] tracking-widest hover:underline underline-offset-4">Modify Vector</button>
                       </div>
                     </div>
                   ))}
                 </>
               )}
               {activeTab === 'security' && (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
                     <Lock size={60} className="text-[#0f62fe] animate-pulse" />
                     <div className="space-y-4">
                        <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">Secure Lattice Active</h4>
                        <p className="text-sm text-[var(--muted-foreground)] font-bold italic max-w-md mx-auto leading-relaxed">
                           Cryptographic keys are anchored to the IBM Trust Layer. Multi-factor verification required for partition access.
                        </p>
                     </div>
                     <button className="fintech-btn-primary px-10 py-4 shadow-[0_20px_40px_rgba(15,98,254,0.3)]">Verify Identity Vector</button>
                  </div>
               )}
               {activeTab === 'compliance' && (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
                     <Shield size={60} className="text-[#0f62fe]" />
                     <div className="space-y-4">
                        <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">Policy Enforcement Active</h4>
                        <p className="text-sm text-[var(--muted-foreground)] font-bold italic max-w-md mx-auto leading-relaxed">
                           All automated extractions are validated against PCI-DSS and GDPR protocols in real-time.
                        </p>
                     </div>
                  </div>
               )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="enterprise-card p-10 bg-[#0f62fe] text-white rounded-sm shadow-[0_42px_100px_rgba(15,98,254,0.3)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                 <ShieldCheck size={120} />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-12 opacity-70 italic border-b border-white/20 pb-4">Operator Status</h4>
              <div className="flex flex-col gap-8 relative z-10">
                 <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-full border-2 border-white/20 flex items-center justify-center p-1 bg-white/5">
                       <Fingerprint size={32} className="text-white" />
                    </div>
                    <div>
                       <p className="text-lg font-black italic tracking-tighter leading-none mb-1">Authenticated</p>
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Level 4 Oversight Access</p>
                    </div>
                 </div>
                 <div className="space-y-4 bg-black/20 p-6 rounded-sm border border-white/10">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-80 italic">
                       <span>Link Integrity</span>
                       <span>100%</span>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-white w-full shadow-[0_0_10px_white]" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="enterprise-card p-10 bg-[var(--card)] border border-[var(--border)] rounded-sm group overflow-hidden relative shadow-3xl">
              <div className="absolute inset-0 neural-grid opacity-[0.05] pointer-events-none" />
              <h4 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-[0.4em] mb-8 italic opacity-50">Experimental Flags</h4>
              <div className="space-y-6 relative z-10">
                 {[
                   { label: 'Quantum Resilient Hashing', active: true },
                   { label: 'Auto-Partition Logic', active: false },
                   { label: 'Neural Mirroring', active: true }
                 ].map((flag, i) => (
                   <div key={i} className="flex items-center justify-between group/item">
                      <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest italic group-hover/item:text-[var(--foreground)] transition-colors">{flag.label}</span>
                      <div className={cn(
                        "h-5 w-10 rounded-full p-1 transition-all cursor-pointer relative",
                        flag.active ? "bg-[#0f62fe]" : "bg-[var(--border)]"
                      )}>
                        <div className={cn("h-3 w-3 bg-white rounded-full transition-all shadow-md", flag.active ? "translate-x-5" : "translate-x-0")} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}


function NeuralNetworkStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{ x: number, y: number, vx: number, vy: number, cluster: number }> = [];
    let traffic: Array<{ start: number, end: number, progress: number, speed: number }> = [];
    const clusterCount = 5;
    const particlesPerCluster = 8;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    const init = () => {
      particles = [];
      const clusters = [];
      for (let i = 0; i < clusterCount; i++) {
        clusters.push({
          x: Math.random() * canvas.width * 0.8 + canvas.width * 0.1,
          y: Math.random() * canvas.height * 0.8 + canvas.height * 0.1
        });
      }

      clusters.forEach((c, clusterIdx) => {
        for (let i = 0; i < particlesPerCluster; i++) {
          particles.push({
            x: c.x + (Math.random() - 0.5) * 150,
            y: c.y + (Math.random() - 0.5) * 150,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            cluster: clusterIdx
          });
        }
      });
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Soft boundary attraction to cluster center origin (simplified)
      });

      // Draw connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
          
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.15;
            ctx.strokeStyle = p1.cluster === p2.cluster ? `rgba(15, 98, 254, ${alpha})` : `rgba(255, 255, 255, ${alpha * 0.5})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Traffic simulation
      if (Math.random() < 0.05 && traffic.length < 20) {
        const start = Math.floor(Math.random() * particles.length);
        const end = Math.floor(Math.random() * particles.length);
        if (particles[start].cluster !== particles[end].cluster) {
          traffic.push({ start, end, progress: 0, speed: 0.01 + Math.random() * 0.02 });
        }
      }

      traffic = traffic.filter(t => {
        t.progress += t.speed;
        if (t.progress >= 1) return false;

        const p1 = particles[t.start];
        const p2 = particles[t.end];
        const tx = p1.x + (p2.x - p1.x) * t.progress;
        const ty = p1.y + (p2.y - p1.y) * t.progress;

        ctx.fillStyle = '#0f62fe';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#0f62fe';
        ctx.beginPath();
        ctx.arc(tx, ty, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        return true;
      });

      // Draw cluster cores
      particles.forEach((p, i) => {
        if (i % particlesPerCluster === 0) {
           ctx.fillStyle = '#0f62fe';
           ctx.shadowBlur = 20;
           ctx.shadowColor = '#0f62fe';
           ctx.beginPath();
           ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
           ctx.fill();
           ctx.shadowBlur = 0;
           
           // Region Label simulation
           ctx.font = '9px "JetBrains Mono"';
           ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
           ctx.fillText(`CLUSTER-0x${p.cluster}`, p.x + 10, p.y - 10);
        } else {
           ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
           ctx.beginPath();
           ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
           ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    init();
    draw(0);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 opacity-60">
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent z-10" />
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

function DashboardView() {
  const [stats] = useState([
    { label: 'Modernization Yield', value: '84.2%', delta: '+12.4%', trend: 'up', icon: Zap },
    { label: 'Neural Throughput', value: '1.2 PB/s', delta: 'Nominal', trend: 'neutral', icon: Activity },
    { label: 'Regulatory Coverage', value: '98.1%', delta: '+2.1%', trend: 'up', icon: ShieldCheck },
    { label: 'Logic Leaks', value: '0.00', delta: '-14', trend: 'down', icon: Eye },
  ]);

  const recentEvents = [
    { id: '#4209', task: 'Logic Decomposition', target: 'VaultPro.bin', status: 'Complete', time: '2m ago' },
    { id: '#4208', task: 'Sentinel Scan', target: 'LegacyBilling.java', status: 'Alert', time: '14m ago' },
    { id: '#4207', task: 'Cross-Border Sync', target: 'IBM-EU-C2', status: 'Active', time: '32m ago' },
    { id: '#4206', task: 'Attestation XML', target: 'SEC-17a-4', status: 'Verified', time: '1h ago' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-20"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-[var(--border)] pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] select-none pointer-events-none italic font-black text-9xl uppercase tracking-tighter shrink-0">ORBIT</div>
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
              <Globe size={16} className="text-[#0f62fe] animate-pulse" />
              <span className="text-[11px] font-black text-[#0f62fe] uppercase tracking-[0.5em] leading-none italic">Global Command Substrate v9.4</span>
          </div>
          <h1 className="text-7xl font-black tracking-tight text-[var(--foreground)] uppercase italic leading-none mb-8">
            Neural <span className="text-[#0f62fe]">Command</span>
          </h1>
          <p className="text-[var(--muted-foreground)] font-bold text-lg leading-relaxed italic border-l-4 border-[#0f62fe]/50 pl-10 max-w-2xl shadow-glow-sm">
            Orchestrating the transition from legacy monoliths to elastic neural substrates. IBM Granite provides real-time observability into <span className="text-[var(--foreground)] font-black">logic extraction throughput</span> and modernization debt reduction.
          </p>
        </div>

        <div className="flex items-center gap-8 bg-black/40 border border-[var(--border)] p-8 rounded-sm shadow-2xl relative group">
           <div className="absolute inset-0 bg-[#0f62fe]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.4em] italic mb-2 opacity-40">System Uptime</span>
              <span className="text-3xl font-black italic tracking-tighter text-white">14:22:04:18</span>
           </div>
           <div className="h-12 w-px bg-[var(--border)] mx-4" />
           <div className="p-4 bg-[#0f62fe]/10 rounded-sm">
              <RefreshCw size={20} className="text-[#0f62fe] animate-spin-slow" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="enterprise-card p-12 bg-[var(--card)] border border-[var(--border)] rounded-sm group hover:border-[#0f62fe] transition-all relative overflow-hidden shadow-3xl">
             <div className="absolute inset-0 neural-grid opacity-[0.03] pointer-events-none" />
             <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="p-5 bg-[var(--background)] border border-[var(--border)] rounded-sm group-hover:bg-[#0f62fe]/10 transition-colors shadow-inner">
                   <stat.icon size={28} className="text-[#0f62fe]" />
                </div>
                <div className={cn(
                  "px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest border italic",
                  stat.trend === 'up' ? "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]" : 
                  stat.trend === 'down' ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : 
                  "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                )}>
                  {stat.delta}
                </div>
             </div>
             <p className="text-[11px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.5em] mb-4 italic opacity-40 relative z-10">{stat.label}</p>
             <p className="text-6xl font-black text-[var(--foreground)] tracking-tighter italic relative z-10 group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 enterprise-card p-12 bg-[var(--card)] border border-[var(--border)] rounded-sm min-h-[600px] flex flex-col relative overflow-hidden shadow-3xl">
           <div className="absolute inset-0 neural-grid opacity-[0.02] pointer-events-none" />
           <div className="flex items-center justify-between mb-16 relative z-10">
              <div>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tight leading-none mb-3">Modernization Velocity</h3>
                <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.5em] italic opacity-40">Reasoning units extracted vs. target architecture mapping // Global Cluster Trace</p>
              </div>
              <div className="flex gap-6">
                 <button className="h-12 px-8 text-[11px] font-black uppercase text-[var(--muted-foreground)] border border-[var(--border)] rounded-sm hover:border-[#0f62fe] transition-all italic tracking-[0.2em]">24h Trace</button>
                 <button className="h-12 px-8 text-[11px] font-black uppercase text-white bg-[#0f62fe] rounded-sm italic tracking-[0.2em] shadow-[0_15px_30px_rgba(15,98,254,0.3)]">Active 7d</button>
              </div>
           </div>
           
           <div className="flex-1 min-h-0 relative z-10 -mx-8">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={[
                   { name: 'Mon', value: 400, yield: 240 },
                   { name: 'Tue', value: 300, yield: 139 },
                   { name: 'Wed', value: 500, yield: 980 },
                   { name: 'Thu', value: 278, yield: 390 },
                   { name: 'Fri', value: 489, yield: 880 },
                   { name: 'Sat', value: 239, yield: 580 },
                   { name: 'Sun', value: 349, yield: 730 },
                 ]}>
                    <defs>
                      <linearGradient id="dashboardGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f62fe" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0f62fe" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: '900', letterSpacing: '0.1em' }} dy={15} />
                    <YAxis hide />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0c0c0e', border: '1px solid rgba(15,98,254,0.2)', borderRadius: '2px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                       itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#0f62fe', fontStyle: 'italic' }}
                       cursor={{ stroke: '#0f62fe', strokeWidth: 1 }}
                    />
                    <Area type="monotone" dataKey="yield" stroke="#0f62fe" strokeWidth={5} fill="url(#dashboardGrad)" animationDuration={2000} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-10">
           <div className="enterprise-card p-12 bg-[#0c0c0e] border border-[var(--border)] rounded-sm flex-1 flex flex-col relative overflow-hidden shadow-3xl">
              <div className="absolute inset-0 neural-grid opacity-[0.05] pointer-events-none" />
              <div className="flex items-center justify-between mb-10 relative z-10 border-b border-white/5 pb-8">
                 <h3 className="text-2xl font-black text-white italic uppercase tracking-tight leading-none font-mono">Active Ingress</h3>
                 <Activity size={24} className="text-[#0f62fe] animate-pulse" />
              </div>

              <div className="flex-1 space-y-8 relative z-10 overflow-y-auto custom-scrollbar pr-4">
                 {recentEvents.map((event, i) => (
                   <div key={i} className="flex gap-8 items-start group cursor-pointer hover:translate-x-2 transition-transform">
                      <div className={cn(
                        "h-2 w-2 rounded-full mt-2.5 shrink-0 shadow-[0_0_12px_currentColor]",
                        event.status === 'Complete' ? 'text-green-500 bg-green-500' :
                        event.status === 'Alert' ? 'text-red-500 bg-red-500 animate-pulse' :
                        'text-[#0f62fe] bg-[#0f62fe]'
                      )} />
                      <div className="flex-1 border-b border-white/5 pb-6 group-last:border-0">
                         <div className="flex justify-between items-start mb-3">
                            <span className="text-lg font-black text-[var(--foreground)] uppercase tracking-tighter group-hover:text-[#0f62fe] transition-colors italic leading-none">{event.task}</span>
                            <span className="text-[10px] font-black text-[var(--muted-foreground)] opacity-30 italic">{event.time}</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest opacity-60">ID: {event.id}</span>
                            <div className="h-1 w-1 bg-white/10 rounded-full" />
                            <span className="text-[10px] font-black text-[#0f62fe] uppercase tracking-widest">{event.target}</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>

              <button className="mt-12 w-full h-16 bg-[var(--secondary)] border border-[var(--border)] text-[11px] font-black uppercase tracking-[0.5em] italic rounded-sm hover:border-[#0f62fe] hover:text-[#0f62fe] transition-all group shrink-0 shadow-lg relative overflow-hidden">
                 <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0f62fe] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                 <span className="group-hover:tracking-[0.7em] transition-all relative z-10">Archival Search Matrix</span>
              </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function OrchestratorView() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      <div className="mb-10 border-b border-[#1a1a1f] pb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Workflow size={14} className="text-[#0f62fe]" />
            <span className="text-[10px] font-black text-[#0f62fe] uppercase tracking-[0.3em]">Agent Orchestration Registry</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
            Neural <span className="text-[#0f62fe]">Agents</span>
          </h1>
          <p className="text-[#64748b] mt-4 font-bold text-sm max-w-xl">
            Distributed intelligence nodes built on IBM Granite architecture. Each agent is specialized in specific logic domains.
          </p>
        </div>
        <div className="flex gap-4">
           <div className="px-5 py-3 bg-[#0c0c0e] border border-[#1a1a1f] rounded-sm">
              <span className="text-[11px] font-black text-[#0f62fe] uppercase tracking-widest">Active nodes: 12/15</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <AgentCard 
          name="Neural Miner 01" 
          status="Active" 
          task="Decomposing LegacyBilling.java:412"
          uptime="99.98%"
          type="Logic Extraction"
          efficiency={94}
        />
        <AgentCard 
          name="Risk Sentinel" 
          status="Active" 
          task="Continuous SEC/FINRA cross-validation"
          uptime="100%"
          type="Compliance Reasoner"
          efficiency={98}
        />
        <AgentCard 
          name="Refactor Oracle" 
          status="Idle" 
          task="Awaiting next logic-predicate batch"
          uptime="94.2%"
          type="Modernizer"
          efficiency={82}
        />
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, trend, icon, color = "text-[#0f62fe]", description }: { title: string; value: string; trend: string; icon: React.ReactNode; color?: string; description?: string }) {
  return (
    <div className="enterprise-card p-8 group relative overflow-hidden bg-[#0c0c0e] border-[#1a1a1f] hover:border-[#0f62fe]/30 transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#0f62fe]/5 rounded-bl-[100px] -mr-16 -mt-16 group-hover:bg-[#0f62fe]/10 transition-all duration-700 group-hover:scale-110" />
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className={cn("h-12 w-12 flex items-center justify-center bg-[#050507] rounded-sm group-hover:bg-[#0f62fe] group-hover:text-white transition-all border border-[#1a1a1f] group-hover:shadow-[0_0_20px_rgba(15,98,254,0.3)]", color)}>
          {icon}
        </div>
        <div className={cn(
          "px-3 py-1 bg-black/40 border border-[#1a1a1f] text-[10px] font-black uppercase tracking-widest rounded-sm backdrop-blur-sm", 
          trend.startsWith('+') ? "text-green-500 border-green-500/20" : "text-[#64748b]"
        )}>
          {trend}
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-[11px] text-[#64748b] font-black uppercase tracking-[0.3em] mb-2">{title}</p>
        <p className="text-4xl font-black text-white tracking-tighter italic leading-none">{value}</p>
        <div className="h-[2px] w-8 bg-[#0f62fe] mt-4 mb-3 group-hover:w-20 transition-all duration-500" />
        <p className="text-[10px] text-[#64748b] font-bold opacity-60 uppercase tracking-widest">{description}</p>
      </div>
    </div>
  );
}

function AgentCard({ name, status, task, uptime, type, efficiency }: { name: string; status: string; task: string; uptime: string; type: string; efficiency?: number }) {
  return (
    <div className="enterprise-card p-10 group relative overflow-hidden bg-[#0c0c0e] border-[#1a1a1f] hover:border-[#0f62fe]/40 transition-all group shadow-2xl">
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#0f62fe]/5 rounded-bl-[120px] -mr-20 -mt-20 group-hover:bg-[#0f62fe]/10 transition-all duration-1000 group-hover:scale-125 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 flex items-center justify-center bg-[#050507] text-[#0f62fe] rounded-sm group-hover:bg-[#0f62fe] group-hover:text-white transition-all border border-[#1a1a1f] shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_rgba(15,98,254,0.4)]">
            <Cpu size={32} strokeWidth={1} />
          </div>
          <div>
            <h4 className="font-black text-white text-xl tracking-tighter leading-none italic uppercase">{name}</h4>
            <span className="text-[10px] text-[#0f62fe] font-black uppercase tracking-[0.3em] mt-3 inline-block opacity-80">{type}</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 bg-[#050507] px-4 py-1.5 rounded-sm border border-[#1a1a1f]">
          <div className={cn("w-2 h-2 rounded-full", status === 'Active' ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-[#1a1a1f]")} />
          <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{status}</span>
        </div>
      </div>
      
      <div className="space-y-8 relative z-10">
        <div className="p-6 bg-[#050507] rounded-sm border border-[#1a1a1f] relative group/task overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#0f62fe]/20 group-hover/task:bg-[#0f62fe] transition-all" />
          <p className="text-[10px] text-[#64748b] font-black uppercase tracking-[0.4em] mb-3 opacity-60 italic">Process Stream</p>
          <p className="text-[13px] text-white leading-relaxed font-bold font-mono truncate tracking-tight">{task}</p>
          <div className="absolute top-4 right-4 flex gap-1">
             {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-[#0f62fe] rounded-full animate-bounce" style={{ animationDelay: `${i*0.2}s` }} />)}
          </div>
        </div>
        
        <div>
           <div className="flex items-center justify-between text-[11px] mb-3 uppercase font-black tracking-[0.3em]">
            <span className="text-[#64748b] italic">Reasoning Affinity</span>
            <span className="text-white font-mono">{efficiency || 92}%</span>
          </div>
          <div className="w-full bg-[#1a1a1f] h-[2px] rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${efficiency || 92}%` }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="h-full bg-[#0f62fe] shadow-[0_0_15px_rgba(15,98,254,0.6)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="p-5 bg-black/40 border border-[#1a1a1f] rounded-sm group-hover:border-[#1a1a1f] transition-all">
             <p className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.3em] mb-2 italic">Uptime</p>
             <p className="text-lg font-black text-white italic leading-none font-mono tracking-tighter">{uptime}</p>
           </div>
           <div className="p-5 bg-black/40 border border-[#1a1a1f] rounded-sm group-hover:border-[#1a1a1f] transition-all">
             <p className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.3em] mb-2 italic">Ref Latency</p>
             <p className="text-lg font-black text-[#0f62fe] italic leading-none font-mono tracking-tighter">{Math.floor(Math.random() * 50) + 20}ms</p>
           </div>
        </div>
      </div>

      <div className="mt-10 flex gap-4 relative z-10">
        <button className="flex-1 text-[11px] font-black text-[#64748b] py-4 border border-[#1a1a1f] hover:bg-[#16161a] hover:text-white transition-all uppercase tracking-[0.3em] rounded-sm italic">Recalibrate</button>
        <button className="flex-1 fintech-btn-primary py-4 italic shadow-2xl">Scale Node</button>
      </div>
    </div>
  );
}

function SecurityView() {
  const [activeVulnerability, setActiveVulnerability] = useState<number | null>(null);
  const [scanningLines, setScanningLines] = useState<string[]>([
    "[INFRA] Sentinel engine initialized.",
    "[SCAN] Deep-traversing LegacyBilling.java...",
    "[WARN] Semantic pattern mismatch at line 442.",
  ]);

  const vulnerabilities = [
    { id: 'V-102', module: 'LegacyBilling.java', type: 'SQL Injection', severity: 'Critical', status: 'Flagged', risk: 0.92, vector: 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', impact: 'Financial Data Exposure' },
    { id: 'V-088', module: 'AuthCore.c', type: 'Buffer Overflow', severity: 'High', status: 'Analyzing', risk: 0.78, vector: 'AV:N/AC:L/PR:H/UI:N/S:U/C:L/I:L/A:H', impact: 'Remote Code Execution' },
    { id: 'V-121', module: 'UserSecrets.xml', type: 'Hardcoded Cryptography', severity: 'Medium', status: 'Fix Proposed', risk: 0.45, vector: 'AV:L/AC:H/PR:N/UI:R/S:C/C:H/I:N/A:N', impact: 'Secret Material Leak' },
    { id: 'V-045', module: 'PaymentGateway', type: 'IDOR', severity: 'Low', status: 'Monitoring', risk: 0.12, vector: 'AV:N/AC:M/PR:N/UI:R/S:U/C:L/I:N/A:N', impact: 'Unauthorized Access' },
  ];

  useEffect(() => {
    const logs = [
      "[SENTINEL] Anomaly detected in partition 0x42",
      "[REASONER] Validating predicate logic in ingress...",
      "[IBM Z] Resource isolation triggered for NODE-0x04D",
      "[SCAN] Bytecode analysis of VaultPro.bin: 84% complete",
      "[META] Syncing threat vectors with Global Fabric",
    ];
    let i = 0;
    const interval = setInterval(() => {
      setScanningLines(prev => [...prev.slice(-3), logs[i % logs.length]]);
      i++;
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-20"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-[var(--border)] pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none italic font-black text-9xl uppercase tracking-tighter">SENTINEL</div>
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={14} className="text-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] leading-none italic">Neural Threat Abstraction</span>
          </div>
          <h1 className="text-6xl font-black tracking-tight text-[var(--foreground)] uppercase italic leading-none mb-6">
            Threat <span className="text-red-600">Sentinel</span>
          </h1>
          <p className="text-[var(--muted-foreground)] font-bold text-sm leading-relaxed italic border-l-2 border-red-500/50 pl-6">
            Proactive semantic scanning of legacy substrates. IBM Granite identifies <span className="text-[var(--foreground)]">zero-day vulnerabilities</span> by reasoning over absolute code logic, mapping exploits before they are weaponized.
          </p>
        </div>

        <div className="flex flex-col gap-4 font-mono">
           <div className="flex items-center gap-3 text-[10px] text-red-500 font-black uppercase tracking-widest italic">
              <RefreshCw size={12} className="animate-spin" /> Live Scanning Matrix
           </div>
           <div className="bg-black/60 border border-red-900/20 p-6 rounded-sm space-y-2 min-w-[320px]">
              {scanningLines.map((line, idx) => (
                <div key={idx} className="text-[10px] text-red-500/60 font-medium italic truncate">
                   {line}
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vulnerabilities.map((v, i) => (
              <motion.div 
                key={v.id} 
                onClick={() => setActiveVulnerability(i)}
                className={cn(
                  "enterprise-card p-10 flex flex-col bg-[var(--card)] border transition-all cursor-pointer relative overflow-hidden group",
                  activeVulnerability === i ? "border-red-500 ring-1 ring-red-500/20" : "border-[var(--border)] hover:border-red-500/50"
                )}
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                   <Shield size={48} className="text-red-500" />
                </div>
                
                <div className="flex justify-between items-start mb-10">
                   <div className={cn(
                     "px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest border",
                     v.severity === 'Critical' ? "bg-red-500 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                   )}>
                      {v.severity}
                   </div>
                   <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest opacity-40 italic">ID://{v.id}</span>
                </div>

                <h3 className="font-black text-[var(--foreground)] text-2xl tracking-tighter uppercase italic leading-none mb-4 group-hover:text-red-500 transition-colors">
                  {v.type}
                </h3>
                
                <div className="flex items-center gap-2 mb-10">
                   <FileCode2 size={12} className="text-[#0f62fe]" />
                   <span className="text-[10px] text-[var(--muted-foreground)] font-black uppercase tracking-widest">{v.module}</span>
                </div>

                <div className="space-y-8 mt-auto">
                   <div className="flex justify-between items-end">
                      <div>
                         <p className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-widest italic mb-2">Neural Probability</p>
                         <p className={cn("text-3xl font-black italic tracking-tighter leading-none", v.risk > 0.8 ? "text-red-500 font-black" : "text-amber-500")}>
                           {(v.risk * 100).toFixed(0)}%
                         </p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-widest italic mb-2">CVSS V3</p>
                         <p className="text-sm font-mono text-[var(--foreground)] uppercase font-bold opacity-60 italic">{v.severity === 'Critical' ? '9.8' : '7.5'}</p>
                      </div>
                   </div>
                   <div className="h-1 bg-[var(--background)] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${v.risk * 100}%` }}
                        className={cn("h-full", v.risk > 0.8 ? "bg-red-500 shadow-[0_0_10px_#ef4444]" : "bg-amber-500")}
                      />
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <AnimatePresence mode="wait">
              {activeVulnerability !== null ? (
                <motion.div 
                  key="vuln-detail"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="enterprise-card p-10 bg-red-600 text-white rounded-sm h-[650px] flex flex-col relative overflow-hidden shadow-3xl"
                >
                   <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-1000 rotate-12">
                      <ShieldAlert size={200} />
                   </div>
                   
                   <div className="relative z-10 flex-1">
                      <div className="flex items-center gap-3 mb-10 border-b border-white/20 pb-6">
                         <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">Vulnerability Context</span>
                      </div>
                      
                      <h4 className="text-4xl font-black italic tracking-tighter uppercase leading-tight mb-8">
                        {vulnerabilities[activeVulnerability].type}
                      </h4>

                      <div className="grid grid-cols-1 gap-10">
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60 mb-3 italic">Impact Vector</p>
                            <p className="text-xl font-bold italic tracking-tight">{vulnerabilities[activeVulnerability].impact}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60 mb-5 italic">Logic Decoupling Suggestion</p>
                            <div className="bg-black/20 p-6 rounded-sm space-y-4 border border-white/10 italic">
                               <p className="text-xs font-bold leading-relaxed">
                                 "Granite reasoner has identified a tainted input flow that propagates to the database layer. Recommendation: Decouple the predicate logic and wrap in a Sentinel isolation container."
                               </p>
                            </div>
                         </div>
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60 mb-3 italic">Audit ID</p>
                            <p className="text-sm font-mono font-black italic tracking-widest">{vulnerabilities[activeVulnerability].id}-GT-2024</p>
                         </div>
                      </div>
                   </div>

                   <div className="relative z-10 space-y-4 shrink-0 mt-8">
                      <button className="w-full py-5 bg-white text-red-600 text-[11px] font-black uppercase tracking-[0.3em] italic rounded-sm hover:-translate-y-1 transition-all shadow-2xl active:scale-95">
                         Execute Sentinel Patch
                      </button>
                      <button 
                        onClick={() => setActiveVulnerability(null)}
                        className="w-full py-4 border border-white/20 text-[10px] font-black uppercase tracking-[0.3em] italic rounded-sm hover:bg-white/10 transition-all font-bold"
                      >
                         Dismiss Report
                      </button>
                   </div>
                </motion.div>
              ) : (
                <div className="space-y-8">
                   <div className="enterprise-card p-10 bg-[var(--card)] border border-[var(--border)] rounded-sm h-[300px] flex flex-col justify-center items-center text-center space-y-6 italic relative overflow-hidden group">
                      <div className="absolute inset-0 neural-grid opacity-[0.03] pointer-events-none" />
                      <div className="p-10 bg-red-500/5 border border-red-500/20 rounded-full group-hover:scale-110 transition-transform duration-700">
                        <Lock size={64} className="text-red-500/30" />
                      </div>
                      <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.3em] leading-relaxed max-w-[200px]">
                        Select threat node for deep semantic resonance.
                      </p>
                   </div>

                   <div className="enterprise-card p-10 bg-black/40 border border-[#0f62fe]/20 rounded-sm flex flex-col gap-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-5">
                         <Shield size={64} className="text-[#0f62fe]" />
                      </div>
                      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                         <div className="h-12 w-12 rounded-sm bg-[#0f62fe] flex items-center justify-center font-black text-xl text-white italic">B</div>
                         <div>
                            <h4 className="text-[10px] font-black text-[#0f62fe] uppercase tracking-[0.4em] mb-1 italic">Bob's Security Insight</h4>
                            <p className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-widest italic opacity-50">Sentient Sentinel Thread</p>
                         </div>
                      </div>
                      <p className="text-xs font-bold text-[var(--foreground)]/80 italic leading-relaxed">
                        "The pattern matching in LegacyBilling.java is highly recursive. Granite suggests that standard WAF rules won't catch this—it's a logic-level exploit. We should proceed with decommissioning that predicate immediately."
                      </p>
                   </div>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function FeedbackModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [type, setType] = useState<'suggestion' | 'bug'>('suggestion');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, email }),
      });
      
      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setMessage('');
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-[var(--card)] border border-[var(--border)] p-10 rounded-sm shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0f62fe] via-blue-400 to-transparent opacity-50" />
            
            <div className="flex justify-between items-start mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={14} className="text-[#0f62fe]" />
                  <span className="text-[10px] font-black text-[#0f62fe] uppercase tracking-[0.4em]">User Feedback Loop</span>
                </div>
                <h2 className="text-3xl font-black text-[var(--foreground)] uppercase italic tracking-tighter">Submit <span className="text-[#0f62fe]">Insight</span></h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-[var(--secondary)] rounded-sm transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <X size={20} />
              </button>
            </div>

            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12 text-center"
              >
                <div className="h-16 w-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <h3 className="text-xl font-black text-[var(--foreground)] uppercase italic mb-2 tracking-tight">Transmission Successful</h3>
                <p className="text-[var(--muted-foreground)] font-bold text-sm">Neural entry recorded. Thank you for the synchronization.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex gap-4 p-1 bg-[var(--background)] border border-[var(--border)] rounded-sm">
                  {(['suggestion', 'bug'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-sm italic",
                        type === t ? "bg-[#0f62fe] text-white shadow-lg shadow-blue-500/20" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      )}
                    >
                      {t === 'suggestion' ? 'Suggestion' : 'Bug Report'}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.3em] italic">Operator ID (Email)</label>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@granite.neural"
                    className="w-full bg-[var(--background)] border border-[var(--border)] p-4 text-[13px] font-bold text-[var(--foreground)] focus:ring-1 focus:ring-[#0f62fe] outline-none rounded-sm placeholder:opacity-10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.3em] italic">Semantic Payload</label>
                  <textarea 
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your insight or report a logic failure..."
                    rows={4}
                    className="w-full bg-[var(--background)] border border-[var(--border)] p-5 text-[13px] font-bold text-[var(--foreground)] focus:ring-1 focus:ring-[#0f62fe] outline-none rounded-sm resize-none placeholder:opacity-10 leading-relaxed"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || !message.trim() || !email.trim()}
                  className="fintech-btn-primary w-full py-5 flex items-center justify-center gap-4 disabled:opacity-20 transition-all shadow-2xl italic group"
                >
                  <Zap size={18} className={cn("fill-white transition-transform", isSubmitting && "animate-pulse")} />
                  {isSubmitting ? 'Uplinking...' : 'Execute Submission'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function CommandPalette({ 
  isOpen, 
  onClose, 
  onSelectAction 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSelectAction: (section: Section) => void;
}) {
  const [query, setQuery] = useState('');
  
  const actions: { icon: React.ReactNode; label: string; cmd: string; section?: Section; shortcut?: string }[] = [
    { icon: <LayoutDashboard size={16} />, label: 'Neural Dashboard', cmd: 'NAV_DASHBOARD', section: 'dashboard', shortcut: 'D' },
    { icon: <Workflow size={16} />, label: 'Logic Orchestrator', cmd: 'NAV_ORCHESTRATOR', section: 'agents', shortcut: 'O' },
    { icon: <Globe size={16} />, label: 'Global Cluster', cmd: 'NAV_INFRA', section: 'infrastructure', shortcut: 'I' },
    { icon: <FileCode2 size={16} />, label: 'Legacy Explorer', cmd: 'NAV_EXPLORER', section: 'explorer', shortcut: 'E' },
    { icon: <MessageSquare size={16} />, label: 'Reasoning Console', cmd: 'NAV_CHAT', section: 'chat', shortcut: 'C' },
    { icon: <ShieldAlert size={16} />, label: 'Security Audit', cmd: 'NAV_SECURITY', section: 'security', shortcut: 'S' },
    { icon: <TrendingUp size={16} />, label: 'Financial Delta', cmd: 'NAV_FINANCE', section: 'finance', shortcut: 'F' },
    { icon: <FlaskConical size={16} />, label: 'Module Decomposer', cmd: 'NAV_LAB', section: 'logic-lab', shortcut: 'L' },
    { icon: <Database size={16} />, label: 'Knowledge Lattice', cmd: 'NAV_GRAPH', section: 'logic-graph', shortcut: 'G' },
    { icon: <ShieldCheck size={16} />, label: 'Compliance Matrix', cmd: 'NAV_COMPLIANCE', section: 'compliance', shortcut: 'K' },
    { icon: <Terminal size={16} />, label: 'Execute System Scrub', cmd: 'EXEC_SCRUB' },
    { icon: <Zap size={16} />, label: 'Force Neural Sync', cmd: 'FORCE_SYNC' },
  ];

  const filteredActions = actions.filter(a => 
    a.label.toLowerCase().includes(query.toLowerCase()) || 
    a.cmd.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -20 }}
            className="w-full max-w-2xl bg-[#0c0c0e] border border-white/10 rounded-sm shadow-[0_50px_150px_rgba(15,98,254,0.3)] relative overflow-hidden flex flex-col max-h-[60vh]"
          >
            <div className="p-8 border-b border-white/5 flex items-center gap-6">
              <Search size={20} className="text-[#0f62fe]" />
              <input 
                autoFocus
                placeholder="EXECUTE GLOBAL COMMAND OR SEARCH MODULES..." 
                className="bg-transparent border-none outline-none text-xl font-black italic tracking-tighter text-white placeholder:text-white/10 w-full uppercase"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="px-3 py-1 bg-white/5 rounded-sm border border-white/10 shrink-0">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">ESC TO ABORT</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
              {filteredActions.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] italic">No matching logic vectors found</p>
                </div>
              ) : (
                filteredActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (action.section) onSelectAction(action.section);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#0f62fe]/10 rounded-sm group transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center group-hover:border-[#0f62fe] transition-colors">
                        <div className="text-[var(--muted-foreground)] group-hover:text-[#0f62fe] transition-colors">{action.icon}</div>
                      </div>
                      <div className="text-left">
                        <p className="text-[13px] font-black text-white uppercase italic tracking-tighter group-hover:text-[#0f62fe] transition-colors">{action.label}</p>
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] font-mono mt-1">{action.cmd}</p>
                      </div>
                    </div>
                    {action.shortcut && (
                      <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-sm group-hover:border-[#0f62fe]/30 transition-colors">
                        <span className="text-[10px] font-bold text-white/30 group-hover:text-[#0f62fe]">{action.shortcut}</span>
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
            
            <div className="p-4 bg-black/50 border-t border-white/5 flex items-center justify-between text-[9px] font-black text-white/20 uppercase tracking-widest italic">
              <div className="flex gap-6">
                <span>↑↓ Navigate</span>
                <span>Enter to Select</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#0f62fe]">Granite Terminal</span>
                <span className="opacity-40">v4.2.0-STABLE</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'alert' | 'success';
}

function ToastSystem({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-10 right-10 z-[300] flex flex-col gap-4 pointer-events-none w-96">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto group relative"
          >
            <div className={cn(
              "p-6 bg-[#0c0c0e]/95 backdrop-blur-xl border-l-[4px] border border-white/10 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden",
              toast.type === 'alert' ? "border-l-red-500 border-red-500/20" : 
              toast.type === 'success' ? "border-l-green-500 border-green-500/20" : 
              "border-l-[#0f62fe] border-[#0f62fe]/20"
            )}>
              <div className="absolute inset-0 neural-grid opacity-[0.03]" />
              
              <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="flex items-center gap-3">
                  {toast.type === 'alert' ? <AlertTriangle size={14} className="text-red-500" /> : 
                   toast.type === 'success' ? <CheckCircle2 size={14} className="text-green-500" /> : 
                   <Info size={14} className="text-[#0f62fe]" />}
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.3em]",
                    toast.type === 'alert' ? "text-red-500" : 
                    toast.type === 'success' ? "text-green-500" : 
                    "text-[#0f62fe]"
                  )}>
                    {toast.type === 'alert' ? 'System Violation' : 
                     toast.type === 'success' ? 'Neural Sync Complete' : 
                     'Logic Ingress'}
                  </span>
                </div>
                <button 
                  onClick={() => removeToast(toast.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
              
              <p className="text-[12px] font-bold text-white/90 leading-relaxed italic relative z-10">{toast.message}</p>
              
              <div className="mt-4 flex items-center justify-between text-[9px] font-black text-white/10 uppercase tracking-widest relative z-10">
                <span>{new Date().toLocaleTimeString()}</span>
                <span className="font-mono">ID: {toast.id}</span>
              </div>
            </div>
            
            {/* Ambient Glow */}
            <div className={cn(
              "absolute -inset-1 blur-2xl opacity-10 pointer-events-none",
              toast.type === 'alert' ? "bg-red-500" : 
              toast.type === 'success' ? "bg-green-500" : 
              "bg-[#0f62fe]"
            )} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function InfrastructureView() {
  const [nodes, setNodes] = useState([
    { id: 'NODE-0x01A', region: 'IBM-EAST-Z1', load: 42, temp: 32, status: 'Optimal', type: 'Granite-Dense', uptime: '99.99%', latency: '2ms' },
    { id: 'NODE-0x02B', region: 'IBM-WEST-Z4', load: 68, temp: 38, status: 'Active', type: 'Granite-Lattice', uptime: '99.98%', latency: '14ms' },
    { id: 'NODE-0x03C', region: 'IBM-ASIA-S1', load: 12, temp: 28, status: 'Optimal', type: 'Granite-Dense', uptime: '99.99%', latency: '42ms' },
    { id: 'NODE-0x04D', region: 'IBM-EU-C2', load: 91, temp: 52, status: 'Critical', type: 'Granite-Dense', uptime: '94.20%', latency: '8ms' },
    { id: 'NODE-0x05E', region: 'IBM-LATAM-V1', load: 24, temp: 30, status: 'Active', type: 'Granite-Lattice', uptime: '99.95%', latency: '56ms' },
    { id: 'NODE-0x06F', region: 'IBM-META-DX', load: 31, temp: 29, status: 'Optimal', type: 'Quantum-Safe', uptime: '100.00%', latency: '1ms' },
  ]);

  const [telemetry, setTelemetry] = useState<any[]>([]);

  useEffect(() => {
    const data = Array.from({ length: 20 }, (_, i) => ({
      time: i,
      throughput: Math.floor(Math.random() * 500) + 200,
      errors: Math.floor(Math.random() * 10),
    }));
    setTelemetry(data);

    const interval = setInterval(() => {
      setNodes(prev => prev.map(n => ({
        ...n,
        load: Math.min(100, Math.max(0, n.load + (Math.random() * 10 - 5))),
        temp: Math.min(80, Math.max(20, n.temp + (Math.random() * 2 - 1))),
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-20"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-[var(--border)] pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none italic font-black text-8xl uppercase tracking-tighter shrink-0">MESH</div>
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
              <Globe size={14} className="text-[#0f62fe] animate-pulse" />
              <span className="text-[10px] font-black text-[#0f62fe] uppercase tracking-[0.4em] leading-none italic">Global Substrate Level 4</span>
          </div>
          <h1 className="text-6xl font-black tracking-tight text-[var(--foreground)] uppercase italic leading-none mb-6">
            Neural <span className="text-[#0f62fe]">Infrastructure</span>
          </h1>
          <p className="text-[var(--muted-foreground)] font-bold text-sm leading-relaxed italic border-l-2 border-[#0f62fe] pl-6">
            Observing the elastic compute fabric. Orchestrating Granite logic across <span className="text-[var(--foreground)]">distributed Z-Series mainframe clusters</span> with zero-latency lattice synchronization.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
           {[
             { label: 'Total Throughput', value: '4.2 PB/s', icon: Zap },
             { label: 'Packet Drift', value: '0.002ms', icon: Activity },
             { label: 'Active Clusters', value: '14,209', icon: Layers },
             { label: 'Mesh Integrity', value: '99.99%', icon: HardDrive },
           ].map((stat, i) => (
             <div key={i} className="space-y-1">
                <div className="flex items-center gap-2 text-[#0f62fe]/50 mb-2">
                  <stat.icon size={12} />
                  <span className="text-[9px] font-black uppercase tracking-widest italic">{stat.label}</span>
                </div>
                <div className="text-2xl font-black italic tracking-tighter text-[var(--foreground)] leading-none">{stat.value}</div>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nodes.map((node, i) => (
                <div key={i} className="enterprise-card p-8 bg-[var(--card)]/50 backdrop-blur-xl border border-[var(--border)] rounded-sm group hover:border-[#0f62fe] transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                     <Cpu size={48} className="text-[#0f62fe]" />
                  </div>
                  
                  <div className="flex justify-between items-start mb-10">
                     <div>
                        <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tighter italic mb-1 uppercase leading-none">{node.id}</h3>
                        <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest italic flex items-center gap-2">
                          <MapPin size={10} className="text-[#0f62fe]" />
                          {node.region}
                        </p>
                     </div>
                     <div className={cn(
                        "px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border",
                        node.status === 'Optimal' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                        node.status === 'Active' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : 
                        "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                     )}>
                        {node.status}
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="space-y-3">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest italic">
                           <span className="text-[var(--muted-foreground)]">Neural Load</span>
                           <span className={cn(node.load > 85 ? "text-red-500" : "text-[#0f62fe]")}>{node.load.toFixed(1)}%</span>
                        </div>
                        <div className="h-1 bg-[var(--background)] rounded-full overflow-hidden">
                           <motion.div 
                              animate={{ width: `${node.load}%` }}
                              className={cn("h-full transition-colors", node.load > 85 ? "bg-red-500 shadow-[0_0_10px_#ef4444]" : "bg-[#0f62fe]")}
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-3 gap-6">
                        <div>
                           <p className="text-[8px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-1 italic opacity-50">Thermal</p>
                           <p className="text-sm font-black italic text-[var(--foreground)]">{node.temp.toFixed(1)}°C</p>
                        </div>
                        <div>
                           <p className="text-[8px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-1 italic opacity-50">Uptime</p>
                           <p className="text-sm font-black italic text-[var(--foreground)]">{node.uptime}</p>
                        </div>
                        <div>
                           <p className="text-[8px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-1 italic opacity-50">Latency</p>
                           <p className="text-sm font-black italic text-[#0f62fe]">{node.latency}</p>
                        </div>
                     </div>
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-8">
           <div className="enterprise-card p-10 bg-[var(--card)]/80 backdrop-blur-2xl border border-[var(--border)] rounded-sm h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-black uppercase tracking-tight italic text-[var(--foreground)]">Cluster Throughput</h3>
                 <Activity size={16} className="text-[#0f62fe]" />
              </div>
              <div className="flex-1 min-h-0 -mx-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetry}>
                    <defs>
                      <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f62fe" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0f62fe" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', borderRadius: '4px' }}
                      itemStyle={{ color: '#0f62fe', fontWeight: '900', textTransform: 'uppercase' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="throughput" 
                      stroke="#0f62fe" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorThroughput)" 
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="enterprise-card p-10 bg-black/40 border border-[#0f62fe]/20 rounded-sm flex flex-col gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                 <Shield size={64} className="text-[#0f62fe]" />
              </div>
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                 <div className="h-12 w-12 rounded-sm bg-[#0f62fe] flex items-center justify-center font-black text-xl text-white italic">B</div>
                 <div>
                    <h4 className="text-[10px] font-black text-[#0f62fe] uppercase tracking-[0.4em] mb-1 italic">Bob's Diagnostic Channel</h4>
                    <p className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-widest italic opacity-50">Secure Uplink Established</p>
                 </div>
              </div>
              <p className="text-xs font-bold text-[var(--foreground)]/80 italic leading-relaxed">
                "Noticing thermal spikes in EU-C2. Lattice drift is minimal but predicting a cache miss cascade if EU-C2 remains in critical load. Initiating shadow migration to IBM-META-DX clusters."
              </p>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Auto-Mitigation Status</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-2 py-0.5 rounded-sm">Enabled</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Encryption Standard</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--foreground)]">FIPS-140-3</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function ExplorerView({ onDecompose }: { onDecompose: () => void }) {
  const [selectedFile, setSelectedFile] = useState<number | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'logic' | 'docs' | 'tests'>('logic');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiDocs, setAiDocs] = useState<string>('');
  const [aiTests, setAiTests] = useState<string>('');
  const [isGeneratingDocs, setIsGeneratingDocs] = useState(false);
  const [isGeneratingExplorerTests, setIsGeneratingExplorerTests] = useState(false);

  const toggleNode = (nodeName: string) => {
    setExpandedNodes(prev => 
      prev.includes(nodeName) ? prev.filter(n => n !== nodeName) : [...prev, nodeName]
    );
  };

  const handleAction = async (type: 'docs' | 'tests') => {
    if (selectedFile === null) return;
    const file = files[selectedFile];
    setActiveTab(type);

    if (type === 'docs') {
      setIsGeneratingDocs(true);
      setAiDocs('');
      try {
        if (!AI_CLIENT) { setAiDocs('ERROR: API key not configured. Add GEMINI_API_KEY to your environment.'); return; }
        const response = await AI_CLIENT.models.generateContent({
          model: MODEL_ID,
          contents: [{ role: 'user', parts: [{ text: `Generate documentation for this file: ${file.name}\n\nCode:\n${file.code}` }] }],
          config: { systemInstruction: AI_SYSTEM_PROMPTS.docGenerator, temperature: 0.2 }
        });
        setAiDocs(response.text || 'No documentation generated.');
      } catch (e) {
        setAiDocs('ERROR: Failed to generate documentation. Check your API key.');
        console.error(e);
      } finally {
        setIsGeneratingDocs(false);
      }
    }

    if (type === 'tests') {
      setIsGeneratingExplorerTests(true);
      setAiTests('');
      try {
        if (!AI_CLIENT) { setAiTests('// ERROR: API key not configured. Add GEMINI_API_KEY to your environment.'); return; }
        const response = await AI_CLIENT.models.generateContent({
          model: MODEL_ID,
          contents: [{ role: 'user', parts: [{ text: `Generate a complete unit test suite for this file: ${file.name}\n\nCode:\n${file.code}` }] }],
          config: { systemInstruction: AI_SYSTEM_PROMPTS.testGenerator, temperature: 0.1 }
        });
        setAiTests(response.text || '// No tests generated.');
      } catch (e) {
        setAiTests('// ERROR: Failed to generate tests. Check your API key.');
        console.error(e);
      } finally {
        setIsGeneratingExplorerTests(false);
      }
    }
  };

  const files = [
    { 
      name: 'CoreBilling.java', 
      type: 'java', 
      size: '14.2kb', 
      status: 'Analyzed', 
      risk: 'Low', 
      extraction: 0.98, 
      code: 'public class CoreBilling {\n  private final Ledger ledger;\n  \n  public void processTransaction(Transaction tx) {\n    // Legacy logic needs decoupling\n    validate(tx);\n    dispatchToLedger(tx);\n  }\n}',
      nodes: [
        { id: 'ledger-sync', name: 'Ledger Synchronization', type: 'Database Proxy', coverage: 1.00, complexity: 'O(log N)' },
        { id: 'tx-validator', name: 'Transaction Validator', type: 'Predicate Logic', coverage: 0.96, complexity: 'O(1)' },
        { id: 'err-boundary', name: 'Error Boundary', type: 'Exception Handler', coverage: 0.85, complexity: 'O(N)' }
      ]
    },
    { 
      name: 'AuthInterceptor.c', 
      type: 'c', 
      size: '8.1kb', 
      status: 'Scanning', 
      risk: 'Medium', 
      extraction: 0.42, 
      code: '#include <auth.h>\n\nint main_auth_path() {\n  // Vulnerable pointer arithmetic detected\n  char *buf = malloc(1024);\n  ...\n}',
      nodes: [
        { id: 'ptr-arith', name: 'Pointer Arithmetic Engine', type: 'Memory Vector', coverage: 0.12, complexity: 'High' },
        { id: 'auth-stack', name: 'Identity Stack', type: 'Auth Logic', coverage: 0.65, complexity: 'Medium' }
      ]
    },
    { 
      name: 'LegacyPricing.plsql', 
      type: 'sql', 
      size: '24.5kb', 
      status: 'Opaque', 
      risk: 'High', 
      extraction: 0.00, 
      code: 'CREATE OR REPLACE PROCEDURE calc_price AS\nBEGIN\n  -- Opaque business rules\n  UPDATE prices SET val = val * 1.2;\nEND;',
      nodes: [
        { id: 'price-engine', name: 'Legacy Price Engine', type: 'SQL Trigger', coverage: 0.00, complexity: 'Unknown' }
      ]
    },
    { 
      name: 'PricingPredicates.xml', 
      type: 'xml', 
      size: '1.2kb', 
      status: 'Extracted', 
      risk: 'None', 
      extraction: 1.00, 
      code: '<predicate id="PR-01">\n  <logic>\n    <if condition="tier == GOLD" />\n  </logic>\n</predicate>',
      nodes: [
        { id: 'tier-logic', name: 'Tiering Predicate', type: 'XML DSL', coverage: 1.00, complexity: 'Literal' }
      ]
    },
    { 
      name: 'UserGate.cbl', 
      type: 'cobol', 
      size: '42.1kb', 
      status: 'Decomposing', 
      risk: 'Critical', 
      extraction: 0.12, 
      code: 'IDENTIFICATION DIVISION.\nPROGRAM-ID. USERGATE.\n...\nWORKING-STORAGE SECTION.',
      nodes: [
        { id: 'env-div', name: 'Environment Division', type: 'Bootstrap', coverage: 0.45, complexity: 'Static' },
        { id: 'data-seg', name: 'Data Segment Mapping', type: 'Memory Layout', coverage: 0.05, complexity: 'Critical' }
      ]
    },
    { 
      name: 'GlobalConstants.h', 
      type: 'h', 
      size: '2.4kb', 
      status: 'Analyzed', 
      risk: 'Low', 
      extraction: 0.89, 
      code: '#define MAX_SESSIONS 1024\n#define AUTH_KEY "SENTINEL_01"',
      nodes: [
        { id: 'const-map', name: 'Constant Mapping', type: 'Header Macro', coverage: 1.00, complexity: 'O(1)' }
      ]
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-20"
    >
       <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-[var(--border)] pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none italic font-black text-9xl uppercase tracking-tighter">SOURCE</div>
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-4">
              <FileCode2 size={14} className="text-[#0f62fe]" />
              <span className="text-[10px] font-black text-[#0f62fe] uppercase tracking-[0.4em] leading-none italic">Semantic Module Ingestion v9.2</span>
          </div>
          <h1 className="text-6xl font-black tracking-tight text-[var(--foreground)] uppercase italic leading-none mb-6">
            Legacy <span className="text-[#0f62fe]">Explorer</span>
          </h1>
          <p className="text-[var(--muted-foreground)] font-bold text-sm leading-relaxed italic border-l-2 border-[#0f62fe]/50 pl-6">
            High-resolution map of monolithic source vectors. IBM Granite prioritizes modernization targets by analyzing <span className="text-[var(--foreground)]">recursive pointer depth</span> and business logic density.
          </p>
        </div>

        <div className="flex gap-6 items-center">
           {[
             { label: 'COBOL', count: 12, color: 'text-amber-500' },
             { label: 'C/C++', count: 42, color: 'text-blue-500' },
             { label: 'Java', count: 89, color: 'text-red-500' },
           ].map((stat, i) => (
             <div key={i} className="flex flex-col items-center border border-[var(--border)] px-6 py-4 rounded-sm bg-[var(--card)]">
                <span className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-widest italic mb-1">{stat.label}</span>
                <span className={cn("text-xl font-black italic tracking-tighter", stat.color)}>{stat.count}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-3 space-y-8">
            <div className="enterprise-card p-10 bg-[var(--card)] border border-[var(--border)] rounded-sm space-y-8 relative overflow-hidden">
               <div className="absolute inset-0 neural-grid opacity-[0.03] pointer-events-none" />
               <h3 className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.4em] italic mb-6 border-b border-[var(--border)] pb-4 opacity-50">Topology Map</h3>
               <div className="space-y-4 relative z-10">
                  {['src/legacy', 'main/cobol', 'infra/auth', 'modules/billing', 'audit/logs'].map((folder, i) => (
                     <div key={i} className="flex items-center gap-4 p-4 hover:bg-[#0f62fe]/5 border border-transparent hover:border-[#0f62fe]/20 rounded-sm cursor-pointer group transition-all">
                        <div className="h-8 w-8 flex items-center justify-center border border-[var(--border)] rounded-sm group-hover:border-[#0f62fe] transition-colors bg-[var(--background)] shadow-lg">
                           <ChevronRight size={12} className="text-[#64748b] group-hover:text-[#0f62fe] transition-colors" />
                        </div>
                        <span className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-[0.3em] italic group-hover:text-[#0f62fe] transition-colors">{folder}</span>
                     </div>
                  ))}
               </div>
               
               <div className="pt-10 border-t border-[var(--border)]">
                  <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-sm space-y-4">
                     <div className="flex items-center gap-3">
                        <AlertTriangle size={14} className="text-red-500 animate-pulse" />
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">Critical Path Block</span>
                     </div>
                     <p className="text-[10px] font-bold text-red-500/70 leading-relaxed italic uppercase tracking-tighter">
                       "UserGate.cbl" contains non-deterministic logic gates. Extraction accuracy degraded.
                     </p>
                  </div>
               </div>
            </div>
         </div>

         <div className="lg:col-span-9 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[800px]">
            <div className={cn(
               "enterprise-card bg-[var(--card)] border-[var(--border)] rounded-sm overflow-hidden shadow-2xl flex flex-col relative transition-all duration-700",
               selectedFile !== null ? "lg:col-span-6" : "lg:col-span-12"
            )}>
               <div className="absolute inset-0 neural-grid opacity-[0.02] pointer-events-none" />
               <div className="p-8 border-b border-[var(--border)] bg-black/40 backdrop-blur-md flex items-center justify-between shrink-0 relative z-10">
                  <div className="flex items-center gap-6">
                     <TerminalIcon size={24} className="text-[#0f62fe]" />
                     <div>
                        <h3 className="font-black text-2xl text-[var(--foreground)] uppercase tracking-tight italic leading-none">Module Index</h3>
                        <p className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mt-2 italic opacity-40">Total vectors identified: 142</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="px-6 py-3 border border-white/5 rounded-sm bg-black/40 flex items-center gap-4 shadow-inner">
                        <Search size={14} className="text-[#64748b]" />
                        <input type="text" placeholder="Filter..." className="bg-transparent text-[10px] font-black uppercase outline-none w-32 placeholder:opacity-20 text-white" />
                     </div>
                  </div>
               </div>
               
               <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                  <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[var(--background)] border-b border-[var(--border)] sticky top-0 z-20">
                           <th className="px-10 py-6 text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-[0.4em] italic leading-none">Identity Vector</th>
                           <th className="px-10 py-6 text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-[0.4em] italic leading-none">Neural State</th>
                           <th className="px-10 py-6 text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-[0.4em] italic leading-none">State Yield</th>
                           <th className="px-10 py-6 text-right text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-[0.4em] italic leading-none">Risk Topology</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {files.map((file, i) => (
                           <tr 
                             key={i} 
                             onClick={() => setSelectedFile(i)}
                             className={cn(
                               "transition-all cursor-pointer group/row",
                               selectedFile === i ? "bg-[#0f62fe]/10" : "hover:bg-white/[0.03]"
                             )}
                           >
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-6">
                                    <div className={cn(
                                       "p-4 bg-[var(--background)] border border-white/5 rounded-sm transition-all relative group-hover/row:border-[#0f62fe]",
                                       selectedFile === i && "border-[#0f62fe] scale-110 shadow-[0_0_20px_rgba(15,98,254,0.2)]"
                                    )}>
                                       <FileCode2 size={24} className={cn("transition-colors", selectedFile === i || "text-[#64748b]", (selectedFile === i) && "text-[#0f62fe]")} />
                                       {file.extraction > 0.8 && <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]" />}
                                    </div>
                                    <div>
                                       <p className="text-lg font-black text-[var(--foreground)] uppercase tracking-tighter italic leading-none mb-2">{file.name}</p>
                                       <span className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-widest">{file.size} // {file.type.toUpperCase()}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-3">
                                    <div className={cn(
                                       "h-2 w-2 rounded-full shadow-[0_0_10px_currentColor]",
                                       file.status === 'Analyzed' ? "text-green-500 bg-green-500" :
                                       file.status === 'Scanning' ? "text-blue-500 bg-blue-500 animate-pulse" :
                                       file.status === 'Opaque' ? "text-amber-500 bg-amber-500" : "text-[#0f62fe] bg-[#0f62fe]"
                                    )} />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)] italic">{file.status}</span>
                                 </div>
                              </td>
                              <td className="px-10 py-8 min-w-[200px]">
                                 <div className="space-y-3">
                                    <div className="flex justify-between items-end text-[9px] font-black text-[var(--muted-foreground)] uppercase italic">
                                       <span className="tracking-widest">Logic Confidence</span>
                                       <span className="text-[#0f62fe] font-mono">{(file.extraction * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                       <motion.div 
                                          initial={{ width: 0 }} 
                                          animate={{ width: `${file.extraction * 100}%` }} 
                                          className="h-full bg-[#0f62fe] shadow-[0_0_15px_rgba(15,98,254,0.4)]" 
                                       />
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8 text-right">
                                 <span className={cn(
                                    "px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm border italic",
                                    file.risk === 'Low' || file.risk === 'None' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                    file.risk === 'Medium' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                    "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                 )}>
                                    {file.risk}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            <AnimatePresence>
               {selectedFile !== null && (
                 <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="lg:col-span-6 enterprise-card bg-[#0a0a0c] border border-[var(--border)] rounded-sm overflow-hidden flex flex-col shadow-3xl"
                 >
                    <div className="p-8 border-b border-[var(--border)] bg-black/60 flex items-center justify-between shrink-0">
                       <div className="flex items-center gap-4">
                          <Maximize2 size={16} className="text-[#0f62fe]" />
                          <h4 className="text-[12px] font-black uppercase tracking-[0.3em] italic text-white leading-none">Neural Logic Inspector</h4>
                       </div>
                       <button onClick={() => setSelectedFile(null)} className="h-8 w-8 flex items-center justify-center hover:bg-white/5 rounded-sm transition-colors group">
                          <X size={16} className="text-[#64748b] group-hover:text-white" />
                       </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-8 font-mono text-xs leading-relaxed custom-scrollbar space-y-10">
                       <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                          <div className="p-3 bg-[#0f62fe]/10 rounded-sm">
                             <FileText size={20} className="text-[#0f62fe]" />
                          </div>
                          <div className="flex-1">
                             <p className="text-[14px] font-black text-white italic tracking-tighter uppercase leading-none mb-1">{files[selectedFile].name}</p>
                             <p className="text-[9px] font-black text-[#64748b] uppercase tracking-widest italic opacity-60">Bob Contextual Analysis</p>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                             <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Bob Reading...</span>
                          </div>
                       </div>

                       <div className="flex border-b border-white/10 gap-8">
                         {[
                           { id: 'logic', label: 'Logic Explorer', icon: Database },
                           { id: 'docs', label: 'Bob Documentation', icon: BookOpen },
                           { id: 'tests', label: 'Test Synthesizer', icon: ShieldCheck }
                         ].map(tab => (
                           <button
                             key={tab.id}
                             onClick={() => setActiveTab(tab.id as any)}
                             className={cn(
                               "pb-4 text-[10px] font-black uppercase tracking-[0.2em] italic flex items-center gap-2 transition-all relative",
                               activeTab === tab.id ? "text-[#0f62fe]" : "text-white/20 hover:text-white/40"
                             )}
                           >
                             <tab.icon size={12} />
                             {tab.label}
                             {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f62fe]" />}
                           </button>
                         ))}
                       </div>

                       {isProcessing ? (
                         <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-16 h-16 border-4 border-[#0f62fe]/20 border-t-[#0f62fe] rounded-full animate-spin" />
                            <div>
                               <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">IBM Bob Reasoning...</p>
                               <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-2">Traversing Repository Graph</p>
                            </div>
                         </div>
                       ) : (
                         <>
                           {activeTab === 'logic' && (
                             <div className="space-y-10">
                                <div className="space-y-4">
                                   <div className="flex items-center justify-between">
                                     <h5 className="text-[10px] font-black text-[#0f62fe] uppercase tracking-[0.4em] italic">Bob Logic Invariants</h5>
                                     <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{files[selectedFile].nodes.length} Segments Identified</span>
                                   </div>
                                   
                                   <div className="space-y-2">
                                      {files[selectedFile].nodes.map((node) => (
                                        <div key={node.id} className="border border-white/5 bg-white/[0.02] rounded-sm overflow-hidden transition-all hover:bg-white/[0.04]">
                                          <button 
                                            onClick={() => toggleNode(node.id)}
                                            className="w-full flex items-center justify-between p-4 focus:outline-none"
                                          >
                                             <div className="flex items-center gap-4">
                                               <div className={cn(
                                                 "h-2 w-2 rounded-full",
                                                 node.coverage > 0.9 ? "bg-green-500" : node.coverage > 0.5 ? "bg-blue-500" : "bg-amber-500"
                                               )} />
                                               <span className="text-[11px] font-black text-white uppercase italic tracking-tighter">{node.name}</span>
                                             </div>
                                             <ChevronDown size={14} className={cn("text-white/20 transition-transform", expandedNodes.includes(node.id) && "rotate-180")} />
                                          </button>
                                          <AnimatePresence>
                                            {expandedNodes.includes(node.id) && (
                                              <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden bg-black/40 border-t border-white/5"
                                              >
                                                 <div className="p-4 grid grid-cols-2 gap-4">
                                                    <div>
                                                       <p className="text-[8px] font-black text-[#64748b] uppercase tracking-widest mb-1 italic">Bob's Type Vector</p>
                                                       <p className="text-[10px] font-black text-white uppercase italic">{node.type}</p>
                                                    </div>
                                                    <div>
                                                       <p className="text-[8px] font-black text-[#64748b] uppercase tracking-widest mb-1 italic">Reasoning Complexity</p>
                                                       <p className="text-[10px] font-black text-white uppercase italic">{node.complexity}</p>
                                                    </div>
                                                    <div className="col-span-2 space-y-2 mt-2">
                                                       <div className="flex justify-between text-[8px] font-black uppercase text-[#0f62fe] italic">
                                                         <span>Extraction Confidence</span>
                                                         <span>{(node.coverage * 100).toFixed(1)}%</span>
                                                       </div>
                                                       <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                         <div 
                                                           className="h-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.5)]" 
                                                           style={{ width: `${node.coverage * 100}%` }}
                                                         />
                                                       </div>
                                                    </div>
                                                 </div>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                      ))}
                                   </div>
                                </div>
                                
                                <div className="space-y-4">
                                   <h5 className="text-[10px] font-black text-[#0f62fe] uppercase tracking-[0.4em] italic leading-none">Contextual Source</h5>
                                   <div className="bg-black/80 rounded-sm border border-white/5 relative group p-6 border-l-2 border-l-[#0f62fe]">
                                      <pre className="text-blue-100/90 whitespace-pre-wrap leading-relaxed">{files[selectedFile].code}</pre>
                                   </div>
                                </div>
                             </div>
                           )}

                           {activeTab === 'docs' && (
                             <div className="space-y-6 animate-in fade-in duration-500">
                               {isGeneratingDocs ? (
                                 <div className="flex flex-col items-center justify-center py-20 gap-6">
                                   <div className="w-12 h-12 border-4 border-[#0f62fe]/20 border-t-[#0f62fe] rounded-full animate-spin" />
                                   <p className="text-[10px] font-black text-[#0f62fe] uppercase tracking-[0.4em] animate-pulse italic">Bob generating docs...</p>
                                 </div>
                               ) : aiDocs ? (
                                 <div className="space-y-4">
                                   <div className="flex items-center gap-3 mb-4">
                                     <div className="h-2 w-2 rounded-full bg-[#0f62fe] animate-pulse" />
                                     <span className="text-[10px] font-black text-[#0f62fe] uppercase tracking-[0.4em] italic">Bob Documentation Output</span>
                                     <button
                                       onClick={() => navigator.clipboard.writeText(aiDocs)}
                                       className="ml-auto text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-widest hover:text-[#0f62fe] transition-colors"
                                     >Copy</button>
                                   </div>
                                   <div className="bg-black/60 border border-[#0f62fe]/20 p-8 rounded-sm overflow-y-auto max-h-[500px] custom-scrollbar">
                                     <pre className="text-[11px] font-mono text-blue-200/80 leading-relaxed whitespace-pre-wrap">{aiDocs}</pre>
                                   </div>
                                 </div>
                               ) : (
                                 <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
                                   <div className="p-10 bg-[#0f62fe]/5 border border-[#0f62fe]/20 rounded-sm">
                                     <BookOpen size={48} className="text-[#0f62fe]/30" />
                                   </div>
                                   <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.3em] italic">Click Bob Documentation below to generate real docs</p>
                                 </div>
                               )}
                             </div>
                           )}

                           {activeTab === 'tests' && (
                             <div className="space-y-6 animate-in fade-in duration-500">
                               {isGeneratingExplorerTests ? (
                                 <div className="flex flex-col items-center justify-center py-20 gap-6">
                                   <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
                                   <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.4em] animate-pulse italic">Bob synthesizing tests...</p>
                                 </div>
                               ) : aiTests ? (
                                 <div className="space-y-4">
                                   <div className="flex items-center gap-3 mb-4">
                                     <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                     <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.4em] italic">Bob Test Suite Output</span>
                                     <button
                                       onClick={() => navigator.clipboard.writeText(aiTests)}
                                       className="ml-auto text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-widest hover:text-green-500 transition-colors"
                                     >Copy Tests</button>
                                   </div>
                                   <div className="bg-black/60 border border-green-900/20 p-8 rounded-sm overflow-y-auto max-h-[500px] custom-scrollbar">
                                     <pre className="text-[11px] font-mono text-green-300/80 leading-relaxed whitespace-pre-wrap">{aiTests}</pre>
                                   </div>
                                 </div>
                               ) : (
                                 <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
                                   <div className="p-10 bg-green-500/5 border border-green-500/20 rounded-sm">
                                     <ShieldCheck size={48} className="text-green-500/30" />
                                   </div>
                                   <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.3em] italic">Click Bob Test Suite below to generate real tests</p>
                                 </div>
                               )}
                             </div>
                           )}
                         </>
                       )}
                       
                       <div className="pt-6 border-t border-white/5 space-y-6">
                          <p className="text-[10px] font-black text-[#0f62fe] uppercase tracking-[0.4em] italic mb-4 leading-none">Modernization Progress</p>
                          <div className="grid grid-cols-2 gap-6">
                            {[
                              { label: 'Entropy Reduction', value: '42.1%', icon: Zap },
                              { label: 'Logic Recoupling', value: '88.4%', icon: Activity }
                            ].map((insight, i) => (
                              <div key={i} className="flex flex-col p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                                <div className="flex items-center gap-3 mb-2">
                                   <insight.icon size={12} className="text-[#0f62fe]" />
                                   <span className="text-[8px] font-black text-[#64748b] uppercase tracking-widest">{insight.label}</span>
                                </div>
                                <span className="text-xl font-black italic tracking-tighter text-white">{insight.value}</span>
                              </div>
                            ))}
                          </div>
                       </div>
                    </div>
                    
                    <div className="p-8 border-t border-[var(--border)] bg-black/60 shrink-0 flex flex-col gap-6">
                       <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] text-white/20 italic">
                          <div className="flex items-center gap-2">
                             <Activity size={10} className="text-[#0f62fe] animate-pulse" />
                             <span>Active Bob Context: {files[selectedFile].name}</span>
                          </div>
                          <span>Repository Awareness: 100%</span>
                       </div>
                       <div className="flex gap-4">
                          <button 
                            onClick={() => handleAction('docs')}
                            className="flex-1 h-14 bg-white/[0.05] border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] italic rounded-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
                          >
                             <BookOpen size={14} className="group-hover:text-[#0f62fe] transition-colors" /> 
                             Bob Documentation
                          </button>
                          <button 
                            onClick={() => handleAction('tests')}
                            className="flex-1 h-14 bg-white/[0.05] border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] italic rounded-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
                          >
                             <Microscope size={14} className="group-hover:text-[#0f62fe] transition-colors" /> 
                             Bob Test Suite
                          </button>
                          <button 
                            onClick={onDecompose}
                            className="flex-[1.5] h-14 bg-[#0f62fe] text-white text-[11px] font-black uppercase tracking-[0.4em] italic rounded-sm hover:-translate-y-1 transition-all shadow-[0_20px_40px_rgba(15,98,254,0.3)] active:scale-95 flex items-center justify-center gap-3"
                          >
                             <FlaskConical size={16} /> 
                             Bob Decomposition
                          </button>
                       </div>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </motion.div>
  );
}

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('granite-theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return 'dark'; // Default identity
    }
    return 'dark';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('granite-theme', newTheme);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return { theme, toggleTheme };
}


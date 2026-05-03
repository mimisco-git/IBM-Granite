/**
 * Shadow Brain AI Service
 * Uses Google Gemini (FREE via AI Studio: aistudio.google.com)
 * Set VITE_GEMINI_API_KEY in your .env file
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Node, Edge, DecomposedIntent, PolicyValidation, ArcanaSynthesis } from '../types';

const MODEL = 'gemini-1.5-flash'; // Free tier model

function getClient(): GoogleGenerativeAI {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not set in .env — get a free key at aistudio.google.com');
  return new GoogleGenerativeAI(apiKey);
}

async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
    generationConfig: { responseMimeType: 'text/plain' },
  });

  const result = await model.generateContent(userPrompt);
  return result.response.text();
}

async function callGeminiJSON(systemPrompt: string, userPrompt: string): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
    generationConfig: { responseMimeType: 'application/json' },
  });

  const result = await model.generateContent(userPrompt);
  return result.response.text();
}

function parseJSON(raw: string): unknown {
  // Strip any accidental markdown fences
  return JSON.parse(raw.replace(/```json\n?|```\n?/g, '').trim());
}

// ─── Intent Decomposer ────────────────────────────────────────────────────────
export async function decomposeIntent(
  intentText: string,
  nodes: Node[],
  edges: Edge[]
): Promise<DecomposedIntent> {
  const system = `You are the Arcana Shadow Brain, an expert financial execution engine for the Arc Network (EVM-compatible L1 by Circle).

Arc Network facts:
- USDC is the native gas token (ERC-20 uses 6 decimals; native uses 18)
- EURC address: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
- CCTP V2 cross-chain USDC transfers, Arc domain = 26
- IdentityRegistry (ERC-8004): 0x8004A818BFB912233c491871b3d84c89A494BD9e
- StableFX FxEscrow: 0x867650F5eAe8df91445971f14d89fd84F0C9a9f8
- GatewayWallet (Unified Balance): 0x0077777d7EBA4688BDeF3E311b846F25870A19B9
- Sub-second finality via Malachite BFT consensus
- Explorer: https://testnet.arcscan.app

You decompose natural language financial intents into atomic executable blockchain steps.
Respond ONLY with valid JSON matching the schema exactly. No extra text.`;

  const userPrompt = `Decompose this financial intent into atomic on-chain steps:
"${intentText}"

Workspace nodes: ${JSON.stringify(nodes.map(n => ({ id: n.id, type: n.type, title: n.title, balance: n.balance, chain: n.chain })))}
Connections: ${JSON.stringify(edges.map(e => ({ source: e.source, target: e.target, label: e.label })))}

Return this exact JSON schema:
{
  "rawIntent": "${intentText}",
  "summary": "one sentence describing what this intent accomplishes",
  "totalEstimatedGas": "0.000XXX USDC",
  "riskScore": 25,
  "warnings": ["warning if any"],
  "steps": [
    {
      "id": "step_1",
      "action": "check_balance",
      "description": "human readable description",
      "params": { "token": "USDC", "chain": "Arc" },
      "estimatedGas": "0.000010 USDC",
      "riskLevel": "low"
    }
  ]
}

action must be one of: check_balance, estimate_gas, approve_token, bridge, transfer, fx_swap, register_agent, fund_escrow
riskLevel must be: low, medium, or high
riskScore is 0-100`;

  const raw = await callGeminiJSON(system, userPrompt);
  const parsed = parseJSON(raw) as DecomposedIntent;
  return {
    ...parsed,
    steps: parsed.steps.map(s => ({ ...s, status: 'pending' as const })),
  };
}

// ─── Policy Validator ─────────────────────────────────────────────────────────
export async function validatePolicy(
  policyCode: string,
  agentType: string
): Promise<PolicyValidation> {
  const system = `You are an Arc Network smart contract security auditor. Analyze policies written for the Arcana Policy DSL (JavaScript-like syntax).

Arc context:
- Agents execute USDC/EURC transfers autonomously on Arc Testnet
- shouldExecute(intent) must return a boolean
- Higher riskScore = more dangerous
- Red flags: no spending caps, unbounded chains, no recipient validation, no daily limits

Respond ONLY with valid JSON matching the schema exactly. No extra text.`;

  const userPrompt = `Validate this ${agentType} agent policy:

\`\`\`
${policyCode}
\`\`\`

Return this exact JSON schema:
{
  "isValid": true,
  "riskScore": 35,
  "riskLabel": "moderate",
  "issues": ["specific issue found if any"],
  "suggestions": ["concrete improvement suggestion"],
  "explanation": "2-3 sentence plain English summary of what this policy does and its risk"
}

riskLabel must be one of: safe, moderate, risky, critical`;

  const raw = await callGeminiJSON(system, userPrompt);
  return parseJSON(raw) as PolicyValidation;
}

// ─── Shadow Brain Synthesis ───────────────────────────────────────────────────
export async function synthesizeArcana(nodes: Node[], edges: Edge[]): Promise<ArcanaSynthesis> {
  const system = `You are the Arcana Shadow Brain, a recursive liquidity cogitator for the Arc Network (Circle's EVM L1 stablecoin chain).

Arc capabilities:
- Unified Balance via GatewayWallet (aggregates multi-chain USDC into one view)
- Circle CCTP V2 (Arc domain 26) for burn-and-mint cross-chain transfers
- StableFX for USDC/EURC on-chain RFQ settlement
- ERC-8004 for on-chain agent identity, reputation, and validation
- ERC-8183 for programmable job/escrow lifecycle contracts
- Post-quantum lattice-based signature roadmap
- Sub-second Malachite BFT finality (~800ms blocks)

Respond ONLY with valid JSON matching the schema exactly. No extra text.`;

  const userPrompt = `Analyze this financial graph and return intelligence:

Nodes: ${JSON.stringify(nodes.map(n => ({ title: n.title, type: n.type, balance: n.balance, chain: n.chain, status: n.status })))}
Connections: ${JSON.stringify(edges.map(e => ({ source: e.source, target: e.target, label: e.label })))}

Return this exact JSON schema:
{
  "logicSteps": [
    "Scanning 4 nodes across Arc and Base for Unified Balance opportunities...",
    "Verifying CCTP V2 path availability for cross-chain routes...",
    "Evaluating agent policy health and security scores...",
    "Calculating optimal liquidity consolidation path..."
  ],
  "synthesis": "2-3 sentence analysis of current liquidity state and top opportunities on Arc Network",
  "suggestions": [
    "actionable suggestion referencing real Arc features",
    "second suggestion",
    "third suggestion"
  ],
  "simulation": {
    "expectedGas": "0.0042 USDC",
    "savedFees": "$8.20",
    "isQuantumSafe": true
  }
}`;

  const raw = await callGeminiJSON(system, userPrompt);
  return parseJSON(raw) as ArcanaSynthesis;
}

// ─── Shadow Brain Chat ────────────────────────────────────────────────────────
export async function chatWithBrain(
  userMessage: string,
  context: { nodes: Node[]; edges: Edge[]; walletAddress: string | null }
): Promise<string> {
  const system = `You are the Arcana Shadow Brain, an AI financial advisor built into the Arcana app for the Arc Network by Circle.

You help users with:
- Understanding their on-chain liquidity across Arc and bridged chains
- Planning USDC/EURC transfers, CCTP bridges, and StableFX swaps
- Registering and managing ERC-8004 AI agents
- Scheduling USDC payroll disbursements
- Optimizing routes using Unified Balance

Be concise (2-4 sentences max), practical, and reference real Arc features. Current workspace context: ${JSON.stringify({
    nodes: context.nodes.map(n => ({ title: n.title, type: n.type, balance: n.balance, chain: n.chain })),
    wallet: context.walletAddress ?? 'not connected',
  })}`;

  return await callGemini(system, userMessage);
}

// ─── CCTP Route Optimizer ─────────────────────────────────────────────────────
export async function analyzeCCTPRoutes(
  fromChain: string,
  toChain: string,
  amount: string,
  asset: string
): Promise<{
  routes: Array<{
    id: string; fromChain: string; toChain: string;
    estimatedTime: string; estimatedFee: string; feeUsd: string;
    hops: string[]; recommended: boolean; securityScore: number; notes: string;
  }>;
  recommendation: string;
}> {
  const system = `You are a Circle CCTP V2 cross-chain routing optimizer for the Arc Network.

CCTP V2 domain IDs: Arc=26, Ethereum=0, Avalanche=1, Optimism=2, Arbitrum=3, Base=6, Polygon=7, Solana=5.

Arc advantages: lowest fees (USDC as gas, ~$0.001/tx), sub-second Malachite BFT finality, direct burn-and-mint to any CCTP chain.

For routes that require a hop (e.g. Arc to Solana: Arc to Ethereum to Solana), include both options.

Respond ONLY with valid JSON matching the schema exactly. No extra text.`;

  const userPrompt = `Calculate all viable CCTP V2 routes:
From: ${fromChain}
To: ${toChain}
Amount: ${amount} ${asset}

Return this exact JSON schema:
{
  "routes": [
    {
      "id": "route_direct",
      "fromChain": "${fromChain}",
      "toChain": "${toChain}",
      "estimatedTime": "< 5 seconds",
      "estimatedFee": "0.001200 USDC",
      "feeUsd": "$0.0012",
      "hops": ["${fromChain}", "${toChain}"],
      "recommended": true,
      "securityScore": 97,
      "notes": "Direct CCTP V2 burn-and-mint. Fastest and cheapest path."
    }
  ],
  "recommendation": "one sentence explaining which route to use and why"
}`;

  const raw = await callGeminiJSON(system, userPrompt);
  return parseJSON(raw) as Awaited<ReturnType<typeof analyzeCCTPRoutes>>;
}

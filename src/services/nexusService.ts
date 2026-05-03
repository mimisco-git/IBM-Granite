import { GoogleGenerativeAI } from "@google/generative-ai";
import { Node, Edge } from "../types";

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function synthesizeArcana(nodes: Node[], edges: Edge[]) {
  const prompt = `
    You are "Arcana Quantum Shadow Brain," a recursive cogitator for the Arc Network.
    Analyze this financial graph:
    Nodes: ${JSON.stringify(nodes.map(n => ({ title: n.title, type: n.type, balance: n.balance, chain: n.chain })))}
    Connections: ${JSON.stringify(edges)}
    
    The user wants to leverage Arc Network for Agentic Liquidity and Quantum-Safe stablecoin management.
    Return a structured JSON:
    {
      "logicSteps": [
        "Verifying quantum-resistant signature paths for ${nodes.length} nodes...",
        "Simulating cross-chain intent: USDC flow from Arc to Base via Circle CCTP...",
        "Analyzing security scores for connected Agents..."
      ],
      "synthesis": "Your liquidity is currently diversified across chains. Arc's Unified Balance can compress these into a single 128-bit cryptographic record.",
      "suggestions": [
        "Enable 'Quantum Guardian' policy for the Main Wallet",
        "Deploy FX Agent to handle USDC/EURC rotations",
        "Converge fragmented liquidity into Arc Unified Balance"
      ],
      "simulation": {
        "expectedGas": "0.0004 ARC",
        "savedFees": "$12.40",
        "isQuantumSafe": true
      }
    }
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text || "{}");
  } catch (error) {
    console.error("Arcana Synthesis Error:", error);
    return null;
  }
}

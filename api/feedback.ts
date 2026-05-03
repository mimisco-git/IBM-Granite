import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, message, email } = req.body;
  console.log(`[FEEDBACK] Received ${type}:`, { message, email });

  // In production, save this to a database (Firestore, PlanetScale, etc.)
  // For now, we log it and return success.
  return res.status(200).json({ status: 'success', received: true });
}

/**
 * Vercel deploy entry handler, for serverless deployment, please don't modify this file
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server/app.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Delego la gestione alla app Express
    return (app as any)(req as any, res as any);
  } catch (err) {
    console.error("Errore durante l'inizializzazione del server:", err);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'BOOTSTRAP_ERROR'
    });
  }
}
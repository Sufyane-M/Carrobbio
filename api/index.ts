/**
 * Vercel deploy entry handler, for serverless deployment, please don't modify this file
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Verifica variabili d'ambiente critiche prima di importare l'app
    const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];
    const missing = requiredEnv.filter((name) => !process.env[name] || String(process.env[name]).trim() === '');

    if (missing.length > 0) {
      res.status(500).json({
        success: false,
        error: 'Configurazione ambiente mancante',
        code: 'ENV_MISSING',
        missing
      });
      return;
    }

    // Import dinamico per evitare errori a livello di modulo che interrompono la risposta JSON
    const mod = await import('../server/app');
    const app = mod.default as any;
    return app(req as any, res as any);
  } catch (err) {
    console.error("Errore durante l'inizializzazione del server:", err);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'BOOTSTRAP_ERROR'
    });
  }
}
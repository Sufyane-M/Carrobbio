/**
 * CSRF Protection Middleware
 * Protegge da attacchi Cross-Site Request Forgery
 */
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase.js';
import crypto from 'crypto';



interface CSRFRequest extends Request {
  csrfToken?: string;
  user?: any;
  sessionId?: string;
}

/**
 * Genera un token CSRF sicuro
 */
function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verifica la validità di un token CSRF
 */
function verifyCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken));
}

/**
 * Middleware per generare e fornire token CSRF
 */
export const generateCSRF = async (
  req: CSRFRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = generateCSRFToken();
    const sessionId = req.sessionId || 'anonymous';
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 ora

    // Salva il token nel database (usando security_logs come storage temporaneo)
    await supabase
      .from('security_logs')
      .insert({
        event_type: 'csrf_token_generated',
        user_id: req.user?.userId || null,
        ip_address: req.ip || req.connection.remoteAddress || 'unknown',
        user_agent: req.get('User-Agent') || 'unknown',
        details: {
          token: token,
          sessionId: sessionId,
          expiresAt: expiresAt.toISOString()
        },
        created_at: new Date().toISOString()
      });

    res.cookie('csrf-token', token, {
      httpOnly: false, // Deve essere accessibile da JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 ore
    })

    res.setHeader('X-CSRF-Token', token)
    next()
  } catch (error) {
    console.error('Errore nella generazione del token CSRF:', error);
    next(error);
  }
};

/**
 * Middleware per verificare token CSRF
 */
export const verifyCSRF = async (
  req: CSRFRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Escludi metodi GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const sessionToken = (req.cookies['csrf-token'] || req.headers['x-csrf-token']) as string;
    const headerToken = req.headers['x-csrf-token'] as string;
    const sessionId = (req as any).sessionId || 'anonymous';

    if (!sessionToken || !headerToken || sessionToken !== headerToken) {
      return res.status(403).json({
        error: 'CSRF token mismatch',
        message: 'Token CSRF non valido o mancante'
      });
    }

    // Cerca il token nel database
    const { data: tokenRecords, error } = await supabase
      .from('security_logs')
      .select('*')
      .eq('event_type', 'csrf_token_generated')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Ultimi 60 minuti
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Errore nella verifica del token CSRF:', error);
      return res.status(500).json({
        success: false,
        error: 'Errore interno del server'
      });
    }

    // Trova un token valido
    const validToken = tokenRecords?.find(record => {
      const details = record.details as any;
      return details.token === headerToken && 
             details.sessionId === sessionId &&
             new Date() < new Date(details.expiresAt);
    });

    if (!validToken) {
      // Log del tentativo di CSRF
      await supabase
        .from('security_logs')
        .insert({
          event_type: 'csrf_attack_attempt',
          user_id: req.user?.userId || null,
          ip_address: req.ip || req.connection.remoteAddress || 'unknown',
          user_agent: req.get('User-Agent') || 'unknown',
          details: {
            providedToken: headerToken,
            sessionId: sessionId,
            endpoint: req.path
          },
          created_at: new Date().toISOString()
        });

      return res.status(403).json({
        success: false,
        error: 'Token CSRF non valido o scaduto'
      });
    }

    // Token valido, procedi
    next();
  } catch (error: any) {
    console.error('Errore nella verifica CSRF:', error);
    return res.status(500).json({
      success: false,
      error: 'Errore interno del server'
    });
  }
};

/**
 * Endpoint per ottenere un nuovo token CSRF
 */
export const getCSRFToken = async (req: Request, res: Response) => {
  try {
    const token = generateCSRFToken();
    const sessionId = (req as any).sessionId || 'anonymous';
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 ora

    // Salva il token nel database
    await supabase
      .from('security_logs')
      .insert({
        event_type: 'csrf_token_generated',
        user_id: (req as any).user?.userId || null,
        ip_address: req.ip || req.connection.remoteAddress || 'unknown',
        user_agent: req.get('User-Agent') || 'unknown',
        details: {
          token: token,
          sessionId: sessionId,
          expiresAt: expiresAt.toISOString()
        },
        created_at: new Date().toISOString()
      });

    res.json({
      success: true,
      csrfToken: token,
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Errore nella generazione del token CSRF:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server'
    });
  }
};

/**
 * Middleware per pulire i token CSRF scaduti
 */
export const cleanupExpiredCSRFTokens = async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    await supabase
      .from('security_logs')
      .delete()
      .eq('event_type', 'csrf_token_generated')
      .lt('created_at', oneHourAgo.toISOString());
  } catch (error) {
    console.error('Errore nella pulizia dei token CSRF scaduti:', error);
  }
};

// Pulisci i token scaduti ogni 30 minuti
setInterval(cleanupExpiredCSRFTokens, 30 * 60 * 1000);
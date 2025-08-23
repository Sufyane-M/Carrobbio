/**
 * Rate Limiting Middleware
 * Protegge dalle richieste eccessive e attacchi brute force
 */
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

interface RateLimitConfig {
  windowMs: number; // Finestra temporale in millisecondi
  maxAttempts: number; // Numero massimo di tentativi
  blockDurationMs: number; // Durata del blocco in millisecondi
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minuti
  maxAttempts: 5,
  blockDurationMs: 30 * 60 * 1000 // 30 minuti
};

/**
 * Middleware di rate limiting intelligente
 */
export const rateLimiter = (config: Partial<RateLimitConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      const endpoint = req.path;
      const now = new Date();
      const windowStart = new Date(now.getTime() - finalConfig.windowMs);

      // Verifica tentativi recenti
      const { data: recentAttempts, error } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('ip_address', clientIp)
        .eq('endpoint', endpoint)
        .gte('attempted_at', windowStart.toISOString())
        .order('attempted_at', { ascending: false });

      if (error) {
        console.error('Errore nel controllo rate limit:', error);
        return next(); // In caso di errore, permetti la richiesta
      }

      // Controlla se l'IP è attualmente bloccato
      const blockedUntil = new Date(now.getTime() - finalConfig.blockDurationMs);
      const blockedAttempts = recentAttempts?.filter(attempt => 
        attempt.is_blocked && new Date(attempt.attempted_at) > blockedUntil
      ) || [];

      if (blockedAttempts.length > 0) {
        const lastBlockedAttempt = blockedAttempts[0];
        const unblockTime = new Date(new Date(lastBlockedAttempt.attempted_at).getTime() + finalConfig.blockDurationMs);
        
        return res.status(429).json({
          success: false,
          error: 'Troppi tentativi falliti. Riprova più tardi.',
          retryAfter: Math.ceil((unblockTime.getTime() - now.getTime()) / 1000)
        });
      }

      // Conta i tentativi nella finestra temporale
      const attemptCount = recentAttempts?.length || 0;

      if (attemptCount >= finalConfig.maxAttempts) {
        // Registra il blocco
        await supabase
          .from('login_attempts')
          .insert({
            ip_address: clientIp,
            user_agent: userAgent,
            endpoint: endpoint,
            is_successful: false,
            is_blocked: true,
            attempted_at: now.toISOString()
          });

        return res.status(429).json({
          success: false,
          error: 'Troppi tentativi. Account temporaneamente bloccato.',
          retryAfter: Math.ceil(finalConfig.blockDurationMs / 1000)
        });
      }

      // Aggiungi informazioni di rate limiting alla richiesta
      (req as any).rateLimitInfo = {
        remainingAttempts: finalConfig.maxAttempts - attemptCount,
        resetTime: new Date(now.getTime() + finalConfig.windowMs)
      };

      next();
    } catch (error) {
      console.error('Errore nel middleware rate limiter:', error);
      next(); // In caso di errore, permetti la richiesta
    }
  };
};

/**
 * Registra un tentativo di login
 */
export const logLoginAttempt = async (
  req: Request,
  isSuccessful: boolean,
  userId?: string,
  errorMessage?: string
) => {
  try {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    const endpoint = req.path;

    await supabase
      .from('login_attempts')
      .insert({
        ip_address: clientIp,
        user_agent: userAgent,
        endpoint: endpoint,
        user_id: userId,
        is_successful: isSuccessful,
        is_blocked: false,
        error_message: errorMessage,
        attempted_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Errore nel logging del tentativo di login:', error);
  }
};

/**
 * Rate limiter specifico per login (più restrittivo)
 */
export const loginRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minuti
  maxAttempts: 3, // Solo 3 tentativi per il login
  blockDurationMs: 60 * 60 * 1000 // 1 ora di blocco
});

/**
 * Rate limiter per password reset
 */
export const passwordResetRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 ora
  maxAttempts: 3, // 3 tentativi per ora
  blockDurationMs: 2 * 60 * 60 * 1000 // 2 ore di blocco
});
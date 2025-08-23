import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase';
import { z } from 'zod';

/**
 * Nuovo middleware di autenticazione e sicurezza
 * Implementa validazione JWT sicura con Supabase
 * Conforme alle specifiche OWASP per la sicurezza
 */

// Interfaccia per la richiesta autenticata
interface AuthenticatedRequest extends Request {
  adminId?: string;
  adminUser?: {
    id: string;
    email: string;
    role: string;
    mustChangePassword: boolean;
  };
  sessionId?: string;
}

/**
 * Registra eventi di sicurezza nel sistema di audit
 */
async function logSecurityEvent(
  adminId: string | null,
  action: string,
  ipAddress: string,
  userAgent: string | undefined,
  success: boolean = true,
  errorMessage?: string
) {
  try {
    await supabase
      .from('audit_logs')
      .insert({
        admin_id: adminId,
        action,
        ip_address: ipAddress,
        user_agent: userAgent || 'Unknown',
        success,
        error_message: errorMessage || null,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Errore nel logging dell\'evento di sicurezza:', error);
  }
}

/**
 * Middleware principale per l'autenticazione JWT
 * Verifica token, sessione e stato dell'utente
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent');
  
  try {
    // Estrai token da cookie o header Authorization
    const token = req.cookies?.admin_token || 
                 req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      await logSecurityEvent(null, 'AUTH_MISSING_TOKEN', ipAddress, userAgent, false, 'No token provided');
      res.status(401).json({
        success: false,
        error: 'Token di accesso richiesto',
        code: 'MISSING_TOKEN'
      });
      return;
    }
    
    // Verifica e decodifica JWT
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!, {
        algorithms: ['HS256'],
        issuer: 'carrobbio-admin',
        audience: 'carrobbio-admin-panel'
      });
    } catch (jwtError) {
      await logSecurityEvent(null, 'AUTH_INVALID_TOKEN', ipAddress, userAgent, false, 'JWT verification failed');
      
      if (jwtError instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          error: 'Token scaduto',
          code: 'TOKEN_EXPIRED'
        });
        return;
      }
      
      res.status(401).json({
        success: false,
        error: 'Token non valido',
        code: 'INVALID_TOKEN'
      });
      return;
    }
    
    // Verifica sessione nel database
    const { data: session, error: sessionError } = await supabase
      .from('admin_sessions')
      .select('*, admin_users(*)')
      .eq('session_token', token)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .single();
    
    if (sessionError || !session) {
      await logSecurityEvent(decoded?.adminId, 'AUTH_INVALID_SESSION', ipAddress, userAgent, false, 'Session not found or expired');
      res.status(401).json({
        success: false,
        error: 'Sessione non valida o scaduta',
        code: 'INVALID_SESSION'
      });
      return;
    }
    
    // Verifica che l'utente sia ancora attivo
    if (!session.admin_users.is_active) {
      await logSecurityEvent(session.admin_users.id, 'AUTH_ACCOUNT_INACTIVE', ipAddress, userAgent, false, 'Account deactivated');
      res.status(401).json({
        success: false,
        error: 'Account disattivato',
        code: 'ACCOUNT_INACTIVE'
      });
      return;
    }
    
    // Verifica che l'account non sia bloccato
    if (session.admin_users.is_locked || 
        (session.admin_users.locked_until && new Date(session.admin_users.locked_until) > new Date())) {
      await logSecurityEvent(session.admin_users.id, 'AUTH_ACCOUNT_LOCKED', ipAddress, userAgent, false, 'Account locked');
      res.status(401).json({
        success: false,
        error: 'Account temporaneamente bloccato',
        code: 'ACCOUNT_LOCKED'
      });
      return;
    }
    
    // Aggiorna ultima attività della sessione
    await supabase
      .from('admin_sessions')
      .update({ 
        last_activity_at: new Date().toISOString(),
        ip_address: ipAddress // Aggiorna IP se cambiato
      })
      .eq('id', session.id);
    
    // Imposta dati utente nella richiesta
    req.adminId = session.admin_users.id;
    req.adminUser = {
      id: session.admin_users.id,
      email: session.admin_users.email,
      role: session.admin_users.role,
      mustChangePassword: session.admin_users.must_change_password
    };
    req.sessionId = session.id;
    
    // Log accesso riuscito (solo per operazioni sensibili)
    if (req.method !== 'GET' || req.path.includes('/admin/')) {
      await logSecurityEvent(session.admin_users.id, 'AUTH_SUCCESS', ipAddress, userAgent);
    }
    
    next();
    
  } catch (error) {
    console.error('Errore nel middleware di autenticazione:', error);
    await logSecurityEvent(null, 'AUTH_ERROR', ipAddress, userAgent, false, error instanceof Error ? error.message : 'Unknown error');
    
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Middleware per verificare ruoli specifici
 * Utilizzare dopo authenticateToken
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent');
    
    if (!req.adminUser) {
      res.status(401).json({
        success: false,
        error: 'Autenticazione richiesta',
        code: 'AUTHENTICATION_REQUIRED'
      });
      return;
    }
    
    if (!allowedRoles.includes(req.adminUser.role)) {
      await logSecurityEvent(
        req.adminUser.id, 
        'AUTH_INSUFFICIENT_PERMISSIONS', 
        ipAddress, 
        userAgent, 
        false, 
        `Required roles: ${allowedRoles.join(', ')}, User role: ${req.adminUser.role}`
      );
      
      res.status(403).json({
        success: false,
        error: 'Permessi insufficienti',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }
    
    next();
  };
};

/**
 * Middleware per forzare il cambio password
 * Utilizzare dopo authenticateToken per endpoint che richiedono password aggiornata
 */
export const requirePasswordChange = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.adminUser) {
    res.status(401).json({
      success: false,
      error: 'Autenticazione richiesta',
      code: 'AUTHENTICATION_REQUIRED'
    });
    return;
  }
  
  if (req.adminUser.mustChangePassword) {
    res.status(403).json({
      success: false,
      error: 'È necessario cambiare la password prima di continuare',
      code: 'PASSWORD_CHANGE_REQUIRED'
    });
    return;
  }
  
  next();
};

/**
 * Middleware per validazione input con Zod
 * Utilizzare per validare body, query o params delle richieste
 */
export const validateInput = (schema: z.ZodSchema, target: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = req[target];
      const validatedData = schema.parse(dataToValidate);
      
      // Sostituisci i dati originali con quelli validati e sanitizzati
      (req as any)[target] = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Dati di input non validi',
          details: error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message
          })),
          code: 'VALIDATION_ERROR'
        });
        return;
      }
      
      console.error('Errore nella validazione input:', error);
      res.status(500).json({
        success: false,
        error: 'Errore interno del server',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

/**
 * Middleware per rate limiting avanzato per IP
 * Implementa sliding window con Supabase
 */
export const rateLimitByIP = (maxRequests: number = 100, windowMinutes: number = 15) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent');
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
    
    try {
      // Conta le richieste recenti da questo IP
      const { data: recentRequests, error } = await supabase
        .from('audit_logs')
        .select('id')
        .eq('ip_address', ipAddress)
        .gte('created_at', windowStart.toISOString());
      
      if (error) {
        console.error('Errore nel rate limiting:', error);
        // In caso di errore, permetti la richiesta ma logga l'evento
        await logSecurityEvent(null, 'RATE_LIMIT_ERROR', ipAddress, userAgent, false, error.message);
        next();
        return;
      }
      
      const requestCount = recentRequests?.length || 0;
      
      if (requestCount >= maxRequests) {
        await logSecurityEvent(null, 'RATE_LIMIT_EXCEEDED', ipAddress, userAgent, false, `${requestCount} requests in ${windowMinutes} minutes`);
        
        res.status(429).json({
          success: false,
          error: `Troppi tentativi. Riprova tra ${windowMinutes} minuti.`,
          code: 'RATE_LIMITED',
          retryAfter: windowMinutes * 60
        });
        return;
      }
      
      // Log della richiesta per il rate limiting
      await logSecurityEvent(null, 'API_REQUEST', ipAddress, userAgent, true, `${req.method} ${req.path}`);
      
      next();
      
    } catch (error) {
      console.error('Errore nel middleware di rate limiting:', error);
      // In caso di errore, permetti la richiesta
      next();
    }
  };
};

/**
 * Middleware per sicurezza headers (OWASP)
 * Imposta header di sicurezza essenziali
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Previene attacchi XSS
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self'; " +
    "font-src 'self'; " +
    "object-src 'none'; " +
    "media-src 'self'; " +
    "frame-src 'none';"
  );
  
  // Strict Transport Security (solo in produzione)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  
  next();
};

/**
 * Middleware per logging delle richieste sensibili
 * Utilizzare per endpoint critici
 */
export const logSensitiveOperation = (operationType: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent');
    const adminId = req.adminId;
    
    try {
      await logSecurityEvent(
        adminId || null,
        `SENSITIVE_OP_${operationType.toUpperCase()}`,
        ipAddress,
        userAgent,
        true,
        `${req.method} ${req.path} - ${JSON.stringify(req.body)}`
      );
      
      next();
    } catch (error) {
      console.error('Errore nel logging dell\'operazione sensibile:', error);
      next(); // Continua anche in caso di errore di logging
    }
  };
};

// Esporta i tipi per l'uso in altri file
export type { AuthenticatedRequest };
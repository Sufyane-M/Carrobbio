import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase';
import { z } from 'zod';
import crypto from 'crypto';

/**
 * Nuovo sistema di autenticazione server-side con Supabase
 * Implementa endpoint RESTful sicuri con validazioni rigorose
 * Conforme alle specifiche OWASP per la sicurezza
 */

// JWT Secret validation
const JWT_SECRET: string = process.env.JWT_SECRET || '';
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Schema di validazione per il login (rilassato per compatibilità con utenti seed)
const loginSchema = z.object({
  email: z.string()
    .email('Formato email non valido')
    .min(5, 'Email troppo corta')
    .max(255, 'Email troppo lunga')
    .toLowerCase()
    .trim(),
  // Nota: per consentire il login con credenziali seed, non applichiamo policy complesse qui.
  // La policy forte viene applicata al cambio password.
  password: z.string().min(1, 'Password richiesta')
});

// Schema per il cambio password
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password attuale richiesta'),
  newPassword: z.string()
    .min(8, 'Nuova password deve essere di almeno 8 caratteri')
    .max(128, 'Password troppo lunga')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_=])/, 
           'Password deve contenere almeno: 1 minuscola, 1 maiuscola, 1 numero, 1 carattere speciale')
});

// Schema per il reset password
const resetPasswordSchema = z.object({
  email: z.string().email('Formato email non valido').toLowerCase().trim()
});

// Schema per conferma reset password
const confirmResetSchema = z.object({
  token: z.string().min(32, 'Token non valido'),
  newPassword: z.string()
    .min(8, 'Password deve essere di almeno 8 caratteri')
    .max(128, 'Password troppo lunga')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_=])/, 
           'Password deve contenere almeno: 1 minuscola, 1 maiuscola, 1 numero, 1 carattere speciale')
});

/**
 * Registra un tentativo di login nel sistema di audit
 */
async function logLoginAttempt(
  email: string, 
  ipAddress: string, 
  userAgent: string | undefined, 
  success: boolean, 
  failureReason?: string
) {
  try {
    await supabase
      .from('login_attempts')
      .insert({
        email,
        ip_address: ipAddress,
        user_agent: userAgent || 'Unknown',
        success,
        failure_reason: failureReason || null,
        attempted_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Errore nel logging del tentativo di login:', error);
  }
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
 * Genera token JWT sicuro per l'autenticazione
 */
function generateJWT(adminId: string, email: string, role: string): string {
  const payload = {
    adminId,
    email,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 ore
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    issuer: 'carrobbio-admin',
    audience: 'carrobbio-admin-panel'
  });
}

/**
 * Genera token di refresh sicuro
 */
function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Endpoint per il login dell'amministratore
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent');
  
  try {
    // Validazione rigorosa dell'input
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;
    
    // Verifica rate limiting per IP
    const recentAttempts = await supabase
      .from('login_attempts')
      .select('*')
      .eq('ip_address', ipAddress)
      .gte('attempted_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())
      .eq('success', false);
    
    if (recentAttempts.data && recentAttempts.data.length >= 5) {
      await logLoginAttempt(email, ipAddress, userAgent, false, 'rate_limited');
      res.status(429).json({
        success: false,
        error: 'Troppi tentativi di login. Riprova tra 15 minuti.',
        code: 'RATE_LIMITED'
      });
      return;
    }
    
    // Recupera l'utente admin dal database
    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (userError || !adminUser) {
      await logLoginAttempt(email, ipAddress, userAgent, false, 'invalid_credentials');
      res.status(401).json({
        success: false,
        error: 'Credenziali non valide',
        code: 'INVALID_CREDENTIALS'
      });
      return;
    }
    
    // Verifica se l'account è attivo
    if (!adminUser.is_active) {
      await logLoginAttempt(email, ipAddress, userAgent, false, 'account_inactive');
      res.status(401).json({
        success: false,
        error: 'Account disattivato',
        code: 'ACCOUNT_INACTIVE'
      });
      return;
    }
    
    // Verifica se l'account è bloccato
    if (adminUser.is_locked || (adminUser.locked_until && new Date(adminUser.locked_until) > new Date())) {
      await logLoginAttempt(email, ipAddress, userAgent, false, 'account_locked');
      res.status(401).json({
        success: false,
        error: 'Account temporaneamente bloccato',
        code: 'ACCOUNT_LOCKED'
      });
      return;
    }
    
    // Verifica password con bcrypt
    const isPasswordValid = await bcrypt.compare(password, adminUser.password_hash);
    
    if (!isPasswordValid) {
      // Incrementa i tentativi falliti
      const newFailedAttempts = adminUser.failed_login_attempts + 1;
      const shouldLock = newFailedAttempts >= 5;
      
      await supabase
        .from('admin_users')
        .update({
          failed_login_attempts: newFailedAttempts,
          is_locked: shouldLock,
          locked_until: shouldLock ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : null
        })
        .eq('id', adminUser.id);
      
      await logLoginAttempt(email, ipAddress, userAgent, false, 'invalid_credentials');
      
      res.status(401).json({
        success: false,
        error: shouldLock ? 'Account bloccato per troppi tentativi falliti' : 'Credenziali non valide',
        code: 'INVALID_CREDENTIALS'
      });
      return;
    }
    
    // Login riuscito - genera token
    const accessToken = generateJWT(adminUser.id, adminUser.email, adminUser.role);
    const refreshToken = generateRefreshToken();
    
    // Crea sessione nel database
    const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ore
    
    const { error: sessionError } = await supabase
      .from('admin_sessions')
      .insert({
        admin_id: adminUser.id,
        session_token: accessToken,
        refresh_token: refreshToken,
        ip_address: ipAddress,
        user_agent: userAgent || 'Unknown',
        expires_at: sessionExpiry.toISOString(),
        is_active: true
      });
    
    if (sessionError) {
      console.error('Errore nella creazione della sessione:', sessionError);
      res.status(500).json({
        success: false,
        error: 'Errore interno del server',
        code: 'INTERNAL_ERROR'
      });
      return;
    }
    
    // Aggiorna statistiche utente
    await supabase
      .from('admin_users')
      .update({
        failed_login_attempts: 0,
        is_locked: false,
        locked_until: null,
        last_login_at: new Date().toISOString(),
        last_login_ip: ipAddress
      })
      .eq('id', adminUser.id);
    
    // Log del login riuscito
    await logLoginAttempt(email, ipAddress, userAgent, true);
    await logSecurityEvent(adminUser.id, 'LOGIN_SUCCESS', ipAddress, userAgent);
    
    // Imposta cookie sicuri
    res.cookie('admin_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 ore
    });
    
    res.cookie('admin_refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 giorni
    });
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        mustChangePassword: adminUser.must_change_password
      },
      session: {
        session_token: accessToken,
        refresh_token: refreshToken,
        expires_at: sessionExpiry.toISOString()
      }
    });
    
  } catch (error) {
    console.error('Errore nel login:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dati di input non validi',
        details: error.issues?.map(e => ({ field: e.path.join('.'), message: e.message })) || [],
        code: 'VALIDATION_ERROR'
      });
      return;
    }
    
    await logSecurityEvent(null, 'LOGIN_ERROR', ipAddress, userAgent, false, error instanceof Error ? error.message : 'Unknown error');
    
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Endpoint per ottenere tutti gli admin
 * GET /api/auth/admins
 */
export const getAllAdmins = async (req: Request, res: Response): Promise<void> => {
  const adminId = (req as any).adminId;
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent');
  
  try {
    // Log dell'operazione per sicurezza
    await logSecurityEvent(adminId, 'ADMIN_LIST_ACCESS', ipAddress, userAgent);
    
    // Recupera tutti gli admin dalla tabella admin_users
    const { data: admins, error } = await supabase
      .from('admin_users')
      .select('id, email, role, created_at, updated_at, last_login_at, is_active, is_locked')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Errore nel recupero degli admin:', error);
      await logSecurityEvent(adminId, 'ADMIN_LIST_ERROR', ipAddress, userAgent, false, error.message);
      res.status(500).json({
        success: false,
        error: 'Errore durante il caricamento degli admin',
        code: 'DATABASE_ERROR'
      });
      return;
    }
    
    // Mappa i risultati per rimuovere informazioni sensibili
    const adminUsers = (admins || []).map(admin => ({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      created_at: admin.created_at,
      updated_at: admin.updated_at,
      last_login_at: admin.last_login_at,
      is_active: admin.is_active,
      is_locked: admin.is_locked,
      password_hash: '' // Non restituire mai l'hash della password
    }));
    
    res.status(200).json({
      success: true,
      data: adminUsers,
      count: adminUsers.length
    });
    
  } catch (error) {
    console.error('Errore nell\'endpoint getAllAdmins:', error);
    await logSecurityEvent(adminId, 'ADMIN_LIST_ERROR', ipAddress, userAgent, false, error instanceof Error ? error.message : 'Unknown error');
    
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Endpoint per richiedere il reset della password
 * POST /api/auth/request-password-reset
 */
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent');
  
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    const { email } = validatedData;
    
    // Verifica se l'utente esiste
    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('id, email, is_active')
      .eq('email', email)
      .single();
    
    // Sempre restituire successo per motivi di sicurezza
    if (userError || !adminUser || !adminUser.is_active) {
      await logSecurityEvent(null, 'PASSWORD_RESET_REQUEST_INVALID', ipAddress, userAgent, false, 'Invalid email');
      res.status(200).json({
        success: true,
        message: 'Se l\'email è registrata, riceverai le istruzioni per il reset'
      });
      return;
    }
    
    // Genera token di reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 ora
    
    // Salva token nel database
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        admin_id: adminUser.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });
    
    if (tokenError) {
      console.error('Errore nel salvataggio del token di reset:', tokenError);
      res.status(500).json({
        success: false,
        error: 'Errore interno del server',
        code: 'INTERNAL_ERROR'
      });
      return;
    }
    
    await logSecurityEvent(adminUser.id, 'PASSWORD_RESET_REQUESTED', ipAddress, userAgent);
    
    // TODO: Inviare email con token di reset
    console.log(`Token di reset per ${email}: ${resetToken}`);
    
    res.status(200).json({
      success: true,
      message: 'Se l\'email è registrata, riceverai le istruzioni per il reset'
    });
    
  } catch (error) {
    console.error('Errore nella richiesta di reset password:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Email non valida',
        code: 'VALIDATION_ERROR'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Endpoint per ottenere il profilo utente
 * GET /api/auth/profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const adminId = (req as any).adminId;
  
  try {
    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('id, email, role, created_at, last_login_at, must_change_password, is_active')
      .eq('id', adminId)
      .single();
    
    if (userError || !adminUser) {
      res.status(404).json({
        success: false,
        error: 'Utente non trovato',
        code: 'USER_NOT_FOUND'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: {
        user: adminUser
      }
    });
    
  } catch (error) {
    console.error('Errore nel recupero del profilo:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Endpoint per ottenere le sessioni utente
 * GET /api/auth/sessions
 */
export const getUserSessions = async (req: Request, res: Response): Promise<void> => {
  const adminId = (req as any).adminId;
  
  try {
    const { data: sessions, error: sessionsError } = await supabase
      .from('admin_sessions')
      .select('id, ip_address, user_agent, created_at, last_activity_at, expires_at, is_active')
      .eq('admin_id', adminId)
      .eq('is_active', true)
      .order('last_activity_at', { ascending: false });
    
    if (sessionsError) {
      console.error('Errore nel recupero delle sessioni:', sessionsError);
      res.status(500).json({
        success: false,
        error: 'Errore interno del server',
        code: 'INTERNAL_ERROR'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: {
        sessions: sessions || []
      }
    });
    
  } catch (error) {
    console.error('Errore nel recupero delle sessioni:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Endpoint per terminare una sessione specifica
 * DELETE /api/auth/sessions/:sessionId
 */
export const terminateSession = async (req: Request, res: Response): Promise<void> => {
  const adminId = (req as any).adminId;
  const sessionId = req.params.sessionId;
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent');
  
  try {
    const { error: updateError } = await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('id', sessionId)
      .eq('admin_id', adminId);
    
    if (updateError) {
      console.error('Errore nella terminazione della sessione:', updateError);
      res.status(500).json({
        success: false,
        error: 'Errore interno del server',
        code: 'INTERNAL_ERROR'
      });
      return;
    }
    
    await logSecurityEvent(adminId, 'SESSION_TERMINATED', ipAddress, userAgent);
    
    res.status(200).json({
      success: true,
      message: 'Sessione terminata con successo'
    });
    
  } catch (error) {
    console.error('Errore nella terminazione della sessione:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Endpoint per terminare tutte le sessioni
 * DELETE /api/auth/sessions
 */
export const terminateAllSessions = async (req: Request, res: Response): Promise<void> => {
  const adminId = (req as any).adminId;
  const currentToken = req.cookies.admin_token || req.headers.authorization?.replace('Bearer ', '');
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent');
  
  try {
    const { error: updateError } = await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('admin_id', adminId)
      .neq('session_token', currentToken || '');
    
    if (updateError) {
      console.error('Errore nella terminazione delle sessioni:', updateError);
      res.status(500).json({
        success: false,
        error: 'Errore interno del server',
        code: 'INTERNAL_ERROR'
      });
      return;
    }
    
    await logSecurityEvent(adminId, 'ALL_SESSIONS_TERMINATED', ipAddress, userAgent);
    
    res.status(200).json({
      success: true,
      message: 'Tutte le altre sessioni sono state terminate'
    });
    
  } catch (error) {
    console.error('Errore nella terminazione delle sessioni:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Endpoint per ottenere statistiche di sicurezza
 * GET /api/auth/security-stats
 */
export const getSecurityStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Statistiche login attempts
    const { data: loginStats } = await supabase
      .from('login_attempts')
      .select('success')
      .gte('attempted_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    // Sessioni attive
    const { data: activeSessions } = await supabase
      .from('admin_sessions')
      .select('id')
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString());
    
    // Eventi di sicurezza recenti
    const { data: securityEvents } = await supabase
      .from('audit_logs')
      .select('action, success')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100);
    
    const stats = {
      loginAttempts: {
        total: loginStats?.length || 0,
        successful: loginStats?.filter(l => l.success).length || 0,
        failed: loginStats?.filter(l => !l.success).length || 0
      },
      activeSessions: activeSessions?.length || 0,
      securityEvents: securityEvents?.length || 0
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Errore nel recupero delle statistiche:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Endpoint per sbloccare un account
 * POST /api/auth/unlock-account
 */
export const unlockAccount = async (req: Request, res: Response): Promise<void> => {
  const adminId = (req as any).adminId;
  const { adminId: targetAdminId } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent');
  
  try {
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        is_locked: false,
        locked_until: null,
        failed_login_attempts: 0
      })
      .eq('id', targetAdminId);
    
    if (updateError) {
      console.error('Errore nello sblocco dell\'account:', updateError);
      res.status(500).json({
        success: false,
        error: 'Errore interno del server',
        code: 'INTERNAL_ERROR'
      });
      return;
    }
    
    await logSecurityEvent(adminId, 'ACCOUNT_UNLOCKED', ipAddress, userAgent);
    
    res.status(200).json({
      success: true,
      message: 'Account sbloccato con successo'
    });
    
  } catch (error) {
    console.error('Errore nello sblocco dell\'account:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Endpoint per rinnovare il token
 * POST /api/auth/refresh-token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent');
  
  try {
    // Verifica refresh token
    const { data: session, error: sessionError } = await supabase
      .from('admin_sessions')
      .select('*, admin_users(*)')
      .eq('refresh_token', refreshToken)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .single();
    
    if (sessionError || !session) {
      res.status(401).json({
        success: false,
        error: 'Refresh token non valido o scaduto',
        code: 'INVALID_REFRESH_TOKEN'
      });
      return;
    }
    
    // Genera nuovo access token
    const newAccessToken = generateJWT(
      session.admin_users.id,
      session.admin_users.email,
      session.admin_users.role
    );
    
    // Aggiorna sessione
    await supabase
      .from('admin_sessions')
      .update({
        session_token: newAccessToken,
        last_activity_at: new Date().toISOString()
      })
      .eq('id', session.id);
    
    await logSecurityEvent(session.admin_users.id, 'TOKEN_REFRESHED', ipAddress, userAgent);
    
    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresIn: 24 * 60 * 60 // 24 ore in secondi
      }
    });
    
  } catch (error) {
    console.error('Errore nel refresh del token:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Funzione di pulizia per rimuovere sessioni e token scaduti
 */
export const cleanupExpiredSessions = async (): Promise<void> => {
  try {
    const now = new Date().toISOString();
    
    // Rimuovi sessioni scadute
    await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .lt('expires_at', now);
    
    // Rimuovi token di reset scaduti
    await supabase
      .from('password_reset_tokens')
      .delete()
      .lt('expires_at', now);
    
    console.log('Pulizia sessioni scadute completata');
  } catch (error) {
    console.error('Errore nella pulizia delle sessioni:', error);
  }
};

// Esegui pulizia ogni ora
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

/**
 * Endpoint per il logout dell'amministratore
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent');
  const token = req.cookies.admin_token || req.headers.authorization?.replace('Bearer ', '');
  
  try {
    if (token) {
      // Disattiva la sessione nel database
      await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('session_token', token);
      
      // Log del logout
      const decoded = jwt.decode(token) as any;
      if (decoded?.adminId) {
        await logSecurityEvent(decoded.adminId, 'LOGOUT_SUCCESS', ipAddress, userAgent);
      }
    }
    
    // Rimuovi cookie con le stesse opzioni usate per impostarli
    res.clearCookie('admin_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    });
    res.clearCookie('admin_refresh', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    });
    
    res.status(200).json({
      success: true,
      message: 'Logout effettuato con successo'
    });
    
  } catch (error) {
    console.error('Errore nel logout:', error);
    
    // Anche in caso di errore, rimuovi i cookie
    res.clearCookie('admin_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    });
    res.clearCookie('admin_refresh', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    });
    
    res.status(200).json({
      success: true,
      message: 'Logout effettuato'
    });
  }
};

/**
 * Endpoint per verificare la validità della sessione
 * GET /api/auth/verify
 */
export const verifySession = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies.admin_token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Token di accesso mancante',
      code: 'MISSING_TOKEN'
    });
    return;
  }
  
  try {
    // Verifica JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Verifica sessione nel database
    const { data: session, error: sessionError } = await supabase
      .from('admin_sessions')
      .select('*, admin_users(*)')
      .eq('session_token', token)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .single();
    
    if (sessionError || !session) {
      res.status(401).json({
        success: false,
        error: 'Sessione non valida o scaduta',
        code: 'INVALID_SESSION'
      });
      return;
    }
    
    // Aggiorna ultima attività
    await supabase
      .from('admin_sessions')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', session.id);
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: session.admin_users.id,
          email: session.admin_users.email,
          role: session.admin_users.role,
          mustChangePassword: session.admin_users.must_change_password
        },
        session: {
          expiresAt: session.expires_at,
          lastActivity: session.last_activity_at
        }
      }
    });
    
  } catch (error) {
    console.error('Errore nella verifica della sessione:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Token non valido',
        code: 'INVALID_TOKEN'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Endpoint per il cambio password
 * POST /api/auth/change-password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent');
  const adminId = (req as any).adminId; // Impostato dal middleware di autenticazione
  
  try {
    // Validazione input
    const validatedData = changePasswordSchema.parse(req.body);
    const { currentPassword, newPassword } = validatedData;
    
    // Recupera l'utente admin
    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', adminId)
      .single();
    
    if (userError || !adminUser) {
      res.status(404).json({
        success: false,
        error: 'Utente non trovato',
        code: 'USER_NOT_FOUND'
      });
      return;
    }
    
    // Verifica password attuale
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminUser.password_hash);
    
    if (!isCurrentPasswordValid) {
      await logSecurityEvent(adminId, 'PASSWORD_CHANGE_FAILED', ipAddress, userAgent, false, 'Invalid current password');
      res.status(401).json({
        success: false,
        error: 'Password attuale non corretta',
        code: 'INVALID_CURRENT_PASSWORD'
      });
      return;
    }
    
    // Genera hash della nuova password
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    
    // Aggiorna password nel database
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        password_hash: newPasswordHash,
        salt: salt,
        password_changed_at: new Date().toISOString(),
        must_change_password: false
      })
      .eq('id', adminId);
    
    if (updateError) {
      console.error('Errore nell\'aggiornamento della password:', updateError);
      res.status(500).json({
        success: false,
        error: 'Errore nell\'aggiornamento della password',
        code: 'UPDATE_ERROR'
      });
      return;
    }
    
    // Invalida tutte le sessioni esistenti tranne quella corrente
    const currentToken = req.cookies.admin_token || req.headers.authorization?.replace('Bearer ', '');
    await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('admin_id', adminId)
      .neq('session_token', currentToken || '');
    
    await logSecurityEvent(adminId, 'PASSWORD_CHANGED', ipAddress, userAgent);
    
    res.status(200).json({
      success: true,
      message: 'Password cambiata con successo'
    });
    
  } catch (error) {
    console.error('Errore nel cambio password:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dati di input non validi',
        details: error.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
        code: 'VALIDATION_ERROR'
      });
      return;
    }
    
    await logSecurityEvent(adminId, 'PASSWORD_CHANGE_ERROR', ipAddress, userAgent, false, error instanceof Error ? error.message : 'Unknown error');
    
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
};
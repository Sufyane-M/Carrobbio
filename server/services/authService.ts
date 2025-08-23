import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';

/**
 * Nuovo servizio di autenticazione per il sistema admin
 * Implementa gestione sicura delle sessioni e operazioni di autenticazione
 * Conforme alle specifiche OWASP e best practices di sicurezza
 */

// JWT Secret validation
const JWT_SECRET: string = process.env.JWT_SECRET || '';
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Configurazione sicurezza
const SALT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;
const SESSION_DURATION_HOURS = 8;
const REFRESH_TOKEN_DURATION_DAYS = 30;

// Schemi di validazione
const LoginCredentialsSchema = z.object({
  email: z.string().email('Email non valida').toLowerCase(),
  password: z.string().min(1, 'Password richiesta')
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password attuale richiesta'),
  newPassword: z.string()
    .min(8, 'La password deve essere di almeno 8 caratteri')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'La password deve contenere almeno: 1 minuscola, 1 maiuscola, 1 numero, 1 carattere speciale')
});

const ResetPasswordSchema = z.object({
  email: z.string().email('Email non valida').toLowerCase()
});

// Tipi TypeScript
interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  is_active: boolean;
  is_locked: boolean;
  locked_until: string | null;
  failed_login_attempts: number;
  last_login_at: string | null;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

interface LoginResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    mustChangePassword: boolean;
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  sessionId?: string;
  error?: string;
  code?: string;
}

interface SessionInfo {
  id: string;
  adminId: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  expiresAt: string;
  lastActivityAt: string;
}

/**
 * Classe principale per il servizio di autenticazione
 */
export class AuthService {
  
  /**
   * Autentica un utente admin con email e password
   */
  static async login(
    email: string, 
    password: string, 
    ipAddress: string, 
    userAgent: string
  ): Promise<LoginResult> {
    try {
      // Validazione input
      const validatedData = LoginCredentialsSchema.parse({ email, password });
      
      // Registra tentativo di login
      await this.logLoginAttempt(validatedData.email, ipAddress, userAgent, false);
      
      // Recupera utente dal database
      const { data: user, error: userError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', validatedData.email)
        .single();
      
      if (userError || !user) {
        await this.logSecurityEvent(null, 'LOGIN_FAILED_USER_NOT_FOUND', ipAddress, userAgent, false, `Email: ${validatedData.email}`);
        return {
          success: false,
          error: 'Credenziali non valide',
          code: 'INVALID_CREDENTIALS'
        };
      }
      
      // Verifica se l'account è attivo
      if (!user.is_active) {
        await this.logSecurityEvent(user.id, 'LOGIN_FAILED_ACCOUNT_INACTIVE', ipAddress, userAgent, false);
        return {
          success: false,
          error: 'Account disattivato',
          code: 'ACCOUNT_INACTIVE'
        };
      }
      
      // Verifica se l'account è bloccato
      if (user.is_locked || (user.locked_until && new Date(user.locked_until) > new Date())) {
        await this.logSecurityEvent(user.id, 'LOGIN_FAILED_ACCOUNT_LOCKED', ipAddress, userAgent, false);
        return {
          success: false,
          error: 'Account temporaneamente bloccato per troppi tentativi falliti',
          code: 'ACCOUNT_LOCKED'
        };
      }
      
      // Verifica password
      const passwordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!passwordValid) {
        // Incrementa tentativi falliti
        await this.handleFailedLogin(user.id, ipAddress, userAgent);
        return {
          success: false,
          error: 'Credenziali non valide',
          code: 'INVALID_CREDENTIALS'
        };
      }
      
      // Reset tentativi falliti dopo login riuscito
      await this.resetFailedLoginAttempts(user.id);
      
      // Genera tokens e sessione
      const tokens = await this.generateTokens(user);
      const sessionId = await this.createSession(user.id, tokens.accessToken, ipAddress, userAgent);
      
      // Aggiorna ultimo login
      await supabase
        .from('admin_users')
        .update({ 
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      // Log login riuscito
      await this.logSecurityEvent(user.id, 'LOGIN_SUCCESS', ipAddress, userAgent, true);
      await this.logLoginAttempt(user.email, ipAddress, userAgent, true);
      
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          mustChangePassword: user.must_change_password
        },
        tokens,
        sessionId
      };
      
    } catch (error) {
      console.error('Errore nel servizio di login:', error);
      await this.logSecurityEvent(null, 'LOGIN_ERROR', ipAddress, userAgent, false, error instanceof Error ? error.message : 'Unknown error');
      
      return {
        success: false,
        error: 'Errore interno del server',
        code: 'INTERNAL_ERROR'
      };
    }
  }
  
  /**
   * Effettua logout e invalida la sessione
   */
  static async logout(sessionId: string, ipAddress: string, userAgent: string): Promise<boolean> {
    try {
      // Recupera informazioni sessione
      const { data: session } = await supabase
        .from('admin_sessions')
        .select('admin_id')
        .eq('id', sessionId)
        .single();
      
      // Disattiva sessione
      await supabase
        .from('admin_sessions')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      // Log logout
      if (session) {
        await this.logSecurityEvent(session.admin_id, 'LOGOUT_SUCCESS', ipAddress, userAgent, true);
      }
      
      return true;
    } catch (error) {
      console.error('Errore nel logout:', error);
      return false;
    }
  }
  
  /**
   * Cambia password utente
   */
  static async changePassword(
    adminId: string,
    currentPassword: string,
    newPassword: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ success: boolean; error?: string; code?: string }> {
    try {
      // Validazione input
      const validatedData = ChangePasswordSchema.parse({ currentPassword, newPassword });
      
      // Recupera utente
      const { data: user, error: userError } = await supabase
        .from('admin_users')
        .select('password_hash')
        .eq('id', adminId)
        .single();
      
      if (userError || !user) {
        return {
          success: false,
          error: 'Utente non trovato',
          code: 'USER_NOT_FOUND'
        };
      }
      
      // Verifica password attuale
      const currentPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password_hash);
      
      if (!currentPasswordValid) {
        await this.logSecurityEvent(adminId, 'PASSWORD_CHANGE_FAILED_WRONG_CURRENT', ipAddress, userAgent, false);
        return {
          success: false,
          error: 'Password attuale non corretta',
          code: 'INVALID_CURRENT_PASSWORD'
        };
      }
      
      // Verifica che la nuova password sia diversa
      const samePassword = await bcrypt.compare(validatedData.newPassword, user.password_hash);
      if (samePassword) {
        return {
          success: false,
          error: 'La nuova password deve essere diversa da quella attuale',
          code: 'SAME_PASSWORD'
        };
      }
      
      // Hash nuova password
      const newPasswordHash = await bcrypt.hash(validatedData.newPassword, SALT_ROUNDS);
      
      // Aggiorna password nel database
      await supabase
        .from('admin_users')
        .update({ 
          password_hash: newPasswordHash,
          must_change_password: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', adminId);
      
      // Invalida tutte le sessioni esistenti tranne quella corrente
      await supabase
        .from('admin_sessions')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('admin_id', adminId);
      
      // Log cambio password riuscito
      await this.logSecurityEvent(adminId, 'PASSWORD_CHANGE_SUCCESS', ipAddress, userAgent, true);
      
      return { success: true };
      
    } catch (error) {
      console.error('Errore nel cambio password:', error);
      await this.logSecurityEvent(adminId, 'PASSWORD_CHANGE_ERROR', ipAddress, userAgent, false, error instanceof Error ? error.message : 'Unknown error');
      
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.issues[0]?.message || 'Errore di validazione',
          code: 'VALIDATION_ERROR'
        };
      }
      
      return {
        success: false,
        error: 'Errore interno del server',
        code: 'INTERNAL_ERROR'
      };
    }
  }
  
  /**
   * Verifica se una sessione è valida
   */
  static async verifySession(sessionId: string): Promise<SessionInfo | null> {
    try {
      const { data: session, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .single();
      
      if (error || !session) {
        return null;
      }
      
      return {
        id: session.id,
        adminId: session.admin_id,
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        isActive: session.is_active,
        expiresAt: session.expires_at,
        lastActivityAt: session.last_activity_at
      };
    } catch (error) {
      console.error('Errore nella verifica sessione:', error);
      return null;
    }
  }
  
  /**
   * Genera tokens JWT per l'utente
   */
  private static async generateTokens(user: AdminUser): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      adminId: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.must_change_password
    };
    
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: `${SESSION_DURATION_HOURS}h`,
      issuer: 'carrobbio-admin',
      audience: 'carrobbio-admin-panel',
      algorithm: 'HS256'
    });
    
    const refreshToken = jwt.sign(
      { adminId: user.id, type: 'refresh' }, 
      JWT_REFRESH_SECRET, 
      {
        expiresIn: `${REFRESH_TOKEN_DURATION_DAYS}d`,
        issuer: 'carrobbio-admin',
        audience: 'carrobbio-admin-panel',
        algorithm: 'HS256'
      }
    );
    
    return { accessToken, refreshToken };
  }
  
  /**
   * Crea una nuova sessione nel database
   */
  private static async createSession(
    adminId: string, 
    sessionToken: string, 
    ipAddress: string, 
    userAgent: string
  ): Promise<string> {
    const sessionId = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);
    
    await supabase
      .from('admin_sessions')
      .insert({
        id: sessionId,
        admin_id: adminId,
        session_token: sessionToken,
        ip_address: ipAddress,
        user_agent: userAgent,
        is_active: true,
        expires_at: expiresAt.toISOString(),
        last_activity_at: now.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      });
    
    return sessionId;
  }
  
  /**
   * Gestisce login fallito e blocco account
   */
  private static async handleFailedLogin(adminId: string, ipAddress: string, userAgent: string): Promise<void> {
    // Incrementa tentativi falliti
    const { data: user } = await supabase
      .from('admin_users')
      .select('failed_login_attempts')
      .eq('id', adminId)
      .single();
    
    const newAttempts = (user?.failed_login_attempts || 0) + 1;
    const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS;
    
    const updateData: any = {
      failed_login_attempts: newAttempts,
      updated_at: new Date().toISOString()
    };
    
    if (shouldLock) {
      const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      updateData.is_locked = true;
      updateData.locked_until = lockUntil.toISOString();
    }
    
    await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', adminId);
    
    // Log evento
    const action = shouldLock ? 'LOGIN_FAILED_ACCOUNT_LOCKED' : 'LOGIN_FAILED_INVALID_PASSWORD';
    await this.logSecurityEvent(adminId, action, ipAddress, userAgent, false, `Attempts: ${newAttempts}`);
  }
  
  /**
   * Reset tentativi di login falliti
   */
  private static async resetFailedLoginAttempts(adminId: string): Promise<void> {
    await supabase
      .from('admin_users')
      .update({ 
        failed_login_attempts: 0,
        is_locked: false,
        locked_until: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminId);
  }
  
  /**
   * Registra tentativo di login
   */
  private static async logLoginAttempt(
    email: string, 
    ipAddress: string, 
    userAgent: string, 
    success: boolean
  ): Promise<void> {
    try {
      await supabase
        .from('login_attempts')
        .insert({
          email,
          ip_address: ipAddress,
          user_agent: userAgent,
          success,
          attempted_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Errore nel logging del tentativo di login:', error);
    }
  }
  
  /**
   * Registra evento di sicurezza
   */
  private static async logSecurityEvent(
    adminId: string | null,
    action: string,
    ipAddress: string,
    userAgent: string,
    success: boolean = true,
    details?: string
  ): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          admin_id: adminId,
          action,
          ip_address: ipAddress,
          user_agent: userAgent,
          success,
          error_message: success ? null : details,
          details: success ? details : null,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Errore nel logging dell\'evento di sicurezza:', error);
    }
  }
  
  /**
   * Pulisce sessioni scadute (da chiamare periodicamente)
   */
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      await supabase
        .from('admin_sessions')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .lt('expires_at', new Date().toISOString())
        .eq('is_active', true);
      
      console.log('Sessioni scadute pulite con successo');
    } catch (error) {
      console.error('Errore nella pulizia delle sessioni scadute:', error);
    }
  }
  
  /**
   * Ottiene statistiche di sicurezza
   */
  static async getSecurityStats(days: number = 7): Promise<any> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const { data: loginAttempts } = await supabase
        .from('login_attempts')
        .select('success')
        .gte('attempted_at', startDate.toISOString());
      
      const { data: securityEvents } = await supabase
        .from('audit_logs')
        .select('action, success')
        .gte('created_at', startDate.toISOString());
      
      const successfulLogins = loginAttempts?.filter(a => a.success).length || 0;
      const failedLogins = loginAttempts?.filter(a => !a.success).length || 0;
      const securityIncidents = securityEvents?.filter(e => !e.success).length || 0;
      
      return {
        period: `${days} giorni`,
        totalLoginAttempts: loginAttempts?.length || 0,
        successfulLogins,
        failedLogins,
        securityIncidents,
        totalSecurityEvents: securityEvents?.length || 0
      };
    } catch (error) {
      console.error('Errore nel recupero delle statistiche di sicurezza:', error);
      return null;
    }
  }
}

// Esporta tipi per l'uso in altri file
export type { LoginResult, SessionInfo, AdminUser };
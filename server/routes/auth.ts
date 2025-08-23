import express from 'express';
import * as authController from '../controllers/authController';
import { 
  authenticateToken, 
  requireRole, 
  requirePasswordChange, 
  validateInput, 
  securityHeaders,
  logSensitiveOperation 
} from '../middleware/auth';
import { 
  rateLimiter, 
  loginRateLimiter, 
  passwordResetRateLimiter 
} from '../middleware/rateLimiter';
import { z } from 'zod';

/**
 * Route di autenticazione per il sistema admin
 * Implementa endpoint RESTful sicuri con validazione rigorosa
 * Conforme alle specifiche OWASP e best practices di sicurezza
 */

const router = express.Router();

// Applica headers di sicurezza a tutte le route
router.use(securityHeaders);

// Schemi di validazione per le route
const LoginSchema = z.object({
  email: z.string().email('Email non valida').toLowerCase().trim(),
  password: z.string().min(1, 'Password richiesta')
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password attuale richiesta'),
  newPassword: z.string()
    .min(8, 'La password deve essere di almeno 8 caratteri')
    .max(128, 'La password non può superare i 128 caratteri')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'La password deve contenere almeno: 1 minuscola, 1 maiuscola, 1 numero, 1 carattere speciale')
});

const ResetPasswordSchema = z.object({
  email: z.string().email('Email non valida').toLowerCase().trim()
});

/**
 * @route POST /api/auth/login
 * @desc Autentica un utente admin
 * @access Public (con rate limiting)
 * @security Rate limiting, validazione input, logging tentativi
 */
router.post('/login', 
  loginRateLimiter,
  validateInput(LoginSchema),
  logSensitiveOperation('LOGIN_ATTEMPT'),
  authController.login
);

/**
 * @route POST /api/auth/logout
 * @desc Effettua logout e invalida la sessione
 * @access Private
 * @security Token JWT richiesto, logging operazione
 */
router.post('/logout',
  authenticateToken,
  logSensitiveOperation('LOGOUT_ATTEMPT'),
  authController.logout
);

/**
 * @route GET /api/auth/verify-session
 * @desc Verifica se la sessione corrente è valida
 * @access Private
 * @security Token JWT richiesto
 */
router.get('/verify-session',
  authenticateToken,
  authController.verifySession
);

/**
 * @route POST /api/auth/change-password
 * @desc Cambia la password dell'utente autenticato
 * @access Private
 * @security Token JWT richiesto, validazione password, logging operazione
 */
router.post('/change-password',
  authenticateToken,
  validateInput(ChangePasswordSchema),
  logSensitiveOperation('PASSWORD_CHANGE_ATTEMPT'),
  authController.changePassword
);

/**
 * @route POST /api/auth/force-password-change
 * @desc Forza il cambio password per utenti che devono aggiornarla
 * @access Private (solo utenti con must_change_password = true)
 * @security Token JWT richiesto, controllo flag password change
 */
router.post('/force-password-change',
  authenticateToken,
  requirePasswordChange,
  validateInput(ChangePasswordSchema),
  logSensitiveOperation('FORCED_PASSWORD_CHANGE'),
  authController.changePassword
);

/**
 * @route POST /api/auth/request-password-reset
 * @desc Richiede il reset della password via email
 * @access Public (con rate limiting)
 * @security Rate limiting, validazione email, logging richiesta
 */
router.post('/request-password-reset',
  passwordResetRateLimiter,
  validateInput(ResetPasswordSchema),
  logSensitiveOperation('PASSWORD_RESET_REQUEST'),
  authController.requestPasswordReset
);

/**
 * @route GET /api/auth/profile
 * @desc Ottiene il profilo dell'utente autenticato
 * @access Private
 * @security Token JWT richiesto
 */
router.get('/profile',
  authenticateToken,
  authController.getProfile
);

/**
 * @route GET /api/auth/sessions
 * @desc Ottiene tutte le sessioni attive dell'utente
 * @access Private
 * @security Token JWT richiesto
 */
router.get('/sessions',
  authenticateToken,
  authController.getUserSessions
);

/**
 * @route DELETE /api/auth/sessions/:sessionId
 * @desc Termina una sessione specifica
 * @access Private
 * @security Token JWT richiesto, logging operazione
 */
router.delete('/sessions/:sessionId',
  authenticateToken,
  logSensitiveOperation('SESSION_TERMINATION'),
  authController.terminateSession
);

/**
 * @route DELETE /api/auth/sessions
 * @desc Termina tutte le sessioni dell'utente (tranne quella corrente)
 * @access Private
 * @security Token JWT richiesto, logging operazione
 */
router.delete('/sessions',
  authenticateToken,
  logSensitiveOperation('ALL_SESSIONS_TERMINATION'),
  authController.terminateAllSessions
);

/**
 * @route GET /api/auth/security-stats
 * @desc Ottiene statistiche di sicurezza (solo per admin)
 * @access Private (Admin only)
 * @security Token JWT richiesto, ruolo admin
 */
router.get('/security-stats',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  authController.getSecurityStats
);

/**
 * @route GET /api/auth/admins
 * @desc Ottiene la lista di tutti gli admin (solo per admin)
 * @access Private (Admin only)
 * @security Token JWT richiesto, ruolo admin, logging operazione
 */
router.get('/admins',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  logSensitiveOperation('ADMIN_LIST_ACCESS'),
  authController.getAllAdmins
);

/**
 * @route POST /api/auth/unlock-account
 * @desc Sblocca un account utente (solo per super admin)
 * @access Private (Super Admin only)
 * @security Token JWT richiesto, ruolo super admin, logging operazione
 */
router.post('/unlock-account',
  authenticateToken,
  requireRole(['super_admin']),
  validateInput(z.object({
    adminId: z.string().uuid('ID admin non valido')
  })),
  logSensitiveOperation('ACCOUNT_UNLOCK'),
  authController.unlockAccount
);

/**
 * @route POST /api/auth/refresh-token
 * @desc Rinnova il token di accesso usando il refresh token
 * @access Public
 * @security Validazione refresh token, rate limiting
 */
router.post('/refresh-token',
  rateLimiter(),
  validateInput(z.object({
    refreshToken: z.string().min(1, 'Refresh token richiesto')
  })),
  authController.refreshToken
);

/**
 * @route GET /api/auth/health
 * @desc Endpoint di health check per il sistema di autenticazione
 * @access Public
 * @security Nessuna autenticazione richiesta
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sistema di autenticazione operativo',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

/**
 * Middleware di gestione errori specifico per le route di autenticazione
 */
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Errore nelle route di autenticazione:', error);
  
  // Log dell'errore per sicurezza
  const logData = {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  };
  
  console.error('Auth Route Error:', logData);
  
  // Risposta generica per non esporre dettagli interni
  res.status(500).json({
    success: false,
    error: 'Errore interno del server',
    code: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  });
});

export default router;
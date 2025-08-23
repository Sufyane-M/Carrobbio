/**
 * Tipi condivisi tra frontend e backend
 */

// Interfacce per l'autenticazione
export interface LoginAttempt {
  id: string;
  user_id?: string;
  email: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  failure_reason?: string;
  created_at: string;
  location?: string;
  device_info?: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address: string;
  user_agent: string;
  is_active: boolean;
  is_current?: boolean;
  last_activity?: string;
  expires_at: string;
  created_at: string;
  location?: string;
}

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface SecurityLog {
  id: string;
  event_type: string;
  user_id?: string;
  ip_address: string;
  user_agent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: any;
  created_at: string;
}

// Interfacce per le statistiche di sicurezza
export interface SecurityStats {
  total_login_attempts: number;
  successful_logins: number;
  failed_logins: number;
  blocked_ips: number;
  suspicious_activities: number;
  active_users: number;
  active_sessions: number;
  password_reset_requests: number;
  last_24h_attempts?: number;
  success_rate?: number;
  // Compatibilità con useAuth
  failed_login_attempts?: number;
  last_login?: string | null;
}

export interface ThreatAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  threats: string[];
  recommendations: string[];
  blockedIPs: string[];
  suspiciousPatterns: any[];
}

export interface IPAnalysis {
  ipAddress: string;
  riskScore: number;
  isBlocked: boolean;
  loginAttempts: number;
  lastActivity: string;
  userAgent: string;
  location?: string;
  threats: string[];
}

// Interfacce per le richieste API
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  message?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Interfacce per l'utente
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
}

// Interfacce per le risposte API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipi per i filtri e le query
export interface SecurityFilters {
  startDate?: string;
  endDate?: string;
  eventType?: string;
  severity?: string;
  ipAddress?: string;
  userId?: string;
}

export interface SessionFilters {
  userId?: string;
  isActive?: boolean;
  ipAddress?: string;
}

// Costanti
export const SECURITY_EVENT_TYPES = {
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  LOGOUT: 'logout',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'password_reset_completed',
  PASSWORD_CHANGED: 'password_changed',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  IP_BLOCKED: 'ip_blocked',
  SESSION_CREATED: 'session_created',
  SESSION_TERMINATED: 'session_terminated'
} as const;

export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;
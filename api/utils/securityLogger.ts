/**
 * Security Logger Utility
 * Gestisce il logging degli eventi di sicurezza
 */
import { supabase } from '../lib/supabase';

interface SecurityLogEntry {
  event_type: string;
  user_id?: string;
  ip_address: string;
  user_agent: string;
  details?: any;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Logger per eventi di sicurezza
 */
export const securityLogger = {
  /**
   * Log di un evento di sicurezza
   */
  async log(entry: SecurityLogEntry): Promise<void> {
    try {
      await supabase
        .from('security_logs')
        .insert({
          event_type: entry.event_type,
          user_id: entry.user_id || null,
          ip_address: entry.ip_address,
          user_agent: entry.user_agent,
          details: entry.details || {},
          severity: entry.severity || 'medium',
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Errore nel logging di sicurezza:', error);
    }
  },

  /**
   * Log di tentativo di login
   */
  async logLoginAttempt(userId: string | null, email: string, success: boolean, ipAddress: string, userAgent: string): Promise<void> {
    await this.log({
      event_type: success ? 'login_success' : 'login_failed',
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: {
        email,
        success
      },
      severity: success ? 'low' : 'medium'
    });
  },

  /**
   * Log di logout
   */
  async logLogout(userId: string, ipAddress: string, userAgent: string): Promise<void> {
    await this.log({
      event_type: 'logout',
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      severity: 'low'
    });
  },

  /**
   * Log di attività sospetta
   */
  async logSuspiciousActivity(eventType: string, userId: string | null, ipAddress: string, userAgent: string, details: any): Promise<void> {
    await this.log({
      event_type: eventType,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
      severity: 'high'
    });
  }
};
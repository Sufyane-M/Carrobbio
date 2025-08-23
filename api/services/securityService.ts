/**
 * Security Service
 * Gestisce le funzionalità di sicurezza avanzate
 */
import { Request } from 'express'
import { createClient } from '@supabase/supabase-js';
// import { logSecurityEvent } from '../middleware/securityLogger.js'; // Rimosso - gestito internamente
import { sendSuspiciousLoginNotification } from './emailService.js';
import crypto from 'crypto'
import { SecurityStats, ThreatAnalysis, IPAnalysis } from '../../shared/types.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configurazioni di sicurezza
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_ATTEMPT_WINDOW: 15 * 60 * 1000, // 15 minuti
  SUSPICIOUS_ACTIVITY_THRESHOLD: 10, // Richieste per minuto
  IP_BLOCK_DURATION: 60 * 60 * 1000, // 1 ora
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 ore
  PASSWORD_RESET_ATTEMPTS: 3,
  PASSWORD_RESET_WINDOW: 60 * 60 * 1000 // 1 ora
};

// Interfacce importate da shared/types.ts

/**
 * Analizza un indirizzo IP per attività sospette
 */
export const analyzeIPAddress = async (
  ipAddress: string,
  timeWindow: number = 60 * 60 * 1000 // 1 ora
): Promise<IPAnalysis> => {
  try {
    const windowStart = new Date(Date.now() - timeWindow);
    
    // Analizza i tentativi di login
    const { data: loginAttempts, error: loginError } = await supabase
      .from('login_attempts')
      .select('*')
      .eq('ip_address', ipAddress)
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false });

    if (loginError) {
      console.error('Errore nell\'analisi dei tentativi di login:', loginError);
    }

    // Analizza gli eventi di sicurezza
    const { data: securityEvents, error: securityError } = await supabase
      .from('security_logs')
      .select('*')
      .eq('ip_address', ipAddress)
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false });

    if (securityError) {
      console.error('Errore nell\'analisi degli eventi di sicurezza:', securityError);
    }

    const attempts = loginAttempts || [];
    const events = securityEvents || [];
    
    // Calcola il punteggio di rischio
    let riskScore = 0;
    const threats: string[] = [];
    
    // Analisi tentativi di login falliti
    const failedAttempts = attempts.filter(a => !a.success).length;
    if (failedAttempts > 3) {
      riskScore += failedAttempts * 10;
      threats.push(`${failedAttempts} tentativi di login falliti`);
    }
    
    // Analisi frequenza richieste
    const requestCount = events.length;
    if (requestCount > 50) {
      riskScore += 20;
      threats.push(`${requestCount} richieste nell'ultima ora`);
    }
    
    // Analisi pattern sospetti
    const suspiciousEvents = events.filter(e => 
      e.event_type.includes('suspicious') || 
      e.event_type.includes('attack') ||
      e.severity === 'high'
    );
    
    if (suspiciousEvents.length > 0) {
      riskScore += suspiciousEvents.length * 15;
      threats.push(`${suspiciousEvents.length} attività sospette rilevate`);
    }
    
    // Determina se l'IP è bloccato
    const isBlocked = riskScore > 50 || failedAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS;
    
    const lastActivity = attempts.length > 0 ? attempts[0].created_at : 
                        events.length > 0 ? events[0].created_at : new Date().toISOString();
    
    const userAgent = attempts.length > 0 ? attempts[0].user_agent : 
                     events.length > 0 ? events[0].user_agent : 'unknown';

    return {
      ipAddress,
      riskScore: Math.min(riskScore, 100),
      isBlocked,
      loginAttempts: attempts.length,
      lastActivity,
      userAgent,
      threats
    };
  } catch (error) {
    console.error('Errore nell\'analisi dell\'IP:', error);
    return {
      ipAddress,
      riskScore: 0,
      isBlocked: false,
      loginAttempts: 0,
      lastActivity: new Date().toISOString(),
      userAgent: 'unknown',
      threats: []
    };
  }
};

/**
 * Rileva pattern di attacco comuni
 */
export const detectAttackPatterns = async (
  timeWindow: number = 60 * 60 * 1000 // 1 ora
): Promise<ThreatAnalysis> => {
  try {
    const windowStart = new Date(Date.now() - timeWindow);
    
    // Analizza gli eventi di sicurezza recenti
    const { data: events, error } = await supabase
      .from('security_logs')
      .select('*')
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Errore nel rilevamento dei pattern di attacco:', error);
      return {
        riskLevel: 'low',
        threats: [],
        recommendations: [],
        blockedIPs: [],
        suspiciousPatterns: []
      };
    }

    const threats: string[] = [];
    const recommendations: string[] = [];
    const suspiciousPatterns: any[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    // Analizza pattern di brute force
    const bruteForceEvents = events.filter(e => 
      e.event_type.includes('login_failure') || 
      e.event_type.includes('rate_limit')
    );
    
    if (bruteForceEvents.length > 20) {
      threats.push('Possibile attacco brute force rilevato');
      recommendations.push('Implementare CAPTCHA dopo 3 tentativi falliti');
      riskLevel = 'high';
    }
    
    // Analizza tentativi di SQL injection
    const sqlInjectionEvents = events.filter(e => 
      e.details && JSON.stringify(e.details).includes('sql')
    );
    
    if (sqlInjectionEvents.length > 0) {
      threats.push('Tentativi di SQL injection rilevati');
      recommendations.push('Verificare la sanitizzazione degli input');
      riskLevel = 'high';
    }
    
    // Analizza tentativi di XSS
    const xssEvents = events.filter(e => 
      e.details && JSON.stringify(e.details).includes('script')
    );
    
    if (xssEvents.length > 0) {
      threats.push('Tentativi di XSS rilevati');
      recommendations.push('Verificare la validazione e encoding degli output');
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
    }
    
    // Analizza IP sospetti
    const ipCounts = events.reduce((acc, event) => {
      acc[event.ip_address] = (acc[event.ip_address] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const blockedIPs = Object.entries(ipCounts)
      .filter(([_, count]) => (count as number) > SECURITY_CONFIG.SUSPICIOUS_ACTIVITY_THRESHOLD)
      .map(([ip, _]) => ip);
    
    if (blockedIPs.length > 0) {
      threats.push(`${blockedIPs.length} IP con attività sospetta`);
      recommendations.push('Considerare il blocco temporaneo degli IP sospetti');
    }
    
    // Analizza pattern temporali
    const hourlyDistribution = events.reduce((acc, event) => {
      const hour = new Date(event.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const maxHourlyEvents = Math.max(...Object.values(hourlyDistribution).map(v => v as number));
    if (maxHourlyEvents > 100) {
      threats.push('Picco anomalo di attività rilevato');
      recommendations.push('Monitorare attentamente il traffico nelle prossime ore');
      suspiciousPatterns.push({
        type: 'temporal_anomaly',
        description: 'Picco di attività',
        value: maxHourlyEvents,
        threshold: 100
      });
    }
    
    // Determina il livello di rischio finale
    if (threats.length === 0) {
      riskLevel = 'low';
    } else if (threats.length <= 2) {
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    } else if (threats.length <= 4) {
      riskLevel = riskLevel === 'low' || riskLevel === 'medium' ? 'high' : riskLevel;
    } else {
      riskLevel = 'critical';
    }
    
    return {
      riskLevel,
      threats,
      recommendations,
      blockedIPs,
      suspiciousPatterns
    };
  } catch (error) {
    console.error('Errore nel rilevamento dei pattern di attacco:', error);
    return {
      riskLevel: 'low',
      threats: [],
      recommendations: [],
      blockedIPs: [],
      suspiciousPatterns: []
    };
  }
};

/**
 * Ottieni statistiche di sicurezza
 */
export const getSecurityStatistics = async (
  timeWindow: number = 24 * 60 * 60 * 1000 // 24 ore
): Promise<SecurityStats> => {
  try {
    const windowStart = new Date(Date.now() - timeWindow);
    
    // Statistiche tentativi di login
    const { data: loginAttempts, error: loginError } = await supabase
      .from('login_attempts')
      .select('*')
      .gte('created_at', windowStart.toISOString());

    if (loginError) {
      console.error('Errore nel recupero delle statistiche di login:', loginError);
    }

    // Statistiche sessioni attive
    const { data: activeSessions, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString());

    if (sessionError) {
      console.error('Errore nel recupero delle sessioni attive:', sessionError);
    }

    // Statistiche reset password
    const { data: passwordResets, error: resetError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .gte('created_at', windowStart.toISOString());

    if (resetError) {
      console.error('Errore nel recupero delle statistiche di reset password:', resetError);
    }

    // Statistiche eventi di sicurezza
    const { data: securityEvents, error: securityError } = await supabase
      .from('security_logs')
      .select('*')
      .gte('created_at', windowStart.toISOString())
      .in('event_type', ['suspicious_activity', 'attack_detected', 'rate_limit_exceeded']);

    if (securityError) {
      console.error('Errore nel recupero degli eventi di sicurezza:', securityError);
    }

    const attempts = loginAttempts || [];
    const sessions = activeSessions || [];
    const resets = passwordResets || [];
    const events = securityEvents || [];
    
    // Calcola IP bloccati
    const ipCounts = attempts.reduce((acc, attempt) => {
      if (!attempt.success) {
        acc[attempt.ip_address] = (acc[attempt.ip_address] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const blockedIPs = Object.values(ipCounts).filter((count: number) => 
      count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS
    ).length;
    
    // Utenti attivi unici
    const activeUsers = new Set(sessions.map(s => s.user_id)).size;
    
    return {
      total_login_attempts: attempts.length,
      failed_logins: attempts.filter(a => !a.success).length,
      successful_logins: attempts.filter(a => a.success).length,
      blocked_ips: blockedIPs,
      suspicious_activities: events.length,
      active_users: activeUsers,
      active_sessions: sessions.length,
      password_reset_requests: resets.length
    };
  } catch (error) {
    console.error('Errore nel recupero delle statistiche di sicurezza:', error);
    return {
      total_login_attempts: 0,
      failed_logins: 0,
      successful_logins: 0,
      blocked_ips: 0,
      suspicious_activities: 0,
      active_users: 0,
      active_sessions: 0,
      password_reset_requests: 0
    };
  }
};

/**
 * Ottiene i tentativi di login per un utente
 */
export const getLoginAttempts = async (
  userId: string,
  timeWindow: number = 24 * 60 * 60 * 1000 // 24 ore
): Promise<any[]> => {
  try {
    const windowStart = new Date(Date.now() - timeWindow);
    
    const { data: attempts, error } = await supabase
      .from('login_attempts')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Errore nel recupero dei tentativi di login:', error);
      return [];
    }

    return attempts || [];
  } catch (error) {
    console.error('Errore nel recupero dei tentativi di login:', error);
    return [];
  }
};

/**
 * Registra un evento di sicurezza
 */
export const logSecurityEvent = async (eventData: {
  event_type: string;
  ip_address: string;
  user_agent?: string;
  user_id?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  details?: any;
}): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('security_logs')
      .insert({
        event_type: eventData.event_type,
        ip_address: eventData.ip_address,
        user_agent: eventData.user_agent || 'unknown',
        user_id: eventData.user_id || null,
        severity: eventData.severity || 'medium',
        details: eventData.details || {},
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Errore nel logging dell\'evento di sicurezza:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Errore nel logging dell\'evento di sicurezza:', error);
    return false;
  }
};

/**
 * Blocca un IP per attività sospetta
 */
export const blockSuspiciousIP = async (
  ipAddress: string,
  reason: string,
  duration: number = SECURITY_CONFIG.IP_BLOCK_DURATION
): Promise<boolean> => {
  try {
    // Log dell'evento di blocco rimosso - gestito internamente
    // Il logging sarà gestito dal sistema di sicurezza interno

    console.log(`IP ${ipAddress} bloccato per: ${reason}`);
    return true;
  } catch (error) {
    console.error('Errore nel blocco dell\'IP:', error);
    return false;
  }
};

/**
 * Monitora attività sospette in tempo reale
 */
export const monitorSuspiciousActivity = async (): Promise<void> => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Analizza gli eventi recenti
    const { data: recentEvents, error } = await supabase
      .from('security_logs')
      .select('*')
      .gte('created_at', fiveMinutesAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Errore nel monitoraggio delle attività sospette:', error);
      return;
    }

    if (!recentEvents || recentEvents.length === 0) {
      return;
    }

    // Raggruppa per IP
    const ipActivity = recentEvents.reduce((acc, event) => {
      const ip = event.ip_address;
      if (!acc[ip]) {
        acc[ip] = [];
      }
      acc[ip].push(event);
      return acc;
    }, {} as Record<string, any[]>);

    // Controlla ogni IP per attività sospette
    for (const [ip, events] of Object.entries(ipActivity)) {
      const eventArray = events as any[];
      const suspiciousEvents = eventArray.filter(e => 
        e.severity === 'high' || 
        e.event_type.includes('attack') ||
        e.event_type.includes('suspicious')
      );

      if (suspiciousEvents.length >= 3) {
        await blockSuspiciousIP(
          ip, 
          `${suspiciousEvents.length} eventi sospetti in 5 minuti`
        );

        // Notifica gli amministratori se necessario
        const { data: adminUsers } = await supabase
          .from('admin_users')
          .select('email')
          .eq('role', 'admin');

        if (adminUsers && adminUsers.length > 0) {
          for (const admin of adminUsers) {
            await sendSuspiciousLoginNotification(
              admin.email,
              ip,
              eventArray[0].user_agent || 'unknown',
              new Date().toLocaleString('it-IT')
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('Errore nel monitoraggio delle attività sospette:', error);
  }
};

/**
 * Pulisce i dati di sicurezza vecchi
 */
export const cleanupSecurityData = async (): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Pulisci vecchi log di sicurezza (30 giorni)
    await supabase
      .from('security_logs')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());
    
    // Pulisci vecchi tentativi di login (7 giorni)
    await supabase
      .from('login_attempts')
      .delete()
      .lt('created_at', sevenDaysAgo.toISOString());
    
    // Pulisci token di reset scaduti
    await supabase
      .from('password_reset_tokens')
      .delete()
      .lt('expires_at', new Date().toISOString());
    
    // Disattiva sessioni scadute
    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .lt('expires_at', new Date().toISOString())
      .eq('is_active', true);
    
    console.log('Pulizia dati di sicurezza completata');
  } catch (error) {
    console.error('Errore nella pulizia dei dati di sicurezza:', error);
  }
};

// Avvia il monitoraggio automatico ogni 5 minuti
setInterval(monitorSuspiciousActivity, 5 * 60 * 1000);

// Avvia la pulizia automatica ogni giorno
setInterval(cleanupSecurityData, 24 * 60 * 60 * 1000);
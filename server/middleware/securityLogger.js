import { createClient } from '@supabase/supabase-js';
// Environment variables validation
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is required');
}
if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);
/**
 * Registra un evento di sicurezza
 */
export const logSecurityEvent = async (event) => {
    try {
        await supabase
            .from('security_logs')
            .insert({
            event_type: event.eventType,
            user_id: event.userId || null,
            ip_address: event.ipAddress,
            user_agent: event.userAgent,
            details: event.details || {},
            severity: event.severity || 'medium',
            created_at: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Errore nel logging dell\'evento di sicurezza:', error);
    }
};
/**
 * Middleware per il logging delle richieste sensibili
 */
export const securityLogger = (eventType, severity = 'medium') => {
    return async (req, res, next) => {
        const originalSend = res.send;
        const startTime = Date.now();
        // Override del metodo send per catturare la risposta
        res.send = function (body) {
            const responseTime = Date.now() - startTime;
            const statusCode = res.statusCode;
            // Log dell'evento
            logSecurityEvent({
                eventType: eventType,
                userId: req.user?.userId,
                ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown',
                severity: severity,
                details: {
                    method: req.method,
                    path: req.path,
                    statusCode: statusCode,
                    responseTime: responseTime,
                    body: req.method !== 'GET' ? req.body : undefined,
                    query: req.query,
                    headers: {
                        'content-type': req.get('Content-Type'),
                        'accept': req.get('Accept'),
                        'referer': req.get('Referer')
                    }
                }
            });
            return originalSend.call(this, body);
        };
        next();
    };
};
/**
 * Middleware per rilevare attività sospette
 */
export const suspiciousActivityDetector = async (req, res, next) => {
    try {
        const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        const path = req.path;
        const method = req.method;
        // Rileva pattern sospetti
        const suspiciousPatterns = [
            /\.\.\//, // Path traversal
            /<script/i, // XSS attempts
            /union.*select/i, // SQL injection
            /javascript:/i, // JavaScript injection
            /eval\(/i, // Code injection
            /exec\(/i, // Command injection
        ];
        const requestString = `${method} ${path} ${JSON.stringify(req.query)} ${JSON.stringify(req.body)}`;
        const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestString));
        if (isSuspicious) {
            await logSecurityEvent({
                eventType: 'suspicious_activity_detected',
                userId: req.user?.userId,
                ipAddress: clientIp,
                userAgent: userAgent,
                severity: 'high',
                details: {
                    method: method,
                    path: path,
                    query: req.query,
                    body: req.body,
                    detectedPattern: 'Multiple suspicious patterns'
                }
            });
        }
        // Rileva richieste ad alta frequenza dallo stesso IP
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const { data: recentRequests } = await supabase
            .from('security_logs')
            .select('id')
            .eq('ip_address', clientIp)
            .gte('created_at', fiveMinutesAgo.toISOString());
        if (recentRequests && recentRequests.length > 100) {
            await logSecurityEvent({
                eventType: 'high_frequency_requests',
                ipAddress: clientIp,
                userAgent: userAgent,
                severity: 'high',
                details: {
                    requestCount: recentRequests.length,
                    timeWindow: '5 minutes',
                    currentPath: path
                }
            });
        }
        next();
    }
    catch (error) {
        console.error('Errore nel rilevamento di attività sospette:', error);
        next();
    }
};
/**
 * Middleware per il logging degli errori di autenticazione
 */
export const authErrorLogger = async (req, res, next) => {
    const originalSend = res.send;
    res.send = function (body) {
        if (res.statusCode === 401 || res.statusCode === 403) {
            logSecurityEvent({
                eventType: 'authentication_failure',
                userId: req.user?.userId,
                ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown',
                severity: 'medium',
                details: {
                    method: req.method,
                    path: req.path,
                    statusCode: res.statusCode,
                    body: req.body,
                    headers: req.headers
                }
            });
        }
        return originalSend.call(this, body);
    };
    next();
};
/**
 * Funzione per ottenere statistiche di sicurezza
 */
export const getSecurityStats = async (timeframe = 'day') => {
    try {
        let timeAgo;
        switch (timeframe) {
            case 'hour':
                timeAgo = new Date(Date.now() - 60 * 60 * 1000);
                break;
            case 'day':
                timeAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                break;
            case 'week':
                timeAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                break;
        }
        const { data: events, error } = await supabase
            .from('security_logs')
            .select('event_type, severity, created_at')
            .gte('created_at', timeAgo.toISOString());
        if (error) {
            throw error;
        }
        const stats = {
            totalEvents: events?.length || 0,
            eventsByType: {},
            eventsBySeverity: {
                low: 0,
                medium: 0,
                high: 0,
                critical: 0
            },
            timeframe
        };
        events?.forEach(event => {
            // Conta per tipo
            stats.eventsByType[event.event_type] = (stats.eventsByType[event.event_type] || 0) + 1;
            // Conta per severità
            stats.eventsBySeverity[event.severity]++;
        });
        return stats;
    }
    catch (error) {
        console.error('Errore nel recupero delle statistiche di sicurezza:', error);
        return null;
    }
};
/**
 * Pulisce i log di sicurezza vecchi (oltre 30 giorni)
 */
export const cleanupOldSecurityLogs = async () => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        await supabase
            .from('security_logs')
            .delete()
            .lt('created_at', thirtyDaysAgo.toISOString());
        console.log('Log di sicurezza vecchi puliti con successo');
    }
    catch (error) {
        console.error('Errore nella pulizia dei log di sicurezza:', error);
    }
};
// Pulisci i log vecchi ogni giorno
setInterval(cleanupOldSecurityLogs, 24 * 60 * 60 * 1000);

/**
 * Tipi condivisi tra frontend e backend
 */
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
};
export const SEVERITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

# Piano di Implementazione - Sistema Login Admin Avanzato

## 1. Strategia di Migrazione

### 1.1 Approccio Blue-Green Deployment

Per garantire la continuità del servizio durante la migrazione, implementeremo un approccio blue-green:

- **Blue Environment**: Sistema attuale in produzione
- **Green Environment**: Nuovo sistema di login avanzato
- **Rollback Plan**: Possibilità di tornare al sistema precedente in caso di problemi

### 1.2 Fasi di Implementazione

1. **Fase 1**: Preparazione infrastruttura e database
2. **Fase 2**: Sviluppo nuovo sistema in parallelo
3. **Fase 3**: Testing e validazione
4. **Fase 4**: Migrazione graduale utenti
5. **Fase 5**: Dismissione sistema legacy

## 2. Implementazione Backend

### 2.1 Struttura Directory Backend

```
api/
├── middleware/
│   ├── auth.ts
│   ├── rateLimiting.ts
│   ├── validation.ts
│   └── security.ts
├── controllers/
│   ├── authController.ts
│   └── adminController.ts
├── services/
│   ├── authService.ts
│   ├── emailService.ts
│   └── securityService.ts
├── models/
│   ├── AdminUser.ts
│   ├── LoginAttempt.ts
│   └── PasswordResetToken.ts
├── utils/
│   ├── jwt.ts
│   ├── bcrypt.ts
│   └── validators.ts
└── routes/
    ├── auth.ts
    └── admin.ts
```

### 2.2 Middleware di Sicurezza

**Rate Limiting Middleware (api/middleware/rateLimiting.ts)**
```typescript
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export const loginRateLimit = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 5, // max 5 tentativi per IP
  message: {
    error: 'Troppi tentativi di login. Riprova tra 15 minuti.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const passwordResetRateLimit = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 3, // max 3 richieste reset per IP
  message: {
    error: 'Troppi tentativi di reset password. Riprova tra 1 ora.'
  }
})
```

**Authentication Middleware (api/middleware/auth.ts)**
```typescript
import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'

interface AuthRequest extends Request {
  user?: any
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token di accesso richiesto' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    // Verifica che la sessione sia ancora valida
    const { data: session } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_token', token)
      .eq('user_id', decoded.userId)
      .single()

    if (!session || new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Sessione scaduta' })
    }

    // Aggiorna last_activity
    await supabase
      .from('user_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', session.id)

    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Token non valido' })
  }
}
```

### 2.3 Controller di Autenticazione

**Auth Controller (api/controllers/authController.ts)**
```typescript
import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../lib/supabase'
import { emailService } from '../services/emailService'
import { securityService } from '../services/securityService'

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password, rememberMe } = req.body
      const ipAddress = req.ip
      const userAgent = req.get('User-Agent')

      // Trova utente
      const { data: user, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .single()

      // Log tentativo di login
      await securityService.logLoginAttempt({
        userId: user?.id,
        ipAddress,
        userAgent,
        success: false
      })

      if (!user || !await bcrypt.compare(password, user.password_hash)) {
        return res.status(401).json({
          error: 'Credenziali non valide'
        })
      }

      // Genera JWT token
      const tokenExpiry = rememberMe ? '30d' : '2h'
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: tokenExpiry }
      )

      // Crea sessione
      const sessionExpiry = new Date()
      sessionExpiry.setTime(
        sessionExpiry.getTime() + 
        (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000)
      )

      await supabase.from('user_sessions').insert({
        user_id: user.id,
        session_token: token,
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: sessionExpiry.toISOString()
      })

      // Aggiorna last_login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id)

      // Log successo
      await securityService.logLoginAttempt({
        userId: user.id,
        ipAddress,
        userAgent,
        success: true
      })

      await securityService.logSecurityEvent({
        userId: user.id,
        eventType: 'LOGIN_SUCCESS',
        description: 'Login effettuato con successo',
        ipAddress
      })

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        expiresIn: rememberMe ? 2592000 : 7200
      })
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({ error: 'Errore interno del server' })
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body
      const ipAddress = req.ip

      const { data: user } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .single()

      if (!user) {
        // Non rivelare se l'email esiste o meno
        return res.json({
          success: true,
          message: 'Se l\'email esiste, riceverai un link per il reset'
        })
      }

      // Genera token sicuro
      const resetToken = crypto.randomBytes(32).toString('hex')
      const tokenHash = await bcrypt.hash(resetToken, 10)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minuti

      // Salva token
      await supabase.from('password_reset_tokens').insert({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString()
      })

      // Invia email
      await emailService.sendPasswordResetEmail(user.email, resetToken)

      // Log evento
      await securityService.logSecurityEvent({
        userId: user.id,
        eventType: 'PASSWORD_RESET_REQUESTED',
        description: 'Richiesta reset password',
        ipAddress
      })

      res.json({
        success: true,
        message: 'Se l\'email esiste, riceverai un link per il reset'
      })
    } catch (error) {
      console.error('Forgot password error:', error)
      res.status(500).json({ error: 'Errore interno del server' })
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword, confirmPassword } = req.body
      const ipAddress = req.ip

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          error: 'Le password non corrispondono'
        })
      }

      // Trova token valido
      const { data: resetTokens } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())

      let validToken = null
      for (const tokenRecord of resetTokens || []) {
        if (await bcrypt.compare(token, tokenRecord.token_hash)) {
          validToken = tokenRecord
          break
        }
      }

      if (!validToken) {
        return res.status(400).json({
          error: 'Token non valido o scaduto'
        })
      }

      // Hash nuova password
      const passwordHash = await bcrypt.hash(newPassword, 12)

      // Aggiorna password
      await supabase
        .from('admin_users')
        .update({ 
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', validToken.user_id)

      // Marca token come usato
      await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('id', validToken.id)

      // Invalida tutte le sessioni esistenti
      await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', validToken.user_id)

      // Log evento
      await securityService.logSecurityEvent({
        userId: validToken.user_id,
        eventType: 'PASSWORD_RESET_COMPLETED',
        description: 'Password resettata con successo',
        ipAddress
      })

      res.json({
        success: true,
        message: 'Password aggiornata con successo'
      })
    } catch (error) {
      console.error('Reset password error:', error)
      res.status(500).json({ error: 'Errore interno del server' })
    }
  }
}
```

## 3. Implementazione Frontend

### 3.1 Struttura Componenti React

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── ui/
│   │   ├── Input.tsx
│   │   ├── Button.tsx
│   │   ├── Alert.tsx
│   │   └── LoadingSpinner.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useForm.ts
│   └── useSecurityLogs.ts
├── services/
│   ├── authService.ts
│   └── apiClient.ts
├── types/
│   └── auth.ts
└── utils/
    ├── validation.ts
    └── security.ts
```

### 3.2 Hook di Autenticazione Avanzato

**useAuth Hook (src/hooks/useAuth.ts)**
```typescript
import { useState, useEffect, createContext, useContext } from 'react'
import { authService } from '../services/authService'
import type { AdminUser, LoginCredentials } from '../types/auth'

interface AuthContextType {
  user: AdminUser | null
  loading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await authService.login(credentials)
      
      // Salva token in httpOnly cookie (gestito dal server)
      setUser(response.user)
      
      // Salva dati utente in localStorage per persistenza UI
      localStorage.setItem('carrobbio_user', JSON.stringify(response.user))
    } catch (err: any) {
      setError(err.message || 'Errore durante il login')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
      localStorage.removeItem('carrobbio_user')
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true)
      setError(null)
      await authService.forgotPassword(email)
    } catch (err: any) {
      setError(err.message || 'Errore durante la richiesta')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (token: string, password: string, confirmPassword: string) => {
    try {
      setLoading(true)
      setError(null)
      await authService.resetPassword(token, password, confirmPassword)
    } catch (err: any) {
      setError(err.message || 'Errore durante il reset')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Verifica token all'avvio
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.verifyToken()
        if (response.valid) {
          setUser(response.user)
        }
      } catch (err) {
        // Token non valido, rimuovi dati locali
        localStorage.removeItem('carrobbio_user')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  return {
    user,
    loading,
    error,
    login,
    logout,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user
  }
}
```

## 4. Piano di Migrazione

### 4.1 Checklist Pre-Migrazione

- [ ] Backup completo database esistente
- [ ] Setup ambiente di staging identico alla produzione
- [ ] Configurazione variabili ambiente (JWT_SECRET, REDIS_URL, EMAIL_API_KEY)
- [ ] Test completi su ambiente staging
- [ ] Preparazione script di rollback
- [ ] Notifica utenti della manutenzione programmata

### 4.2 Procedura di Migrazione

**Step 1: Preparazione Database**
```sql
-- Esegui migrazioni database
\i supabase/migrations/006_advanced_auth_system.sql

-- Verifica integrità dati
SELECT COUNT(*) FROM admin_users WHERE is_active = true;
```

**Step 2: Deploy Backend**
```bash
# Build e deploy nuovo backend
npm run build
npm run deploy:staging

# Test health check
curl -f http://staging-api.ilcarrobbio.com/health
```

**Step 3: Deploy Frontend**
```bash
# Build frontend con nuovo sistema auth
VITE_API_URL=https://staging-api.ilcarrobbio.com npm run build

# Deploy su staging
npm run deploy:staging
```

**Step 4: Testing Completo**
- Test login con credenziali esistenti
- Test recupero password
- Test rate limiting
- Test sicurezza (CSRF, XSS)
- Test responsive design

**Step 5: Go-Live**
```bash
# Switch DNS/Load Balancer al nuovo sistema
# Monitoraggio real-time per 2 ore
# Rollback automatico se errori > 1%
```

### 4.3 Monitoraggio Post-Migrazione

- Monitoraggio errori login (target: < 0.1%)
- Performance response time (target: < 200ms)
- Utilizzo memoria e CPU
- Log di sicurezza per attività sospette
- Feedback utenti per 48 ore

### 4.4 Piano di Rollback

In caso di problemi critici:

1. **Rollback immediato** (< 5 minuti)
   ```bash
   # Switch DNS al sistema legacy
   # Disabilita nuovo sistema
   # Notifica team
   ```

2. **Rollback database** (se necessario)
   ```sql
   -- Restore da backup pre-migrazione
   -- Verifica integrità dati
   ```

3. **Comunicazione**
   - Notifica utenti del problema
   - Timeline per risoluzione
   - Aggiornamenti ogni 30 minuti

## 5. Metriche di Successo

- **Sicurezza**: 0 vulnerabilità critiche, 100% richieste protette da CSRF
- **Performance**: Login < 200ms, Uptime > 99.9%
- **Usabilità**: Tasso successo login > 98%, 0 segnalazioni UX negative
- **Affidabilità**: 0 perdite di sessione, recovery password < 2 minuti

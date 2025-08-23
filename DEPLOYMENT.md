# Deployment Guide - Il Carrobbio

Guida completa per il deployment dell'applicazione Il Carrobbio su Vercel.

## 📋 Prerequisiti

- Account Vercel
- Progetto Supabase configurato
- Repository Git (GitHub, GitLab, o Bitbucket)

## 🚀 Deployment su Vercel

### 1. Preparazione del Repository

```bash
# Clona il repository
git clone <your-repo-url>
cd Carrobbio

# Installa le dipendenze
npm install
```

### 2. Configurazione delle Variabili d'Ambiente

Copia il file `.env.example` in `.env` e configura le seguenti variabili:

#### Frontend (Supabase)
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### Backend
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_REGION=your-region
```

#### JWT Configuration
```env
JWT_SECRET=your-super-secret-jwt-key-256-bits
JWT_EXPIRES_IN=24h
```

#### Server Configuration
```env
PORT=3002
FRONTEND_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

#### Email Configuration
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@carrobbio.com
```

### 3. Deploy su Vercel

#### Opzione A: Vercel CLI
```bash
# Installa Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

#### Opzione B: Vercel Dashboard
1. Vai su [vercel.com](https://vercel.com)
2. Clicca "New Project"
3. Importa il repository
4. Configura le variabili d'ambiente nel dashboard
5. Deploy

### 4. Configurazione Variabili d'Ambiente su Vercel

Nel dashboard Vercel:
1. Vai su **Settings** > **Environment Variables**
2. Aggiungi tutte le variabili dal file `.env.example`
3. Assicurati di impostare `NODE_ENV=production`

### 5. Configurazione Database Supabase

Esegui le migrazioni del database:
```bash
# Se hai Supabase CLI installato
supabase db push

# Oppure esegui manualmente le migrazioni dalla cartella supabase/migrations
```

## 🔧 Configurazione Files

### vercel.json
Il file è già configurato per:
- Build statico del frontend
- Funzioni serverless per le API
- Headers CORS
- Rewrites per SPA routing

### package.json
Script ottimizzati:
- `vercel-build`: Script di build per Vercel
- `build`: Build di produzione
- `start`: Avvio server di produzione

### vite.config.ts
Configurazione ottimizzata per:
- Code splitting
- Minificazione
- Ottimizzazioni di produzione

## 🧪 Testing

### Test Locale
```bash
# Build di produzione
npm run build

# Preview locale
npm run preview
```

### Test su Vercel
```bash
# Deploy di preview
vercel

# Deploy di produzione
vercel --prod
```

## 🔍 Troubleshooting

### Errori Comuni

1. **API Routes non funzionano**
   - Verifica che `vercel.json` sia configurato correttamente
   - Controlla che le funzioni siano in `api/` directory

2. **Variabili d'ambiente non caricate**
   - Verifica nel dashboard Vercel
   - Assicurati che i nomi siano corretti

3. **Build fallisce**
   - Controlla i log di build su Vercel
   - Verifica che tutte le dipendenze siano installate

4. **Database connection errors**
   - Verifica le credenziali Supabase
   - Controlla che RLS sia configurato correttamente

### Log e Monitoring

- **Vercel Functions**: Dashboard > Functions > View Logs
- **Build Logs**: Dashboard > Deployments > View Build Logs
- **Runtime Logs**: Dashboard > Functions > View Function Logs

## 📚 Risorse Utili

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

## 🔐 Sicurezza

- Non committare mai il file `.env`
- Usa sempre HTTPS in produzione
- Configura correttamente CORS
- Implementa rate limiting per le API
- Usa JWT con scadenza appropriata

## 📞 Supporto

Per problemi di deployment, controlla:
1. Log di build su Vercel
2. Log delle funzioni
3. Configurazione delle variabili d'ambiente
4. Stato del database Supabase
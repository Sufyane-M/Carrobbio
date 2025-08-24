# Guida al Deploy su Vercel

Questa guida risolve i problemi comuni durante il deploy del progetto Il Carrobbio su Vercel.

## 🚨 Problemi Risolti

### 1. Versione Node.js Deprecata

**Problema:** Node.js 18.x è deprecato su Vercel dal 1 settembre 2025.

**Soluzione:** ✅ Aggiornato `package.json` per utilizzare Node.js 20.x (più stabile con i builder Vercel)

```json
{
  "engines": {
    "node": "20.x"
  }
}
```

> **Nota:** Node 20.x è preferibile a 22.x su Vercel perché alcuni builder ufficiali (`@vercel/node@2.x`) non supportano ancora Node 22 in modo stabile. Node 20.x risolve anche i warning EBADENGINE di pacchetti come `react-router@7.8.1`.

### 2. Configurazione Variabili d'Ambiente Supabase

**Problema:** Le variabili d'ambiente devono essere prefissate con `VITE_` per essere accessibili nel frontend.

**Soluzione:** ✅ Il codice utilizza già le variabili corrette:

```typescript
// src/lib/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

### 3. Conflitto Import Dinamico/Statico

**Problema:** `FeaturedDishes` era importato sia staticamente che dinamicamente.

**Soluzione:** ✅ Rimosso l'import statico da `index.ts`, mantenendo solo l'import dinamico in `Home.tsx`.

## 📋 Checklist per il Deploy

### Preparazione Pre-Deploy

**Pulizia Dependencies (Raccomandato):**

Prima del deploy, pulisci i lockfile per evitare conflitti:

```bash
# Rimuovi vecchi lockfile e node_modules
rm -rf node_modules package-lock.json pnpm-lock.yaml

# Reinstalla con npm
npm install

# OPPURE se usi pnpm
pnpm install
```

### Configurazione Vercel

1. **Impostazioni Progetto:**
   - [ ] Node.js Version: `20.x`
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `dist`
   - [ ] Install Command: `npm install`

2. **Variabili d'Ambiente:**
   
   Vai su **Project Settings > Environment Variables** e aggiungi:
   
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   JWT_SECRET=your-jwt-secret-256-bits
   FRONTEND_URL=https://your-domain.vercel.app
   NODE_ENV=production
   ```

3. **Configurazione Build:**
   - [ ] Assicurati che tutte le variabili `VITE_*` siano disponibili durante il build
   - [ ] Verifica che non ci siano errori TypeScript

### Verifica Post-Deploy

1. **Funzionalità Frontend:**
   - [ ] Homepage carica correttamente
   - [ ] Navigazione funziona
   - [ ] Componenti dinamici (FeaturedDishes) si caricano

2. **Integrazione Supabase:**
   - [ ] Connessione al database
   - [ ] Autenticazione admin
   - [ ] CRUD operazioni

3. **Performance:**
   - [ ] Tempi di caricamento accettabili
   - [ ] Nessun errore in console
   - [ ] Lazy loading funziona

## 🔧 Comandi Utili

```bash
# Test build locale
npm run build
npm run preview

# Verifica TypeScript
npm run check

# Lint del codice
npm run lint
```

## 🐛 Troubleshooting

### Errore "Missing Supabase environment variables"

1. Verifica che le variabili siano configurate su Vercel
2. Assicurati che inizino con `VITE_` per il frontend
3. Controlla che i valori siano corretti (URL e chiavi)

### Errore di Build TypeScript

1. Esegui `npm run check` localmente
2. Risolvi tutti gli errori TypeScript
3. Verifica che tutte le dipendenze siano installate

### Problemi di Performance

1. Controlla che il lazy loading sia configurato correttamente
2. Verifica che non ci siano import circolari
3. Usa gli strumenti di sviluppo per analizzare i bundle

## 📞 Supporto

Se riscontri problemi durante il deploy:

1. Controlla i log di build su Vercel
2. Verifica la configurazione delle variabili d'ambiente
3. Testa il build localmente prima del deploy
4. Consulta la documentazione Vercel per Node.js 22.x
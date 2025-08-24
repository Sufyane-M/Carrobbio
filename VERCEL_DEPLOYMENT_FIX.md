# Risoluzione Errore Deployment Vercel

## Problema Risolto

L'errore `Cannot find module '/var/task/server/app'` era causato dal fatto che i file TypeScript del server non venivano compilati correttamente durante il deployment su Vercel.

## Modifiche Apportate

### 1. Creazione di tsconfig.build.json
- Creato un file di configurazione TypeScript separato per il build di produzione
- Configurato per compilare solo i file del server (server/, api/, shared/)
- Abilitato `esModuleInterop` e `allowSyntheticDefaultImports` per compatibilità
- Output configurato nella root del progetto per compatibilità con Vercel
- Usa formato modulo `ESNext` per funzionare con `"type": "module"` in package.json

### 2. Aggiornamento package.json
- Modificato il build script da `tsc -b && vite build` a `tsc -p tsconfig.build.json && vite build`
- Questo assicura che i file del server vengano compilati prima del build del frontend

### 3. Rimozione di import.meta.url
- Rimosso l'uso di `import.meta.url` da `server/app.ts` per compatibilità con CommonJS
- Eliminato il codice non necessario per `__dirname` e `__filename`

### 4. Correzione Import ES Module
- Aggiornati tutti gli import relativi nei file TypeScript e JavaScript per includere estensioni `.js`
- `server/server.ts`: `import app from './app.js'`
- `server/app.ts`: `import authRoutes from './routes/auth.js'`
- Tutti i file controller, middleware e service aggiornati per usare estensioni `.js`
- Questo garantisce la corretta risoluzione dei moduli nell'ambiente ES module di Node.js

### 5. Configurazione Vercel
- Rimosso `outputDirectory` da `vercel.json` per usare la struttura di default
- Mantenuto il `buildCommand` personalizzato per includere la compilazione TypeScript

## Struttura File Dopo il Build

```
project-root/
├── api/
│   ├── index.js (compilato)
│   └── index.ts (sorgente)
├── server/
│   ├── app.js (compilato)
│   ├── app.ts (sorgente)
│   ├── controllers/
│   │   ├── *.js (compilati)
│   │   └── *.ts (sorgenti)
│   └── ...
├── dist/ (frontend build)
└── ...
```

## Verifica del Build

Per verificare che il build funzioni correttamente:

```bash
npm run build
```

Dovrebbe:
1. Compilare i file TypeScript del server in JavaScript
2. Compilare il frontend React con Vite
3. Non mostrare errori di compilazione

## Deployment su Vercel

1. Assicurarsi che tutte le variabili d'ambiente siano configurate su Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - `NODE_ENV=production`

2. Fare il deployment:
   ```bash
   vercel --prod
   ```

3. Verificare che l'endpoint `/api/auth/login` risponda correttamente

## Note Tecniche

- I file TypeScript vengono ora compilati in JavaScript durante il build
- Vercel può trovare e eseguire i moduli JavaScript compilati
- La configurazione CORS è stata corretta per il dominio di produzione
- Il logging è stato migliorato per facilitare il debugging

## Test Post-Deployment

1. Aprire il sito su Vercel
2. Andare alla pagina admin
3. Tentare il login
4. Verificare che non ci siano più errori 500 o problemi di parsing JSON

Se ci sono ancora problemi, controllare i log di Vercel per errori specifici.
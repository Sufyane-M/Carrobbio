import app from '../server/app.js';
export default async function handler(req, res) {
    try {
        // Delego la gestione alla app Express
        return app(req, res);
    }
    catch (err) {
        console.error("Errore durante l'inizializzazione del server:", err);
        res.status(500).json({
            success: false,
            error: 'Errore interno del server',
            code: 'BOOTSTRAP_ERROR'
        });
    }
}

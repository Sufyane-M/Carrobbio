/**
 * Email Service
 * Gestisce l'invio delle email per reset password e notifiche di sicurezza
 */
import nodemailer from 'nodemailer';
// Configurazione email
const EMAIL_CONFIG = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true per 465, false per altri
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
};
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@carrobbio.com';
const FROM_NAME = process.env.FROM_NAME || 'Ristorante Carrobbio';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// Crea il transporter per nodemailer
let transporter = null;
/**
 * Inizializza il transporter email
 */
const initializeTransporter = () => {
    if (!transporter) {
        if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
            console.warn('Configurazione email mancante. Le email non verranno inviate.');
            // Restituisce un transporter mock per sviluppo
            return {
                sendMail: async (mailOptions) => {
                    console.log('📧 EMAIL MOCK - Invio simulato:');
                    console.log('To:', mailOptions.to);
                    console.log('Subject:', mailOptions.subject);
                    console.log('Content:', mailOptions.text || mailOptions.html);
                    return { messageId: 'mock-message-id' };
                }
            };
        }
        transporter = nodemailer.createTransport(EMAIL_CONFIG);
    }
    return transporter;
};
/**
 * Template HTML per email di reset password
 */
const getPasswordResetTemplate = (resetUrl, userEmail) => {
    return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password - Ristorante Carrobbio</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #8B4513;
                margin-bottom: 10px;
            }
            .content {
                margin-bottom: 30px;
            }
            .reset-button {
                display: inline-block;
                background-color: #8B4513;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
            }
            .reset-button:hover {
                background-color: #A0522D;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #666;
                margin-top: 30px;
                border-top: 1px solid #eee;
                padding-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🍝 Ristorante Carrobbio</div>
                <h2>Reset della Password</h2>
            </div>
            
            <div class="content">
                <p>Ciao,</p>
                <p>Hai richiesto il reset della password per il tuo account amministratore (<strong>${userEmail}</strong>).</p>
                <p>Clicca sul pulsante qui sotto per reimpostare la tua password:</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="reset-button">Reimposta Password</a>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Importante:</strong>
                    <ul>
                        <li>Questo link è valido per <strong>1 ora</strong></li>
                        <li>Può essere utilizzato una sola volta</li>
                        <li>Se non hai richiesto questo reset, ignora questa email</li>
                    </ul>
                </div>
                
                <p>Se il pulsante non funziona, copia e incolla questo link nel tuo browser:</p>
                <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
                    ${resetUrl}
                </p>
            </div>
            
            <div class="footer">
                <p>Questa email è stata inviata automaticamente dal sistema di gestione del Ristorante Carrobbio.</p>
                <p>Se hai problemi, contatta l'amministratore del sistema.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
/**
 * Template HTML per notifica di login sospetto
 */
const getSuspiciousLoginTemplate = (userEmail, ipAddress, userAgent, timestamp) => {
    return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Attività Sospetta - Ristorante Carrobbio</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #8B4513;
                margin-bottom: 10px;
            }
            .alert {
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .details {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #666;
                margin-top: 30px;
                border-top: 1px solid #eee;
                padding-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🍝 Ristorante Carrobbio</div>
                <h2>🚨 Attività Sospetta Rilevata</h2>
            </div>
            
            <div class="alert">
                <strong>Attenzione!</strong> È stata rilevata un'attività sospetta sul tuo account amministratore.
            </div>
            
            <div class="details">
                <h3>Dettagli dell'attività:</h3>
                <ul>
                    <li><strong>Account:</strong> ${userEmail}</li>
                    <li><strong>Indirizzo IP:</strong> ${ipAddress}</li>
                    <li><strong>Browser/Dispositivo:</strong> ${userAgent}</li>
                    <li><strong>Data e Ora:</strong> ${timestamp}</li>
                </ul>
            </div>
            
            <p><strong>Cosa fare:</strong></p>
            <ul>
                <li>Se sei stato tu, puoi ignorare questa email</li>
                <li>Se non riconosci questa attività, cambia immediatamente la password</li>
                <li>Controlla le sessioni attive nel pannello amministratore</li>
                <li>Contatta l'amministratore del sistema se necessario</li>
            </ul>
            
            <div class="footer">
                <p>Questa email è stata inviata automaticamente dal sistema di sicurezza del Ristorante Carrobbio.</p>
                <p>Non rispondere a questa email.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
/**
 * Invia email di reset password
 */
export const sendPasswordResetEmail = async (email, resetToken, userAgent, ipAddress) => {
    try {
        const transporter = initializeTransporter();
        const resetUrl = `${FRONTEND_URL}/admin/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
            to: email,
            subject: '🔐 Reset Password - Ristorante Carrobbio',
            html: getPasswordResetTemplate(resetUrl, email),
            text: `
        Reset della Password - Ristorante Carrobbio
        
        Hai richiesto il reset della password per il tuo account amministratore (${email}).
        
        Clicca su questo link per reimpostare la tua password:
        ${resetUrl}
        
        Questo link è valido per 1 ora e può essere utilizzato una sola volta.
        
        Se non hai richiesto questo reset, ignora questa email.
      `
        };
        const result = await transporter.sendMail(mailOptions);
        // Log dell'evento rimosso - gestito dal securityService
        console.log('Email di reset password inviata:', result.messageId);
        return { success: true };
    }
    catch (error) {
        console.error('Errore nell\'invio dell\'email di reset password:', error);
        // Log dell'errore rimosso - gestito dal securityService
        return {
            success: false,
            error: error.message || 'Errore nell\'invio dell\'email'
        };
    }
};
/**
 * Invia notifica di login sospetto
 */
export const sendSuspiciousLoginNotification = async (email, ipAddress, userAgent, timestamp) => {
    try {
        const transporter = initializeTransporter();
        const mailOptions = {
            from: `"${FROM_NAME} Security" <${FROM_EMAIL}>`,
            to: email,
            subject: '🚨 Attività Sospetta Rilevata - Ristorante Carrobbio',
            html: getSuspiciousLoginTemplate(email, ipAddress, userAgent, timestamp),
            text: `
        Attività Sospetta Rilevata - Ristorante Carrobbio
        
        È stata rilevata un'attività sospetta sul tuo account amministratore.
        
        Dettagli:
        - Account: ${email}
        - IP: ${ipAddress}
        - Browser: ${userAgent}
        - Data: ${timestamp}
        
        Se non sei stato tu, cambia immediatamente la password.
      `
        };
        const result = await transporter.sendMail(mailOptions);
        console.log('Notifica di login sospetto inviata:', result.messageId);
        return { success: true };
    }
    catch (error) {
        console.error('Errore nell\'invio della notifica di login sospetto:', error);
        return {
            success: false,
            error: error.message || 'Errore nell\'invio della notifica'
        };
    }
};
/**
 * Invia notifica di cambio password
 */
export const sendPasswordChangeNotification = async (email, ipAddress, userAgent) => {
    try {
        const transporter = initializeTransporter();
        const timestamp = new Date().toLocaleString('it-IT');
        const mailOptions = {
            from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
            to: email,
            subject: '✅ Password Cambiata - Ristorante Carrobbio',
            html: `
        <!DOCTYPE html>
        <html lang="it">
        <head>
            <meta charset="UTF-8">
            <title>Password Cambiata</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
                .container { background: white; padding: 30px; border-radius: 10px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #8B4513; }
                .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🍝 Ristorante Carrobbio</div>
                    <h2>Password Cambiata con Successo</h2>
                </div>
                
                <div class="success">
                    <strong>✅ Confermato!</strong> La password del tuo account è stata cambiata con successo.
                </div>
                
                <p><strong>Dettagli:</strong></p>
                <ul>
                    <li>Account: ${email}</li>
                    <li>Data: ${timestamp}</li>
                    <li>IP: ${ipAddress}</li>
                    <li>Browser: ${userAgent}</li>
                </ul>
                
                <p>Se non hai effettuato tu questo cambio, contatta immediatamente l'amministratore del sistema.</p>
            </div>
        </body>
        </html>
      `,
            text: `
        Password Cambiata - Ristorante Carrobbio
        
        La password del tuo account è stata cambiata con successo.
        
        Dettagli:
        - Account: ${email}
        - Data: ${timestamp}
        - IP: ${ipAddress}
        - Browser: ${userAgent}
        
        Se non hai effettuato tu questo cambio, contatta l'amministratore.
      `
        };
        const result = await transporter.sendMail(mailOptions);
        console.log('Notifica di cambio password inviata:', result.messageId);
        return { success: true };
    }
    catch (error) {
        console.error('Errore nell\'invio della notifica di cambio password:', error);
        return {
            success: false,
            error: error.message || 'Errore nell\'invio della notifica'
        };
    }
};
/**
 * Testa la configurazione email
 */
export const testEmailConfiguration = async () => {
    try {
        const transporter = initializeTransporter();
        // Verifica la connessione SMTP
        if (typeof transporter.verify === 'function') {
            await transporter.verify();
        }
        console.log('Configurazione email verificata con successo');
        return { success: true };
    }
    catch (error) {
        console.error('Errore nella configurazione email:', error);
        return {
            success: false,
            error: error.message || 'Errore nella configurazione email'
        };
    }
};

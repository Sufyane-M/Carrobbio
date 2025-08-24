/**
 * Script per creare un utente admin di test
 * Eseguire con: node create-admin-user.js
 */

const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurazione Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Errore: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere configurati nel file .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    const email = 'admin@carrobbio.com';
    const password = 'Admin123!@#';
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    
    console.log('Creazione utente admin...');
    console.log('Email:', email);
    console.log('Password:', password);
    
    // Verifica se l'utente esiste già
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      console.log('Utente admin già esistente. Aggiornamento password...');
      
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({
          password_hash: passwordHash,
          salt: salt,
          is_active: true,
          is_locked: false,
          failed_login_attempts: 0,
          locked_until: null,
          password_changed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('email', email);
      
      if (updateError) {
        console.error('Errore nell\'aggiornamento dell\'utente:', updateError);
        process.exit(1);
      }
      
      console.log('✅ Utente admin aggiornato con successo!');
    } else {
      console.log('Creazione nuovo utente admin...');
      
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          email: email,
          password_hash: passwordHash,
          salt: salt,
          role: 'super_admin',
          is_active: true,
          is_locked: false,
          failed_login_attempts: 0,
          password_changed_at: new Date().toISOString(),
          must_change_password: false
        });
      
      if (insertError) {
        console.error('Errore nella creazione dell\'utente:', insertError);
        process.exit(1);
      }
      
      console.log('✅ Utente admin creato con successo!');
    }
    
    console.log('\n=== CREDENZIALI ADMIN ===');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('========================\n');
    
  } catch (error) {
    console.error('Errore:', error);
    process.exit(1);
  }
}

createAdminUser();
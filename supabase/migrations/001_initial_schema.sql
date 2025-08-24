-- Crea tabella prenotazioni
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  guests INTEGER NOT NULL CHECK (guests > 0 AND guests <= 20),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crea indici per prenotazioni
CREATE INDEX idx_reservations_date ON reservations(reservation_date DESC);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_email ON reservations(email);

-- Crea tabella menu
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(6,2) NOT NULL CHECK (price > 0),
  category VARCHAR(20) NOT NULL CHECK (category IN ('antipasti', 'pizza', 'pasta', 'pesce', 'dolci', 'bevande')),
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crea indici per menu
CREATE INDEX idx_menu_category ON menu_items(category);
CREATE INDEX idx_menu_available ON menu_items(available);

-- Crea tabella contatti
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crea indici per contatti
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX idx_contacts_read ON contacts(read);

-- Crea tabella admin users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Abilita RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy per prenotazioni
CREATE POLICY "Allow public read access" ON reservations FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert" ON reservations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON reservations FOR ALL TO authenticated USING (true);

-- Policy per menu
CREATE POLICY "Allow public read menu" ON menu_items FOR SELECT TO anon USING (available = true);
CREATE POLICY "Allow authenticated full menu access" ON menu_items FOR ALL TO authenticated USING (true);

-- Policy per contatti
CREATE POLICY "Allow public insert contacts" ON contacts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated read contacts" ON contacts FOR SELECT TO authenticated USING (true);

-- Policy per admin users
CREATE POLICY "Allow authenticated read admin" ON admin_users FOR SELECT TO authenticated USING (true);

-- Inserisci admin di default (password: admin123)
INSERT INTO admin_users (email, password_hash, role) VALUES 
('admin@ilcarrobbio.com', '$2b$10$WrGjsoz9cpeXBncCKhpXpeqNYPYY9aE9JE8t5rqrvwGcouCK2lw9G', 'admin');

-- Dati iniziali menu
INSERT INTO menu_items (name, description, price, category, image_url) VALUES
('Antipasto della Casa', 'Selezione di salumi e formaggi locali con miele e mostarda', 12.00, 'antipasti', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400'),
('Bruschette Miste', 'Bruschette con pomodoro, burrata e prosciutto crudo', 8.50, 'antipasti', 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400'),
('Crudo di Ricciola', 'Ricciola marinata con agrumi e olio extravergine', 15.00, 'antipasti', 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=400'),
('Pizza Margherita', 'Pomodoro, mozzarella di bufala, basilico fresco', 8.00, 'pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'),
('Pizza Diavola', 'Pomodoro, mozzarella, salame piccante, olive nere', 10.00, 'pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'),
('Pizza Marinara', 'Pomodoro, aglio, origano, olio extravergine', 6.50, 'pizza', 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400'),
('Pizza Quattro Stagioni', 'Pomodoro, mozzarella, prosciutto, funghi, carciofi, olive', 12.00, 'pizza', 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400'),
('Pizza Capricciosa', 'Pomodoro, mozzarella, prosciutto cotto, funghi, carciofi', 11.00, 'pizza', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400'),
('Spaghetti alle Vongole', 'Spaghetti con vongole veraci, aglio, prezzemolo e vino bianco', 14.00, 'pasta', 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400'),
('Risotto ai Porcini', 'Risotto cremoso con funghi porcini e parmigiano', 16.00, 'pasta', 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400'),
('Branzino in Crosta', 'Branzino fresco in crosta di sale con verdure di stagione', 22.00, 'pesce', 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400'),
('Grigliata Mista di Pesce', 'Selezione di pesce fresco alla griglia con contorno', 25.00, 'pesce', 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=400'),
('Tiramisù della Casa', 'Tiramisù tradizionale preparato al momento', 6.00, 'dolci', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400'),
('Panna Cotta ai Frutti di Bosco', 'Panna cotta con coulis di frutti di bosco freschi', 5.50, 'dolci', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400'),
('Vino della Casa Rosso', 'Vino rosso locale, bottiglia 750ml', 18.00, 'bevande', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400'),
('Acqua Naturale', 'Acqua naturale 1L', 2.50, 'bevande', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400');

-- Permessi per le tabelle
GRANT SELECT ON reservations TO anon;
GRANT ALL PRIVILEGES ON reservations TO authenticated;

GRANT SELECT ON menu_items TO anon;
GRANT ALL PRIVILEGES ON menu_items TO authenticated;

GRANT INSERT ON contacts TO anon;
GRANT ALL PRIVILEGES ON contacts TO authenticated;

GRANT SELECT ON admin_users TO authenticated;
GRANT ALL PRIVILEGES ON admin_users TO authenticated;
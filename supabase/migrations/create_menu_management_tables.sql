-- Sistema di Gestione Menu Admin - Creazione Tabelle
-- Creazione delle tabelle per il sistema completo di gestione menu

-- Funzione per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tabella Categorie
CREATE TABLE categorie (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descrizione TEXT,
    ordine INTEGER NOT NULL DEFAULT 0,
    attiva BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance categorie
CREATE INDEX idx_categorie_ordine ON categorie(ordine ASC);
CREATE INDEX idx_categorie_attiva ON categorie(attiva);

-- Trigger per updated_at categorie
CREATE TRIGGER update_categorie_updated_at
    BEFORE UPDATE ON categorie
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabella Piatti
CREATE TABLE piatti (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    descrizione TEXT NOT NULL,
    prezzo DECIMAL(8,2) NOT NULL CHECK (prezzo > 0),
    allergeni TEXT[] DEFAULT '{}',
    immagine_url VARCHAR(500),
    disponibile BOOLEAN DEFAULT true,
    ordine INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance piatti
CREATE INDEX idx_piatti_disponibile ON piatti(disponibile);
CREATE INDEX idx_piatti_ordine ON piatti(ordine ASC);
CREATE INDEX idx_piatti_nome ON piatti USING gin(to_tsvector('italian', nome));
CREATE INDEX idx_piatti_allergeni ON piatti USING gin(allergeni);

-- Trigger per updated_at piatti
CREATE TRIGGER update_piatti_updated_at
    BEFORE UPDATE ON piatti
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabella Relazione Piatti-Categorie
CREATE TABLE piatti_categorie (
    piatto_id UUID REFERENCES piatti(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES categorie(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (piatto_id, categoria_id)
);

-- Indici per performance relazioni
CREATE INDEX idx_piatti_categorie_piatto ON piatti_categorie(piatto_id);
CREATE INDEX idx_piatti_categorie_categoria ON piatti_categorie(categoria_id);

-- Dati iniziali categorie
INSERT INTO categorie (nome, descrizione, ordine) VALUES
('Antipasti', 'Selezione di antipasti tradizionali', 1),
('Primi Piatti', 'Pasta e risotti della casa', 2),
('Secondi Piatti', 'Carni e pesci di stagione', 3),
('Contorni', 'Verdure e accompagnamenti', 4),
('Dolci', 'Dolci della tradizione', 5),
('Bevande', 'Vini, birre e bevande', 6);

-- Dati di esempio piatti
INSERT INTO piatti (nome, descrizione, prezzo, allergeni, disponibile, ordine) VALUES
('Bruschetta al Pomodoro', 'Pane tostato con pomodori freschi, basilico e aglio', 8.50, '{"glutine"}', true, 1),
('Spaghetti Carbonara', 'Pasta con uova, pecorino, guanciale e pepe nero', 14.00, '{"glutine", "uova", "latte"}', true, 2),
('Bistecca alla Fiorentina', 'Bistecca di manzo alla griglia con rosmarino', 28.00, '{}', true, 3);

-- Collegamento piatti-categorie di esempio
INSERT INTO piatti_categorie (piatto_id, categoria_id)
SELECT p.id, c.id
FROM piatti p, categorie c
WHERE 
    (p.nome = 'Bruschetta al Pomodoro' AND c.nome = 'Antipasti') OR
    (p.nome = 'Spaghetti Carbonara' AND c.nome = 'Primi Piatti') OR
    (p.nome = 'Bistecca alla Fiorentina' AND c.nome = 'Secondi Piatti');
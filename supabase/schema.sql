-- =============================================
-- NOTIF-FLOW — Schéma Supabase (Jalon 1)
-- =============================================

-- Table des campagnes
CREATE TABLE IF NOT EXISTS campaigns (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    filename    TEXT NOT NULL,
    total_rows  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des commandes / destinataires
CREATE TABLE IF NOT EXISTS notif_orders (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id   UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    email         TEXT,
    phone         TEXT,
    order_number  TEXT,
    status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'in_progress', 'sent', 'error')),
    error_message TEXT,
    raw_data      JSONB,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_notif_orders_campaign_id ON notif_orders(campaign_id);
CREATE INDEX IF NOT EXISTS idx_notif_orders_status ON notif_orders(status);

-- Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notif_orders_updated_at
    BEFORE UPDATE ON notif_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

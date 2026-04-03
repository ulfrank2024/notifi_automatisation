-- =============================================
-- NOTIF-FLOW — Migration v3
-- Table des clés API partenaires
-- =============================================

CREATE TABLE IF NOT EXISTS api_keys (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,                  -- Label lisible (ex: "Compagnie X - Prod")
    key_prefix  TEXT NOT NULL,                  -- Préfixe affiché : nf_live_xxxx
    key_hash    TEXT NOT NULL UNIQUE,           -- SHA-256 de la clé complète
    is_active   BOOLEAN NOT NULL DEFAULT true,
    last_used_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

-- =============================================
-- NOTIF-FLOW — Migration v2
-- Ajout first_name, last_name + vue stats
-- =============================================

ALTER TABLE notif_orders ADD COLUMN IF NOT EXISTS first_name TEXT DEFAULT '';
ALTER TABLE notif_orders ADD COLUMN IF NOT EXISTS last_name  TEXT DEFAULT '';

-- Vue agrégée par campagne (utilisée par le dashboard)
CREATE OR REPLACE VIEW campaign_stats AS
SELECT
    c.id,
    c.name,
    c.filename,
    c.total_rows,
    c.created_at,
    COUNT(o.id)                                          AS total_orders,
    COUNT(CASE WHEN o.status = 'pending'     THEN 1 END) AS pending,
    COUNT(CASE WHEN o.status = 'in_progress' THEN 1 END) AS in_progress,
    COUNT(CASE WHEN o.status = 'sent'        THEN 1 END) AS sent,
    COUNT(CASE WHEN o.status = 'error'       THEN 1 END) AS error
FROM campaigns c
LEFT JOIN notif_orders o ON o.campaign_id = c.id
GROUP BY c.id, c.name, c.filename, c.total_rows, c.created_at;

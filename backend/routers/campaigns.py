from collections import defaultdict
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.database import get_supabase
from services.parser import parse_file

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


class MappingSchema(BaseModel):
    filename: str
    file_content_b64: str
    campaign_name: str
    mapping: dict[str, str]


def _aggregate_orders(orders: list[dict]) -> dict:
    """Agrège les orders par campaign_id → dict de stats."""
    counts = defaultdict(lambda: {"total": 0, "pending": 0, "in_progress": 0, "sent": 0, "error": 0})
    for o in orders:
        cid = o["campaign_id"]
        counts[cid]["total"] += 1
        status = o.get("status", "pending")
        if status in counts[cid]:
            counts[cid][status] += 1
    return counts


@router.post("/")
async def create_campaign(payload: MappingSchema):
    import base64
    content = base64.b64decode(payload.file_content_b64)
    parsed = parse_file(payload.filename, content)

    db = get_supabase()
    campaign_res = (
        db.table("campaigns")
        .insert({"name": payload.campaign_name, "filename": payload.filename, "total_rows": parsed["total"]})
        .execute()
    )
    if not campaign_res.data:
        raise HTTPException(status_code=500, detail="Erreur création campagne")

    campaign_id = campaign_res.data[0]["id"]
    m = payload.mapping
    orders = []
    for row in parsed["rows"]:
        orders.append({
            "campaign_id":  campaign_id,
            "first_name":   str(row.get(m.get("first_name", ""), "")),
            "last_name":    str(row.get(m.get("last_name",  ""), "")),
            "email":        str(row.get(m.get("email",       ""), "")),
            "phone":        str(row.get(m.get("phone",       ""), "")),
            "order_number": str(row.get(m.get("order_number",""), "")),
            "status":       "pending",
            "raw_data":     row,
        })

    for i in range(0, len(orders), 500):
        db.table("notif_orders").insert(orders[i:i + 500]).execute()

    return {"campaign_id": campaign_id, "inserted": len(orders)}


@router.get("/stats")
async def global_stats():
    db = get_supabase()
    campaigns_res = db.table("campaigns").select("id").execute()
    orders_res    = db.table("notif_orders").select("status").execute()

    orders = orders_res.data or []
    total   = len(orders)
    pending = sum(1 for o in orders if o["status"] == "pending")
    sent    = sum(1 for o in orders if o["status"] == "sent")
    error   = sum(1 for o in orders if o["status"] == "error")

    return {
        "total_campaigns": len(campaigns_res.data or []),
        "total_contacts":  total,
        "pending":         pending,
        "sent":            sent,
        "error":           error,
        "send_rate":       round(sent / total * 100, 1) if total > 0 else 0,
    }


@router.get("/history")
async def campaigns_history():
    """Campagnes + stats calculées côté Python (sans dépendance à la vue SQL)."""
    db = get_supabase()
    campaigns_res = db.table("campaigns").select("*").order("created_at", desc=True).execute()
    orders_res    = db.table("notif_orders").select("campaign_id, status").execute()

    counts = _aggregate_orders(orders_res.data or [])

    result = []
    for c in (campaigns_res.data or []):
        stats = counts[c["id"]]
        result.append({
            **c,
            "total_orders": stats["total"],
            "pending":      stats["pending"],
            "in_progress":  stats["in_progress"],
            "sent":         stats["sent"],
            "error":        stats["error"],
        })
    return result


@router.get("/contacts")
async def all_contacts(page: int = 1, page_size: int = 100):
    db = get_supabase()
    offset = (page - 1) * page_size
    res = (
        db.table("notif_orders")
        .select("id, campaign_id, first_name, last_name, email, phone, order_number, status, created_at")
        .order("created_at", desc=True)
        .range(offset, offset + page_size - 1)
        .execute()
    )
    return res.data


@router.delete("/{campaign_id}")
async def delete_campaign(campaign_id: str):
    """Supprime la campagne et tous ses contacts (CASCADE)."""
    db = get_supabase()
    db.table("campaigns").delete().eq("id", campaign_id).execute()
    return {"deleted": True}


@router.get("/{campaign_id}/orders")
async def get_orders(campaign_id: str, page: int = 1, page_size: int = 100):
    db = get_supabase()
    offset = (page - 1) * page_size
    res = (
        db.table("notif_orders")
        .select("*")
        .eq("campaign_id", campaign_id)
        .range(offset, offset + page_size - 1)
        .execute()
    )
    return res.data

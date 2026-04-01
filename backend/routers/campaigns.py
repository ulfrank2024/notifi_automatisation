from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..core.database import get_supabase
from ..services.parser import parse_file

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


class MappingSchema(BaseModel):
    filename: str
    file_content_b64: str          # fichier encodé base64
    campaign_name: str
    mapping: dict[str, str]        # ex: {"email": "Colonne Email", "phone": "Tel", "order_number": "N° CMD"}


class OrderRow(BaseModel):
    email: str = ""
    phone: str = ""
    order_number: str = ""
    raw_data: dict = {}


@router.post("/")
async def create_campaign(payload: MappingSchema):
    """
    Crée une campagne et insère toutes les commandes en base Supabase.
    """
    import base64
    content = base64.b64decode(payload.file_content_b64)
    parsed = parse_file(payload.filename, content)

    db = get_supabase()

    # 1. Créer la campagne
    campaign_res = (
        db.table("campaigns")
        .insert({"name": payload.campaign_name, "filename": payload.filename, "total_rows": parsed["total"]})
        .execute()
    )
    if not campaign_res.data:
        raise HTTPException(status_code=500, detail="Erreur création campagne")

    campaign_id = campaign_res.data[0]["id"]

    # 2. Mapper et insérer les commandes
    orders = []
    m = payload.mapping
    for row in parsed["rows"]:
        orders.append({
            "campaign_id": campaign_id,
            "email": str(row.get(m.get("email", ""), "")),
            "phone": str(row.get(m.get("phone", ""), "")),
            "order_number": str(row.get(m.get("order_number", ""), "")),
            "status": "pending",
            "raw_data": row,
        })

    # Insertion par batch de 500
    for i in range(0, len(orders), 500):
        db.table("orders").insert(orders[i:i + 500]).execute()

    return {"campaign_id": campaign_id, "inserted": len(orders)}


@router.get("/")
async def list_campaigns():
    db = get_supabase()
    res = db.table("campaigns").select("*").order("created_at", desc=True).execute()
    return res.data


@router.get("/{campaign_id}/orders")
async def get_orders(campaign_id: str, page: int = 1, page_size: int = 50):
    db = get_supabase()
    offset = (page - 1) * page_size
    res = (
        db.table("orders")
        .select("*")
        .eq("campaign_id", campaign_id)
        .range(offset, offset + page_size - 1)
        .execute()
    )
    return res.data

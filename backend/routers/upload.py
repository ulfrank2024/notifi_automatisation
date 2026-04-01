from fastapi import APIRouter, UploadFile, File
from services.parser import parse_file

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/preview")
async def preview_file(file: UploadFile = File(...)):
    """
    Lit le fichier et retourne les colonnes + un aperçu des données.
    Utilisé par le Mapping Intelligent côté frontend.
    """
    content = await file.read()
    result = parse_file(file.filename, content)
    return {
        "filename": file.filename,
        "total": result["total"],
        "columns": result["columns"],
        "preview": result["rows"][:10],  # Aperçu des 10 premières lignes
    }

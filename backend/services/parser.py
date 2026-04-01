"""
Moteur d'analyse multi-format : Excel (.xlsx), CSV, TXT
Retourne un dict avec les colonnes détectées et les lignes nettoyées.
"""
import io
import pandas as pd
from fastapi import HTTPException


SUPPORTED_EXTENSIONS = {".xlsx", ".csv", ".txt"}


def parse_file(filename: str, content: bytes) -> dict:
    ext = _get_extension(filename)
    df = _read_file(ext, content)
    df = _clean(df)

    return {
        "columns": df.columns.tolist(),
        "rows": df.to_dict(orient="records"),
        "total": len(df),
    }


def _get_extension(filename: str) -> str:
    lower = filename.lower()
    for ext in SUPPORTED_EXTENSIONS:
        if lower.endswith(ext):
            return ext
    raise HTTPException(
        status_code=400,
        detail=f"Format non supporté. Formats acceptés : {', '.join(SUPPORTED_EXTENSIONS)}",
    )


def _read_file(ext: str, content: bytes) -> pd.DataFrame:
    buffer = io.BytesIO(content)
    try:
        if ext == ".xlsx":
            return pd.read_excel(buffer, engine="openpyxl")
        elif ext == ".csv":
            # Détection automatique du séparateur
            return pd.read_csv(buffer, sep=None, engine="python")
        else:  # .txt
            return pd.read_csv(buffer, sep=None, engine="python")
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Erreur de lecture du fichier : {exc}")


def _clean(df: pd.DataFrame) -> pd.DataFrame:
    # Suppression des lignes entièrement vides
    df = df.dropna(how="all")
    # Nettoyage des noms de colonnes
    df.columns = [str(c).strip() for c in df.columns]
    # Remplacement des NaN par chaîne vide pour la sérialisation JSON
    df = df.fillna("")
    return df.reset_index(drop=True)

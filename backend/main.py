from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.security import require_auth
from routers import auth, upload, campaigns, contacts, notifications

app = FastAPI(title="Notif-Flow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route publique — login
app.include_router(auth.router)

# Routes protégées — token JWT requis
protected = {"dependencies": [Depends(require_auth)]}
app.include_router(upload.router,         **protected)
app.include_router(campaigns.router,      **protected)
app.include_router(contacts.router,       **protected)
app.include_router(notifications.router,  **protected)


@app.get("/health")
def health():
    return {"status": "ok"}

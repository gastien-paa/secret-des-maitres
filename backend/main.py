import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from dotenv import load_dotenv
from database import engine
from routers import etudiants, frais, paiements, retards, depenses, categories, tableau_bord, auth, caisse, remises, comptes

load_dotenv()

app = FastAPI(title="Secret des Maîtres - Gestion", redirect_slashes=False)

# Origines autorisées à contacter ce backend (local + futur site en ligne)
origines = os.getenv("ORIGINES_AUTORISEES", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origines,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Brancher tous les routeurs
app.include_router(etudiants.router)
app.include_router(frais.router)
app.include_router(paiements.router)
app.include_router(retards.router)
app.include_router(depenses.router)
app.include_router(categories.router)
app.include_router(tableau_bord.router)
app.include_router(auth.router)
app.include_router(caisse.router)
app.include_router(remises.router)
app.include_router(comptes.router)


@app.get("/")
def accueil():
    return {"message": "Le backend fonctionne !"}


@app.get("/test-db")
def test_db():
    with engine.connect() as connexion:
        resultat = connexion.execute(text("SELECT COUNT(*) FROM categories"))
        nombre = resultat.scalar()
    return {"message": "Connexion à la base réussie", "nombre_categories": nombre}
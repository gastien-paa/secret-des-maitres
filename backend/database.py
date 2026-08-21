import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Charger le fichier .env
load_dotenv()

# Quelle base utiliser ? (défini dans .env : "local" ou "en_ligne")
BASE_ACTIVE = os.getenv("BASE_ACTIVE", "local")

if BASE_ACTIVE == "en_ligne":
    # Base en ligne (Neon) : connexion par URL complète
    url = os.getenv("DB_EN_LIGNE")
    engine = create_engine(url)
    print(">>> Connexion à la base EN LIGNE (Neon)")

else:
    # Base locale : méthode connect_args (gère les caractères # et @)
    engine = create_engine(
        "postgresql+psycopg2://",
        connect_args={
            "user": "postgres",
            "password": "#monica@123fok",
            "host": "localhost",
            "port": 5432,
            "dbname": "Secret des Maitres",
            "client_encoding": "utf8",
        },
    )
    print(">>> Connexion à la base LOCALE")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
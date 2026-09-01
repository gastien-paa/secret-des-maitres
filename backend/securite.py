from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import bcrypt

# Clé secrète pour signer les jetons (garde TA propre valeur si tu l'as déjà changée)
import os
from dotenv import load_dotenv
load_dotenv()

CLE_SECRETE = os.getenv("CLE_SECRETE", "cle_par_defaut_a_changer")
ALGORITHME = "HS256"
DUREE_TOKEN_MINUTES = 60 * 12  # le jeton reste valide 12 heures

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/connexion")


def hacher_mot_de_passe(mot_de_passe: str) -> str:
    """Transforme un mot de passe en version illisible (hachée)."""
    mdp_bytes = mot_de_passe.encode("utf-8")[:72]
    sel = bcrypt.gensalt()
    hache = bcrypt.hashpw(mdp_bytes, sel)
    return hache.decode("utf-8")


def verifier_mot_de_passe(mot_de_passe: str, hache: str) -> bool:
    """Vérifie qu'un mot de passe correspond à sa version hachée."""
    mdp_bytes = mot_de_passe.encode("utf-8")[:72]
    return bcrypt.checkpw(mdp_bytes, hache.encode("utf-8"))


def creer_token(donnees: dict) -> str:
    """Crée un jeton de connexion (le 'bracelet d'entrée')."""
    a_encoder = donnees.copy()
    expiration = datetime.utcnow() + timedelta(minutes=DUREE_TOKEN_MINUTES)
    a_encoder.update({"exp": expiration})
    return jwt.encode(a_encoder, CLE_SECRETE, algorithm=ALGORITHME)


def utilisateur_actuel(token: str = Depends(oauth2_scheme)):
    """Vérifie le jeton et renvoie les infos de l'utilisateur connecté."""
    erreur = HTTPException(status_code=401, detail="Non authentifié")
    try:
        charge = jwt.decode(token, CLE_SECRETE, algorithms=[ALGORITHME])
        identifiant = charge.get("sub")
        role = charge.get("role")
        if identifiant is None:
            raise erreur
        return {"identifiant": identifiant, "role": role}
    except JWTError:
        raise erreur


def admin_seulement(utilisateur: dict = Depends(utilisateur_actuel)):
    """Autorise uniquement les administrateurs."""
    if utilisateur["role"] != "admin":
        raise HTTPException(status_code=403, detail="Action réservée à l'administrateur")
    return utilisateur
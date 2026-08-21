from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from securite import verifier_mot_de_passe, creer_token


router = APIRouter(prefix="/auth", tags=["Authentification"])


# CONNEXION : vérifie identifiant + mot de passe, renvoie un jeton
@router.post("/connexion", response_model=schemas.Token)
def connexion(donnees: schemas.ConnexionRequest, db: Session = Depends(get_db)):
    # Chercher l'utilisateur
    utilisateur = db.query(models.Utilisateur).filter(
        models.Utilisateur.identifiant == donnees.identifiant
    ).first()

    # Vérifier qu'il existe ET que le mot de passe est bon
    if utilisateur is None or not verifier_mot_de_passe(donnees.mot_de_passe, utilisateur.mot_de_passe_hache):
        raise HTTPException(status_code=401, detail="Identifiant ou mot de passe incorrect")

    # Créer le jeton avec les infos de l'utilisateur
    token = creer_token({
        "sub": utilisateur.identifiant,
        "role": utilisateur.role,
    })

    return schemas.Token(
        access_token=token,
        token_type="bearer",
        role=utilisateur.role,
        nom_complet=utilisateur.nom_complet,
    )
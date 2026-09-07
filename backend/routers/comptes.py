from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from securite import utilisateur_actuel, admin_seulement, verifier_mot_de_passe, hacher_mot_de_passe
import models
import schemas

router = APIRouter(prefix="/comptes", tags=["Comptes"])


# Voir les infos de son propre compte
@router.get("/moi", response_model=schemas.UtilisateurInfo)
def mon_compte(db: Session = Depends(get_db), utilisateur=Depends(utilisateur_actuel)):
    u = db.query(models.Utilisateur).filter(
        models.Utilisateur.identifiant == utilisateur["identifiant"]
    ).first()
    if u is None:
        raise HTTPException(status_code=404, detail="Compte introuvable")
    return u


# Changer SON propre mot de passe (avec l'ancien)
@router.put("/mon-mot-de-passe")
def changer_mon_mot_de_passe(donnees: schemas.ChangerMotDePasse, db: Session = Depends(get_db), utilisateur=Depends(utilisateur_actuel)):
    u = db.query(models.Utilisateur).filter(
        models.Utilisateur.identifiant == utilisateur["identifiant"]
    ).first()
    if u is None:
        raise HTTPException(status_code=404, detail="Compte introuvable")

    # Vérifier l'ancien mot de passe
    if not verifier_mot_de_passe(donnees.ancien_mot_de_passe, u.mot_de_passe_hache):
        raise HTTPException(status_code=400, detail="Ancien mot de passe incorrect")

    # Vérifier que le nouveau n'est pas trop court
    if len(donnees.nouveau_mot_de_passe) < 6:
        raise HTTPException(status_code=400, detail="Le nouveau mot de passe doit faire au moins 6 caractères")

    u.mot_de_passe_hache = hacher_mot_de_passe(donnees.nouveau_mot_de_passe)
    db.commit()
    return {"message": "Mot de passe modifié avec succès"}


# Changer SON propre identifiant (avec confirmation par mot de passe)
@router.put("/mon-identifiant")
def changer_mon_identifiant(donnees: schemas.ChangerIdentifiant, db: Session = Depends(get_db), utilisateur=Depends(utilisateur_actuel)):
    u = db.query(models.Utilisateur).filter(
        models.Utilisateur.identifiant == utilisateur["identifiant"]
    ).first()
    if u is None:
        raise HTTPException(status_code=404, detail="Compte introuvable")

    # Confirmer avec le mot de passe
    if not verifier_mot_de_passe(donnees.mot_de_passe, u.mot_de_passe_hache):
        raise HTTPException(status_code=400, detail="Mot de passe incorrect")

    # Vérifier que le nouvel identifiant n'est pas déjà pris
    existe = db.query(models.Utilisateur).filter(
        models.Utilisateur.identifiant == donnees.nouvel_identifiant
    ).first()
    if existe:
        raise HTTPException(status_code=400, detail="Cet identifiant est déjà utilisé")

    if len(donnees.nouvel_identifiant) < 3:
        raise HTTPException(status_code=400, detail="L'identifiant doit faire au moins 3 caractères")

    u.identifiant = donnees.nouvel_identifiant
    db.commit()
    return {"message": "Identifiant modifié avec succès", "nouvel_identifiant": donnees.nouvel_identifiant}


# ADMIN : lister tous les comptes
@router.get("/", response_model=list[schemas.UtilisateurInfo])
def lister_comptes(db: Session = Depends(get_db), admin=Depends(admin_seulement)):
    return db.query(models.Utilisateur).all()


# ADMIN : réinitialiser le mot de passe d'un autre compte (sans l'ancien)
@router.put("/admin/reset-mot-de-passe")
def admin_reset_mot_de_passe(donnees: schemas.AdminResetMotDePasse, db: Session = Depends(get_db), admin=Depends(admin_seulement)):
    u = db.query(models.Utilisateur).filter(
        models.Utilisateur.identifiant == donnees.identifiant_cible
    ).first()
    if u is None:
        raise HTTPException(status_code=404, detail="Compte cible introuvable")

    if len(donnees.nouveau_mot_de_passe) < 6:
        raise HTTPException(status_code=400, detail="Le mot de passe doit faire au moins 6 caractères")

    u.mot_de_passe_hache = hacher_mot_de_passe(donnees.nouveau_mot_de_passe)
    db.commit()
    return {"message": f"Mot de passe de '{donnees.identifiant_cible}' réinitialisé"}
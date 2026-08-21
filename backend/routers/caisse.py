from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from securite import utilisateur_actuel, admin_seulement
import models
import schemas

router = APIRouter(prefix="/caisse", tags=["Caisse"])


def lire_fonds_de_caisse(db):
    config = db.query(models.Configuration).filter(
        models.Configuration.cle == "fonds_de_caisse"
    ).first()
    if config is None:
        return 0.0
    return float(config.valeur)


# ÉTAT DE LA CAISSE (fonds + encaissé - dépenses - remises)
@router.get("/", response_model=schemas.CaisseComplete)
def etat_caisse(db: Session = Depends(get_db), utilisateur=Depends(utilisateur_actuel)):
    fonds = lire_fonds_de_caisse(db)

    total_encaisse = float(db.query(func.coalesce(func.sum(models.Paiement.montant), 0)).scalar())
    total_depense = float(db.query(func.coalesce(func.sum(models.Depense.montant), 0)).scalar())
    total_remises = float(db.query(func.coalesce(func.sum(models.Remise.montant), 0)).scalar())

    nb_paiements = db.query(models.Paiement).count()
    nb_depenses = db.query(models.Depense).count()
    nb_remises = db.query(models.Remise).count()

    caisse_actuelle = fonds + total_encaisse - total_depense - total_remises

    return schemas.CaisseComplete(
        fonds_de_caisse=fonds,
        total_encaisse=total_encaisse,
        total_depense=total_depense,
        total_remises=total_remises,
        caisse_actuelle=caisse_actuelle,
        nombre_paiements=nb_paiements,
        nombre_depenses=nb_depenses,
        nombre_remises=nb_remises,
    )


# DÉFINIR le fonds de caisse (admin seulement)
@router.put("/fonds")
def definir_fonds(donnees: schemas.FondsCaisseUpdate, db: Session = Depends(get_db), admin=Depends(admin_seulement)):
    config = db.query(models.Configuration).filter(
        models.Configuration.cle == "fonds_de_caisse"
    ).first()
    if config is None:
        config = models.Configuration(cle="fonds_de_caisse", valeur=str(donnees.montant))
        db.add(config)
    else:
        config.valeur = str(donnees.montant)
    db.commit()
    return {"message": "Fonds de caisse mis à jour", "montant": donnees.montant}
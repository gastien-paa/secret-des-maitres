from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from securite import utilisateur_actuel
import models
import schemas

router = APIRouter(prefix="/remises", tags=["Remises"])


# ENREGISTRER une remise (gérant ou admin)
@router.post("/", response_model=schemas.RemiseOut)
def creer_remise(remise: schemas.RemiseCreate, db: Session = Depends(get_db), utilisateur=Depends(utilisateur_actuel)):
    nouvelle_remise = models.Remise(
        montant=remise.montant,
        destination=remise.destination,
        note=remise.note,
        enregistre_par=utilisateur["identifiant"],  # qui a enregistré
    )
    db.add(nouvelle_remise)
    db.commit()
    db.refresh(nouvelle_remise)
    return nouvelle_remise


# LISTER les remises
@router.get("/", response_model=list[schemas.RemiseOut])
def lister_remises(db: Session = Depends(get_db), utilisateur=Depends(utilisateur_actuel)):
    return db.query(models.Remise).order_by(models.Remise.date_remise.desc(), models.Remise.id.desc()).all()
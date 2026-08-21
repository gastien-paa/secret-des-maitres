from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from securite import admin_seulement

router = APIRouter(prefix="/depenses", tags=["Dépenses"])


# ENREGISTRER une dépense
@router.post("/", response_model=schemas.DepenseOut)
def creer_depense(depense: schemas.DepenseCreate, db: Session = Depends(get_db)):
    # Si une catégorie est fournie, vérifier qu'elle existe
    if depense.categorie_id is not None:
        categorie = db.query(models.Categorie).filter(
            models.Categorie.id == depense.categorie_id
        ).first()
        if categorie is None:
            raise HTTPException(status_code=404, detail="Catégorie introuvable")

    nouvelle_depense = models.Depense(**depense.model_dump())
    db.add(nouvelle_depense)
    db.commit()
    db.refresh(nouvelle_depense)
    return nouvelle_depense


# LISTER toutes les dépenses
@router.get("/", response_model=list[schemas.DepenseOut])
def lister_depenses(db: Session = Depends(get_db)):
    return db.query(models.Depense).order_by(models.Depense.date_depense.desc()).all()


# SUPPRIMER une dépense
@router.delete("/{depense_id}")
def supprimer_depense(depense_id: int, db: Session = Depends(get_db), admin=Depends(admin_seulement)):
    depense = db.query(models.Depense).filter(
        models.Depense.id == depense_id
    ).first()
    if depense is None:
        raise HTTPException(status_code=404, detail="Dépense introuvable")
    db.delete(depense)
    db.commit()
    return {"message": "Dépense supprimée"}
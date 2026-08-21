from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/categories", tags=["Catégories"])


# LISTER toutes les catégories
@router.get("/", response_model=list[schemas.CategorieOut])
def lister_categories(db: Session = Depends(get_db)):
    return db.query(models.Categorie).all()
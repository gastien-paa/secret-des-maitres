from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from datetime import date

router = APIRouter(prefix="/frais", tags=["Frais"])


# ATTRIBUER un frais à un étudiant
@router.post("/", response_model=schemas.FraisOut)
def creer_frais(frais: schemas.FraisCreate, db: Session = Depends(get_db)):
    etudiant = db.query(models.Etudiant).filter(models.Etudiant.id == frais.etudiant_id).first()
    if etudiant is None:
        raise HTTPException(status_code=404, detail="Étudiant introuvable")

    nouveau_frais = models.FraisEtudiant(**frais.model_dump())
    db.add(nouveau_frais)
    db.commit()
    db.refresh(nouveau_frais)
    return nouveau_frais


# LISTER tous les frais
@router.get("/", response_model=list[schemas.FraisOut])
def lister_frais(db: Session = Depends(get_db)):
    return db.query(models.FraisEtudiant).all()


# LISTER les frais d'UN étudiant précis
@router.get("/etudiant/{etudiant_id}", response_model=list[schemas.FraisOut])
def frais_d_un_etudiant(etudiant_id: int, db: Session = Depends(get_db)):
    return db.query(models.FraisEtudiant).filter(
        models.FraisEtudiant.etudiant_id == etudiant_id
    ).all()


# GÉNÉRER automatiquement inscription + 8 mensualités (sept → avril)
@router.post("/generer", response_model=list[schemas.FraisOut])
def generer_calendrier(demande: schemas.GenererFraisRequest, db: Session = Depends(get_db)):
    # Vérifier que l'étudiant existe
    etudiant = db.query(models.Etudiant).filter(
        models.Etudiant.id == demande.etudiant_id
    ).first()
    if etudiant is None:
        raise HTTPException(status_code=404, detail="Étudiant introuvable")

    # Empêcher les doublons : refuser si l'étudiant a déjà des frais
    frais_existants = db.query(models.FraisEtudiant).filter(
        models.FraisEtudiant.etudiant_id == demande.etudiant_id
    ).count()
    if frais_existants > 0:
        raise HTTPException(
            status_code=400,
            detail="Cet étudiant a déjà des frais générés."
        )

    a = demande.annee_debut          # 2026
    JOUR = 25                        # jour d'échéance de chaque frais
    frais_a_creer = []

    # 1. Le frais d'inscription (5 000 F)
    frais_a_creer.append(models.FraisEtudiant(
        etudiant_id=demande.etudiant_id,
        type_frais="inscription",
        libelle="Inscription",
        montant_du=5000,
        date_echeance=date(a, 9, JOUR),
    ))

    # 2. Les 8 mensualités (20 000 F), de septembre à avril
    mois = [
        ("Septembre", a, 9), ("Octobre", a, 10),
        ("Novembre", a, 11), ("Décembre", a, 12),
        ("Janvier", a + 1, 1), ("Février", a + 1, 2),
        ("Mars", a + 1, 3), ("Avril", a + 1, 4),
    ]
    for nom_mois, annee, num_mois in mois:
        frais_a_creer.append(models.FraisEtudiant(
            etudiant_id=demande.etudiant_id,
            type_frais="mensualite",
            libelle=f"Mensualité {nom_mois} {annee}",
            montant_du=20000,
            date_echeance=date(annee, num_mois, JOUR),
        ))

    # Tout enregistrer d'un coup
    db.add_all(frais_a_creer)
    db.commit()
    for f in frais_a_creer:
        db.refresh(f)

    return frais_a_creer
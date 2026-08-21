from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from database import get_db
import models
import schemas

router = APIRouter(prefix="/tableau-bord", tags=["Tableau de bord"])


@router.get("/", response_model=schemas.TableauDeBord)
def tableau_de_bord(db: Session = Depends(get_db)):
    # Total encaissé : somme de tous les paiements
    total_encaisse = db.query(func.coalesce(func.sum(models.Paiement.montant), 0)).scalar()

    # Total attendu : somme de tous les frais dus
    total_attendu = db.query(func.coalesce(func.sum(models.FraisEtudiant.montant_du), 0)).scalar()

    # Total dépensé : somme de toutes les dépenses
    total_depense = db.query(func.coalesce(func.sum(models.Depense.montant), 0)).scalar()

    # Nombre d'étudiants
    nombre_etudiants = db.query(models.Etudiant).count()

    # Nombre de frais en retard (échéance passée + non soldés)
    nombre_retards = db.query(models.FraisEtudiant).filter(
        models.FraisEtudiant.statut != "paye",
        models.FraisEtudiant.date_echeance < date.today()
    ).count()

    # Conversions et calculs
    total_encaisse = float(total_encaisse)
    total_attendu = float(total_attendu)
    total_depense = float(total_depense)

    return schemas.TableauDeBord(
        total_encaisse=total_encaisse,
        total_attendu=total_attendu,
        reste_a_encaisser=total_attendu - total_encaisse,
        total_depense=total_depense,
        solde=total_encaisse - total_depense,
        nombre_etudiants=nombre_etudiants,
        nombre_frais_en_retard=nombre_retards,
    )
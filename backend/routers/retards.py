from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from database import get_db
import models
import schemas

router = APIRouter(prefix="/retards", tags=["Retards"])


# LISTER tous les frais en retard (échéance dépassée ET non soldés)
@router.get("/", response_model=list[schemas.FraisEnRetard])
def lister_retards(db: Session = Depends(get_db)):
    aujourd_hui = date.today()

    # On récupère tous les frais non entièrement payés dont l'échéance est passée
    frais_en_retard = db.query(models.FraisEtudiant).filter(
        models.FraisEtudiant.statut != "paye",
        models.FraisEtudiant.date_echeance < aujourd_hui
    ).all()

    resultats = []
    for frais in frais_en_retard:
        # Total déjà payé sur ce frais
        montant_paye = sum(p.montant for p in frais.paiements)
        reste = float(frais.montant_du) - montant_paye

        # Nombre de jours de retard
        jours_retard = (aujourd_hui - frais.date_echeance).days

        # Récupérer le nom de l'étudiant
        etudiant = frais.etudiant

        resultats.append(schemas.FraisEnRetard(
            frais_id=frais.id,
            etudiant_id=frais.etudiant_id,
            nom_etudiant=f"{etudiant.nom} {etudiant.prenom}",
            libelle=frais.libelle,
            montant_du=float(frais.montant_du),
            montant_paye=montant_paye,
            reste_a_payer=reste,
            date_echeance=frais.date_echeance,
            jours_de_retard=jours_retard,
            statut=frais.statut
        ))

    return resultats
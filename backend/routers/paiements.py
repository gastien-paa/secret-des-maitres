from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from securite import admin_seulement

router = APIRouter(prefix="/paiements", tags=["Paiements"])


# Fonction utilitaire : recalcule le statut d'un frais selon les paiements reçus
def recalculer_statut(frais, db):
    total_paye = sum(p.montant for p in frais.paiements)
    if total_paye == 0:
        frais.statut = "impaye"
    elif total_paye < frais.montant_du:
        frais.statut = "partiel"
    else:
        frais.statut = "paye"
    db.commit()


# ENREGISTRER un paiement sur un frais (avec numéro de reçu automatique)
@router.post("/", response_model=schemas.PaiementOut)
def creer_paiement(paiement: schemas.PaiementCreate, db: Session = Depends(get_db)):
    # Vérifier que le frais existe
    frais = db.query(models.FraisEtudiant).filter(
        models.FraisEtudiant.id == paiement.frais_id
    ).first()
    if frais is None:
        raise HTTPException(status_code=404, detail="Frais introuvable")

    # Générer le prochain numéro de reçu automatiquement
    nombre_paiements = db.query(models.Paiement).count()
    numero_recu = f"REC-{nombre_paiements + 1:04d}"

    # Créer le paiement
    donnees = paiement.model_dump()
    donnees["numero_recu"] = numero_recu   # on force le numéro généré

    nouveau_paiement = models.Paiement(**donnees)
    db.add(nouveau_paiement)
    db.commit()
    db.refresh(nouveau_paiement)

    # Recalculer le statut du frais automatiquement
    db.refresh(frais)
    recalculer_statut(frais, db)

    return nouveau_paiement


# LISTER tous les paiements
@router.get("/", response_model=list[schemas.PaiementOut])
def lister_paiements(db: Session = Depends(get_db)):
    return db.query(models.Paiement).all()


# LISTER les paiements d'un frais précis
@router.get("/frais/{frais_id}", response_model=list[schemas.PaiementOut])
def paiements_d_un_frais(frais_id: int, db: Session = Depends(get_db)):
    return db.query(models.Paiement).filter(
        models.Paiement.frais_id == frais_id
    ).all()


# SUPPRIMER un paiement (avec recalcul automatique du statut)
@router.delete("/{paiement_id}")
def supprimer_paiement(paiement_id: int, db: Session = Depends(get_db), admin=Depends(admin_seulement)):
    paiement = db.query(models.Paiement).filter(
        models.Paiement.id == paiement_id
    ).first()
    if paiement is None:
        raise HTTPException(status_code=404, detail="Paiement introuvable")

    # On garde une référence au frais concerné avant de supprimer
    frais = db.query(models.FraisEtudiant).filter(
        models.FraisEtudiant.id == paiement.frais_id
    ).first()

    # Supprimer le paiement
    db.delete(paiement)
    db.commit()

    # Recalculer le statut du frais
    db.refresh(frais)
    recalculer_statut(frais, db)

    return {"message": "Paiement supprimé et statut recalculé"}


# HISTORIQUE : tous les paiements avec infos étudiant et frais
@router.get("/historique/complet", response_model=list[schemas.PaiementHistorique])
def historique_paiements(db: Session = Depends(get_db)):
    paiements = db.query(models.Paiement).order_by(
        models.Paiement.date_paiement.desc(),
        models.Paiement.id.desc()
    ).all()

    resultats = []
    for p in paiements:
        frais = p.frais
        etudiant = frais.etudiant
        # Reste à payer sur ce frais au global
        total_paye_frais = float(sum(x.montant for x in frais.paiements))
        reste = float(frais.montant_du) - total_paye_frais

        resultats.append(schemas.PaiementHistorique(
            id=p.id,
            numero_recu=p.numero_recu,
            date_paiement=p.date_paiement,
            montant=float(p.montant),
            mode_paiement=p.mode_paiement,
            nom_etudiant=f"{etudiant.nom} {etudiant.prenom}",
            etudiant_id=etudiant.id,
            libelle=frais.libelle,
            reste_a_payer=reste,
        ))

    return resultats
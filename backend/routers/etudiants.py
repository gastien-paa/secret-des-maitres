from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from securite import admin_seulement

# Un "routeur" regroupe toutes les routes liées aux étudiants
router = APIRouter(prefix="/etudiants", tags=["Étudiants"])


# AJOUTER un étudiant
@router.post("/", response_model=schemas.EtudiantOut)
def creer_etudiant(etudiant: schemas.EtudiantCreate, db: Session = Depends(get_db)):
    nouvel_etudiant = models.Etudiant(**etudiant.model_dump())
    db.add(nouvel_etudiant)
    db.commit()
    db.refresh(nouvel_etudiant)
    return nouvel_etudiant


# LISTER tous les étudiants
@router.get("/", response_model=list[schemas.EtudiantOut])
def lister_etudiants(db: Session = Depends(get_db)):
    return db.query(models.Etudiant).all()


# VOIR un étudiant précis par son id
@router.get("/{etudiant_id}", response_model=schemas.EtudiantOut)
def voir_etudiant(etudiant_id: int, db: Session = Depends(get_db)):
    etudiant = db.query(models.Etudiant).filter(models.Etudiant.id == etudiant_id).first()
    if etudiant is None:
        raise HTTPException(status_code=404, detail="Étudiant introuvable")
    return etudiant


# SUPPRIMER un étudiant (et tous ses frais/paiements liés)
@router.delete("/{etudiant_id}")
def supprimer_etudiant(etudiant_id: int, db: Session = Depends(get_db), admin=Depends(admin_seulement)):
    etudiant = db.query(models.Etudiant).filter(
        models.Etudiant.id == etudiant_id
    ).first()
    if etudiant is None:
        raise HTTPException(status_code=404, detail="Étudiant introuvable")

    db.delete(etudiant)
    db.commit()
    return {"message": "Étudiant supprimé"}


# FICHE DÉTAILLÉE d'un étudiant (infos + frais + totaux)
@router.get("/{etudiant_id}/fiche", response_model=schemas.FicheEtudiant)
def fiche_etudiant(etudiant_id: int, db: Session = Depends(get_db)):
    etudiant = db.query(models.Etudiant).filter(
        models.Etudiant.id == etudiant_id
    ).first()
    if etudiant is None:
        raise HTTPException(status_code=404, detail="Étudiant introuvable")

    frais_detailles = []
    total_du = 0.0
    total_paye = 0.0

    for frais in etudiant.frais:
        paye = float(sum(p.montant for p in frais.paiements))
        du = float(frais.montant_du)
        total_du += du
        total_paye += paye

        frais_detailles.append(schemas.FraisAvecPaiement(
            id=frais.id,
            type_frais=frais.type_frais,
            libelle=frais.libelle,
            montant_du=du,
            montant_paye=paye,
            reste_a_payer=du - paye,
            date_echeance=frais.date_echeance,
            statut=frais.statut,
        ))

    # Trier les frais par date d'échéance (du plus ancien au plus récent)
    frais_detailles.sort(key=lambda f: f.date_echeance)

    return schemas.FicheEtudiant(
        id=etudiant.id,
        nom=etudiant.nom,
        prenom=etudiant.prenom,
        contact=etudiant.contact,
        concours_vise=etudiant.concours_vise,
        statut=etudiant.statut,
        total_du=total_du,
        total_paye=total_paye,
        reste_a_payer=total_du - total_paye,
        frais=frais_detailles,
    )


# STATISTIQUES par concours
@router.get("/stats/par-concours")
def etudiants_par_concours(db: Session = Depends(get_db)):
    etudiants = db.query(models.Etudiant).all()

    # Regrouper par concours
    groupes = {}
    for e in etudiants:
        concours = e.concours_vise or "Non précisé"
        if concours not in groupes:
            groupes[concours] = []
        groupes[concours].append({
            "id": e.id,
            "nom": e.nom,
            "prenom": e.prenom,
            "contact": e.contact,
            "statut": e.statut,
        })

    # Transformer en liste avec le compte
    resultat = []
    for concours, liste in groupes.items():
        resultat.append({
            "concours": concours,
            "nombre": len(liste),
            "etudiants": liste,
        })

    # Trier du concours le plus demandé au moins demandé
    resultat.sort(key=lambda x: x["nombre"], reverse=True)

    return resultat
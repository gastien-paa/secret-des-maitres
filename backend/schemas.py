from pydantic import BaseModel
from datetime import date
from typing import Optional


# Ce qu'on ATTEND quand on crée un étudiant (les données entrantes)
class EtudiantCreate(BaseModel):
    nom: str
    prenom: str
    contact: Optional[str] = None
    concours_vise: Optional[str] = None


# Ce qu'on RENVOIE quand on lit un étudiant (les données sortantes)
class EtudiantOut(BaseModel):
    id: int
    nom: str
    prenom: str
    contact: Optional[str] = None
    concours_vise: Optional[str] = None
    date_inscription: date
    statut: str

    class Config:
        from_attributes = True  # permet de convertir un objet SQLAlchemy en réponse JSON


# ===== FRAIS =====

# Ce qu'on ENVOIE pour attribuer un frais à un étudiant
class FraisCreate(BaseModel):
    etudiant_id: int
    type_frais: str          # "inscription" ou "mensualite"
    libelle: str             # ex: "Inscription" ou "Mensualité Octobre 2026"
    montant_du: float
    date_echeance: date


# Ce qu'on RENVOIE quand on lit un frais
class FraisOut(BaseModel):
    id: int
    etudiant_id: int
    type_frais: str
    libelle: str
    montant_du: float
    date_echeance: date
    statut: str

    class Config:
        from_attributes = True


# ===== GÉNÉRATION DU CALENDRIER DE FRAIS =====

class GenererFraisRequest(BaseModel):
    etudiant_id: int
    annee_debut: int = 2026   # année du mois de septembre


# ===== PAIEMENTS =====

# Ce qu'on ENVOIE pour enregistrer un paiement
class PaiementCreate(BaseModel):
    frais_id: int
    montant: float
    mode_paiement: str = "especes"   # "especes", "mobile_money" ou "virement"
    numero_recu: Optional[str] = None


# Ce qu'on RENVOIE
class PaiementOut(BaseModel):
    id: int
    frais_id: int
    montant: float
    date_paiement: date
    mode_paiement: str
    numero_recu: Optional[str] = None

    class Config:
        from_attributes = True


# ===== RETARDS (frais en retard de paiement) =====

class FraisEnRetard(BaseModel):
    frais_id: int
    etudiant_id: int
    nom_etudiant: str
    libelle: str
    montant_du: float
    montant_paye: float
    reste_a_payer: float
    date_echeance: date
    jours_de_retard: int
    statut: str


# ===== CATÉGORIES =====

class CategorieOut(BaseModel):
    id: int
    nom: str
    type: str

    class Config:
        from_attributes = True


# ===== DÉPENSES =====

class DepenseCreate(BaseModel):
    categorie_id: Optional[int] = None
    description: str
    montant: float
    beneficiaire: Optional[str] = None
    mode_paiement: str = "especes"


class DepenseOut(BaseModel):
    id: int
    categorie_id: Optional[int] = None
    description: str
    montant: float
    date_depense: date
    beneficiaire: Optional[str] = None
    mode_paiement: str

    class Config:
        from_attributes = True


# ===== TABLEAU DE BORD =====

class TableauDeBord(BaseModel):
    total_encaisse: float
    total_attendu: float
    reste_a_encaisser: float
    total_depense: float
    solde: float
    nombre_etudiants: int
    nombre_frais_en_retard: int


# ===== FICHE DÉTAILLÉE D'UN ÉTUDIANT =====

class FraisAvecPaiement(BaseModel):
    id: int
    type_frais: str
    libelle: str
    montant_du: float
    montant_paye: float
    reste_a_payer: float
    date_echeance: date
    statut: str


class FicheEtudiant(BaseModel):
    id: int
    nom: str
    prenom: str
    contact: Optional[str] = None
    concours_vise: Optional[str] = None
    statut: str
    total_du: float
    total_paye: float
    reste_a_payer: float
    frais: list[FraisAvecPaiement]


# ===== HISTORIQUE DES PAIEMENTS =====

class PaiementHistorique(BaseModel):
    id: int
    numero_recu: Optional[str] = None
    date_paiement: date
    montant: float
    mode_paiement: str
    nom_etudiant: str
    etudiant_id: int
    libelle: str
    reste_a_payer: float


# ===== AUTHENTIFICATION =====

class ConnexionRequest(BaseModel):
    identifiant: str
    mot_de_passe: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    nom_complet: Optional[str] = None


# ===== CAISSE (vue gérant) =====

class Caisse(BaseModel):
    periode: str
    date_debut: date
    total_encaisse: float
    total_depense: float
    solde_caisse: float
    nombre_paiements: int
    nombre_depenses: int


# ===== REMISES =====

class RemiseCreate(BaseModel):
    montant: float
    destination: Optional[str] = None
    note: Optional[str] = None

class RemiseOut(BaseModel):
    id: int
    montant: float
    date_remise: date
    destination: Optional[str] = None
    note: Optional[str] = None
    enregistre_par: Optional[str] = None

    class Config:
        from_attributes = True

# ===== CAISSE (nouvelle version) =====

class CaisseComplete(BaseModel):
    fonds_de_caisse: float
    total_encaisse: float
    total_depense: float
    total_remises: float
    caisse_actuelle: float
    nombre_paiements: int
    nombre_depenses: int
    nombre_remises: int

class FondsCaisseUpdate(BaseModel):
    montant: float


    # ===== GESTION DES COMPTES =====

class ChangerMotDePasse(BaseModel):
    ancien_mot_de_passe: str
    nouveau_mot_de_passe: str

class ChangerIdentifiant(BaseModel):
    mot_de_passe: str  # confirmer avec le mot de passe
    nouvel_identifiant: str

class AdminResetMotDePasse(BaseModel):
    identifiant_cible: str  # quel compte modifier
    nouveau_mot_de_passe: str

class UtilisateurInfo(BaseModel):
    id: int
    identifiant: str
    role: str
    nom_complet: Optional[str] = None

    class Config:
        from_attributes = True
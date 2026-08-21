from sqlalchemy import Column, Integer, String, Date, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Etudiant(Base):
    __tablename__ = "etudiants"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    contact = Column(String(30))
    concours_vise = Column(String(100))
    date_inscription = Column(Date, server_default=func.current_date(), nullable=False)
    statut = Column(String(20), server_default="actif", nullable=False)

    frais = relationship("FraisEtudiant", back_populates="etudiant", cascade="all, delete")


class Categorie(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    type = Column(String(10), nullable=False)


class FraisEtudiant(Base):
    __tablename__ = "frais_etudiant"

    id = Column(Integer, primary_key=True, index=True)
    etudiant_id = Column(Integer, ForeignKey("etudiants.id", ondelete="CASCADE"), nullable=False)
    type_frais = Column(String(20), nullable=False)
    libelle = Column(String(100), nullable=False)
    montant_du = Column(Numeric(12, 2), nullable=False)
    date_echeance = Column(Date, nullable=False)
    statut = Column(String(10), server_default="impaye", nullable=False)

    etudiant = relationship("Etudiant", back_populates="frais")
    paiements = relationship("Paiement", back_populates="frais", cascade="all, delete")


class Paiement(Base):
    __tablename__ = "paiements"

    id = Column(Integer, primary_key=True, index=True)
    frais_id = Column(Integer, ForeignKey("frais_etudiant.id", ondelete="CASCADE"), nullable=False)
    montant = Column(Numeric(12, 2), nullable=False)
    date_paiement = Column(Date, server_default=func.current_date(), nullable=False)
    mode_paiement = Column(String(20), server_default="especes", nullable=False)
    numero_recu = Column(String(30), unique=True)

    frais = relationship("FraisEtudiant", back_populates="paiements")


class Depense(Base):
    __tablename__ = "depenses"

    id = Column(Integer, primary_key=True, index=True)
    categorie_id = Column(Integer, ForeignKey("categories.id"))
    description = Column(String(200), nullable=False)
    montant = Column(Numeric(12, 2), nullable=False)
    date_depense = Column(Date, server_default=func.current_date(), nullable=False)
    beneficiaire = Column(String(100))
    mode_paiement = Column(String(20), server_default="especes", nullable=False)


class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    identifiant = Column(String(50), unique=True, nullable=False)
    mot_de_passe_hache = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, server_default="operateur")
    nom_complet = Column(String(100))


class Remise(Base):
    __tablename__ = "remises"

    id = Column(Integer, primary_key=True, index=True)
    montant = Column(Numeric(12, 2), nullable=False)
    date_remise = Column(Date, server_default=func.current_date(), nullable=False)
    destination = Column(String(50))
    note = Column(String(200))
    enregistre_par = Column(String(50))


class Configuration(Base):
    __tablename__ = "configuration"

    cle = Column(String(50), primary_key=True)
    valeur = Column(String(200))
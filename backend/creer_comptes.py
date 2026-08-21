from database import SessionLocal
import models
from securite import hacher_mot_de_passe

db = SessionLocal()

# ⚠️ CHOISIS TES MOTS DE PASSE ICI
comptes = [
    {
        "identifiant": "Gastien",
        "mot_de_passe": "#monica@123fok",   # ← change-le
        "role": "admin",
        "nom_complet": "M. FOKA Gastien",
    },
    {
        "identifiant": "gerant",
        "mot_de_passe": "gerant321",       # ← change-le
        "role": "operateur",
        "nom_complet": "Le Gérant",
    },
]

for c in comptes:
    # Vérifier si le compte existe déjà
    existe = db.query(models.Utilisateur).filter(
        models.Utilisateur.identifiant == c["identifiant"]
    ).first()
    if existe:
        print(f"Le compte '{c['identifiant']}' existe déjà, ignoré.")
        continue

    utilisateur = models.Utilisateur(
        identifiant=c["identifiant"],
        mot_de_passe_hache=hacher_mot_de_passe(c["mot_de_passe"]),
        role=c["role"],
        nom_complet=c["nom_complet"],
    )
    db.add(utilisateur)
    print(f"Compte '{c['identifiant']}' créé ({c['role']}).")

db.commit()
db.close()
print("Terminé !")
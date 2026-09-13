import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import api from "../api";

// Liste des concours proposés à l'inscription
const CONCOURS = ["AS", "ISE-MATH", "ISE-ECO", "BECEAS", "INPHB", "ESATIC", "Autre"];

function Etudiants() {
  const estAdmin = localStorage.getItem("role") === "admin";
  const [etudiants, setEtudiants] = useState([]);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [contact, setContact] = useState("");
  const [concours, setConcours] = useState("");
  const [filtreConcours, setFiltreConcours] = useState("tous");

  function chargerEtudiants() {
    api.get("/etudiants/")
      .then((reponse) => setEtudiants(reponse.data))
      .catch((erreur) => console.error(erreur));
  }

  useEffect(() => {
    chargerEtudiants();
  }, []);

  function ajouterEtudiant() {
    if (!nom || !prenom) {
      alert("Le nom et le prénom sont obligatoires.");
      return;
    }
    api.post("/etudiants/", {
      nom: nom,
      prenom: prenom,
      contact: contact || null,
      concours_vise: concours || null,
    })
      .then(() => {
        setNom(""); setPrenom(""); setContact(""); setConcours("");
        chargerEtudiants();
      })
      .catch((erreur) => console.error(erreur));
  }

  function supprimerEtudiant(id, nomComplet) {
    const confirmation = window.confirm(
      `Supprimer ${nomComplet} ?\nAttention : tous ses frais et paiements seront aussi supprimés.`
    );
    if (!confirmation) return;

    api.delete(`/etudiants/${id}`)
      .then(() => chargerEtudiants())
      .catch((erreur) => console.error(erreur));
  }

  function genererFrais(id, nomComplet) {
    const confirmation = window.confirm(
      `Générer les frais (inscription + 8 mensualités) pour ${nomComplet} ?`
    );
    if (!confirmation) return;

    api.post("/frais/generer", { etudiant_id: id, annee_debut: 2026 })
      .then(() => alert(`Frais générés pour ${nomComplet} !`))
      .catch((erreur) => {
        if (erreur.response && erreur.response.status === 400) {
          alert(`${nomComplet} a déjà ses frais. Génération annulée pour éviter les doublons.`);
        } else {
          console.error(erreur);
          alert("Erreur lors de la génération.");
        }
      });
  }

  // Charger une image (le logo) et la convertir pour le PDF
  function chargerImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg"));
      };
      img.onerror = () => resolve(null); // si le logo ne charge pas, on continue sans
      img.src = url;
    });
  }

  // Générer le PDF de la liste des étudiants du concours filtré
  async function telechargerListePDF() {
    const BLEU = [30, 58, 138];
    const JAUNE = [245, 197, 24];

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const largeur = pdf.internal.pageSize.getWidth();

    // Bandeau supérieur coloré
    pdf.setFillColor(...BLEU);
    pdf.rect(0, 0, largeur, 6, "F");
    pdf.setFillColor(...JAUNE);
    pdf.rect(0, 6, largeur, 2, "F");

    // Logo
    const logo = await chargerImage("/logo.jpeg");
    if (logo) {
      pdf.addImage(logo, "JPEG", 15, 14, 24, 24);
    }

    // En-tête texte
    pdf.setTextColor(...BLEU);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("SECRET DES MAÎTRES", largeur / 2, 22, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(80, 80, 80);
    pdf.text("Centre de préparation aux concours", largeur / 2, 29, { align: "center" });

    // Ligne de séparation
    pdf.setDrawColor(...BLEU);
    pdf.setLineWidth(0.6);
    pdf.line(15, 44, largeur - 15, 44);

    // Titre du document
    pdf.setTextColor(...BLEU);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.text("LISTE DES ÉTUDIANTS", largeur / 2, 55, { align: "center" });

    const nomConcours = filtreConcours === "tous" ? "Tous les concours" : `Concours : ${filtreConcours}`;
    pdf.setFontSize(12);
    pdf.setTextColor(50, 50, 50);
    pdf.text(nomConcours, largeur / 2, 63, { align: "center" });

    // En-tête du tableau
    let y = 75;
    pdf.setFillColor(...BLEU);
    pdf.rect(15, y, largeur - 30, 9, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("N°", 20, y + 6);
    pdf.text("Nom", 33, y + 6);
    pdf.text("Prénom", 110, y + 6);

    // Lignes des étudiants
    y += 9;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(30, 30, 30);

    etudiantsAffiches.forEach((e, index) => {
      // Nouvelle page si on arrive en bas
      if (y > 275) {
        pdf.addPage();
        y = 20;
      }
      // Fond alterné pour la lisibilité
      if (index % 2 === 0) {
        pdf.setFillColor(243, 246, 250);
        pdf.rect(15, y, largeur - 30, 8, "F");
      }
      pdf.setTextColor(30, 30, 30);
      pdf.text(String(index + 1), 20, y + 5.5);
      pdf.text(e.nom || "", 33, y + 5.5);
      pdf.text(e.prenom || "", 110, y + 5.5);
      y += 8;
    });

    // Total
    y += 6;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...BLEU);
    pdf.text(`Total : ${etudiantsAffiches.length} étudiant(s)`, 15, y);

    // Date de génération
    const date = new Date().toLocaleDateString("fr-FR", {
      year: "numeric", month: "long", day: "numeric"
    });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Généré le ${date}`, largeur - 15, y, { align: "right" });

    // Nom du fichier
    const nomFichier = filtreConcours === "tous" ? "Tous" : filtreConcours.replace(/[^a-zA-Z0-9]/g, "_");
    pdf.save(`Liste-etudiants-${nomFichier}.pdf`);
  }

  const concoursPresents = [...new Set(etudiants.map((e) => e.concours_vise || "Non précisé"))].sort();

  const etudiantsAffiches = filtreConcours === "tous"
    ? etudiants
    : etudiants.filter((e) => (e.concours_vise || "Non précisé") === filtreConcours);

  return (
    <div>
      <style>{cssEtudiants}</style>
      <h2 style={{ color: "#1e293b" }}>Étudiants</h2>

      {/* Formulaire d'ajout */}
      <div style={{ background: "white", padding: 20, borderRadius: 12, marginBottom: 30, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginTop: 0 }}>Ajouter un étudiant</h3>
        <div className="form-ajout">
          <input placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} className="champ" />
          <input placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} className="champ" />
          <input placeholder="Contact" value={contact} onChange={(e) => setContact(e.target.value)} className="champ" />
          <select value={concours} onChange={(e) => setConcours(e.target.value)} className="champ">
            <option value="">— Concours visé —</option>
            {CONCOURS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button onClick={ajouterEtudiant} className="bouton-ajouter">Ajouter</button>
        </div>
      </div>

      {/* Filtre par concours */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ color: "#64748b", fontSize: 14 }}>Filtrer :</span>
        <button
          onClick={() => setFiltreConcours("tous")}
          style={boutonFiltre(filtreConcours === "tous")}
        >
          Tous ({etudiants.length})
        </button>
        {concoursPresents.map((c) => {
          const nb = etudiants.filter((e) => (e.concours_vise || "Non précisé") === c).length;
          return (
            <button key={c} onClick={() => setFiltreConcours(c)} style={boutonFiltre(filtreConcours === c)}>
              {c} ({nb})
            </button>
          );
        })}
      </div>

      {/* Tableau de la liste */}
      <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <h3 style={{ margin: 0 }}>
            {filtreConcours === "tous" ? "Tous les étudiants" : `Concours : ${filtreConcours}`} ({etudiantsAffiches.length})
          </h3>
          {etudiantsAffiches.length > 0 && (
            <button onClick={telechargerListePDF} style={{
              padding: "8px 16px", background: "#1e3a8a", color: "white", border: "none",
              borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: "bold"
            }}>
              📄 Télécharger la liste PDF
            </button>
          )}
        </div>

        {/* Conteneur scrollable pour le tableau sur mobile */}
        <div style={{ overflowX: "auto", marginTop: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                <th style={thStyle}>Nom</th>
                <th style={thStyle}>Prénom</th>
                <th style={thStyle}>Contact</th>
                <th style={thStyle}>Concours</th>
                <th style={thStyle}>Statut</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {etudiantsAffiches.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={tdStyle}>
                    <Link to={`/etudiants/${e.id}/fiche`} style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "bold" }}>
                      {e.nom}
                    </Link>
                  </td>
                  <td style={tdStyle}>{e.prenom}</td>
                  <td style={tdStyle}>{e.contact || "—"}</td>
                  <td style={tdStyle}>{e.concours_vise || "—"}</td>
                  <td style={tdStyle}>{e.statut}</td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => genererFrais(e.id, `${e.nom} ${e.prenom}`)}
                        style={boutonPetit("#22c55e")}
                      >
                        Générer frais
                      </button>
                      {estAdmin && (
                        <button
                          onClick={() => supprimerEtudiant(e.id, `${e.nom} ${e.prenom}`)}
                          style={boutonPetit("#ef4444")}
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const boutonPetit = (couleur) => ({
  padding: "6px 12px", background: couleur, color: "white", border: "none",
  borderRadius: 6, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap"
});
const boutonFiltre = (actif) => ({
  padding: "6px 14px", background: actif ? "#1e3a8a" : "white",
  color: actif ? "white" : "#64748b", border: "1px solid #cbd5e1",
  borderRadius: 20, cursor: "pointer", fontSize: 13,
  fontWeight: actif ? "bold" : "normal"
});
const thStyle = { padding: "10px 8px", color: "#64748b", fontSize: 13, whiteSpace: "nowrap" };
const tdStyle = { padding: "10px 8px", color: "#334155" };

const cssEtudiants = `
  .form-ajout {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .champ {
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 14px;
    flex: 1;
    min-width: 140px;
  }
  .bouton-ajouter {
    padding: 10px 20px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
  }
  @media (max-width: 768px) {
    .champ {
      width: 100%;
      flex: none;
      box-sizing: border-box;
    }
    .bouton-ajouter {
      width: 100%;
    }
  }
`;

export default Etudiants;
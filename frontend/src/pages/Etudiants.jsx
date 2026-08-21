import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

  // Liste des concours réellement présents (pour le filtre)
  const concoursPresents = [...new Set(etudiants.map((e) => e.concours_vise || "Non précisé"))].sort();

  // Étudiants filtrés selon le concours choisi
  const etudiantsAffiches = filtreConcours === "tous"
    ? etudiants
    : etudiants.filter((e) => (e.concours_vise || "Non précisé") === filtreConcours);

  return (
    <div>
      <h2 style={{ color: "#1e293b" }}>Étudiants</h2>

      {/* Formulaire d'ajout */}
      <div style={{ background: "white", padding: 20, borderRadius: 12, marginBottom: 30, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginTop: 0 }}>Ajouter un étudiant</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} style={champStyle} />
          <input placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} style={champStyle} />
          <input placeholder="Contact" value={contact} onChange={(e) => setContact(e.target.value)} style={champStyle} />
          <select value={concours} onChange={(e) => setConcours(e.target.value)} style={champStyle}>
            <option value="">— Concours visé —</option>
            {CONCOURS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button onClick={ajouterEtudiant} style={boutonStyle}>Ajouter</button>
        </div>
      </div>

      {/* Filtre par concours */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ color: "#64748b", fontSize: 14 }}>Filtrer par concours :</span>
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
        <h3 style={{ marginTop: 0 }}>
          {filtreConcours === "tous" ? "Tous les étudiants" : `Concours : ${filtreConcours}`} ({etudiantsAffiches.length})
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const champStyle = { padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14 };
const boutonStyle = { padding: "8px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 };
const boutonPetit = (couleur) => ({
  padding: "6px 12px", background: couleur, color: "white", border: "none",
  borderRadius: 6, cursor: "pointer", fontSize: 13, marginRight: 8
});
const boutonFiltre = (actif) => ({
  padding: "6px 14px", background: actif ? "#1e3a8a" : "white",
  color: actif ? "white" : "#64748b", border: "1px solid #cbd5e1",
  borderRadius: 20, cursor: "pointer", fontSize: 13,
  fontWeight: actif ? "bold" : "normal"
});
const thStyle = { padding: "10px 8px", color: "#64748b", fontSize: 13 };
const tdStyle = { padding: "10px 8px", color: "#334155" };

export default Etudiants;
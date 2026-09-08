import { useState, useEffect } from "react";
import api from "../api";

function Depenses() {
  const estAdmin = localStorage.getItem("role") === "admin";
  const [depenses, setDepenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState("");
  const [montant, setMontant] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [beneficiaire, setBeneficiaire] = useState("");
  const [mode, setMode] = useState("especes");

  function chargerDonnees() {
    api.get("/depenses/")
      .then((reponse) => setDepenses(reponse.data))
      .catch((erreur) => console.error(erreur));
    api.get("/categories/")
      .then((reponse) => {
        setCategories(reponse.data.filter((c) => c.type === "depense"));
      })
      .catch((erreur) => console.error(erreur));
  }

  useEffect(() => {
    chargerDonnees();
  }, []);

  function ajouterDepense() {
    if (!description || !montant) {
      alert("La description et le montant sont obligatoires.");
      return;
    }
    api.post("/depenses/", {
      categorie_id: categorieId ? parseInt(categorieId) : null,
      description: description,
      montant: parseFloat(montant),
      beneficiaire: beneficiaire || null,
      mode_paiement: mode,
    })
      .then(() => {
        setDescription(""); setMontant(""); setCategorieId("");
        setBeneficiaire(""); setMode("especes");
        chargerDonnees();
      })
      .catch((erreur) => console.error(erreur));
  }

  function supprimerDepense(id, desc) {
    if (!window.confirm(`Supprimer la dépense "${desc}" ?`)) return;
    api.delete(`/depenses/${id}`)
      .then(() => chargerDonnees())
      .catch((erreur) => console.error(erreur));
  }

  function nomCategorie(id) {
    const cat = categories.find((c) => c.id === id);
    return cat ? cat.nom : "—";
  }

  const total = depenses.reduce((somme, d) => somme + parseFloat(d.montant), 0);

  return (
    <div>
      <style>{cssDepenses}</style>
      <h2 style={{ color: "#1e293b" }}>Dépenses</h2>

      {/* Formulaire d'ajout */}
      <div style={{ background: "white", padding: 20, borderRadius: 12, marginBottom: 30, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginTop: 0 }}>Enregistrer une dépense</h3>
        <div className="form-depense">
          <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="champ-d" />
          <input type="number" placeholder="Montant" value={montant} onChange={(e) => setMontant(e.target.value)} className="champ-d" />
          <select value={categorieId} onChange={(e) => setCategorieId(e.target.value)} className="champ-d">
            <option value="">— Catégorie —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
          <input placeholder="Bénéficiaire" value={beneficiaire} onChange={(e) => setBeneficiaire(e.target.value)} className="champ-d" />
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="champ-d">
            <option value="especes">Espèces</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="virement">Virement</option>
          </select>
          <button onClick={ajouterDepense} className="bouton-d">Enregistrer</button>
        </div>
      </div>

      {/* Tableau des dépenses */}
      <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginTop: 0 }}>
          Liste ({depenses.length}) — Total : <span style={{ color: "#ef4444" }}>{total.toLocaleString("fr-FR")} F</span>
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Catégorie</th>
                <th style={thStyle}>Bénéficiaire</th>
                <th style={thStyle}>Montant</th>
                <th style={thStyle}>Mode</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {depenses.map((d) => (
                <tr key={d.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={tdStyle}>{d.date_depense}</td>
                  <td style={tdStyle}>{d.description}</td>
                  <td style={tdStyle}>{nomCategorie(d.categorie_id)}</td>
                  <td style={tdStyle}>{d.beneficiaire || "—"}</td>
                  <td style={tdStyle}>{parseFloat(d.montant).toLocaleString("fr-FR")} F</td>
                  <td style={tdStyle}>{d.mode_paiement}</td>
                  <td style={tdStyle}>
                    {estAdmin && (
                      <button
                        onClick={() => supprimerDepense(d.id, d.description)}
                        style={{ padding: "5px 12px", background: "#ef4444", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" }}
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
    </div>
  );
}

const thStyle = { padding: "10px 8px", color: "#64748b", fontSize: 13, whiteSpace: "nowrap" };
const tdStyle = { padding: "10px 8px", color: "#334155" };

const cssDepenses = `
  .form-depense {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .champ-d {
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 14px;
    flex: 1;
    min-width: 140px;
  }
  .bouton-d {
    padding: 10px 20px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
  }
  @media (max-width: 768px) {
    .champ-d {
      width: 100%;
      flex: none;
      box-sizing: border-box;
    }
    .bouton-d {
      width: 100%;
    }
  }
`;

export default Depenses;
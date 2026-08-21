import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import Recu from "../composants/Recu";

function FicheEtudiant() {
  const { id } = useParams();
  const [fiche, setFiche] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [fraisEnPaiement, setFraisEnPaiement] = useState(null);
  const [montantSaisi, setMontantSaisi] = useState("");
  const [modeSaisi, setModeSaisi] = useState("especes");
  const [recuAffiche, setRecuAffiche] = useState(null);

  function chargerFiche() {
    api.get(`/etudiants/${id}/fiche`)
      .then((reponse) => {
        setFiche(reponse.data);
        setChargement(false);
      })
      .catch((erreur) => {
        console.error(erreur);
        setChargement(false);
      });
  }

  useEffect(() => {
    chargerFiche();
  }, [id]);

  if (chargement) return <p>Chargement...</p>;
  if (!fiche) return <p>Étudiant introuvable.</p>;

  function couleurStatut(statut) {
    if (statut === "paye") return "#22c55e";
    if (statut === "partiel") return "#f59e0b";
    return "#ef4444";
  }

  function enregistrerPaiement(frais) {
    const montant = parseFloat(montantSaisi);
    if (!montant || montant <= 0) {
      alert("Entre un montant valide.");
      return;
    }
    if (montant > frais.reste_a_payer) {
      const ok = window.confirm(
        `Le montant (${montant} F) dépasse le reste à payer (${frais.reste_a_payer} F). Continuer quand même ?`
      );
      if (!ok) return;
    }

    api.post("/paiements/", {
      frais_id: frais.id,
      montant: montant,
      mode_paiement: modeSaisi,
    })
      .then((reponse) => {
        setRecuAffiche({
          numero_recu: reponse.data.numero_recu,
          date_paiement: reponse.data.date_paiement,
          nom_etudiant: `${fiche.nom} ${fiche.prenom}`,
          libelle: frais.libelle,
          montant: reponse.data.montant,
          mode_paiement: reponse.data.mode_paiement,
          reste_a_payer: frais.reste_a_payer - reponse.data.montant,
        });
        setFraisEnPaiement(null);
        setMontantSaisi("");
        setModeSaisi("especes");
        // Recharger la fiche immédiatement (données à jour même
        // si on télécharge le PDF sans fermer le reçu)
        chargerFiche();
      })
      .catch((erreur) => {
        console.error(erreur);
        alert("Erreur lors de l'enregistrement du paiement.");
      });
  }

  return (
    <div>
      <Link to="/etudiants" style={{ color: "#3b82f6", textDecoration: "none" }}>
        ← Retour à la liste
      </Link>

      <h2 style={{ color: "#1e293b", marginTop: 16 }}>
        {fiche.nom} {fiche.prenom}
      </h2>
      <p style={{ color: "#64748b" }}>
        Contact : {fiche.contact || "—"} &nbsp;|&nbsp; Concours : {fiche.concours_vise || "—"} &nbsp;|&nbsp; Statut : {fiche.statut}
      </p>

      <div style={{ display: "flex", gap: 20, marginBottom: 30, flexWrap: "wrap" }}>
        <Carte titre="Total dû" valeur={fiche.total_du} couleur="#3b82f6" />
        <Carte titre="Total payé" valeur={fiche.total_paye} couleur="#22c55e" />
        <Carte titre="Reste à payer" valeur={fiche.reste_a_payer} couleur="#ef4444" />
      </div>

      <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginTop: 0 }}>Frais et paiements</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
              <th style={thStyle}>Libellé</th>
              <th style={thStyle}>Dû</th>
              <th style={thStyle}>Payé</th>
              <th style={thStyle}>Reste</th>
              <th style={thStyle}>Échéance</th>
              <th style={thStyle}>Statut</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {fiche.frais.map((f) => (
              <tr key={f.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={tdStyle}>{f.libelle}</td>
                <td style={tdStyle}>{f.montant_du} F</td>
                <td style={tdStyle}>{f.montant_paye} F</td>
                <td style={tdStyle}>{f.reste_a_payer} F</td>
                <td style={tdStyle}>{f.date_echeance}</td>
                <td style={tdStyle}>
                  <span style={{
                    background: couleurStatut(f.statut), color: "white",
                    padding: "3px 10px", borderRadius: 20, fontSize: 12
                  }}>
                    {f.statut}
                  </span>
                </td>
                <td style={tdStyle}>
                  {f.statut !== "paye" && (
                    <button
                      onClick={() => setFraisEnPaiement(f.id)}
                      style={{ padding: "5px 12px", background: "#22c55e", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
                    >
                      Payer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {fraisEnPaiement && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "white", padding: 30, borderRadius: 12, minWidth: 320 }}>
            <h3 style={{ marginTop: 0 }}>Enregistrer un paiement</h3>
            {(() => {
              const frais = fiche.frais.find((f) => f.id === fraisEnPaiement);
              return (
                <>
                  <p style={{ color: "#64748b" }}>
                    {frais.libelle}<br />
                    Reste à payer : <strong>{frais.reste_a_payer} F</strong>
                  </p>
                  <input
                    type="number"
                    placeholder="Montant"
                    value={montantSaisi}
                    onChange={(e) => setMontantSaisi(e.target.value)}
                    style={{ ...champStyle, width: "100%", marginBottom: 12, boxSizing: "border-box" }}
                  />
                  <select
                    value={modeSaisi}
                    onChange={(e) => setModeSaisi(e.target.value)}
                    style={{ ...champStyle, width: "100%", marginBottom: 20, boxSizing: "border-box" }}
                  >
                    <option value="especes">Espèces</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="virement">Virement</option>
                  </select>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => enregistrerPaiement(frais)} style={{ ...boutonValider, flex: 1 }}>
                      Valider
                    </button>
                    <button onClick={() => setFraisEnPaiement(null)} style={{ ...boutonAnnuler, flex: 1 }}>
                      Annuler
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {recuAffiche && (
        <Recu
          infos={recuAffiche}
          onFermer={() => {
            setRecuAffiche(null);
            chargerFiche();
          }}
        />
      )}
    </div>
  );
}

function Carte({ titre, valeur, couleur }) {
  return (
    <div style={{
      background: "white", padding: 20, borderRadius: 12,
      minWidth: 150, boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      borderTop: `4px solid ${couleur}`
    }}>
      <div style={{ color: "#64748b", fontSize: 14 }}>{titre}</div>
      <div style={{ color: couleur, fontSize: 24, fontWeight: "bold", marginTop: 6 }}>
        {valeur} F
      </div>
    </div>
  );
}

const thStyle = { padding: "10px 8px", color: "#64748b", fontSize: 13 };
const tdStyle = { padding: "10px 8px", color: "#334155" };
const champStyle = { padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14 };
const boutonValider = { padding: "10px", background: "#22c55e", color: "white", border: "none", borderRadius: 8, cursor: "pointer" };
const boutonAnnuler = { padding: "10px", background: "#94a3b8", color: "white", border: "none", borderRadius: 8, cursor: "pointer" };

export default FicheEtudiant;
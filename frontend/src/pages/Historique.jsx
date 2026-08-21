import { useState, useEffect } from "react";
import api from "../api";
import Recu from "../composants/Recu";

function Historique() {
  const [paiements, setPaiements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recuAffiche, setRecuAffiche] = useState(null);

  useEffect(() => {
    api.get("/paiements/historique/complet")
      .then((reponse) => {
        setPaiements(reponse.data);
        setChargement(false);
      })
      .catch((erreur) => {
        console.error(erreur);
        setChargement(false);
      });
  }, []);

  if (chargement) return <p>Chargement...</p>;

  // Total encaissé (somme de tous les paiements)
  const total = paiements.reduce((somme, p) => somme + parseFloat(p.montant), 0);

  // Réafficher le reçu d'un paiement
  function revoirRecu(p) {
    setRecuAffiche({
      numero_recu: p.numero_recu,
      date_paiement: p.date_paiement,
      nom_etudiant: p.nom_etudiant,
      libelle: p.libelle,
      montant: p.montant,
      mode_paiement: p.mode_paiement,
      reste_a_payer: p.reste_a_payer,
    });
  }

  return (
    <div>
      <h2 style={{ color: "#1e293b" }}>Historique des paiements</h2>

      <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginTop: 0 }}>
          {paiements.length} paiements — Total encaissé : <span style={{ color: "#22c55e" }}>{total.toLocaleString("fr-FR")} F</span>
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
              <th style={thStyle}>N° reçu</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Étudiant</th>
              <th style={thStyle}>Objet</th>
              <th style={thStyle}>Montant</th>
              <th style={thStyle}>Mode</th>
              <th style={thStyle}>Reçu</th>
            </tr>
          </thead>
          <tbody>
            {paiements.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ ...tdStyle, fontWeight: "bold", color: "#1e3a8a" }}>{p.numero_recu || "—"}</td>
                <td style={tdStyle}>{p.date_paiement}</td>
                <td style={tdStyle}>{p.nom_etudiant}</td>
                <td style={tdStyle}>{p.libelle}</td>
                <td style={{ ...tdStyle, fontWeight: "bold" }}>{parseFloat(p.montant).toLocaleString("fr-FR")} F</td>
                <td style={tdStyle}>{p.mode_paiement}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => revoirRecu(p)}
                    style={{ padding: "5px 12px", background: "#3b82f6", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
                  >
                    Voir le reçu
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Réaffichage du reçu */}
      {recuAffiche && (
        <Recu infos={recuAffiche} onFermer={() => setRecuAffiche(null)} />
      )}
    </div>
  );
}

const thStyle = { padding: "10px 8px", color: "#64748b", fontSize: 13 };
const tdStyle = { padding: "10px 8px", color: "#334155" };

export default Historique;
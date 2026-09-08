import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function Retards() {
  const [retards, setRetards] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get("/retards/")
      .then((reponse) => {
        setRetards(reponse.data);
        setChargement(false);
      })
      .catch((erreur) => {
        console.error(erreur);
        setChargement(false);
      });
  }, []);

  if (chargement) return <p>Chargement...</p>;

  const totalRetard = retards.reduce((somme, r) => somme + parseFloat(r.reste_a_payer), 0);

  return (
    <div>
      <h2 style={{ color: "#1e293b" }}>Retards de paiement</h2>

      {retards.length === 0 ? (
        <div style={{ background: "white", padding: 30, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", textAlign: "center", color: "#22c55e" }}>
          ✓ Aucun retard de paiement. Tout est à jour !
        </div>
      ) : (
        <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginTop: 0 }}>
            {retards.length} frais en retard — Total dû : <span style={{ color: "#ef4444" }}>{totalRetard.toLocaleString("fr-FR")} F</span>
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={thStyle}>Étudiant</th>
                  <th style={thStyle}>Frais</th>
                  <th style={thStyle}>Reste à payer</th>
                  <th style={thStyle}>Échéance</th>
                  <th style={thStyle}>Retard</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {retards.map((r) => (
                  <tr key={r.frais_id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={tdStyle}>{r.nom_etudiant}</td>
                    <td style={tdStyle}>{r.libelle}</td>
                    <td style={{ ...tdStyle, color: "#ef4444", fontWeight: "bold" }}>{parseFloat(r.reste_a_payer).toLocaleString("fr-FR")} F</td>
                    <td style={tdStyle}>{r.date_echeance}</td>
                    <td style={tdStyle}>
                      <span style={{
                        background: r.jours_de_retard > 30 ? "#ef4444" : "#f59e0b",
                        color: "white", padding: "3px 10px", borderRadius: 20, fontSize: 12, whiteSpace: "nowrap"
                      }}>
                        {r.jours_de_retard} jours
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <Link
                        to={`/etudiants/${r.etudiant_id}/fiche`}
                        style={{ padding: "5px 12px", background: "#3b82f6", color: "white", borderRadius: 6, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" }}
                      >
                        Voir la fiche
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: "10px 8px", color: "#64748b", fontSize: 13, whiteSpace: "nowrap" };
const tdStyle = { padding: "10px 8px", color: "#334155", whiteSpace: "nowrap" };

export default Retards;
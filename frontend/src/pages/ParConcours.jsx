import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function ParConcours() {
  const [groupes, setGroupes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [ouvert, setOuvert] = useState(null); // quel concours est déplié

  useEffect(() => {
    api.get("/etudiants/stats/par-concours")
      .then((reponse) => {
        setGroupes(reponse.data);
        setChargement(false);
      })
      .catch((erreur) => {
        console.error(erreur);
        setChargement(false);
      });
  }, []);

  if (chargement) return <p>Chargement...</p>;

  const totalEtudiants = groupes.reduce((s, g) => s + g.nombre, 0);

  // Couleurs pour varier les cartes
  const couleurs = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#ef4444"];

  return (
    <div>
      <h2 style={{ color: "#1e293b" }}>Étudiants par concours</h2>
      <p style={{ color: "#64748b" }}>
        {totalEtudiants} étudiants répartis sur {groupes.length} concours.
      </p>

      {groupes.map((g, index) => {
        const couleur = couleurs[index % couleurs.length];
        const estOuvert = ouvert === g.concours;
        return (
          <div key={g.concours} style={{ background: "white", borderRadius: 12, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
            {/* En-tête cliquable */}
            <div
              onClick={() => setOuvert(estOuvert ? null : g.concours)}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 20px", cursor: "pointer", borderLeft: `5px solid ${couleur}`
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{
                  background: couleur, color: "white", borderRadius: "50%",
                  width: 40, height: 40, display: "flex", alignItems: "center",
                  justifyContent: "center", fontWeight: "bold", fontSize: 16
                }}>
                  {g.nombre}
                </span>
                <span style={{ fontSize: 17, fontWeight: 600, color: "#1e293b" }}>{g.concours}</span>
              </div>
              <span style={{ color: "#94a3b8", fontSize: 14 }}>
                {estOuvert ? "▲ masquer" : "▼ voir la liste"}
              </span>
            </div>

            {/* Liste dépliable */}
            {estOuvert && (
              <div style={{ padding: "0 20px 16px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                      <th style={thStyle}>Nom</th>
                      <th style={thStyle}>Prénom</th>
                      <th style={thStyle}>Contact</th>
                      <th style={thStyle}>Statut</th>
                      <th style={thStyle}>Fiche</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.etudiants.map((e) => (
                      <tr key={e.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={tdStyle}>{e.nom}</td>
                        <td style={tdStyle}>{e.prenom}</td>
                        <td style={tdStyle}>{e.contact || "—"}</td>
                        <td style={tdStyle}>{e.statut}</td>
                        <td style={tdStyle}>
                          <Link to={`/etudiants/${e.id}/fiche`} style={{ color: "#3b82f6", textDecoration: "none" }}>
                            Voir →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const thStyle = { padding: "10px 8px", color: "#64748b", fontSize: 13 };
const tdStyle = { padding: "10px 8px", color: "#334155" };

export default ParConcours;
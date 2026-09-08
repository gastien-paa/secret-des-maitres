import { useState, useEffect } from "react";
import api from "../api";

function Remises() {
  const [remises, setRemises] = useState([]);
  const [montant, setMontant] = useState("");
  const [destination, setDestination] = useState("");
  const [note, setNote] = useState("");

  function chargerRemises() {
    api.get("/remises/")
      .then((reponse) => setRemises(reponse.data))
      .catch((erreur) => console.error(erreur));
  }

  useEffect(() => {
    chargerRemises();
  }, []);

  function ajouterRemise() {
    const m = parseFloat(montant);
    if (isNaN(m) || m <= 0) {
      alert("Entre un montant valide.");
      return;
    }
    api.post("/remises/", {
      montant: m,
      destination: destination || null,
      note: note || null,
    })
      .then(() => {
        setMontant(""); setDestination(""); setNote("");
        chargerRemises();
        alert("Remise enregistrée.");
      })
      .catch((erreur) => console.error(erreur));
  }

  const total = remises.reduce((s, r) => s + parseFloat(r.montant), 0);

  return (
    <div>
      <style>{cssRemises}</style>
      <h2 style={{ color: "#1e293b" }}>Remises d'argent</h2>
      <p style={{ color: "#64748b" }}>
        Enregistrez ici l'argent déposé/remis (banque, Mobile Money…).
      </p>

      {/* Formulaire */}
      <div style={{ background: "white", padding: 20, borderRadius: 12, marginBottom: 30, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginTop: 0 }}>Enregistrer une remise</h3>
        <div className="form-remise">
          <input type="number" placeholder="Montant" value={montant} onChange={(e) => setMontant(e.target.value)} className="champ-r" />
          <input placeholder="Destination (banque, Mobile Money...)" value={destination} onChange={(e) => setDestination(e.target.value)} className="champ-r" />
          <input placeholder="Note (facultatif)" value={note} onChange={(e) => setNote(e.target.value)} className="champ-r" />
          <button onClick={ajouterRemise} className="bouton-r">Enregistrer</button>
        </div>
      </div>

      {/* Liste */}
      <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginTop: 0 }}>
          Historique ({remises.length}) — Total remis : <span style={{ color: "#f59e0b" }}>{total.toLocaleString("fr-FR")} F</span>
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Montant</th>
                <th style={thStyle}>Destination</th>
                <th style={thStyle}>Note</th>
                <th style={thStyle}>Enregistré par</th>
              </tr>
            </thead>
            <tbody>
              {remises.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={tdStyle}>{r.date_remise}</td>
                  <td style={{ ...tdStyle, fontWeight: "bold" }}>{parseFloat(r.montant).toLocaleString("fr-FR")} F</td>
                  <td style={tdStyle}>{r.destination || "—"}</td>
                  <td style={tdStyle}>{r.note || "—"}</td>
                  <td style={tdStyle}>{r.enregistre_par || "—"}</td>
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
const tdStyle = { padding: "10px 8px", color: "#334155", whiteSpace: "nowrap" };

const cssRemises = `
  .form-remise {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .champ-r {
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 14px;
    flex: 1;
    min-width: 140px;
  }
  .bouton-r {
    padding: 10px 20px;
    background: #f59e0b;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
  }
  @media (max-width: 768px) {
    .champ-r {
      width: 100%;
      flex: none;
      box-sizing: border-box;
    }
    .bouton-r {
      width: 100%;
    }
  }
`;

export default Remises;
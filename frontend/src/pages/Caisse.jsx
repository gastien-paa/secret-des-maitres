import { useState, useEffect } from "react";
import api from "../api";

function Caisse() {
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [nouveauFonds, setNouveauFonds] = useState("");
  const estAdmin = localStorage.getItem("role") === "admin";

  function chargerCaisse() {
    setChargement(true);
    api.get("/caisse")
      .then((reponse) => {
        setDonnees(reponse.data);
        setChargement(false);
      })
      .catch((erreur) => {
        console.error(erreur);
        setChargement(false);
      });
  }

  useEffect(() => {
    chargerCaisse();
  }, []);

  function definirFonds() {
    const montant = parseFloat(nouveauFonds);
    if (isNaN(montant) || montant < 0) {
      alert("Entre un montant valide.");
      return;
    }
    api.put("/caisse/fonds", { montant: montant })
      .then(() => {
        setNouveauFonds("");
        chargerCaisse();
        alert("Fonds de caisse mis à jour.");
      })
      .catch((erreur) => console.error(erreur));
  }

  function formater(n) {
    return Number(n).toLocaleString("fr-FR");
  }

  if (chargement) return <p>Chargement...</p>;
  if (!donnees) return <p>Impossible de charger la caisse.</p>;

  return (
    <div>
      <h2 style={{ color: "#1e293b" }}>Caisse</h2>
      <p style={{ color: "#64748b" }}>
        Argent qui devrait être physiquement en caisse actuellement.
      </p>

      {/* La caisse actuelle en vedette */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
        color: "white", padding: 28, borderRadius: 16, marginBottom: 24,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }}>
        <div style={{ fontSize: 15, opacity: 0.9 }}>Argent attendu en caisse</div>
        <div style={{ fontSize: 42, fontWeight: "bold", marginTop: 4 }}>
          {formater(donnees.caisse_actuelle)} F
        </div>
      </div>

      {/* Le détail du calcul */}
      <div style={{ background: "white", padding: 24, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: 24 }}>
        <h3 style={{ marginTop: 0 }}>Détail du calcul</h3>
        <LigneCalcul label="Fonds de caisse de départ" valeur={donnees.fonds_de_caisse} signe="" couleur="#334155" />
        <LigneCalcul label={`+ Encaissé (${donnees.nombre_paiements} paiements)`} valeur={donnees.total_encaisse} signe="+" couleur="#22c55e" />
        <LigneCalcul label={`− Dépenses (${donnees.nombre_depenses})`} valeur={donnees.total_depense} signe="−" couleur="#ef4444" />
        <LigneCalcul label={`− Remises déposées (${donnees.nombre_remises})`} valeur={donnees.total_remises} signe="−" couleur="#f59e0b" />
        <div style={{ borderTop: "2px solid #e2e8f0", marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 18 }}>
          <span>= Caisse actuelle</span>
          <span style={{ color: "#1e3a8a" }}>{formater(donnees.caisse_actuelle)} F</span>
        </div>
      </div>

      {/* Définir le fonds de caisse (admin seulement) */}
      {estAdmin && (
        <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginTop: 0 }}>Définir le fonds de caisse de départ</h3>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 0 }}>
            La somme que tu laisses au départ dans la caisse. Actuellement : <strong>{formater(donnees.fonds_de_caisse)} F</strong>
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="number"
              placeholder="Nouveau montant"
              value={nouveauFonds}
              onChange={(e) => setNouveauFonds(e.target.value)}
              style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14 }}
            />
            <button onClick={definirFonds} style={{ padding: "8px 20px", background: "#1e3a8a", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>
              Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LigneCalcul({ label, valeur, signe, couleur }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ color: "#64748b" }}>{label}</span>
      <span style={{ color: couleur, fontWeight: 500 }}>
        {signe} {Number(valeur).toLocaleString("fr-FR")} F
      </span>
    </div>
  );
}

export default Caisse;
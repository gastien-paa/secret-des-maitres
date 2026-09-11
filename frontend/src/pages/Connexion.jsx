import { useState } from "react";
import api from "../api";

function Connexion({ onConnexion }) {
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");

  function seConnecter() {
    setErreur("");
    api.post("/auth/connexion", {
      identifiant: identifiant,
      mot_de_passe: motDePasse,
    })
      .then((reponse) => {
        const { access_token, role, nom_complet } = reponse.data;
        localStorage.setItem("token", access_token);
        localStorage.setItem("role", role);
        localStorage.setItem("nom_complet", nom_complet || "");
        onConnexion();
      })
      .catch(() => {
        setErreur("Identifiant ou mot de passe incorrect.");
      });
  }

  function surTouche(e) {
    if (e.key === "Enter") seConnecter();
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif",
      padding: 16,
      boxSizing: "border-box",
      // Image de fond + voile sombre par-dessus pour la lisibilité
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.6)), url("/classe.jpg")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}>
      <div style={{
        background: "white", padding: 40, borderRadius: 16,
        boxShadow: "0 10px 40px rgba(0,0,0,0.35)", width: "100%", maxWidth: 340,
        boxSizing: "border-box"
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img src="/logo.jpeg" alt="Logo" style={{ width: 80, height: 80, objectFit: "contain" }} />
          <h2 style={{ color: "#1e293b", margin: "12px 0 4px" }}>Secret des Maîtres</h2>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>Gestion financière</p>
        </div>

        <input
          placeholder="Identifiant"
          value={identifiant}
          onChange={(e) => setIdentifiant(e.target.value)}
          onKeyDown={surTouche}
          style={champStyle}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          onKeyDown={surTouche}
          style={champStyle}
        />

        {erreur && (
          <div style={{ color: "#ef4444", fontSize: 14, marginBottom: 12, textAlign: "center" }}>
            {erreur}
          </div>
        )}

        <button onClick={seConnecter} style={boutonStyle}>Se connecter</button>
      </div>
    </div>
  );
}

const champStyle = {
  width: "100%", padding: "12px 14px", marginBottom: 14,
  border: "1px solid #cbd5e1", borderRadius: 10, fontSize: 15,
  boxSizing: "border-box"
};
const boutonStyle = {
  width: "100%", padding: "12px", background: "#1e3a8a", color: "white",
  border: "none", borderRadius: 10, fontSize: 15, fontWeight: "bold", cursor: "pointer"
};

export default Connexion;
import { useState, useEffect } from "react";
import api from "../api";

function MonCompte() {
  const [infos, setInfos] = useState(null);
  const estAdmin = localStorage.getItem("role") === "admin";

  // Champs mot de passe
  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");

  // Champs identifiant
  const [mdpConfirm, setMdpConfirm] = useState("");
  const [nouvelId, setNouvelId] = useState("");

  // Champs admin (reset gérant)
  const [cible, setCible] = useState("");
  const [nouveauMdpCible, setNouveauMdpCible] = useState("");
  const [comptes, setComptes] = useState([]);

  useEffect(() => {
    api.get("/comptes/moi")
      .then((r) => setInfos(r.data))
      .catch((e) => console.error(e));

    if (estAdmin) {
      api.get("/comptes/")
        .then((r) => setComptes(r.data))
        .catch((e) => console.error(e));
    }
  }, []);

  function changerMotDePasse() {
    if (!ancienMdp || !nouveauMdp) {
      alert("Remplis les deux champs.");
      return;
    }
    api.put("/comptes/mon-mot-de-passe", {
      ancien_mot_de_passe: ancienMdp,
      nouveau_mot_de_passe: nouveauMdp,
    })
      .then(() => {
        alert("Mot de passe modifié avec succès !");
        setAncienMdp(""); setNouveauMdp("");
      })
      .catch((e) => {
        const msg = e.response?.data?.detail || "Erreur.";
        alert(msg);
      });
  }

  function changerIdentifiant() {
    if (!mdpConfirm || !nouvelId) {
      alert("Remplis les deux champs.");
      return;
    }
    api.put("/comptes/mon-identifiant", {
      mot_de_passe: mdpConfirm,
      nouvel_identifiant: nouvelId,
    })
      .then((r) => {
        alert("Identifiant modifié ! Tu devras te reconnecter.");
        // L'identifiant a changé : déconnexion pour se reconnecter
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("nom_complet");
        window.location.reload();
      })
      .catch((e) => {
        const msg = e.response?.data?.detail || "Erreur.";
        alert(msg);
      });
  }

  function resetMotDePasseCible() {
    if (!cible || !nouveauMdpCible) {
      alert("Choisis un compte et entre un nouveau mot de passe.");
      return;
    }
    api.put("/comptes/admin/reset-mot-de-passe", {
      identifiant_cible: cible,
      nouveau_mot_de_passe: nouveauMdpCible,
    })
      .then((r) => {
        alert(r.data.message);
        setCible(""); setNouveauMdpCible("");
      })
      .catch((e) => {
        const msg = e.response?.data?.detail || "Erreur.";
        alert(msg);
      });
  }

  return (
    <div>
      <h2 style={{ color: "#1e293b" }}>Mon compte</h2>
      {infos && (
        <p style={{ color: "#64748b" }}>
          Connecté en tant que <strong>{infos.identifiant}</strong> ({infos.role})
          {infos.nom_complet ? ` — ${infos.nom_complet}` : ""}
        </p>
      )}

      {/* Changer le mot de passe */}
      <div style={carte}>
        <h3 style={{ marginTop: 0 }}>Changer mon mot de passe</h3>
        <input type="password" placeholder="Ancien mot de passe" value={ancienMdp}
          onChange={(e) => setAncienMdp(e.target.value)} style={champ} />
        <input type="password" placeholder="Nouveau mot de passe (min. 6 caractères)" value={nouveauMdp}
          onChange={(e) => setNouveauMdp(e.target.value)} style={champ} />
        <button onClick={changerMotDePasse} style={bouton}>Modifier le mot de passe</button>
      </div>

      {/* Changer l'identifiant */}
      <div style={carte}>
        <h3 style={{ marginTop: 0 }}>Changer mon identifiant</h3>
        <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 0 }}>
          Tu devras te reconnecter avec le nouvel identifiant.
        </p>
        <input placeholder="Nouvel identifiant" value={nouvelId}
          onChange={(e) => setNouvelId(e.target.value)} style={champ} />
        <input type="password" placeholder="Confirme avec ton mot de passe" value={mdpConfirm}
          onChange={(e) => setMdpConfirm(e.target.value)} style={champ} />
        <button onClick={changerIdentifiant} style={bouton}>Modifier l'identifiant</button>
      </div>

      {/* Section admin : réinitialiser le mot de passe d'un autre compte */}
      {estAdmin && (
        <div style={{ ...carte, border: "2px solid #f59e0b" }}>
          <h3 style={{ marginTop: 0, color: "#b45309" }}>Administration des comptes</h3>
          <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 0 }}>
            Réinitialiser le mot de passe d'un compte (utile si le gérant l'a oublié).
          </p>
          <select value={cible} onChange={(e) => setCible(e.target.value)} style={champ}>
            <option value="">— Choisir un compte —</option>
            {comptes.map((c) => (
              <option key={c.id} value={c.identifiant}>
                {c.identifiant} ({c.role})
              </option>
            ))}
          </select>
          <input type="password" placeholder="Nouveau mot de passe pour ce compte" value={nouveauMdpCible}
            onChange={(e) => setNouveauMdpCible(e.target.value)} style={champ} />
          <button onClick={resetMotDePasseCible} style={{ ...bouton, background: "#f59e0b" }}>
            Réinitialiser le mot de passe
          </button>
        </div>
      )}
    </div>
  );
}

const carte = {
  background: "white", padding: 20, borderRadius: 12, marginBottom: 20,
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)", maxWidth: 420
};
const champ = {
  display: "block", width: "100%", padding: "10px 12px", marginBottom: 12,
  border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14, boxSizing: "border-box"
};
const bouton = {
  padding: "10px 20px", background: "#1e3a8a", color: "white", border: "none",
  borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: "bold"
};

export default MonCompte;
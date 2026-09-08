import { useState, useEffect } from "react";
import api from "../api";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";

function TableauBord() {
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get("/tableau-bord/")
      .then((reponse) => {
        setDonnees(reponse.data);
        setChargement(false);
      })
      .catch((erreur) => {
        console.error("Erreur :", erreur);
        setChargement(false);
      });
  }, []);

  if (chargement) return <p>Chargement...</p>;
  if (!donnees) return <p>Impossible de charger les données.</p>;

  const donneesCamembert = [
    { name: "Encaissé", value: donnees.total_encaisse },
    { name: "Reste à encaisser", value: donnees.reste_a_encaisser },
  ];
  const couleursCamembert = ["#22c55e", "#ef4444"];

  const donneesBarres = [
    { name: "Encaissé", montant: donnees.total_encaisse },
    { name: "Dépensé", montant: donnees.total_depense },
    { name: "Solde", montant: donnees.solde },
  ];

  const aujourdhui = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  return (
    <div>
      <style>{cssTableauBord}</style>

      {/* En-tête de bienvenue */}
      <div style={{ marginBottom: 30 }}>
        <h2 style={{ color: "#1e293b", margin: 0 }}>Tableau de bord</h2>
        <p style={{ color: "#94a3b8", margin: "4px 0 0", textTransform: "capitalize" }}>{aujourdhui}</p>
      </div>

      {/* Le solde en vedette */}
      <div className="solde-vedette" style={{
        background: donnees.solde >= 0 ? "linear-gradient(135deg, #1e3a8a, #3b82f6)" : "linear-gradient(135deg, #991b1b, #ef4444)",
        color: "white", borderRadius: 16, marginBottom: 24,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }}>
        <div style={{ fontSize: 15, opacity: 0.9 }}>Solde actuel (trésorerie)</div>
        <div className="solde-montant" style={{ fontWeight: "bold", marginTop: 4 }}>
          {formater(donnees.solde)} F
        </div>
        <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>
          {formater(donnees.total_encaisse)} F encaissés − {formater(donnees.total_depense)} F dépensés
        </div>
      </div>

      {/* Les cartes secondaires */}
      <div className="grille-cartes">
        <Carte titre="Total encaissé" valeur={donnees.total_encaisse} couleur="#22c55e" icone="💰" />
        <Carte titre="Total dépensé" valeur={donnees.total_depense} couleur="#ef4444" icone="💸" />
        <Carte titre="Reste à encaisser" valeur={donnees.reste_a_encaisser} couleur="#f59e0b" icone="⏳" />
        <Carte titre="Total attendu" valeur={donnees.total_attendu} couleur="#3b82f6" icone="📊" />
        <Carte titre="Étudiants" valeur={donnees.nombre_etudiants} couleur="#8b5cf6" icone="🎓" brut />
        <Carte titre="Frais en retard" valeur={donnees.nombre_frais_en_retard} couleur="#ec4899" icone="🔔" brut />
      </div>

      {/* Les graphiques */}
      <div className="grille-graphiques">
        <div style={carteGraphique}>
          <h3 style={titreGraphique}>Répartition des encaissements</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={donneesCamembert} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {donneesCamembert.map((entree, index) => (
                  <Cell key={index} fill={couleursCamembert[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${formater(value)} F`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={carteGraphique}>
          <h3 style={titreGraphique}>Recettes, dépenses et solde</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={donneesBarres}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${formater(value)} F`} />
              <Bar dataKey="montant" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function formater(nombre) {
  return Number(nombre).toLocaleString("fr-FR");
}

function Carte({ titre, valeur, couleur, icone, brut }) {
  return (
    <div style={{
      background: "white", padding: 20, borderRadius: 14,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      borderLeft: `4px solid ${couleur}`
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#64748b", fontSize: 14 }}>{titre}</span>
        <span style={{ fontSize: 20 }}>{icone}</span>
      </div>
      <div style={{ color: couleur, fontSize: 26, fontWeight: "bold", marginTop: 8 }}>
        {formater(valeur)}{brut ? "" : " F"}
      </div>
    </div>
  );
}

const carteGraphique = {
  background: "white", padding: 24, borderRadius: 14,
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
};
const titreGraphique = { color: "#334155", marginTop: 0, marginBottom: 16, fontSize: 16 };

const cssTableauBord = `
  .solde-vedette {
    padding: 28px;
  }
  .solde-montant {
    font-size: 42px;
  }
  .grille-cartes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 36px;
  }
  .grille-graphiques {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 24px;
  }
  @media (max-width: 768px) {
    .solde-vedette {
      padding: 20px;
    }
    .solde-montant {
      font-size: 32px;
    }
    .grille-cartes {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .grille-graphiques {
      grid-template-columns: 1fr;
    }
  }
`;

export default TableauBord;
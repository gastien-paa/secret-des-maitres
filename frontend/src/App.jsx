import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import TableauBord from "./pages/TableauBord";
import Etudiants from "./pages/Etudiants";
import FicheEtudiant from "./pages/FicheEtudiant";
import Depenses from "./pages/Depenses";
import Retards from "./pages/Retards";
import Historique from "./pages/Historique";
import Caisse from "./pages/Caisse";
import Remises from "./pages/Remises";
import Connexion from "./pages/Connexion";
import MonCompte from "./pages/MonCompte";

function App() {
  const [connecte, setConnecte] = useState(() => {
    const token = localStorage.getItem("token");
    return token !== null && token !== "" && token !== "undefined";
  });
  const role = localStorage.getItem("role");
  const nom = localStorage.getItem("nom_complet");
  const estAdmin = role === "admin";

  function seDeconnecter() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("nom_complet");
    setConnecte(false);
  }

  if (!connecte) {
    return <Connexion onConnexion={() => setConnecte(true)} />;
  }

  return (
    <BrowserRouter>
      <div style={{ fontFamily: "sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
        <nav style={{
          background: "#1e293b", padding: "16px 30px",
          display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap"
        }}>
          <span style={{ color: "white", fontWeight: "bold", fontSize: 18, marginRight: 20 }}>
            Secret des Maîtres
          </span>

          {/* Liens visibles par l'admin uniquement */}
          {estAdmin && <Link to="/" style={lienStyle}>Tableau de bord</Link>}

          {/* Liens visibles par tous */}
          <Link to="/etudiants" style={lienStyle}>Étudiants</Link>
          <Link to="/depenses" style={lienStyle}>Dépenses</Link>
          <Link to="/caisse" style={lienStyle}>Caisse</Link>
          <Link to="/remises" style={lienStyle}>Remises</Link>
          <Link to="/mon-compte" style={lienStyle}>Mon compte</Link>

          {/* Liens admin uniquement */}
          {estAdmin && <Link to="/retards" style={lienStyle}>Retards</Link>}
          {estAdmin && <Link to="/historique" style={lienStyle}>Historique</Link>}

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ color: "#cbd5e1", fontSize: 14 }}>
              {nom || "Utilisateur"} ({role})
            </span>
            <button onClick={seDeconnecter} style={{
              background: "#ef4444", color: "white", border: "none",
              padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13
            }}>
              Déconnexion
            </button>
          </div>
        </nav>

        <div style={{ padding: 30 }}>
          <Routes>
            {/* Page d'accueil : tableau de bord pour admin, étudiants pour gérant */}
            <Route path="/" element={estAdmin ? <TableauBord /> : <Navigate to="/etudiants" />} />

            {/* Pages accessibles à tous */}
            <Route path="/etudiants" element={<Etudiants />} />
            <Route path="/etudiants/:id/fiche" element={<FicheEtudiant />} />
            <Route path="/depenses" element={<Depenses />} />
            <Route path="/caisse" element={<Caisse />} />
            <Route path="/remises" element={<Remises />} />
            <Route path="/mon-compte" element={<MonCompte />} />

            {/* Pages admin uniquement : si un gérant tente d'y accéder, il est redirigé */}
            <Route path="/retards" element={estAdmin ? <Retards /> : <Navigate to="/etudiants" />} />
            <Route path="/historique" element={estAdmin ? <Historique /> : <Navigate to="/etudiants" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

const lienStyle = { color: "#cbd5e1", textDecoration: "none", fontSize: 15 };

export default App;
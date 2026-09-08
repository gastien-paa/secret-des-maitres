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

  // Menu ouvert/fermé sur mobile
  const [menuOuvert, setMenuOuvert] = useState(false);

  function seDeconnecter() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("nom_complet");
    setConnecte(false);
  }

  if (!connecte) {
    return <Connexion onConnexion={() => setConnecte(true)} />;
  }

  // Fermer le menu quand on clique un lien (utile sur mobile)
  const fermerMenu = () => setMenuOuvert(false);

  return (
    <BrowserRouter>
      <style>{cssResponsive}</style>
      <div style={{ fontFamily: "sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
        <nav className="barre-nav">
          {/* Ligne du haut : titre + bouton hamburger (mobile) */}
          <div className="nav-haut">
            <span style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
              Secret des Maîtres
            </span>
            <button
              className="bouton-hamburger"
              onClick={() => setMenuOuvert(!menuOuvert)}
              aria-label="Menu"
            >
              {menuOuvert ? "✕" : "☰"}
            </button>
          </div>

          {/* Les liens : toujours visibles sur PC, dépliables sur mobile */}
          <div className={`nav-liens ${menuOuvert ? "ouvert" : ""}`}>
            {estAdmin && <Link to="/" style={lienStyle} onClick={fermerMenu}>Tableau de bord</Link>}
            <Link to="/etudiants" style={lienStyle} onClick={fermerMenu}>Étudiants</Link>
            <Link to="/depenses" style={lienStyle} onClick={fermerMenu}>Dépenses</Link>
            <Link to="/caisse" style={lienStyle} onClick={fermerMenu}>Caisse</Link>
            <Link to="/remises" style={lienStyle} onClick={fermerMenu}>Remises</Link>
            <Link to="/mon-compte" style={lienStyle} onClick={fermerMenu}>Mon compte</Link>
            {estAdmin && <Link to="/retards" style={lienStyle} onClick={fermerMenu}>Retards</Link>}
            {estAdmin && <Link to="/historique" style={lienStyle} onClick={fermerMenu}>Historique</Link>}

            {/* Infos utilisateur + déconnexion */}
            <div className="nav-user">
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
          </div>
        </nav>

        <div className="contenu-page">
          <Routes>
            <Route path="/" element={estAdmin ? <TableauBord /> : <Navigate to="/etudiants" />} />
            <Route path="/etudiants" element={<Etudiants />} />
            <Route path="/etudiants/:id/fiche" element={<FicheEtudiant />} />
            <Route path="/depenses" element={<Depenses />} />
            <Route path="/caisse" element={<Caisse />} />
            <Route path="/remises" element={<Remises />} />
            <Route path="/mon-compte" element={<MonCompte />} />
            <Route path="/retards" element={estAdmin ? <Retards /> : <Navigate to="/etudiants" />} />
            <Route path="/historique" element={estAdmin ? <Historique /> : <Navigate to="/etudiants" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

const lienStyle = { color: "#cbd5e1", textDecoration: "none", fontSize: 15 };

// CSS responsive : comportement PC vs mobile
const cssResponsive = `
  .barre-nav {
    background: #1e293b;
    padding: 16px 30px;
  }
  .nav-haut {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .bouton-hamburger {
    display: none;
    background: transparent;
    color: white;
    border: none;
    font-size: 26px;
    cursor: pointer;
    line-height: 1;
  }
  .nav-liens {
    display: flex;
    gap: 24px;
    align-items: center;
    flex-wrap: wrap;
  }
  .nav-user {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .contenu-page {
    padding: 30px;
  }

  /* Sur mobile (écran étroit) */
  @media (max-width: 768px) {
    .barre-nav {
      padding: 14px 18px;
    }
    .bouton-hamburger {
      display: block;
    }
    .nav-liens {
      display: none;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      margin-top: 16px;
    }
    .nav-liens.ouvert {
      display: flex;
    }
    .nav-user {
      margin-left: 0;
      margin-top: 8px;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
    .contenu-page {
      padding: 16px;
    }
  }
`;

export default App;
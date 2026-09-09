import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function Recu({ infos, onFermer }) {
  function imprimer() {
    window.print();
  }

  async function telechargerPDF() {
    const element = document.getElementById("zone-recu");
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
    const image = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a5",
    });

    const largeurPage = pdf.internal.pageSize.getWidth();
    const hauteurPage = pdf.internal.pageSize.getHeight();

    const ratio = canvas.width / canvas.height;
    let largeur = largeurPage;
    let hauteur = largeur / ratio;
    if (hauteur > hauteurPage) {
      hauteur = hauteurPage;
      largeur = hauteur * ratio;
    }
    const x = (largeurPage - largeur) / 2;
    const y = (hauteurPage - hauteur) / 2;

    pdf.addImage(image, "PNG", x, y, largeur, hauteur);

    // Nettoyer le nom de l'étudiant pour un nom de fichier valide
    const nomPropre = (infos.nom_etudiant || "etudiant")
      .replace(/[^a-zA-Z0-9À-ÿ ]/g, "")  // retire les caractères spéciaux
      .replace(/\s+/g, "_")               // remplace les espaces par _
      .trim();

    pdf.save(`Recu-${nomPropre}-${infos.numero_recu}.pdf`);
  }

  const montantAPayer = infos.montant + infos.reste_a_payer;

  return (
    <div style={overlay}>
      <div>
        <div id="zone-recu" className="recu-impression" style={feuille}>

          {/* FILIGRANE en arrière-plan */}
          <div style={filigrane}>
            <img src="/logo.jpeg" alt="" style={{ width: 300, opacity: 0.08 }} />
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>

            {/* Bandeau supérieur */}
            <div style={{ position: "relative", height: 50, marginBottom: 10 }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 30, background: JAUNE }}></div>
              <div style={{
                position: "absolute", top: 0, left: 0, width: "38%", height: 50,
                background: BLEU, clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)"
              }}></div>
            </div>

            {/* En-tête */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "0 30px", borderBottom: `3px solid ${BLEU}`, paddingBottom: 12 }}>
              <img
                src="/logo.jpeg"
                alt="Logo"
                style={{ width: 80, height: 80, flexShrink: 0, objectFit: "contain" }}
              />
              <div>
                <h1 style={{ margin: 0, color: BLEU, fontSize: 38, letterSpacing: 1, fontWeight: 800 }}>
                  REÇU DE PAIEMENT
                </h1>
                <div style={{ color: "#334155", fontSize: 14, marginTop: 2 }}>
                  Secret des Maîtres — Centre de préparation aux concours
                </div>
                <div style={{ color: BLEU, fontSize: 13, marginTop: 2, fontWeight: "bold" }}>
                  📞 Côte d'Ivoire : +225 01 41 82 56 07 &nbsp;|&nbsp; Cameroun : +237 653 17 10 02
                </div>
              </div>
            </div>

            {/* Ligne N° + Date */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 30px 8px", fontSize: 15 }}>
              <span>
                <strong style={{ color: "#1e293b" }}>N° reçu </strong>
                <span style={{ color: BLEU, fontWeight: "bold" }}>{infos.numero_recu}</span>
              </span>
              <span>
                <strong style={{ color: "#1e293b" }}>Date </strong>
                <span style={{ color: "#334155" }}>{infos.date_paiement}</span>
              </span>
            </div>

            {/* Phrase de confirmation */}
            <div style={{ padding: "0 30px", fontSize: 15, color: "#1e293b", marginBottom: 8 }}>
              Nous confirmons que <strong style={{ color: BLEU }}>{infos.nom_etudiant}</strong> a
              effectué un paiement pour : <strong>{infos.libelle}</strong>.
            </div>

            {/* Tableau */}
            <div style={{ padding: "0 30px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
                <thead>
                  <tr>
                    <th style={{ background: BLEU, color: "white", padding: "8px 16px", textAlign: "left", borderRadius: "6px 0 0 0" }}>
                      DESCRIPTION
                    </th>
                    <th style={{ background: BLEU, color: "white", padding: "8px 16px", textAlign: "right", borderRadius: "0 6px 0 0" }}>
                      MONTANT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                    <td style={{ padding: "10px 16px", fontWeight: "bold", color: "#1e293b" }}>Montant à payer</td>
                    <td style={{ padding: "10px 16px", textAlign: "right", color: "#1e293b" }}>{montantAPayer} F CFA</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                    <td style={{ padding: "10px 16px", fontWeight: "bold", color: "#1e293b" }}>Montant payé</td>
                    <td style={{ padding: "10px 16px", textAlign: "right", color: BLEU, fontWeight: "bold" }}>{infos.montant} F CFA</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px 16px", fontWeight: "bold", color: "#1e293b" }}>Reste à payer</td>
                    <td style={{ padding: "10px 16px", textAlign: "right", color: BLEU, fontWeight: "bold" }}>{infos.reste_a_payer} F CFA</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mode de paiement + signature */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "20px 30px 0" }}>
              <span style={{ fontSize: 13, color: "#64748b" }}>
                Mode de paiement : {infos.mode_paiement}
              </span>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "#64748b" }}>Le Responsable</div>
                <img src="/signature.png" alt="Signature" style={{ height: 55, marginTop: 4, marginBottom: 2 }} />
                <div style={{ borderTop: "1px solid #94a3b8", width: 180, margin: "0 auto" }}></div>
                <div style={{ fontWeight: "bold", color: "#1e293b", marginTop: 6 }}>M. FOKA Gastien</div>
              </div>
            </div>

            {/* Bandeau inférieur */}
            <div style={{ position: "relative", height: 40, marginTop: 20 }}>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 24, background: BLEU }}></div>
              <div style={{
                position: "absolute", bottom: 0, right: 0, width: "38%", height: 40,
                background: JAUNE, clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)"
              }}></div>
            </div>

          </div>
        </div>

        {/* Boutons */}
        <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "center" }}>
          <button onClick={telechargerPDF} style={boutonPDF}>Télécharger PDF</button>
          <button onClick={imprimer} style={boutonImprimer}>Imprimer</button>
          <button onClick={onFermer} style={boutonFermer}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

const BLEU = "#1e3a8a";
const JAUNE = "#f5c518";

const overlay = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(0,0,0,0.5)", display: "flex",
  alignItems: "flex-start", justifyContent: "center", zIndex: 1000,
  overflowY: "auto", padding: "20px 0"
};
const feuille = {
  background: "white", borderRadius: 8,
  width: 700, maxWidth: "100%", fontFamily: "sans-serif", overflow: "hidden",
  boxShadow: "0 4px 20px rgba(0,0,0,0.15)", position: "relative"
};
const filigrane = {
  position: "absolute", top: "50%", left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 0, pointerEvents: "none",
};
const boutonImprimer = { padding: "10px 24px", background: "#1e3a8a", color: "white", border: "none", borderRadius: 8, cursor: "pointer" };
const boutonFermer = { padding: "10px 24px", background: "#94a3b8", color: "white", border: "none", borderRadius: 8, cursor: "pointer" };
const boutonPDF = { padding: "10px 24px", background: "#22c55e", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" };

export default Recu;
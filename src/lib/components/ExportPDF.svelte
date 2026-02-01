<script>
  import { emprunteur, indicateursEmprunteur } from '../stores/emprunteur.js';
  import { prets, tableauConsolide, totauxGlobaux, tableauxAmortissement } from '../stores/prets.js';
  import { calculerTauxEndettement } from '../utils/calculs.js';

  let isExporting = false;

  function exporterPDF() {
    isExporting = true;

    try {
      // Créer une nouvelle fenêtre pour l'impression
      const printWindow = window.open('', '_blank', 'width=1200,height=800');

      if (!printWindow) {
        alert('Veuillez autoriser les popups pour exporter en PDF');
        isExporting = false;
        return;
      }

      const content = genererContenuPDF();

      printWindow.document.write(content);
      printWindow.document.close();

      // Attendre que le contenu soit chargé avant d'imprimer
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          isExporting = false;
        }, 250);
      };

      // Fallback si onload ne se déclenche pas
      setTimeout(() => {
        if (isExporting) {
          printWindow.print();
          isExporting = false;
        }
      }, 1000);

    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
      isExporting = false;
    }
  }

  function genererContenuPDF() {
    const date = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const pretsActifs = $prets.filter(p => p.actif && p.montant > 0);
    const tableauxActifs = $tableauxAmortissement.filter(t => t.actif && t.tableau.length > 0);

    // Trouver le taux d'endettement max
    let tauxEndettementMax = 0;
    let moisMax = 0;
    $tableauConsolide.forEach(ligne => {
      const taux = calculerTauxEndettement(ligne.echeanceTotale, $indicateursEmprunteur.revenusMensuels);
      if (taux > tauxEndettementMax) {
        tauxEndettementMax = taux;
        moisMax = ligne.mois;
      }
    });

    // Calculer le montant total emprunté
    const montantTotalEmprunte = pretsActifs.reduce((sum, p) => sum + p.montant, 0);

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Plan de Financement - ${$emprunteur.nomClient || 'Client'}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 15mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      color: #1a202c;
      background: white;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 3px solid #1a365d;
    }

    .header h1 {
      color: #1a365d;
      font-size: 22px;
      font-weight: 700;
      margin: 0;
    }

    .header-info {
      text-align: right;
      color: #4a5568;
      font-size: 12px;
    }

    .header-info strong {
      color: #1a365d;
      font-size: 14px;
    }

    h2 {
      color: #1a365d;
      font-size: 14px;
      font-weight: 600;
      margin: 20px 0 10px 0;
      padding-bottom: 5px;
      border-bottom: 2px solid #e2e8f0;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 15px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 15px;
    }

    .card {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
    }

    .card-title {
      font-weight: 600;
      color: #1a365d;
      font-size: 12px;
      margin-bottom: 8px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e2e8f0;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px dotted #e2e8f0;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-label {
      color: #4a5568;
      font-size: 10px;
    }

    .info-value {
      font-weight: 600;
      color: #2d3748;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 11px;
    }

    .info-value.highlight {
      color: #1a365d;
      font-size: 13px;
    }

    .info-value.danger {
      color: #c53030;
    }

    .info-value.success {
      color: #276749;
    }

    .totaux-box {
      background: #1a365d;
      color: white;
      border-radius: 6px;
      padding: 15px;
      margin: 15px 0;
    }

    .totaux-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      text-align: center;
    }

    .totaux-item .label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.8;
      margin-bottom: 4px;
    }

    .totaux-item .value {
      font-size: 16px;
      font-weight: 700;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      margin-top: 10px;
    }

    thead {
      background: #1a365d;
      color: white;
    }

    th {
      padding: 8px 6px;
      text-align: center;
      font-weight: 600;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    tbody tr {
      border-bottom: 1px solid #e2e8f0;
    }

    tbody tr:nth-child(even) {
      background: #f7fafc;
    }

    td {
      padding: 6px;
      text-align: right;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    }

    td.mois {
      text-align: center;
      font-weight: 600;
      background: #edf2f7;
    }

    td.total {
      font-weight: 700;
      background: #ebf8ff;
      color: #1a365d;
    }

    td.danger {
      color: #c53030;
      font-weight: 700;
    }

    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      font-size: 9px;
      color: #718096;
      text-align: center;
    }

    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Plan de Financement Immobilier</h1>
    <div class="header-info">
      <div><strong>${$emprunteur.nomClient || 'Client non renseigné'}</strong></div>
      <div>${date}</div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-title">Situation de l'emprunteur</div>
      <div class="info-row">
        <span class="info-label">Revenus annuels bruts</span>
        <span class="info-value highlight">${formatMontant($emprunteur.revenusAnnuels)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Revenus mensuels</span>
        <span class="info-value">${formatMontant($indicateursEmprunteur.revenusMensuels)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Personnes au foyer</span>
        <span class="info-value">${$emprunteur.nbPersonnes}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Endettement existant</span>
        <span class="info-value">${$emprunteur.tauxEndettementExistant}%</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Indicateurs clés</div>
      <div class="info-row">
        <span class="info-label">Quotient Familial RAV</span>
        <span class="info-value ${$indicateursEmprunteur.qfOk ? 'success' : 'danger'}">${formatMontant($indicateursEmprunteur.qfRAV)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">QF de référence</span>
        <span class="info-value">${formatMontant($indicateursEmprunteur.qfReference)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Seuil endettement max</span>
        <span class="info-value">${$emprunteur.seuilEndettementMax}%</span>
      </div>
      <div class="info-row">
        <span class="info-label">Endettement max atteint</span>
        <span class="info-value ${tauxEndettementMax > $emprunteur.seuilEndettementMax ? 'danger' : 'success'}">${tauxEndettementMax.toFixed(2)}% (mois ${moisMax})</span>
      </div>
    </div>
  </div>

  <h2>Détail des prêts</h2>
  <div class="grid-${Math.min(pretsActifs.length, 3)}">
    ${pretsActifs.map(pret => `
      <div class="card">
        <div class="card-title">${pret.label}</div>
        <div class="info-row">
          <span class="info-label">Type</span>
          <span class="info-value">${getTypeLabel(pret.type)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Montant</span>
          <span class="info-value highlight">${formatMontant(pret.montant)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Durée</span>
          <span class="info-value">${pret.dureeMois} mois (${(pret.dureeMois / 12).toFixed(1)} ans)</span>
        </div>
        <div class="info-row">
          <span class="info-label">Taux nominal</span>
          <span class="info-value">${pret.tauxAnnuel}%</span>
        </div>
        <div class="info-row">
          <span class="info-label">Assurance</span>
          <span class="info-value">${pret.tauxAssurance}% (quotité ${pret.quotiteAssurance}%)</span>
        </div>
      </div>
    `).join('')}
  </div>

  <div class="totaux-box">
    <div class="totaux-grid">
      <div class="totaux-item">
        <div class="label">Capital emprunté</div>
        <div class="value">${formatMontant(montantTotalEmprunte)}</div>
      </div>
      <div class="totaux-item">
        <div class="label">Coût des intérêts</div>
        <div class="value">${formatMontant($totauxGlobaux.totalInterets)}</div>
      </div>
      <div class="totaux-item">
        <div class="label">Coût de l'assurance</div>
        <div class="value">${formatMontant($totauxGlobaux.totalAssurance)}</div>
      </div>
      <div class="totaux-item">
        <div class="label">Coût total du crédit</div>
        <div class="value">${formatMontant($totauxGlobaux.totalCredit)}</div>
      </div>
    </div>
  </div>

  <h2>Tableau d'amortissement</h2>
  <table>
    <thead>
      <tr>
        <th>Mois</th>
        ${tableauxActifs.map(t => `<th colspan="2">${t.label}</th>`).join('')}
        <th>Échéance totale</th>
        <th>Taux endett.</th>
      </tr>
      <tr>
        <th></th>
        ${tableauxActifs.map(() => `<th>CRD</th><th>Échéance</th>`).join('')}
        <th></th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      ${genererLignesTableau(tableauxActifs)}
    </tbody>
  </table>

  <div class="footer">
    Document généré le ${date} - Simulation à titre indicatif, ne constitue pas une offre de prêt
  </div>
</body>
</html>
    `;
  }

  function genererLignesTableau(tableauxActifs) {
    const lignes = [];
    const total = $tableauConsolide.length;

    // Créer un échantillon intelligent du tableau
    const indices = new Set();

    // Premiers mois (1-12)
    for (let i = 0; i < Math.min(12, total); i++) indices.add(i);

    // Ensuite tous les 6 mois jusqu'à la fin
    for (let i = 12; i < total; i += 6) indices.add(i);

    // Toujours inclure le dernier mois
    indices.add(total - 1);

    const sortedIndices = [...indices].sort((a, b) => a - b);

    sortedIndices.forEach(i => {
      const ligne = $tableauConsolide[i];
      if (!ligne) return;

      const tauxEndettement = calculerTauxEndettement(ligne.echeanceTotale, $indicateursEmprunteur.revenusMensuels);
      const isDanger = tauxEndettement > $emprunteur.seuilEndettementMax;

      lignes.push(`
        <tr>
          <td class="mois">${ligne.mois}</td>
          ${tableauxActifs.map(t => {
            const lp = ligne.prets[t.index];
            return lp
              ? `<td>${formatMontantCourt(lp.crd)}</td><td>${formatMontantCourt(lp.echeanceTTC)}</td>`
              : `<td>-</td><td>-</td>`;
          }).join('')}
          <td class="total">${formatMontantCourt(ligne.echeanceTotale)}</td>
          <td class="${isDanger ? 'danger' : ''}">${tauxEndettement.toFixed(2)}%</td>
        </tr>
      `);
    });

    return lignes.join('');
  }

  function formatMontant(value) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatMontantCourt(value) {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + ' €';
  }

  function getTypeLabel(type) {
    const labels = {
      amortissable: 'Amortissable',
      ptz: 'PTZ',
      inFine: 'In Fine',
      relais: 'Prêt Relais'
    };
    return labels[type] || type;
  }
</script>

<button
  class="btn-export"
  on:click={exporterPDF}
  disabled={isExporting || $tableauConsolide.length === 0}
  title="Ouvrir une fenêtre d'impression pour sauvegarder en PDF"
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </svg>
  {#if isExporting}
    Export...
  {:else}
    Exporter PDF
  {/if}
</button>

<style>
  .btn-export {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(72, 187, 120, 0.3);
  }

  .btn-export:hover:not(:disabled) {
    background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(72, 187, 120, 0.4);
  }

  .btn-export:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-export:disabled {
    background: #a0aec0;
    cursor: not-allowed;
    box-shadow: none;
  }

  .btn-export svg {
    flex-shrink: 0;
  }
</style>

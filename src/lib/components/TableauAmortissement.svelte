<script>
  import { tableauConsolide, tableauxAmortissement, prets } from '../stores/prets.js';
  import { emprunteur, indicateursEmprunteur } from '../stores/emprunteur.js';
  import { calculerTauxEndettement } from '../utils/calculs.js';

  $: pretsActifs = $prets.filter(p => p.actif && p.montant > 0);
  $: tableauxActifs = $tableauxAmortissement.filter(t => t.actif && t.tableau.length > 0);

  function formatMontant(value) {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function getTauxEndettement(echeanceTotale) {
    if ($indicateursEmprunteur.revenusMensuels <= 0) return 0;
    return calculerTauxEndettement(echeanceTotale, $indicateursEmprunteur.revenusMensuels);
  }

  function isDepassementSeuil(tauxEndettement) {
    return tauxEndettement > $emprunteur.seuilEndettementMax;
  }
</script>

<section class="zone-amortissement">
  <div class="section-header">
    <h2>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 3v18h18"/>
        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
      </svg>
      Tableau d'amortissement
    </h2>
    {#if $tableauConsolide.length > 0}
      <span class="badge">{$tableauConsolide.length} mois</span>
    {/if}
  </div>

  {#if $tableauConsolide.length === 0}
    <div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M3 3v18h18"/>
        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
      </svg>
      <p>Configurez au moins un prêt avec un montant pour voir le tableau d'amortissement</p>
    </div>
  {:else}
    <div class="table-wrapper">
      <table>
        <thead>
          <tr class="header-row">
            <th class="sticky-col mois">Mois</th>
            {#each tableauxActifs as t}
              <th colspan="4" class="pret-header">{t.label}</th>
            {/each}
            <th colspan="2" class="synthese-header">Synthèse</th>
          </tr>
          <tr class="subheader-row">
            <th class="sticky-col"></th>
            {#each tableauxActifs as _}
              <th>CRD</th>
              <th>Intérêts</th>
              <th>Assur.</th>
              <th>Échéance</th>
            {/each}
            <th>Total</th>
            <th>Endett.</th>
          </tr>
        </thead>
        <tbody>
          {#each $tableauConsolide as ligne}
            {@const tauxEndettement = getTauxEndettement(ligne.echeanceTotale)}
            {@const depassement = isDepassementSeuil(tauxEndettement)}
            <tr class:depassement>
              <td class="sticky-col mois">{ligne.mois}</td>
              {#each tableauxActifs as t}
                {@const lignePret = ligne.prets[t.index]}
                {#if lignePret}
                  <td class="montant crd">{formatMontant(lignePret.crd)}</td>
                  <td class="montant interets">{formatMontant(lignePret.interets)}</td>
                  <td class="montant assurance">{formatMontant(lignePret.assurance)}</td>
                  <td class="montant echeance">{formatMontant(lignePret.echeanceTTC)}</td>
                {:else}
                  <td class="montant vide">-</td>
                  <td class="montant vide">-</td>
                  <td class="montant vide">-</td>
                  <td class="montant vide">-</td>
                {/if}
              {/each}
              <td class="montant total">{formatMontant(ligne.echeanceTotale)}</td>
              <td class="pourcentage" class:alerte={depassement}>
                {tauxEndettement.toFixed(2)}%
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="legende">
      <span class="legende-item">
        <span class="color-box depassement"></span>
        Endettement supérieur à {$emprunteur.seuilEndettementMax}%
      </span>
    </div>
  {/if}
</section>

<style>
  .zone-amortissement {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  .section-header {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    padding: 1rem 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-header h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .badge {
    background: rgba(255, 255, 255, 0.15);
    padding: 0.3rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    color: white;
    font-weight: 500;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    color: #94a3b8;
    text-align: center;
    background: #f8fafc;
  }

  .empty-state p {
    margin: 1rem 0 0 0;
    font-size: 0.9rem;
    max-width: 300px;
  }

  .table-wrapper {
    overflow-x: auto;
    max-height: 500px;
    overflow-y: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.75rem;
    font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  }

  thead {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .header-row th {
    padding: 0.75rem 0.5rem;
    text-align: center;
    font-weight: 600;
    background: #1e293b;
    color: white;
    border-right: 1px solid #334155;
  }

  .header-row th:last-child {
    border-right: none;
  }

  .pret-header {
    background: #334155 !important;
  }

  .synthese-header {
    background: #475569 !important;
  }

  .subheader-row th {
    padding: 0.5rem 0.35rem;
    text-align: right;
    font-weight: 500;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    background: #475569;
    color: rgba(255, 255, 255, 0.8);
    border-right: 1px solid #64748b;
  }

  .subheader-row th:last-child {
    border-right: none;
  }

  tbody tr {
    border-bottom: 1px solid #e2e8f0;
    transition: background 0.1s ease;
  }

  tbody tr:nth-child(even) {
    background: #f8fafc;
  }

  tbody tr:hover {
    background: #f1f5f9;
  }

  tbody tr.depassement {
    background: #fef2f2;
  }

  tbody tr.depassement:hover {
    background: #fee2e2;
  }

  td {
    padding: 0.45rem 0.5rem;
    text-align: right;
    white-space: nowrap;
  }

  .sticky-col {
    position: sticky;
    left: 0;
    background: #f1f5f9;
    z-index: 5;
    border-right: 2px solid #cbd5e1;
  }

  thead .sticky-col {
    background: #1e293b;
    z-index: 15;
  }

  .mois {
    text-align: center;
    font-weight: 700;
    min-width: 55px;
    color: #475569;
  }

  thead .mois {
    color: white;
  }

  .montant {
    min-width: 85px;
    color: #475569;
  }

  .montant.vide {
    color: #cbd5e1;
  }

  .montant.crd {
    color: #64748b;
  }

  .montant.interets {
    color: #f59e0b;
  }

  .montant.assurance {
    color: #8b5cf6;
  }

  .montant.echeance {
    font-weight: 600;
    color: #1e293b;
  }

  .montant.total {
    font-weight: 700;
    color: #0284c7;
    background: #f0f9ff;
    border-left: 2px solid #bae6fd;
  }

  .pourcentage {
    min-width: 65px;
    font-weight: 600;
    color: #10b981;
  }

  .pourcentage.alerte {
    color: #ef4444;
    font-weight: 700;
    background: #fef2f2;
  }

  .legende {
    display: flex;
    gap: 1.5rem;
    padding: 0.85rem 1.25rem;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
  }

  .legende-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #64748b;
  }

  .color-box {
    width: 14px;
    height: 14px;
    border-radius: 3px;
    border: 1px solid #e2e8f0;
  }

  .color-box.depassement {
    background: #fef2f2;
    border-color: #fca5a5;
  }

  .table-wrapper::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .table-wrapper::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  .table-wrapper::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  .table-wrapper::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
</style>

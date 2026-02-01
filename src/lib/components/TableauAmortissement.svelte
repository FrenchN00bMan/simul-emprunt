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

<section class="tableau-section">
  <div class="section-header">
    <div class="header-title">
      <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 3v18h18"/>
        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
      </svg>
      <span>Tableau d'amortissement</span>
    </div>
    {#if $tableauConsolide.length > 0}
      <span class="duration-badge">{$tableauConsolide.length} mois</span>
    {/if}
  </div>

  {#if $tableauConsolide.length === 0}
    <div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
      <p>Configurez au moins un prêt avec un montant pour voir le tableau</p>
    </div>
  {:else}
    <div class="table-container">
      <table>
        <thead>
          <tr class="header-main">
            <th class="sticky-col col-mois">Mois</th>
            {#each tableauxActifs as t}
              <th colspan="4" class="col-pret" style="--pret-color: {getPretColor(t.index)}">{t.label}</th>
            {/each}
            <th colspan="2" class="col-synthese">Synthèse</th>
          </tr>
          <tr class="header-sub">
            <th class="sticky-col"></th>
            {#each tableauxActifs as _}
              <th class="sub">CRD</th>
              <th class="sub">Intérêts</th>
              <th class="sub">Assur.</th>
              <th class="sub">Échéance</th>
            {/each}
            <th class="sub total">Total</th>
            <th class="sub ratio">Endett.</th>
          </tr>
        </thead>
        <tbody>
          {#each $tableauConsolide as ligne}
            {@const tauxEndettement = getTauxEndettement(ligne.echeanceTotale)}
            {@const depassement = isDepassementSeuil(tauxEndettement)}
            <tr class:row-alert={depassement}>
              <td class="sticky-col col-mois">{ligne.mois}</td>
              {#each tableauxActifs as t}
                {@const lignePret = ligne.prets[t.index]}
                {#if lignePret}
                  <td class="num crd">{formatMontant(lignePret.crd)}</td>
                  <td class="num int">{formatMontant(lignePret.interets)}</td>
                  <td class="num ass">{formatMontant(lignePret.assurance)}</td>
                  <td class="num ech">{formatMontant(lignePret.echeanceTTC)}</td>
                {:else}
                  <td class="num empty">-</td>
                  <td class="num empty">-</td>
                  <td class="num empty">-</td>
                  <td class="num empty">-</td>
                {/if}
              {/each}
              <td class="num total-val">{formatMontant(ligne.echeanceTotale)}</td>
              <td class="num ratio-val" class:alert={depassement}>
                {tauxEndettement.toFixed(1)}%
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="table-footer">
      <div class="legend-item">
        <span class="legend-color alert"></span>
        <span class="legend-text">Endettement > {$emprunteur.seuilEndettementMax}%</span>
      </div>
    </div>
  {/if}
</section>

<script context="module">
  const pretColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
  function getPretColor(index) {
    return pretColors[index % pretColors.length];
  }
</script>

<style>
  .tableau-section {
    background: #ffffff;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.875rem 1.25rem;
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: white;
    font-size: 0.9375rem;
    font-weight: 600;
  }

  .header-icon {
    width: 18px;
    height: 18px;
  }

  .duration-badge {
    font-size: 0.6875rem;
    font-weight: 600;
    padding: 0.25rem 0.625rem;
    background: rgba(255,255,255,0.15);
    border-radius: 10px;
    color: white;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    color: #9ca3af;
    text-align: center;
    background: #f9fafb;
  }

  .empty-state svg {
    width: 40px;
    height: 40px;
    margin-bottom: 0.75rem;
  }

  .empty-state p {
    margin: 0;
    font-size: 0.875rem;
    max-width: 280px;
  }

  .table-container {
    overflow-x: auto;
    max-height: 420px;
    overflow-y: auto;
  }

  .table-container::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .table-container::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  .table-container::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  .table-container::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.75rem;
    font-family: 'JetBrains Mono', monospace;
  }

  thead {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .header-main th {
    padding: 0.625rem 0.5rem;
    text-align: center;
    font-weight: 600;
    font-size: 0.6875rem;
    background: #1e293b;
    color: white;
    border-right: 1px solid #334155;
  }

  .header-main th:last-child {
    border-right: none;
  }

  .col-pret {
    background: #334155 !important;
  }

  .col-synthese {
    background: #475569 !important;
  }

  .header-sub th {
    padding: 0.375rem 0.375rem;
    text-align: right;
    font-weight: 500;
    font-size: 0.5625rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    background: #475569;
    color: rgba(255,255,255,0.75);
    border-right: 1px solid #64748b;
  }

  .header-sub th:last-child {
    border-right: none;
  }

  .header-sub th.total {
    background: #1e40af;
    color: white;
  }

  .header-sub th.ratio {
    background: #0f766e;
    color: white;
  }

  tbody tr {
    border-bottom: 1px solid #f0f1f3;
    transition: background 0.1s ease;
  }

  tbody tr:nth-child(even) {
    background: #fafbfc;
  }

  tbody tr:hover {
    background: #f1f5f9;
  }

  tbody tr.row-alert {
    background: #fef2f2;
  }

  tbody tr.row-alert:hover {
    background: #fee2e2;
  }

  td {
    padding: 0.375rem 0.5rem;
    white-space: nowrap;
  }

  .sticky-col {
    position: sticky;
    left: 0;
    background: #f8fafc;
    z-index: 5;
    border-right: 2px solid #e5e7eb;
  }

  thead .sticky-col {
    background: #1e293b;
    z-index: 15;
  }

  .col-mois {
    text-align: center;
    font-weight: 700;
    min-width: 50px;
    color: #374151;
  }

  thead .col-mois {
    color: white;
  }

  .num {
    text-align: right;
    min-width: 75px;
    color: #4b5563;
  }

  .num.empty {
    color: #d1d5db;
  }

  .num.crd {
    color: #6b7280;
  }

  .num.int {
    color: #d97706;
  }

  .num.ass {
    color: #7c3aed;
  }

  .num.ech {
    font-weight: 600;
    color: #1e293b;
  }

  .num.total-val {
    font-weight: 700;
    color: #1e40af;
    background: #eff6ff;
    border-left: 2px solid #bfdbfe;
  }

  .num.ratio-val {
    font-weight: 600;
    color: #0f766e;
    min-width: 60px;
  }

  .num.ratio-val.alert {
    color: #dc2626;
    font-weight: 700;
    background: #fef2f2;
  }

  .table-footer {
    display: flex;
    gap: 1.5rem;
    padding: 0.625rem 1rem;
    background: #f9fafb;
    border-top: 1px solid #e5e7eb;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.6875rem;
    color: #6b7280;
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    border: 1px solid #e5e7eb;
  }

  .legend-color.alert {
    background: #fef2f2;
    border-color: #fca5a5;
  }
</style>

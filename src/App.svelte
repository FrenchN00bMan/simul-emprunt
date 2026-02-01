<script>
  import ZoneEmprunteur from './lib/components/ZoneEmprunteur.svelte';
  import ZonePrets from './lib/components/ZonePrets.svelte';
  import TableauAmortissement from './lib/components/TableauAmortissement.svelte';
  import AlertesBandeau from './lib/components/AlertesBandeau.svelte';
  import BaremeAssurances from './lib/components/BaremeAssurances.svelte';
  import ExportPDF from './lib/components/ExportPDF.svelte';
  import GestionSimulations from './lib/components/GestionSimulations.svelte';
  import GraphiquesEvolution from './lib/components/GraphiquesEvolution.svelte';
  import { totauxGlobaux } from './lib/stores/prets.js';
  import { emprunteur, indicateursEmprunteur } from './lib/stores/emprunteur.js';

  function formatMontant(value) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatPourcentage(value) {
    return value.toFixed(1) + '%';
  }

  $: mensualiteMax = $indicateursEmprunteur.revenusMensuels * ($emprunteur.seuilEndettementMax / 100);
</script>

<div class="app-container">
  <!-- Compact Header Bar -->
  <header class="header-bar">
    <div class="header-brand">
      <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <div class="brand-text">
        <span class="brand-title">SimulPrêt</span><!-- v2 -->
        <span class="brand-subtitle">Financement immobilier</span>
      </div>
    </div>

    <div class="header-actions">
      <GestionSimulations />
      <BaremeAssurances />
      <ExportPDF />
    </div>
  </header>

  <!-- KPI Dashboard Strip -->
  {#if $totauxGlobaux.nbPretsActifs > 0}
    <div class="kpi-strip">
      <div class="kpi-item">
        <span class="kpi-label">Capital emprunté</span>
        <span class="kpi-value primary">{formatMontant($totauxGlobaux.totalCapital || 0)}</span>
      </div>
      <div class="kpi-divider"></div>
      <div class="kpi-item">
        <span class="kpi-label">Coût des intérêts</span>
        <span class="kpi-value">{formatMontant($totauxGlobaux.totalInterets)}</span>
      </div>
      <div class="kpi-divider"></div>
      <div class="kpi-item">
        <span class="kpi-label">Coût assurance</span>
        <span class="kpi-value">{formatMontant($totauxGlobaux.totalAssurance)}</span>
      </div>
      <div class="kpi-divider"></div>
      <div class="kpi-item highlight">
        <span class="kpi-label">Coût total crédit</span>
        <span class="kpi-value accent">{formatMontant($totauxGlobaux.totalCredit)}</span>
      </div>
      <div class="kpi-divider"></div>
      <div class="kpi-item">
        <span class="kpi-label">Mensualité max. ({$emprunteur.seuilEndettementMax}%)</span>
        <span class="kpi-value">{formatMontant(mensualiteMax)}</span>
      </div>
    </div>
  {/if}

  <!-- Main Layout: Sidebar + Content -->
  <div class="main-layout">
    <!-- Fixed Sidebar: Borrower Info -->
    <aside class="sidebar">
      <ZoneEmprunteur />
    </aside>

    <!-- Main Content Area -->
    <main class="content">
      <AlertesBandeau />
      <ZonePrets />
      <GraphiquesEvolution />
      <TableauAmortissement />
    </main>
  </div>

  <!-- Minimal Footer -->
  <footer class="footer">
    Calculs indicatifs — Consultez un professionnel pour validation
  </footer>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500;600&display=swap');

  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #f5f6f8;
    color: #1a1d21;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  :global(input[type="number"]) {
    -moz-appearance: textfield;
    font-family: 'JetBrains Mono', monospace;
  }

  :global(input::-webkit-outer-spin-button),
  :global(input::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
  }

  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Header Bar */
  .header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.625rem 1.5rem;
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .brand-icon {
    width: 28px;
    height: 28px;
    color: #2563eb;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  .brand-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1a1d21;
    letter-spacing: -0.025em;
  }

  .brand-subtitle {
    font-size: 0.6875rem;
    color: #6b7280;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  /* KPI Strip */
  .kpi-strip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
    border-bottom: 1px solid #e5e7eb;
    flex-wrap: wrap;
  }

  .kpi-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.25rem 1.5rem;
    min-width: 140px;
  }

  .kpi-item.highlight {
    background: #f0f9ff;
    border-radius: 8px;
    padding: 0.5rem 1.5rem;
    margin: -0.25rem 0;
  }

  .kpi-label {
    font-size: 0.625rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .kpi-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
  }

  .kpi-value.primary {
    color: #1a1d21;
    font-size: 1.125rem;
  }

  .kpi-value.accent {
    color: #2563eb;
    font-size: 1.125rem;
  }

  .kpi-divider {
    width: 1px;
    height: 32px;
    background: #e5e7eb;
  }

  /* Main Layout */
  .main-layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 0;
    flex: 1;
  }

  /* Sidebar */
  .sidebar {
    background: #ffffff;
    border-right: 1px solid #e5e7eb;
    height: calc(100vh - 52px);
    position: sticky;
    top: 52px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .sidebar::-webkit-scrollbar {
    width: 4px;
  }

  .sidebar::-webkit-scrollbar-track {
    background: transparent;
  }

  .sidebar::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 2px;
  }

  /* Content */
  .content {
    padding: 1.25rem;
    overflow-y: auto;
    min-height: calc(100vh - 52px);
  }

  /* Footer */
  .footer {
    padding: 0.75rem 1.5rem;
    text-align: center;
    font-size: 0.75rem;
    color: #9ca3af;
    background: #ffffff;
    border-top: 1px solid #e5e7eb;
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .main-layout {
      grid-template-columns: 280px 1fr;
    }
  }

  @media (max-width: 1024px) {
    .main-layout {
      grid-template-columns: 1fr;
    }

    .sidebar {
      position: relative;
      height: auto;
      top: 0;
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
    }

    .kpi-strip {
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .kpi-divider {
      display: none;
    }

    .kpi-item {
      min-width: auto;
      padding: 0.5rem 1rem;
    }
  }

  @media (max-width: 640px) {
    .header-bar {
      padding: 0.5rem 1rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .brand-subtitle {
      display: none;
    }

    .header-actions {
      flex-wrap: wrap;
    }

    .content {
      padding: 1rem;
    }
  }
</style>

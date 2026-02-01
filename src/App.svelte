<script>
  import ZoneEmprunteur from './lib/components/ZoneEmprunteur.svelte';
  import ZonePrets from './lib/components/ZonePrets.svelte';
  import TableauAmortissement from './lib/components/TableauAmortissement.svelte';
  import AlertesBandeau from './lib/components/AlertesBandeau.svelte';
  import BaremeAssurances from './lib/components/BaremeAssurances.svelte';
  import ExportPDF from './lib/components/ExportPDF.svelte';
  import GestionSimulations from './lib/components/GestionSimulations.svelte';
  import GraphiquesEvolution from './lib/components/GraphiquesEvolution.svelte';
</script>

<main>
  <header>
    <div class="header-brand">
      <div class="logo">
        <svg width="32" height="32" viewBox="0 0 100 100">
          <rect width="100" height="100" rx="12" fill="rgba(255,255,255,0.15)"/>
          <path d="M25 70 L50 30 L75 70 Z" fill="none" stroke="white" stroke-width="5" stroke-linejoin="round"/>
          <line x1="35" y1="55" x2="65" y2="55" stroke="white" stroke-width="5"/>
        </svg>
      </div>
      <div class="brand-text">
        <h1>Simulateur de Prêt Immobilier</h1>
        <span class="subtitle">Plan de financement multi-prêts</span>
      </div>
    </div>
    <div class="header-actions">
      <GestionSimulations />
      <BaremeAssurances />
      <ExportPDF />
    </div>
  </header>

  <div class="container">
    <AlertesBandeau />

    <div class="main-grid">
      <div class="left-column">
        <ZoneEmprunteur />
      </div>
      <div class="right-column">
        <ZonePrets />
      </div>
    </div>

    <GraphiquesEvolution />

    <TableauAmortissement />
  </div>

  <footer>
    <p>Simulateur de prêt immobilier - Calculs à titre indicatif</p>
  </footer>
</main>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
    color: #2d3748;
    line-height: 1.5;
    min-height: 100vh;
  }

  :global(input[type="number"]) {
    -moz-appearance: textfield;
  }

  :global(input::-webkit-outer-spin-button),
  :global(input::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
  }

  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
    color: white;
    padding: 1rem 2rem;
    box-shadow: 0 4px 20px rgba(26, 54, 93, 0.3);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-brand {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
  }

  header h1 {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .subtitle {
    font-size: 0.75rem;
    opacity: 0.7;
    font-weight: 400;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .container {
    max-width: 1800px;
    margin: 0 auto;
    padding: 1.5rem;
    flex: 1;
  }

  .main-grid {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .left-column {
    position: sticky;
    top: 90px;
    height: fit-content;
  }

  @media (max-width: 1200px) {
    .main-grid {
      grid-template-columns: 1fr;
    }

    .left-column {
      position: static;
    }
  }

  @media (max-width: 768px) {
    header {
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }

    .header-actions {
      width: 100%;
      justify-content: center;
      flex-wrap: wrap;
    }

    .container {
      padding: 1rem;
    }

    header h1 {
      font-size: 1.1rem;
    }
  }

  footer {
    background: #1a365d;
    color: rgba(255, 255, 255, 0.7);
    text-align: center;
    padding: 1rem;
    font-size: 0.8rem;
    margin-top: auto;
  }

  footer p {
    margin: 0;
  }
</style>
